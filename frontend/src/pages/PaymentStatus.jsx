import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isCOD, setIsCOD] = useState(false);

 useEffect(() => {
  const params = new URLSearchParams(location.search);

  const order_id = params.get("order_id");

  const cod = params.get("cod");
  const payment = params.get("payment");

  setOrderId(order_id);

  setIsCOD(cod === "1");

  // Razorpay success OR COD success
  if ((payment === "success" || cod === "1") && order_id) {
    setStatus("PAID");

    clearCart();

    
  }

}, [location.search]);

const isSuccess = status === "PAID" || isCOD;

 return (
<div
className={`min-h-screen w-screen pt-28 pb-20 flex items-center justify-center px-5 ${
isSuccess
? "bg-[#FFF8F1]"
: "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"
}`}
>

<div className="max-w-2xl w-full">

<div className="bg-white rounded-[36px] shadow-2xl overflow-hidden">

{/* Top Banner */}

<div
className={`py-12 px-8 text-center ${
isSuccess
? "bg-gradient-to-r from-[#F97354] to-[#ff9b6b]"
: "bg-gradient-to-r from-red-500 to-orange-500"
}`}
>

<div className="w-28 h-28 mx-auto rounded-full bg-white flex items-center justify-center shadow-xl">

<span className="text-6xl">
{isSuccess ? "✅" : "❌"}
</span>

</div>

<h1 className="mt-6 text-4xl font-bold text-white">

{isSuccess
? "Order Confirmed!"
: "Payment Failed"}

</h1>

<p className="mt-3 text-lg text-orange-50">

{isSuccess
? "Thank you for shopping with Uma Dairy"
: "Something went wrong while processing your payment."}

</p>

</div>

{/* Body */}

<div className="p-10">

{isSuccess ? (

<>

<div className="bg-[#FFF8F1] rounded-3xl p-6 border border-orange-100">

<p className="text-sm text-gray-500 uppercase tracking-widest">
Order Number
</p>

<h2 className="mt-2 text-2xl font-bold text-[#3B2418] break-all">
{orderId}
</h2>

</div>

<div className="grid grid-cols-3 gap-5 mt-8">

<div className="bg-orange-50 rounded-2xl p-5 text-center">

<div className="text-4xl">
🧀
</div>

<p className="mt-3 font-semibold text-[#3B2418]">
Fresh Products
</p>

</div>

<div className="bg-orange-50 rounded-2xl p-5 text-center">

<div className="text-4xl">
🚚
</div>

<p className="mt-3 font-semibold text-[#3B2418]">
Preparing Order
</p>

</div>

<div className="bg-orange-50 rounded-2xl p-5 text-center">

<div className="text-4xl">
🏡
</div>

<p className="mt-3 font-semibold text-[#3B2418]">
Home Delivery
</p>

</div>

</div>

<div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
  <h3 className="text-xl font-bold text-green-700">
🎉 Your order has been placed successfully!
</h3>

<p className="mt-3 text-gray-600 leading-7">
We have received your order and our team has already started
preparing your fresh dairy products.
You'll receive delivery updates shortly.
</p>

</div>

<div className="mt-10 flex flex-col sm:flex-row gap-4">

<button
onClick={() => navigate("/dashboard?tab=orders")}
className="flex-1 bg-[#F97354] hover:bg-[#ea6847] text-white py-4 rounded-2xl font-bold text-lg transition"
>

📦 Track My Order

</button>

<button
onClick={() => navigate("/products")}
className="flex-1 border-2 border-[#F97354] text-[#F97354] hover:bg-orange-50 py-4 rounded-2xl font-bold text-lg transition"
>

🛒 Continue Shopping

</button>

</div>

<p className="mt-8 text-center text-gray-500 leading-7">
  Thank you for supporting{" "}
  <span className="font-bold text-[#F97354]">
    Uma Dairy
  </span>{" "}
  💚
  <br />
  Fresh • Pure • Farm to Home
</p>

</>

) : (

<>

<div className="bg-red-50 border border-red-200 rounded-2xl p-6">

<h3 className="text-2xl font-bold text-red-600">

Payment Failed

</h3>

<p className="mt-3 text-gray-600 leading-7">

Unfortunately your payment could not be completed.

Don't worry — no money will be deducted if the transaction failed.

You can safely try again.

</p>

</div>

<div className="mt-10 flex flex-col sm:flex-row gap-4">

<button
onClick={() => navigate(-1)}
className="flex-1 bg-[#F97354] hover:bg-[#ea6847] text-white py-4 rounded-2xl font-bold transition"
>

Try Again

</button>

<button
onClick={() => navigate("/cart")}
className="flex-1 border-2 border-[#F97354] text-[#F97354] hover:bg-orange-50 py-4 rounded-2xl font-bold transition"
>

Back to Cart

</button>

</div>

</>

)}

</div>

</div>

</div>
</div>
);

}
  
export default PaymentStatus;