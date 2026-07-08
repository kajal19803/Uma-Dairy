const axios = require("axios");
const getShiprocketToken = require("../utils/getShiprocketToken");

const createShiprocketOrder = async (order) => {
  try {
    // Generate Shiprocket Token
    const token = await getShiprocketToken();

    // Shiprocket Payload
    const orderData = {
      order_id: order.orderId,

      order_date: new Date(order.createdAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),

      pickup_location: "Home",

      billing_customer_name:
        order.address?.fullName || "Customer",

      billing_last_name: "",

      billing_address:
        order.address?.street || "Default Address",

      billing_city:
        order.address?.city || "Jabalpur",

      billing_state:
        order.address?.state || "Madhya Pradesh",

      billing_pincode:
        order.address?.zip || "482009",

      billing_country: "India",

      billing_phone:
        order.phone || "9999999999",

      shipping_is_billing: true,

      order_items: order.items.map((item) => ({
        name: item.name,

        sku:
          item.productId?.toString() ||
          item.name.replace(/\s/g, "_"),

        units: item.quantity,

        selling_price: item.price,
      })),

      payment_method:
        order.paymentMethod === "COD"
          ? "COD"
          : "Prepaid",

      sub_total: Number(
        (order.finalAmount || order.totalPrice).toFixed(2)
      ),

      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    console.log("📦 Shiprocket Payload");
    console.log(orderData);

    // Create Shiprocket Order
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Shiprocket Response");
    console.log(response.data);

    // ==========================
    // Save Shiprocket Details
    // ==========================

    order.shiprocket.orderId =
      response.data.order_id?.toString() || "";

    order.shiprocket.shipmentId =
      response.data.shipment_id?.toString() || "";

    order.shiprocket.awbCode =
      response.data.awb_code || "";

    order.shiprocket.courierName =
      response.data.courier_name || "";

    order.shiprocket.trackingUrl =
      response.data.tracking_url || "";

    order.shiprocket.trackingStatus =
      response.data.status || "NEW";

    await order.save();

    return response.data;

  } catch (error) {

    console.error(
      "🚫 Shiprocket Service Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = {
  createShiprocketOrder,
};





