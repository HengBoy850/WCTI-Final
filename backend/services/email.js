const nodemailer = require('nodemailer');

// Ethereal Email is a free fake-SMTP service made for developer testing:
// emails you "send" never reach a real inbox - instead you get a preview
// URL that shows exactly what the email looked like. Perfect for testing
// an email flow on localhost without setting up a real mail provider.
//
// If Ethereal can't be reached (e.g. no internet in this environment),
// we fall back to just logging the code to the terminal so registration
// is never blocked during development.

let transporterPromise = null;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('Ethereal test inbox ready:', testAccount.user);
        return transporter;
      } catch (err) {
        console.warn('Could not reach Ethereal (offline?) - verification codes will only be logged to the console.');
        return null;
      }
    })();
  }
  return transporterPromise;
}

/**
 * Sends a verification code email. Always logs the code to the console too,
 * so local development/testing never depends on actually receiving the email.
 * Returns a preview URL if Ethereal was reachable, otherwise null.
 */
async function sendVerificationEmail(toEmail, code) {
  console.log(`\n[Email] Verification code for ${toEmail}: ${code}\n`);

  const transporter = await getTransporter();
  if (!transporter) return null;

  try {
    const info = await transporter.sendMail({
      from: '"Savory Spoon" <no-reply@savoryspoon.example>',
      to: toEmail,
      subject: 'Verify your Savory Spoon account',
      text: `Your verification code is: ${code}\n\nThis code expires in 15 minutes.`,
      html: `<p>Your verification code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 15 minutes.</p>`,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[Email] Preview URL:', previewUrl);
    return previewUrl;
  } catch (err) {
    console.warn('[Email] Failed to send via Ethereal:', err.message);
    return null;
  }
}

module.exports = { sendVerificationEmail };
