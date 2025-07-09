const websiteReplies = {
  refund: 'To request a refund, go to My Orders > select the order > Request Refund.',
  order: 'To view or track your order, visit the "My Orders" page.',
  cancel: 'To cancel an order, go to the order details and click "Cancel Order".',
  ticket: 'You can raise a support ticket from the Help section.',
  delivery: 'Deliveries typically take 2-3 days. Check "My Orders" for updates.',
  product: 'We sell fresh milk, ghee, paneer, curd, and more dairy products.',
  offer: 'Check the homepage for today’s special offers or deals!',
  uma: 'Uma Dairy is your trusted source for fresh and organic dairy products!',
};

function getWebsiteReply(message) {
  const msg = message.toLowerCase();
  for (const keyword in websiteReplies) {
    if (msg.includes(keyword)) {
      return websiteReplies[keyword];
    }
  }
  return null;
}

module.exports = getWebsiteReply;
