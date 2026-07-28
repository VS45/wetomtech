const { body, validationResult } = require('express-validator');
const { saveLead } = require('../services/leadStorage');
const { notifyTeam } = require('../services/mailer');

const commonValidators = [
  body('fullName').trim().isLength({ min: 2, max: 120 }).withMessage('Enter your full name.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('phone').trim().isLength({ min: 7, max: 40 }).withMessage('Enter a valid phone number.'),
  body('organisation').optional({ checkFalsy: true }).trim().isLength({ max: 160 }),
  body('service').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('message').trim().isLength({ min: 10, max: 3000 }).withMessage('Provide a short description of your request.'),
  body('website').optional({ checkFalsy: true }).isEmpty().withMessage('Spam detected.')
];

function redirectFor(type, status) {
  const map = {
    contact: '/contact',
    coverage: '/coverage',
    quote: '/contact',
    career: '/careers'
  };
  return `${map[type] || '/contact'}?status=${status}`;
}

async function submitLead(req, res, next) {
  try {
    const type = ['contact', 'coverage', 'quote', 'career'].includes(req.body.type)
      ? req.body.type
      : 'contact';

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(redirectFor(type, 'invalid'));
    }

    const lead = {
      type,
      fullName: req.body.fullName,
      organisation: req.body.organisation || null,
      email: req.body.email,
      phone: req.body.phone,
      service: req.body.service || null,
      address: req.body.address || null,
      message: req.body.message,
      sourceIp: req.ip
    };

    await saveLead(lead);
    notifyTeam(lead).catch((error) => console.warn('Email notification failed:', error.message));

    return res.redirect(redirectFor(type, 'success'));
  } catch (error) {
    next(error);
  }
}

module.exports = { commonValidators, submitLead };
