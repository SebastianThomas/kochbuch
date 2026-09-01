const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

// SMTP config comes from the environment (injected via the k8s secret in
// production - see deploy/deployment.yaml). Never commit real credentials.
const MAIL_HOST = process.env.MAIL_HOST || 'smtp.gmail.com';
const MAIL_PORT = Number(process.env.MAIL_PORT) || 465;
const MAIL_SECURE = process.env.MAIL_SECURE
  ? process.env.MAIL_SECURE === 'true'
  : MAIL_PORT === 465;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER;

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: MAIL_USER ? { user: MAIL_USER, pass: MAIL_PASS } : undefined,
});

const send = (res, { address, subject, text, html }) => {
  if (!MAIL_USER || !MAIL_PASS) {
    return res
      .status(503)
      .json({ error: 'Mail is not configured (MAIL_USER / MAIL_PASS missing).' });
  }

  const mailOptions = {
    from: MAIL_FROM,
    to: MAIL_FROM ? `${address}, ${MAIL_FROM}` : address,
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
