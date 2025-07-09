const nodemailer = require('nodemailer');

const sendTicketMail = async ({ to, ticketNumber, issueType, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Uma Dairy Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: `✅ Ticket Confirmation - #${ticketNumber}`,
      html: `
        <h2>Thank you for raising a support ticket at Uma Dairy 🧈</h2>
        <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Your Message:</strong><br /> ${message}</p>
        
        <p>📨 Our support team will contact you soon.</p>
        <p>🔎 <strong>You can also check your ticket status anytime by visiting your profile section on our website.</strong></p>
        
        <br />
        <p>Regards,<br>Uma Dairy Support Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error sending ticket confirmation email:', error);
  }
};

module.exports = sendTicketMail;

