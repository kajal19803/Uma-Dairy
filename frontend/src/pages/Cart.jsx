import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import useUserStore from '../store/userStore';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useUserStore();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [customAddress, setCustomAddress] = useState(false);
  const [customPhone, setCustomPhone] = useState(false);
  const [formAddress, setFormAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const getPriceNumber = (price) => {
    if (typeof price === 'number') return price;
    const match = price.match(/\u20B9(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : parseFloat(price) || 0;
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + getPriceNumber(item.price) * (item.quantity || 1),
    0
  );
  const gst = totalPrice * 0.03;

  const finalTotal = totalPrice + gst;

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place order');
      navigate('/login');
      return;
    }

    let addressData = selectedAddress;
    let phoneData = selectedPhone;

    if (customAddress) {
      const { fullName, street, city, state, zip } = formAddress;
      if (!fullName || !street || !city || !state || !zip) {
        return alert('Please fill in all address fields');
      }
      addressData = formAddress;
    }

    if (customPhone && !phone) {
      return alert('Please enter phone number');
    }
    if (customPhone) phoneData = phone;
    


   const orderPayload = {
      items: cartItems.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      })),
     totalPrice: finalTotal,
      address: addressData,
      phone: phoneData,
   };



    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      localStorage.setItem('latestOrderId', data.order.orderId);
      navigate('/payment', {
        state: {
           order: data.order,
        },
      });
    } catch (err) {
      console.error(err);
      alert('Order failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.address) {
      if (Array.isArray(user.address)) setSelectedAddress(user.address[0]);
      else setSelectedAddress(user.address);
    }
    if (user?.phoneNumber) {
      if (Array.isArray(user.phoneNumber)) setSelectedPhone(user.phoneNumber[0]);
      else setSelectedPhone(user.phoneNumber);
    }
  }, [user]);

  if (cartItems.length === 0) {
  return (
    <div className="min-h-screen w-screen bg-[#FFF8F1] flex items-center justify-center pt-24">
      <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
        <div className="text-7xl mb-6">🛒</div>

        <h2 className="text-4xl font-bold text-[#3B2418]">
          Your Cart is Empty
        </h2>

        <p className="text-gray-500 mt-4">
          Looks like you haven't added any dairy products yet.
        </p>

        <Link
          to="/products"
          className="inline-block mt-8 px-8 py-4 rounded-2xl bg-[#F97354] text-white font-semibold hover:bg-[#ea6847] transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

 return (
<div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-16 px-5">

<div className="max-w-7xl mx-auto">

<div className="text-center mb-12">
<h1 className="text-5xl font-bold text-[#3B2418]">
Shopping Cart
</h1>

<p className="mt-3 text-gray-500 text-lg">
Review your selected dairy products
</p>
</div>

<div className="grid lg:grid-cols-3 gap-8">

{/* LEFT */}

<div className="lg:col-span-2">

<div className="space-y-6">

{cartItems.map((item)=>(

<div
key={item._id}
onClick={()=>navigate(`/product/${item._id}`)}
className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 p-6 flex gap-6 cursor-pointer">

<img
src={`${BACKEND_BASE_URL}${item.images[0]}`}
alt={item.name}
className="w-32 h-32 rounded-2xl object-cover border border-orange-100"/>

<div className="flex-1">

<h2 className="text-2xl font-bold text-[#3B2418]">
{item.name}
</h2>

<p className="text-gray-500 mt-2">
{item.description}
</p>

<p className="mt-3 text-2xl font-bold text-[#F97354]">
₹{item.price}
</p>

<div className="mt-5 flex items-center gap-3">

<button
onClick={(e)=>{
  e.stopPropagation();

  if((item.quantity || 1) > 1){
    updateQuantity(item._id,(item.quantity || 1)-1);
  }else{
    removeFromCart(item._id);
  }
}}
className="w-10 h-10 rounded-full bg-[#F97354] text-white disabled:opacity-50">
-
</button>

<span className="font-semibold text-lg">
{item.quantity||1}
</span>

<button
onClick={(e)=>{
e.stopPropagation();
updateQuantity(item._id,(item.quantity||1)+1);
}}
className="w-10 h-10 rounded-full bg-[#F97354] text-white">
+
</button>

<button
onClick={(e)=>{
e.stopPropagation();
if(window.confirm(`Remove "${item.name}" from cart?`)){
removeFromCart(item._id);
}
}}
className="ml-auto bg-red-100 hover:bg-red-500 hover:text-white text-red-600 px-5 py-2 rounded-xl transition">
Remove
</button>

</div>

</div>

</div>

))}
</div>

{/* ADDRESS */}

<div className="mt-8 bg-white rounded-3xl shadow-xl p-8">

<h2 className="text-2xl font-bold text-[#3B2418] mb-6">
Delivery Address
</h2>

{!customAddress ? (

<>

{Array.isArray(user?.address) && user.address.length>0 ? (

<div className="flex gap-4">

<select
value={JSON.stringify(selectedAddress)}
onChange={(e)=>setSelectedAddress(JSON.parse(e.target.value))}
className="flex-1 rounded-xl text-[#3B2418] border border-orange-200 bg-[#FFF8F1] p-4 outline-none">

{user.address.map((addr,index)=>(

<option
key={index}
value={JSON.stringify(addr)}>
{addr.fullName}, {addr.street}, {addr.city}, {addr.state}, {addr.zip}
</option>

))}

</select>

<button
onClick={()=>setCustomAddress(true)}
className="bg-[#F97354] text-white px-5 rounded-xl hover:bg-[#ea6847]">
New
</button>

</div>

):(

<p className="text-red-500">
please add an address to your profile to proceed with the order.
</p>

)}

</>

):(


<div className="grid md:grid-cols-2 gap-4">

<input
placeholder="Full Name"
className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3"
onChange={(e)=>setFormAddress({...formAddress,fullName:e.target.value})}
/>

<input
placeholder="Street"
className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3"
onChange={(e)=>setFormAddress({...formAddress,street:e.target.value})}
/>

<input
placeholder="City"
className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3"
onChange={(e)=>setFormAddress({...formAddress,city:e.target.value})}
/>

<input
placeholder="State"
className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3"
onChange={(e)=>setFormAddress({...formAddress,state:e.target.value})}
/>

<input
placeholder="ZIP Code"
className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 md:col-span-2"
onChange={(e)=>setFormAddress({...formAddress,zip:e.target.value})}
/>
<button
onClick={async()=>{

const { fullName, street, city, state, zip } = formAddress;

if(!fullName || !street || !city || !state || !zip){
return alert("Fill all fields");
}

try{

const token=localStorage.getItem("token");

const res=await fetch(
`${BACKEND_BASE_URL}/api/auth/update-contact`,
{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`,
},
body:JSON.stringify({

phoneNumbers:user.phoneNumber||[],

addresses:[
...(user.address||[]),
formAddress
]

})
}
);

const data=await res.json();

if(res.ok){

alert("Address Added");

user.address=data.user.address;

setSelectedAddress(formAddress);

setCustomAddress(false);

setFormAddress({
fullName:"",
street:"",
city:"",
state:"",
zip:""
});

}

}catch(err){

console.log(err);

}

}}
className="mt-5 bg-[#F97354] text-white px-6 py-3 rounded-xl hover:bg-[#ea6847]"
>

Add Address

</button>

<button
onClick={()=>{
if(user?.address){
setSelectedAddress(Array.isArray(user.address)?user.address[0]:user.address);
setCustomAddress(false);
}
}}
className="ml-2 text-[#F97354] font-semibold bg-transparent hover:underline border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none">
Use Saved Address
</button>

</div>

)}

<hr className="my-8"/>

<h2 className="text-2xl font-bold text-[#3B2418] mb-5">
Phone Number
</h2>

{!customPhone ? (

<>

{Array.isArray(user?.phoneNumber)&&user.phoneNumber.length>0 ? (

<div className="flex gap-4">

<select
value={selectedPhone}
onChange={(e)=>setSelectedPhone(e.target.value)}
className="flex-1 rounded-xl text-[#3B2418] border border-orange-200 bg-[#FFF8F1] p-4">

{user.phoneNumber.map((num,index)=>(

<option
key={index}
value={num}>
{num}
</option>

))}

</select>

<button
onClick={()=>setCustomPhone(true)}
className="bg-[#F97354] text-white px-5 rounded-xl hover:bg-[#ea6847]">
Change
</button>

</div>

):(

<p className="text-red-500">
please add a phone number to your profile to proceed with the order.
</p>

)}

</>

):(


<div>

<input
type="tel"
placeholder="Enter Phone Number"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
className="w-full rounded-xl border text-[#3B2418] border-orange-200 bg-[#FFF8F1] p-4"
/>

<div className="flex gap-3 mt-5">

<button
onClick={async()=>{

if(!phone){
return alert("Enter phone number");
}

try{

const token=localStorage.getItem("token");

const res=await fetch(
`${BACKEND_BASE_URL}/api/auth/update-contact`,
{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`,
},
body:JSON.stringify({

phoneNumbers:[
...(user.phoneNumber||[]),
phone
],

addresses:user.address||[]

})
}
);

const data=await res.json();

if(res.ok){

alert("Phone Number Added");

user.phoneNumber=data.user.phoneNumber;

setSelectedPhone(phone);

setPhone("");

setCustomPhone(false);

}

}catch(err){

console.log(err);

}

}}
className="bg-[#F97354] hover:bg-[#ea6847] text-white px-6 py-3 rounded-xl"
>

Add Phone

</button>

<button
onClick={()=>{
if(user?.phoneNumber){

setSelectedPhone(
Array.isArray(user.phoneNumber)
?user.phoneNumber[0]
:user.phoneNumber
);

setCustomPhone(false);

}
}}
className="ml-2 text-[#F97354] font-semibold bg-transparent hover:underline border-none outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 shadow-none"
>

Use Saved Number

</button>

</div>

</div>

)}

</div>
</div>

{/* RIGHT SIDE */}

<div className="lg:col-span-1">

<div className="sticky top-28 bg-white rounded-3xl shadow-xl p-8">

<h2 className="text-2xl font-bold text-[#3B2418]">
Order Summary
</h2>

<div className="mt-8 space-y-5">

<div className="flex justify-between text-gray-600">
<span>Total Items</span>
<span>{cartItems.length}</span>
</div>

<div className="flex justify-between text-gray-600">
</div>
<div className="flex justify-between text-gray-600">

<span>Subtotal</span>

<span>
₹{totalPrice.toFixed(2)}
</span>

</div>

<div className="flex justify-between text-gray-600">

<span>GST (3%)</span>

<span>
₹{gst.toFixed(2)}
</span>

</div>

<div className="flex justify-between text-gray-600">

<span>Delivery</span>

<span className="text-green-600 font-semibold">

FREE

</span>

</div>
<hr/>

<div className="flex justify-between items-center">

<span className="text-lg text-[#3B2418] font-semibold">
Grand Total
</span>

<span className="text-3xl font-bold text-[#F97354]">
₹{finalTotal.toFixed(2)}
</span>

</div>

</div>

<button
onClick={handlePlaceOrder}
disabled={loading}
className="mt-8 w-full py-4 rounded-xl bg-[#F97354] hover:bg-[#ea6847] text-white font-bold text-lg transition">

{loading ? "Placing Order..." : "Place Order"}

</button>

<p className="mt-5 text-center text-sm text-gray-500">
🔒 Secure Checkout
</p>

</div>

</div>

</div>

</div>

</div>

);
};

export default Cart;