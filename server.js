require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors()); // for the hackathon demo, allow any origin to call this
app.use(express.json());

// Gmail transporter — sends AS your Gmail account, from a real server,
// not from the browser. Uses a Gmail "App Password", not your normal
// Gmail password (see README for how to generate one).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Health check — hit this URL in a browser to confirm the service is alive.
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'oceantrace-mailer' });
});

// POST /send-alert
// body: { to: "someone@example.com", toName: "Someone", subject: "...", message: "..." }
app.post('/send-alert', async (req, res) => {
  const { to, toName, subject, message } = req.body || {};

  if (!to || !subject || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required field: to, subject, or message.' });
  }

  try {
    const info = await transporter.sendMail({
      from: `"OceanTrace Alerts" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text: message,
    });
    console.log(`Sent to ${to} (${toName || 'no name'}) — messageId ${info.messageId}`);
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('Send failed:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OceanTrace mailer listening on port ${PORT}`);
});
