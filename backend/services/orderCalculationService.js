const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

// ========================================
// Calculate Subtotal & Prepare Items
// ========================================

const calculateSubtotal = async (items) => {

  let subtotal = 0;

  const finalItems = await Promise.all(

    items.map(async (item) => {

      const product = await Product.findById(item._id);

      if (!product) {
        throw new Error("Product not found");
      }

      subtotal += product.price * item.quantity;

      return {

        productId: product._id,

        name: product.name,

        description: product.description,

        mrp: product.mrp,

        discount: product.discount,

        price: product.price,

        images: product.images,

        category: product.category,

        unit: product.unit,

        ingredients: product.ingredients,

        nutritionalInfo: product.nutritionalInfo,

        quantity: item.quantity,

        inStock: product.inStock,

      };

    })

  );

  return {

    subtotal,

    finalItems,

  };

};

// ========================================
// Apply Coupon
// ========================================

const applyCoupon = async (
  couponCode,
  subtotal
) => {

  let discount = 0;

  let appliedCoupon = "";

  if (!couponCode) {

    return {

      discount,

      appliedCoupon,

    };

  }

  const coupon = await Coupon.findOne({

    code: couponCode.toUpperCase(),

    isActive: true,

  });

  if (!coupon) {

    return {

      discount,

      appliedCoupon,

    };

  }

  if (
    coupon.minPurchase &&
    subtotal < coupon.minPurchase
  ) {
    throw new Error(
      `Minimum purchase should be ₹${coupon.minPurchase}`
    );
  }

  if (coupon.discountType === "FLAT") {

    discount = coupon.discountValue;

  } else {

    discount =
      subtotal *
      coupon.discountValue /
      100;

    if (
      coupon.maxDiscount &&
      discount > coupon.maxDiscount
    ) {

      discount =
        coupon.maxDiscount;

    }

  }

  discount = Math.min(
    discount,
    subtotal
  );

  appliedCoupon = coupon.code;

  return {

    discount,

    appliedCoupon,

  };

};
// ========================================
// Calculate GST
// ========================================

const calculateGST = (
  subtotal,
  discount
) => {

  const taxableAmount = Math.max(
    subtotal - discount,
    0
  );

  const gst = Number(
    (taxableAmount * 0.03).toFixed(2)
  );

  return {

    taxableAmount,

    gst,

  };

};

module.exports = {

  calculateSubtotal,

  applyCoupon,

  calculateGST,

};