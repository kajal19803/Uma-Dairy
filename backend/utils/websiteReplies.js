const websiteReplies = {
  hello:
    "👋 Hello! Welcome to Uma Dairy.\n\nHow can I help you today?",

  hi:
    "👋 Hi! I'm Uma Assistant.\n\nHow can I assist you today?",

  uma:
    "🥛 Uma Dairy provides fresh and high-quality dairy products including Ghee, Milk, Paneer, Curd and more.",

  product:
    "🛒 We offer fresh Ghee, Milk, Paneer, Curd, Butter and other dairy products. Visit the Products page to explore everything.",

  ghee:
    "🧈 Our Pure Cow Ghee is made from premium quality milk and is available in different pack sizes.",

  milk:
    "🥛 We provide fresh and hygienic milk delivered directly to your doorstep.",

  paneer:
    "🧀 Our fresh paneer is prepared using premium quality milk without harmful preservatives.",

  curd:
    "🥣 Fresh curd is available every day with guaranteed quality.",

  order:
    "📦 You can track all your orders from Dashboard → My Orders.",

  delivery:
    "🚚 Orders are generally delivered within 2–3 business days depending on your location.",

  payment:
    "💳 We support both Online Payment and Cash on Delivery (COD).",

  cod:
    "💵 Cash on Delivery (COD) is available for eligible orders.",

  refund:
    "💰 If you received a damaged or incorrect product, Uma Assistant can help you raise a support ticket for refund assistance.",

  cancel:
    "❌ If your order hasn't been processed yet, our support team can help you with cancellation.",

  return:
    "📦 Return requests are handled by our support team depending on the product condition.",

  damaged:
    "⚠️ Sorry to hear that. Please raise a support ticket with an image of the damaged product.",

  issue:
    "🛠️ I can help you raise a support ticket regarding your issue.",

  problem:
    "🛠️ Please describe your problem in detail. If required, I'll help you raise a support ticket.",

  support:
    "🎫 You can raise a support ticket directly through Uma Assistant.",

  ticket:
    "🎫 I can help you create a support ticket. Just describe your issue.",

  contact:
    "📞 You can find our contact details on the Contact page.",

  about:
    "🏡 Uma Dairy is committed to delivering fresh and pure dairy products directly from farm to home.",

  policy:
    "📄 You can read our Refund, Shipping and Privacy Policies from the Policy page.",

  offer:
    "🎉 Check our homepage for the latest offers and discounts.",

  wishlist:
    "❤️ Your wishlist is available from your Dashboard after logging in.",

  cart:
    "🛒 You can review and update all selected products in your Cart before placing an order.",

  login:
    "🔐 Please login to access Orders, Wishlist, Dashboard and Support services.",

  register:
    "📝 Create an account to enjoy personalized shopping and order tracking."
};

function getWebsiteReply(message) {
  if (!message) return null;

  const msg = message.toLowerCase().trim();

  for (const keyword in websiteReplies) {
    if (msg.includes(keyword)) {
      return websiteReplies[keyword];
    }
  }

  return null;
}

module.exports = getWebsiteReply;
