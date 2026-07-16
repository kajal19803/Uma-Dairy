const axios = require("axios");

let shiprocketToken = null;
let tokenExpiry = null;

const getShiprocketToken = async () => {
  try {
    // Use existing token if still valid
    if (
      shiprocketToken &&
      tokenExpiry &&
      new Date() < tokenExpiry
    ) {
      return shiprocketToken;
    }
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    shiprocketToken = response.data.token;

    // Shiprocket token is generally valid for ~10 days.
    // Refresh a little earlier (9 days) for safety.
    tokenExpiry = new Date(
      Date.now() + 9 * 24 * 60 * 60 * 1000
    );
    return shiprocketToken;

  } catch (error) {

    console.error(
      "❌ Error getting Shiprocket token:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = getShiprocketToken;
