'use strict';

const crypto = require('node:crypto');
const express = require('express');

const router = express.Router();

const PLAN = Object.freeze({
  id: 'wetomnet-unlimited-20k',
  name: 'WetomNet Unlimited Monthly Internet',
  description: 'WetomNet unlimited internet monthly subscription',
  amountNaira: 20000,
  amountMinor: 2000000, // OPay Cashier expects the amount in the currency minor unit.
  currency: 'NGN',
  country: 'NG'
});

function getConfig() {
  const required = ['OPAY_MERCHANT_ID', 'OPAY_PUBLIC_KEY', 'OPAY_PRIVATE_KEY', 'APP_BASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const isLive = process.env.OPAY_ENV === 'live';
  const apiBase = isLive
    ? 'https://liveapi.opaycheckout.com'
    : 'https://testapi.opaycheckout.com';

  return {
    merchantId: process.env.OPAY_MERCHANT_ID,
    publicKey: process.env.OPAY_PUBLIC_KEY,
    privateKey: process.env.OPAY_PRIVATE_KEY,
    baseUrl: process.env.APP_BASE_URL.replace(/\/$/, ''),
    apiBase
  };
}

function normalisePhone(value) {
  const cleaned = String(value || '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('0')) return `+234${cleaned.slice(1)}`;
  if (cleaned.startsWith('234')) return `+${cleaned}`;
  return cleaned;
}

function cleanText(value, maxLength) {
  return String(value || '').trim().replace(/[<>]/g, '').slice(0, maxLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createReference() {
  return `WTN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function opayRequest(url, headers, bodyString) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers
    },
    body: bodyString,
    signal: AbortSignal.timeout(20000)
  });

  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`OPay returned an invalid response (${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data.message || `OPay request failed with status ${response.status}.`);
  }

  return data;
}

async function queryPaymentStatus(reference) {
  const config = getConfig();
  const payload = { country: PLAN.country, reference };
  const bodyString = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha512', config.privateKey)
    .update(bodyString)
    .digest('hex');

  return opayRequest(
    `${config.apiBase}/api/v1/international/cashier/status`,
    {
      Authorization: `Bearer ${signature}`,
      MerchantId: config.merchantId
    },
    bodyString
  );
}

// Replace this function with your database write.
async function recordPayment(details) {
  console.info('[WetomNet payment]', details);
}

router.post('/payments/opay/initialize', async (req, res) => {
  try {
    if (req.body.website) return res.status(400).send('Invalid request.');
    if (req.body.plan !== PLAN.id) return res.status(400).send('Invalid subscription plan.');
    if (req.body.termsAccepted !== 'yes') return res.status(400).send('Please accept the coverage condition.');

    const fullName = cleanText(req.body.fullName, 120);
    const email = cleanText(req.body.email, 160).toLowerCase();
    const phone = normalisePhone(req.body.phone);
    const address = cleanText(req.body.address, 500);

    if (fullName.length < 2 || !isValidEmail(email) || phone.length < 10 || address.length < 5) {
      return res.status(400).send('Please provide valid customer and service-address details.');
    }

    const config = getConfig();
    const reference = createReference();

    const payment = {
      country: PLAN.country,
      reference,
      amount: {
        total: PLAN.amountMinor,
        currency: PLAN.currency
      },
      returnUrl: `${config.baseUrl}/payments/opay/return?reference=${encodeURIComponent(reference)}`,
      callbackUrl: `${config.baseUrl}/payments/opay/callback`,
      cancelUrl: `${config.baseUrl}/wetomnet?payment=cancelled`,
      displayName: 'WetomNet',
      customerVisitSource: 'BROWSER',
      evokeOpay: true,
      expireAt: 30,
      userInfo: {
        userEmail: email,
        userId: reference,
        userMobile: phone,
        userName: fullName
      },
      product: {
        name: PLAN.name,
        description: `${PLAN.description}. Service address: ${address}`
      }
      // payMethod is intentionally omitted so OPay can show all methods enabled for the merchant.
    };

    const bodyString = JSON.stringify(payment);
    const result = await opayRequest(
      `${config.apiBase}/api/v1/international/cashier/create`,
      {
        Authorization: `Bearer ${config.publicKey}`,
        MerchantId: config.merchantId
      },
      bodyString
    );

    if (result.code !== '00000' || !result.data?.cashierUrl) {
      throw new Error(result.message || 'Unable to create the OPay checkout session.');
    }

    await recordPayment({
      reference,
      orderNo: result.data.orderNo,
      status: result.data.status,
      amountMinor: PLAN.amountMinor,
      currency: PLAN.currency,
      fullName,
      email,
      phone,
      address,
      createdAt: new Date().toISOString()
    });

    return res.redirect(303, result.data.cashierUrl);
  } catch (error) {
    console.error('OPay initialise error:', error);
    return res.redirect(303, '/wetomnet?payment=error');
  }
});

router.get('/payments/opay/return', async (req, res) => {
  const reference = cleanText(req.query.reference, 100);
  if (!reference) return res.redirect(303, '/wetomnet?payment=error');

  try {
    const result = await queryPaymentStatus(reference);
    const payment = result.data;

    if (
      result.code === '00000' &&
      payment?.status === 'SUCCESS' &&
      Number(payment.amount?.total) === PLAN.amountMinor &&
      payment.amount?.currency === PLAN.currency
    ) {
      await recordPayment({
        reference,
        orderNo: payment.orderNo,
        status: 'SUCCESS',
        verifiedAt: new Date().toISOString()
      });
      return res.redirect(303, `/wetomnet?payment=success&reference=${encodeURIComponent(reference)}`);
    }

    return res.redirect(303, `/wetomnet?payment=pending&reference=${encodeURIComponent(reference)}`);
  } catch (error) {
    console.error('OPay return verification error:', error);
    return res.redirect(303, `/wetomnet?payment=pending&reference=${encodeURIComponent(reference)}`);
  }
});

router.post('/payments/opay/callback', async (req, res) => {
  // Acknowledge only after cross-verifying the reference with OPay's status API.
  try {
    const reference = cleanText(req.body?.payload?.reference, 100);
    if (!reference) return res.sendStatus(200);

    const result = await queryPaymentStatus(reference);
    const payment = result.data;

    if (
      result.code === '00000' &&
      payment?.status === 'SUCCESS' &&
      Number(payment.amount?.total) === PLAN.amountMinor &&
      payment.amount?.currency === PLAN.currency
    ) {
      await recordPayment({
        reference,
        orderNo: payment.orderNo,
        status: 'SUCCESS',
        verifiedFrom: 'callback',
        verifiedAt: new Date().toISOString()
      });
      // Activate the customer's subscription here after an idempotent database update.
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error('OPay callback error:', error);
    // Return a non-2xx response so OPay can retry the notification.
    return res.sendStatus(503);
  }
});

module.exports = router;
