const axios = require("axios");
const { generateReviewToken } = require("./reviewToken");
require("dotenv").config();

const BREVO_API = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendEmail(to, subject, html) {
  return axios.post(
    BREVO_API,
    {
      sender: {
        name: "Uma Dairy",
        email: process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: to,
        },
      ],

      subject,

      htmlContent: html,
    },
    {
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
    }
  );
}

async function sendOrderConfirmation(order, user) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">
          ${item.name}
        </td>

        <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
          ${item.quantity}
        </td>

        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">
          ₹${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>

<body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif;">

<table width="100%" style="padding:30px 0;">
<tr>
<td align="center">

<table width="650" style="background:#fff;border-radius:12px;overflow:hidden;">

<tr>
<td style="background:#ff7a59;color:#fff;padding:30px;text-align:center;">
<h1>🥛 Uma Dairy</h1>
<p>Thank you for your order ❤️</p>
</td>
</tr>

<tr>
<td style="padding:35px;">

<h2>Hello ${user.name}, 👋</h2>

<p>
Your payment has been received successfully.
</p>

<div style="
background:#fff5f2;
padding:18px;
border-left:5px solid #ff7a59;
border-radius:8px;
">

<p><b>Order ID:</b> ${order.orderId}</p>

<p><b>Payment:</b> Paid ✅</p>

<p><b>Amount:</b> ₹${order.finalAmount}</p>

<p><b>Status:</b> ${order.orderStatus}</p>

</div>

<h3 style="margin-top:35px;">
Items
</h3>

<table width="100%" cellspacing="0">

<tr style="background:#fafafa;">

<th align="left" style="padding:10px;">Product</th>

<th style="padding:10px;">Qty</th>

<th align="right" style="padding:10px;">Price</th>

</tr>

${itemsHtml}

</table>

<h3 style="margin-top:35px;">
Delivery Address
</h3>

<p>
${order.address.fullName}<br>
${order.address.street}<br>
${order.address.city},
${order.address.state}
-${order.address.zip}
</p>

<p style="margin-top:30px;">
We'll start preparing your order shortly 🚚
</p>

</td>
</tr>

<tr>

<td
style="
background:#fafafa;
padding:20px;
text-align:center;
color:#777;
">

Need help?

<br><br>

📧 ${process.env.BREVO_SENDER_EMAIL}

<br><br>

© ${new Date().getFullYear()} Uma Dairy

</td>

</tr>

</table>

</td>
</tr>

</table>

</body>

</html>
`;

  await sendEmail(
    user.email,
    `🎉 Order Confirmed - ${order.orderId}`,
    html
  );
}

async function sendAdminOrder(order, user) {

const html = `
<h2>🛒 New Order Received</h2>

<p><b>Customer:</b> ${user.name}</p>

<p><b>Email:</b> ${user.email}</p>

<p><b>Phone:</b> ${order.phone}</p>

<p><b>Order:</b> ${order.orderId}</p>

<p><b>Total:</b> ₹${order.finalAmount}</p>

<p><b>Status:</b> ${order.orderStatus}</p>
`;

await sendEmail(
  process.env.ADMIN_EMAIL,
  `🛒 New Order ${order.orderId}`,
  html
);

}
async function sendReviewEmail(order, user) {

  const token = generateReviewToken(
    order._id.toString(),
    user._id.toString()
  );

  const reviewUrl =
    `${process.env.FRONTEND_URL}/review?token=${token}`;

  const itemsHtml = order.items
  .map(
    (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #eee;">
          ${item.name}
        </td>

        <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
          ${item.quantity}
        </td>
      </tr>
    `
  )
  .join("");

  const html = `
<!DOCTYPE html>

<html>

<body style="margin:0;background:#f7f7f7;font-family:Arial,sans-serif;">

<table width="100%" style="padding:30px 0;">
<tr>
<td align="center">

<table
width="650"
style="
background:#fff;
border-radius:12px;
overflow:hidden;
">

<tr>

<td
style="
background:#28a745;
color:white;
padding:30px;
text-align:center;
">

<h1>🥛 Uma Dairy</h1>

<h2>Your Order Has Been Delivered 🎉</h2>

</td>

</tr>

<tr>

<td style="padding:35px;">

<h2>Hello ${user.name}, 👋</h2>

<p>

We hope you loved your order.

Your feedback helps us improve our products.

</p>

<div
style="
background:#f5fff7;
padding:20px;
border-left:5px solid #28a745;
border-radius:8px;
">

<p>

<b>Order ID:</b>

${order.orderId}

</p>

<p>

Your products have been delivered successfully.

</p>

</div>
<h3 style="margin-top:35px;">
Your Delivered Products
</h3>

<table
width="100%"
cellspacing="0"
style="
border-collapse:collapse;
margin-top:15px;
">

<tr style="background:#fafafa;">

<th
align="left"
style="padding:12px;">
Product
</th>

<th
style="padding:12px;">
Qty
</th>

</tr>

${itemsHtml}

</table>
<div
style="
margin-top:40px;
text-align:center;
">

<a
href="${reviewUrl}"
target="_blank"
style="
background:#ff7a59;
color:white;
padding:16px 34px;
border-radius:8px;
text-decoration:none;
font-size:18px;
font-weight:bold;
display:inline-block;
">

⭐ Rate Your Products

</a>

</div>
<p
style="
margin-top:20px;
font-size:13px;
color:#777;
word-break:break-all;
">

If the button doesn't work, copy and paste this link into your browser:

<br><br>

<a href="${reviewUrl}">
${reviewUrl}
</a>

</p>

<p
style="
margin-top:25px;
font-size:15px;
line-height:24px;
color:#555;
text-align:center;
">

Please rate each product individually.

Your ratings help other customers make better choices.

</p>

<p
style="
margin-top:30px;
color:#777;
">

This review link is valid for
<b>30 days</b>.

</p>

</td>

</tr>

<tr>

<td
style="
background:#fafafa;
padding:20px;
text-align:center;
color:#777;
">

Need help?

<br><br>

📧 ${process.env.BREVO_SENDER_EMAIL}

<br><br>

© ${new Date().getFullYear()} Uma Dairy

</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

  try {
  await sendEmail(
    user.email,
    `🎉 Your order has been delivered! Rate your products`,
    html
  );
} catch (err) {
  console.error(
    "Review Email Error:",
    err.response?.data || err.message
  );
}
}

module.exports = {
  sendOrderConfirmation,
  sendAdminOrder,
  sendReviewEmail,
};