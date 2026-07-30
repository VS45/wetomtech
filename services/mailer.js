const nodemailer = require('nodemailer');

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function notifyTeam(lead) {
  if (!smtpConfigured()) return false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const rows = Object.entries(lead)
    .filter(([, value]) => value)
    .map(([key, value]) => `<tr><td style="padding:8px;border:1px solid #dbe4f0"><strong>${key}</strong></td><td style="padding:8px;border:1px solid #dbe4f0">${String(value)}</td></tr>`)
    .join('');

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'WetomTech Website <no-reply@wetomtech.com>',
    to: process.env.MAIL_TO || 'info@wetomtech.com',
    subject: `New WetomTech ${lead.type} enquiry from ${lead.fullName}`,
    html: `<h2>New website enquiry</h2><table style="border-collapse:collapse">${rows}</table>`
  });

  return true;
}

module.exports = { notifyTeam };
