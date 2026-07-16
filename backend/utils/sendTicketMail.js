const axios = require("axios");

const BREVO_API = "https://api.brevo.com/v3/smtp/email";

const sendTicketMail = async ({ to, ticketNumber, issueType, message }) => {
  try {
    await axios.post(
      BREVO_API,
      {
        sender: {
          name: "Uma Dairy Support",
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

        subject: `🎫 Support Ticket Received - ${ticketNumber}`,

        htmlContent: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 0;">
<tr>
<td align="center">

<table width="650" cellpadding="0" cellspacing="0"
style="
background:#ffffff;
border-radius:12px;
overflow:hidden;
box-shadow:0 6px 20px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:#ff7a59;
padding:28px;
text-align:center;
color:white;
">

<h1 style="margin:0;">🎫 Uma Dairy Support</h1>

<p style="margin-top:8px;font-size:15px;">
Pure by Nature • Trusted by You
</p>

</td>
</tr>

<tr>
<td style="padding:35px;">

<h2 style="color:#333;margin-top:0;">
Hello 👋
</h2>

<p style="font-size:16px;color:#555;line-height:1.8;">
Thank you for contacting
<b>Uma Dairy Support.</b>

<br><br>

We have successfully received your support request.
Our support team will review it and get back to you as soon as possible.
</p>

<div
style="
background:#fff6f2;
border-left:5px solid #ff7a59;
padding:20px;
margin:30px 0;
border-radius:8px;
">

<h3 style="margin-top:0;color:#ff6b42;">
📌 Ticket Details
</h3>

<p style="margin:10px 0;">
<b>Ticket Number</b><br>
<span style="font-size:20px;color:#ff5e3a;">
${ticketNumber}
</span>
</p>

<p style="margin:10px 0;">
<b>Issue Type</b><br>
${issueType}
</p>

<p style="margin:10px 0;">
<b>Your Message</b><br>
${message}
</p>

</div>

<div
style="
background:#f8fff6;
border:1px solid #b7efc5;
padding:18px;
border-radius:8px;
margin-top:25px;
">

<b>📍 What's Next?</b>

<ul style="line-height:1.9;color:#555;padding-left:18px;">

<li>Your ticket has been recorded successfully.</li>

<li>Our support team will review your issue shortly.</li>

<li>You can check your ticket status anytime from your Dashboard → My Tickets.</li>

<li>If additional information is required, we'll contact you through email.</li>

</ul>

</div>

<p
style="
margin-top:30px;
font-size:15px;
color:#666;
line-height:1.8;
">

💚 Thank you for choosing
<b>Uma Dairy.</b>

<br>

We appreciate your patience and will do our best to resolve your issue quickly.

</p>

</td>
</tr>

<tr>

<td
style="
background:#fafafa;
padding:22px;
text-align:center;
font-size:13px;
color:#777;
">

Need help?

<br><br>

📧 ${process.env.BREVO_SENDER_EMAIL}

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
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "❌ Brevo Ticket Mail Error:",
      error.response?.data || error.message
    );
  }
};

module.exports = sendTicketMail;