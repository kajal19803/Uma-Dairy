const axios = require('axios');

const getShiprocketToken = async () => {
  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    });

    const token = response.data.token;
    return token;
  } catch (error) {
    console.error("❌ Error getting Shiprocket token:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = getShiprocketToken;
