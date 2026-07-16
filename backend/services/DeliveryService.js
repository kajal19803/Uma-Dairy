const axios = require("axios");
const getShiprocketToken = require("../utils/getShiprocketToken");

const getShippingCharge = async ({
  deliveryPincode,
  paymentMethod = "Prepaid",
  weight = 0.5,
}) => {
  try {
    const token = await getShiprocketToken();

    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        params: {
          pickup_postcode: process.env.PICKUP_PINCODE,
          delivery_postcode: deliveryPincode,
          cod: paymentMethod === "COD" ? 1 : 0,
          weight,
        },
      }
    );
    const couriers =
      response.data.data?.available_courier_companies || [];

    if (!couriers.length) {
      return {
        success: false,
        message: "No courier available",
      };
    }

    // Cheapest courier
    couriers.sort(
      (a, b) => a.rate - b.rate
    );

    const courier = couriers[0];

    return {
      success: true,

      shippingCharge: Number(courier.rate),

      courier: courier.courier_name,

      estimatedDelivery:
        courier.etd || "",

      courierId:
        courier.courier_company_id,
    };

  } catch (err) {

    console.error(
      "❌ Shipping Service Error:",
      err.response?.data || err.message
    );

    throw err;
  }
};

module.exports = {
  getShippingCharge,
};