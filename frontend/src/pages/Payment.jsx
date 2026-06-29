import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { load } from '@cashfreepayments/cashfree-js';
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

  const [cfInstance, setCfInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user || !cartItems || totalPrice === undefined || !orderId) {
      navigate('/cart');
    }
  }, [user, cartItems, totalPrice, orderId, navigate]);

  useEffect(() => {
    const initCashfree = async () => {
      try {
        const cf = await load({ mode: 'production' });
        setCfInstance(cf);
      } catch (err) {
        console.error('Failed to load Cashfree SDK', err);
      }
    };
    initCashfree();
  }, []);

  const handlePayment = async () => {
    if (!user?.name || !user?.email) {
      alert('User info missing. Please login again.');
      return;
    }

    if (!cfInstance || typeof cfInstance.checkout !== 'function') {
      alert('Cashfree SDK not ready yet. Please wait...');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${BACKEND_BASE_URL}/api/orders/payment/create-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: totalPrice,
          name: user.name,
          email: user.email,
          phone,
          order_id: orderId,
        }),
      });

      const data = await res.json();
     if (!res.ok || !data.session_id) {
        alert('Failed to create payment session');
        setLoading(false);
        return;
      }

      cfInstance.checkout({
        paymentSessionId: data.session_id,
        redirect: true,
        redirectTarget: "_self",
        returnUrl: `${window.location.origin}/payment-status?order_id=${orderId}`,
      });
    } catch (err) {
      console.error(' Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCOD = async () => {
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
        navigate(`/paymentstatus?order_id=${orderId}&cod=1`);
      } else {
        alert(data.message || 'COD Order Failed');
      }
    } catch (error) {
      console.error(' COD error:', error);
      alert('Failed to place COD order.');
    }
  };

  return (
<div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-16 px-5">

<div className="text-center mb-12">
<h1 className="text-5xl font-bold text-[#3B2418]">
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
className="mt-4 text-[#F97354] underline font-medium">
Edit Details
</button>

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

<hr/>

<div className="flex justify-between items-center">

<span className="text-lg font-bold text-[#3B2418]">
Grand Total
</span>

<span className="text-4xl font-bold text-[#F97354]">
₹{totalPrice?.toFixed(2)}
</span>

</div>

</div>

{paymentMethod==="online" ? (

<button
onClick={handlePayment}
disabled={loading || !cfInstance}
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

<p className="mt-6 text-center text-sm text-gray-500">
🔒 100% Secure Payment powered by Cashfree
</p>

<div
id="cashfree-checkout"
className="mt-8"
style={{minHeight:"700px"}}
/>

</div>

</div>

</div>

</div>

);
};

export default Payment;