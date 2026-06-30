const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const otpStore = new Map(); 

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_LOGIN,
    pass: process.env.BREVO_SMTP_KEY,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});


router.post('/send', async (req, res) => {
  console.log("📩 /send route hit");
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000); 
  otpStore.set(email, otp);

 const mailOptions = {
  from: '"Uma Dairy" <kajalverma6263@gmail.com>',
  to: email,
  subject: "🔐 Your Uma Dairy OTP Code",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:30px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,.08);">

            <tr>
              <td align="center" style="background:#ff7a59;padding:25px;color:#fff;">
                <h1 style="margin:0;">🥛 Uma Dairy</h1>
                <p style="margin-top:8px;font-size:15px;">
                  Pure by Nature, Trusted by You
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:35px;">

                <h2 style="margin-top:0;color:#333;">
                  Hello 👋
                </h2>

                <p style="font-size:16px;color:#555;line-height:1.7;">
                  We received a request to verify your account.
                  Use the OTP below to continue.
                </p>

                <div style="
                  margin:35px auto;
                  width:260px;
                  background:#fff4ef;
                  border:2px dashed #ff7a59;
                  border-radius:12px;
                  padding:20px;
                  text-align:center;
                ">
                  <p style="
                    margin:0;
                    color:#666;
                    font-size:14px;
                  ">
                    Your OTP
                  </p>

                  <h1 style="
                    margin:12px 0;
                    font-size:42px;
                    letter-spacing:8px;
                    color:#ff5e3a;
                  ">
                    ${otp}
                  </h1>
                </div>

                <p style="
                  text-align:center;
                  color:#444;
                  font-size:15px;
                ">
                  ⏳ This OTP is valid for
                  <b style="color:#ff5e3a;">5 minutes</b>.
                </p>

                <hr style="margin:30px 0;border:none;border-top:1px solid #eee;">

                <p style="
                  color:#777;
                  line-height:1.7;
                  font-size:14px;
                ">
                  🔒 Never share this OTP with anyone.<br>
                  Uma Dairy will never ask for your OTP or password.
                </p>

              </td>
            </tr>

            <tr>
              <td style="
                background:#fafafa;
                text-align:center;
                padding:20px;
                color:#777;
                font-size:13px;
              ">
                Thank you for choosing
                <b>Uma Dairy</b> ❤️
                <br><br>
                © ${new Date().getFullYear()} Uma Dairy. All Rights Reserved.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `,
};

  try {
   console.log("Before sendMail");

   const info = await transporter.sendMail(mailOptions);

   console.log("After sendMail");
   console.log("EMAIL INFO:", info);
    setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});


router.post('/verify', (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = otpStore.get(email);
  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP expired or not found' });
  }

  if (parseInt(otp) === storedOtp) {
    otpStore.delete(email);
    return res.json({ message: 'OTP verified successfully' });
  }

  res.status(400).json({ message: 'Invalid OTP' });
});

module.exports = router;


