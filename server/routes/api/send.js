const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

// SMTP config for your own mailbox, via env (injected via the k8s secret in
// production - see deploy/deployment.yaml). No default host: point MAIL_HOST
// at your custom mail server. Never commit real credentials.
const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = Number(process.env.MAIL_PORT) || 465;
const MAIL_SECURE = process.env.MAIL_SECURE
  ? process.env.MAIL_SECURE === 'true'
  : MAIL_PORT === 465; // 465 = implicit TLS, 587 = STARTTLS (set MAIL_SECURE=false)
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER;

const isConfigured = () => Boolean(MAIL_HOST && MAIL_USER && MAIL_PASS);

const transporter = isConfigured()
  ? nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: MAIL_SECURE,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    })
  : null;

const send = (res, { address, subject, text, html }) => {
  if (!transporter) {
    return res.status(503).json({
      error: 'Mail is not configured (MAIL_HOST / MAIL_USER / MAIL_PASS missing).',
    });
  }

  const mailOptions = {
    from: MAIL_FROM,
    to: address,
    subject,
  };
  if (html !== undefined) {
    mailOptions.html = html;
  } else {
    mailOptions.text = text;
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(`err: ${err}`);
      res
        .status(500)
        .json({ error: 'Something did not work as it should have worked.' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json(`Email sent to ${address}`);
    }
  });
};

router.get('/', (req, res) => {
  res.json({
    msg: 'From here, you can send emails with a single post request',
  });
});

// @route   POST api/send/plain
// @desc    Send a plain-text email
// @access  Public
router.post('/plain', (req, res) => {
  console.log('In post');
  send(res, {
    address: req.body.address,
    subject: req.body.subject,
    text: req.body.content,
  });
});

// @route   POST api/send/html
// @desc    Send an HTML email
// @access  Public
router.post('/html', (req, res) => {
  console.log('In post');
  send(res, {
    address: req.body.address,
    subject: req.body.subject,
    html: `<!DOCTYPE html>${req.body.htmlContent}`,
  });
});

module.exports = router;
