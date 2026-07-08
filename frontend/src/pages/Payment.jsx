import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from "axios";
import useUserStore from '../store/userStore';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { user } = useUserStore();

  const order = location.state?.order;

  const cartItems = order?.items || [];
  const totalPrice = order?.totalPrice || order?.totalAmount;
  const orderId = order?.orderId;
  const address = order?.address;
  const phone = order?.phone;

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");

const [discount, setDiscount] = useState(0);

const [finalAmount, setFinalAmount] = useState(totalPrice);

const [couponLoading, setCouponLoading] = useState(false);

const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  useEffect(() => {
  setFinalAmount(totalPrice);
}, [totalPrice]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user || !cartItems || totalPrice === undefined || !orderId) {
      navigate('/cart');
    }
  }, [user, cartItems, totalPrice, orderId, navigate]);
  const handleApplyCoupon = async () => {

  if (!couponCode.trim()) {
    return alert("Enter coupon code");
  }

  try {

    setCouponLoading(true);

    const res = await axios.post(
      `${BACKEND_BASE_URL}/api/coupon/apply`,
      {
        code: couponCode,
        totalAmount: totalPrice,
      }
    );

    setDiscount(res.data.discount);

    setFinalAmount(res.data.finalAmount);

    setCouponApplied(true);

    alert("Coupon Applied Successfully");

  } catch (err) {
     setCouponApplied(false);
     setDiscount(0);
     setFinalAmount(totalPrice);

    alert(
      err.response?.data?.message || "Invalid Coupon"
    );

  } finally {

    setCouponLoading(false);

  }

};


 const handlePayment = async () => {
  if (!user) {
    alert("Please login first.");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const { data } = await axios.post(
      `${BACKEND_BASE_URL}/api/orders/payment/make-payment`,
      {
        orderId, couponCode,finalAmount, 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const options = {
      key: data.key,

      amount: data.amount,

      currency: data.currency,

      name: "Uma Dairy",

      description: "Order Payment",

      order_id: data.razorpayOrderId,

      prefill: {
        name: data.customer.name,

        email: data.customer.email,

        contact: data.customer.contact,
      },

      theme: {
        color: "#F97354",
      },

      handler: async function (response) {
        try {
          const verify = await axios.post(
            `${BACKEND_BASE_URL}/api/orders/payment/verify`,
            {
              razorpay_order_id: response.razorpay_order_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_signature: response.razorpay_signature,

              orderId,
              couponCode,
              discount,
              finalAmount,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("VERIFY RESPONSE:", verify.data);
          if (verify.data.success) {
            clearCart();

            navigate(`/paymentstatus?order_id=${orderId}&payment=success`);
          } else {
            alert("Payment verification failed.");
          }
        } catch (err) {
          console.error("VERIFY ERROR:", err);

          alert("Payment verification failed.");
        }finally {
    setLoading(false);
  }
      },

      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.open();

  } catch (err) {
    console.error(err);

    alert("Payment failed.");

    setLoading(false);
  }
};

/*  const handleCOD = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${BACKEND_BASE_URL}/api/orders/place-cod`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (res.ok) {
        clearCart();
        navigate(`/paymentstatus?order_id=${orderId}&payment=success`);
      } else {
        alert(data.message || 'COD Order Failed');
      }
    } catch (error) {
      console.error(' COD error:', error);
      alert('Failed to place COD order.');
    }
  };*/

  return (
<div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-16 px-5">

<div className="text-center mb-12">
<h1 className="text-3xl lg:text-5xl font-bold text-[#3B2418]">
Payment
</h1>

<p className="mt-3 text-lg text-gray-500">
Review your order and complete your payment securely
</p>
</div>

<div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

{/* LEFT SIDE */}

<div className="lg:col-span-2">

<div className="bg-white rounded-3xl shadow-xl p-8">

<div className="flex items-center justify-between mb-8">

<div>

<h2 className="text-2xl font-bold text-[#3B2418]">
Order Details
</h2>

<p className="text-gray-500 mt-1">
Order ID : {orderId}
</p>

</div>

<div className="bg-orange-100 text-[#F97354] px-5 py-2 rounded-full font-semibold">
₹{totalPrice?.toFixed(2)}
</div>

</div>

<div className="space-y-5">

{cartItems.map((item)=>(

<div
key={item._id}
className="flex justify-between items-center border border-orange-100 rounded-2xl p-5 hover:shadow-lg transition">

<div className="flex items-center gap-5">

<img
src={
item.images?.[0]
?`${BACKEND_BASE_URL}${item.images[0]}`
:item.productId?.images?.[0]
?item.productId.images[0].startsWith('/uploads')
?`${BACKEND_BASE_URL}${item.productId.images[0]}`
:`${BACKEND_BASE_URL}/uploads/${item.productId.images[0]}`
:'/placeholder.jpg'
}
alt={item.name}
className="w-20 h-20 rounded-xl object-cover"
onError={(e)=>{
e.target.src="/placeholder.jpg";
}}
/>

<div>

<h3 className="font-bold text-xl text-[#3B2418]">
{item.name}
</h3>

<p className="text-gray-500 text-sm mt-1">
Qty : {item.quantity}
</p>

<p className="mt-2 text-[#F97354] font-bold">
₹{item.price}
</p>

</div>

</div>

<div className="text-right">

<p className="text-gray-500">
Subtotal
</p>

<p className="text-xl font-bold text-[#F97354]">
₹{Number(item.price)*item.quantity}
</p>

</div>

</div>

))}

</div>

<hr className="my-10"/>

<h2 className="text-2xl font-bold text-[#3B2418] mb-6">
Delivery Details
</h2>

<div className="bg-[#FFF8F1] rounded-2xl p-6 space-y-3">

<div>
<span className="font-semibold text-[#3B2418]">
Customer :
</span>

<span className="ml-2 text-gray-700">
{user?.name}
</span>
</div>

<div>
<span className="font-semibold text-[#3B2418]">
Email :
</span>

<span className="ml-2 text-gray-700">
{user?.email}
</span>
</div>

<div>
<span className="font-semibold text-[#3B2418]">
Phone :
</span>

<span className="ml-2 text-gray-700">
{phone}
</span>
</div>

<div>

<p className="font-semibold text-[#3B2418] mb-2">
Delivery Address
</p>

{typeof address==="object"?(
<p className="text-gray-600 leading-7">
{address.street}, {address.city}, {address.state} - {address.zip||address.pincode}
</p>
):(
<p className="text-gray-600">
{address}
</p>
)}

</div>

<button
onClick={()=>navigate("/cart")}
className="text-[#F97354] font-semibold bg-transparent hover:underline border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none">
Edit Details
</button>

</div>
</div>

</div>
{/* RIGHT SIDE */}

<div className="lg:col-span-1">

<div className="sticky top-28 bg-white rounded-3xl shadow-xl p-8">

<h2 className="text-2xl font-bold text-[#3B2418]">
Payment Method
</h2>

<p className="text-gray-500 mt-2">
Choose your preferred payment option.
</p>

<div className="mt-8 space-y-4">

<label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
paymentMethod==="online"
?"border-[#F97354] bg-orange-50"
:"border-orange-100"
}`}>

<div>

<p className="font-semibold text-[#3B2418]">
💳 Online Payment
</p>

<p className="text-sm text-gray-500">
UPI • Cards • Net Banking • Wallets
</p>

</div>

<input
type="radio"
name="paymentMethod"
value="online"
checked={paymentMethod==="online"}
onChange={()=>setPaymentMethod("online")}
/>

</label>
{/*
<label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
paymentMethod==="cod"
?"border-[#F97354] bg-orange-50"
:"border-orange-100"
}`}>

<div>

<p className="font-semibold text-[#3B2418]">
🚚 Cash on Delivery
</p>

<p className="text-sm text-gray-500">
Pay when your order arrives.
</p>

</div>

<input
type="radio"
name="paymentMethod"
value="cod"
checked={paymentMethod==="cod"}
onChange={()=>setPaymentMethod("cod")}
/>

</label>
*/}
</div>

<hr className="my-8"/>

<div className="space-y-4">

<div className="flex justify-between">

<span className="text-gray-600">
Items
</span>

<span className="font-semibold">
{cartItems.length}
</span>

</div>

<div className="flex justify-between">

<span className="text-gray-600">
Delivery
</span>

<span className="text-green-600 font-semibold">
FREE
</span>

</div>
<div className="mt-8">

<h3 className="font-semibold mb-3">

Have a Coupon?

</h3>

<div className="flex gap-2">

<input

type="text"

placeholder="Enter Coupon"

value={couponCode}

onChange={(e)=>setCouponCode(e.target.value.toUpperCase())}
disabled={couponApplied}

className="flex-1 border bg-white rounded-md px-4 py-3"

/>

<button

onClick={handleApplyCoupon}

disabled={couponLoading || couponApplied}

className="bg-[#F97354] text-white px-5 rounded-xl"

>

{couponApplied ? "Applied ✓" : couponLoading ? "Applying..." : "Apply"}

</button>

</div>

</div>

<hr/>
{couponApplied && (

<div className="flex justify-between text-green-600">

<span>Coupon Discount</span>

<span>- ₹{discount}</span>

</div>

)}
<div className="flex justify-between items-center">

<span className="text-lg font-bold text-[#3B2418]">
Grand Total
</span>

<span className="text-2xl lg:text-4xl font-bold text-[#F97354]">

₹{finalAmount?.toFixed(2)}
</span>

</div>

</div>
{paymentMethod==="online" && (

<button
onClick={handlePayment}
disabled={loading}
className="mt-5 w-full bg-[#F97354] hover:bg-[#ea6847] text-white py-3 rounded-xl font-bold text-lg transition disabled:opacity-50">

{loading ? "Processing..." : "Pay Securely"}

</button>

)}
{/*}
{paymentMethod==="online" ? (

<button
onClick={handlePayment}
disabled={loading}
className="mt-8 w-full bg-[#F97354] hover:bg-[#ea6847] text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50">

{loading ? "Processing..." : "Pay Securely"}

</button>

):(

<button
onClick={handleCOD}
className="mt-8 w-full bg-[#3B2418] hover:bg-[#2b1b12] text-white py-4 rounded-xl font-bold text-lg transition">

Confirm COD Order

</button>

)}
*/}


<p className="mt-6 text-center text-sm text-gray-500">
🔒 100% Secure Payment powered by Razorpay
</p>


</div>

</div>

</div>

</div>

);
};

export default Payment;