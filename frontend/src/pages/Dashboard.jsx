import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useUserStore from '../store/userStore';
import { FaHeart } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Dashboard = () => {
  const { user, setUser } = useUserStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState({ fullName: '', street: '', city: '', state: '', zip: '' });
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return navigate('/login');

    const fetchUserData = async () => {
      try {
        const [userRes, wishlistRes] = await Promise.all([
          fetch (`${API_URL}/api/user`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/auth/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!userRes.ok || !wishlistRes.ok) throw new Error('Fetch failed');

        const userData = await userRes.json();
        const wishlistData = await wishlistRes.json();

        setUser(userData);
        setAddresses(userData.address || []);
        setPhoneNumbers(userData.phoneNumber || []);
        setWishlist(wishlistData.wishlist || []);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate, setUser]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payment/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Orders fetch failed');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Fetch orders failed', err);
      }
    };

    const fetchTickets = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tickets/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Ticket fetch failed');
        const data = await res.json();
        console.log("🎫 Tickets response:", data);
        setTickets(data || []);


        
      } catch (err) {
        console.error('Fetch tickets failed', err);
      }
    };

    if (token) {
      fetchOrders();
      fetchTickets();
    }
  }, [token]);

  const updateContact = async (updatedPhones, updatedAddresses) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/update-contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phoneNumbers: updatedPhones, addresses: updatedAddresses })
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.user.address);
        setPhoneNumbers(data.user.phoneNumber);
      }
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleAddPhone = () => {
    if (!newPhone || phoneNumbers.includes(newPhone)) return;
    updateContact([...phoneNumbers, newPhone], addresses);
    setNewPhone('');
  };

  const handleAddAddress = () => {
    if (Object.values(newAddress).some(val => !val)) return;
    updateContact(phoneNumbers, [...addresses, newAddress]);
    setNewAddress({ fullName: '', street: '', city: '', state: '', zip: '' });
  };

  const removePhone = async (phone) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/remove-phone`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone })
      });
      if (res.ok) setPhoneNumbers(phoneNumbers.filter(p => p !== phone));
    } catch (err) {
      console.error('Remove phone failed', err);
    }
  };

  const removeAddress = async (addressToRemove) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/remove-address`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addressToRemove })
      });
      if (res.ok) setAddresses(addresses.filter(a => JSON.stringify(a) !== JSON.stringify(addressToRemove)));
    } catch (err) {
      console.error('Remove address failed', err);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/wishlist/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      if (res.ok) setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (err) {
      console.error('Remove from wishlist failed', err);
    }
  };

  return (
<div className="min-h-screen w-screen bg-[#FFF8F1]">

<Navbar/>

<div className="max-w-7xl mx-auto pt-28 pb-16 px-5 grid lg:grid-cols-4 gap-8">

{/* SIDEBAR */}

<div className="lg:col-span-1">

<div className="bg-white rounded-3xl shadow-xl p-6 sticky top-28">

<div className="text-center">

<div className="w-24 h-24 rounded-full bg-orange-100 mx-auto flex items-center justify-center text-4xl">
👤
</div>

<h2 className="mt-4 text-2xl font-bold text-[#3B2418]">
{user?.name}
</h2>

<p className="text-gray-500 text-sm mt-1">
{user?.email}
</p>

</div>

<hr className="my-6"/>

<div className="space-y-2">

<button onClick={()=>setActiveSection("profile")} className={`w-full text-left px-5 py-3 rounded-xl transition border border-orange-100 ${activeSection==="profile"?"bg-[#F97354] text-white border-[#F97354]":"bg-white text-[#3B2418] hover:bg-orange-50"}`}>
👤 My Profile
</button>

<button onClick={()=>setActiveSection("wishlist")} className={`w-full text-left px-5 py-3 rounded-xl transition border border-orange-100 ${activeSection==="wishlist"?"bg-[#F97354] text-white border-[#F97354]":"bg-white text-[#3B2418] hover:bg-orange-50"}`}>
❤️ Wishlist
</button>

<button onClick={()=>setActiveSection("orders")} className={`w-full text-left px-5 py-3 rounded-xl transition border border-orange-100 ${activeSection==="orders"?"bg-[#F97354] text-white border-[#F97354]":"bg-white text-[#3B2418] hover:bg-orange-50"}`}>
📦 Orders
</button>

<button onClick={()=>setActiveSection("addresses")} className={`w-full text-left px-5 py-3 rounded-xl transition border border-orange-100 ${activeSection==="addresses"?"bg-[#F97354] text-white border-[#F97354]":"bg-white text-[#3B2418] hover:bg-orange-50"}`}>
📍 Addresses
</button>

<button onClick={()=>setActiveSection("phones")} className={`w-full text-left px-5 py-3 rounded-xl transition border border-orange-100 ${activeSection==="phones"?"bg-[#F97354] text-white border-[#F97354]":"bg-white text-[#3B2418] hover:bg-orange-50"}`}>
📞 Phone Numbers
</button>

<button onClick={()=>setActiveSection("tickets")} className={`w-full text-left px-5 py-3 rounded-xl transition border border-orange-100 ${activeSection==="tickets"?"bg-[#F97354] text-white border-[#F97354]":"bg-white text-[#3B2418] hover:bg-orange-50"}`}>
🎫 Support Tickets
</button>

</div>

</div>

</div>

{/* MAIN */}

<div className="lg:col-span-3">

{/* PROFILE */}

{activeSection==="profile"&&(

<div className="bg-white rounded-3xl shadow-xl p-10">

<h1 className="text-4xl font-bold text-[#3B2418]">
Welcome Back 👋
</h1>

<p className="mt-2 text-gray-500">
Manage your account information and orders.
</p>

<div className="grid md:grid-cols-2 gap-6 mt-10">

<div className="rounded-2xl bg-[#FFF8F1] p-6">

<p className="text-gray-500">
Name
</p>

<h3 className="text-xl font-bold text-[#3B2418] mt-2">
{user?.name}
</h3>

</div>

<div className="rounded-2xl bg-[#FFF8F1] p-6">

<p className="text-gray-500">
Email
</p>

<h3 className="text-xl font-bold text-[#3B2418] mt-2">
{user?.email}
</h3>

</div>

<div className="rounded-2xl bg-[#FFF8F1] p-6">

<p className="text-gray-500">
Saved Addresses
</p>

<h3 className="text-4xl font-bold text-[#F97354] mt-2">
{addresses.length}
</h3>

</div>

<div className="rounded-2xl bg-[#FFF8F1] p-6">

<p className="text-gray-500">
Orders
</p>

<h3 className="text-4xl font-bold text-[#F97354] mt-2">
{orders.length}
</h3>

</div>

</div>

</div>

)}

{/* WISHLIST */}

{activeSection==="wishlist"&&(

<div>

<h2 className="text-4xl font-bold text-[#3B2418] mb-8">
My Wishlist
</h2>

{wishlist.length?(
<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

{wishlist.map(item=>(

<div key={item._id} className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition">

<Link to={`/product/${item._id}`}>

<img
src={
item.images?.[0]
?(item.images[0].startsWith("/uploads")
?`${API_URL}${item.images[0]}`
:`${API_URL}/uploads/${item.images[0]}`)
:"/placeholder.jpg"
}
alt={item.name}
className="w-full h-56 object-cover"
/>

<div className="p-5">

<h3 className="text-xl font-bold text-[#3B2418]">
{item.name}
</h3>

<p className="mt-2 text-2xl font-bold text-[#F97354]">
₹{item.price}
</p>

<p className={`mt-2 font-medium ${item.inStock?"text-green-600":"text-red-500"}`}>
{item.inStock?"In Stock":"Out of Stock"}
</p>

</div>

</Link>

<div className="px-5 pb-5">

<button
onClick={()=>removeFromWishlist(item._id)}
className="w-full bg-[#F97354] hover:bg-[#ea6847] text-white py-3 rounded-xl transition flex justify-center items-center gap-2">

<FaHeart/>

Remove

</button>

</div>

</div>

))}

</div>

):(

<div className="bg-white rounded-3xl shadow-xl p-16 text-center">

<div className="text-7xl">
❤️
</div>

<h3 className="mt-5 text-2xl font-bold text-[#3B2418]">
Your Wishlist is Empty
</h3>

<p className="mt-2 text-gray-500">
Save your favourite dairy products here.
</p>

</div>

)}

</div>

)}
{/* ORDERS */}

{activeSection === "orders" && (

<div>

<h2 className="text-3xl font-bold text-[#3B2418] mb-6">
My Orders
</h2>

{orders.length ? (

<div className="space-y-6">

{orders.map((order) => (

<div
key={order._id}
className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100"
>

{/* ================= Header ================= */}

<div className="px-6 py-5 bg-[#FFF8F1] border-b border-orange-100">

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

<div>

<h3 className="text-xl font-bold text-[#3B2418]">
Order #{order.orderId}
</h3>

<p className="text-sm text-gray-500 mt-1">
📅 {new Date(order.createdAt).toLocaleString("en-IN")}
</p>

<p className="text-sm text-gray-500">
📞 {order.phone}
</p>

</div>

<div className="flex flex-wrap gap-2">

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
order.orderStatus === "PLACED"
? "bg-green-100 text-green-700"
: "bg-yellow-100 text-yellow-700"
}`}
>
📦 {order.orderStatus}
</span>

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
order.paymentStatus === "PAID"
? "bg-green-100 text-green-700"
: "bg-orange-100 text-orange-700"
}`}
>
💳 {order.paymentStatus}
</span>

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
order.paymentMethod === "COD"
? "bg-blue-100 text-blue-700"
: "bg-purple-100 text-purple-700"
}`}
>
{order.paymentMethod === "COD"
? "💵 COD"
: "🌐 ONLINE"}
</span>

</div>

</div>

</div>

{/* ================= Address ================= */}

{order.address && (

<div className="px-6 pt-5">

<h4 className="font-semibold text-[#3B2418] text-sm mb-2">
📍 Delivery Address
</h4>

<div className="bg-orange-50 rounded-xl p-4">

<p className="font-semibold text-[#3B2418]">
{order.address.fullName}
</p>

<p className="text-sm text-gray-600 mt-1">
{order.address.street}
</p>

<p className="text-sm text-gray-600">
{order.address.city}, {order.address.state} - {order.address.zip}
</p>

</div>

</div>

)}

{/* ================= Products ================= */}

<div className="px-6 py-5 space-y-4">

{order.items.map((item,index)=>(

<div
key={index}
className="flex items-center gap-4 border border-orange-100 rounded-xl p-4 hover:shadow-sm transition"
>

<img
src={
item.images?.[0]
? item.images[0].startsWith("/uploads")
? `${API_URL}${item.images[0]}`
: `${API_URL}/uploads/${item.images[0]}`
: "/placeholder.jpg"
}
alt={item.name}
className="w-20 h-20 rounded-xl object-cover border border-orange-100"
/>

<div className="flex-1">

<h4 className="text-lg font-bold text-[#3B2418]">
{item.name}
</h4>

<p className="text-sm text-gray-500 mt-1">
Category :
<span className="font-medium">
{" "}{item.category}
</span>
</p>

<p className="text-sm text-gray-500">
Unit :
<span className="font-medium">
{" "}{item.unit}
</span>
</p>

<div className="flex items-center gap-2 mt-2">

<span className="text-xl font-bold text-[#F97354]">
₹{item.price}
</span>

<span className="text-sm text-gray-400 line-through">
₹{item.mrp}
</span>

<span className="text-[11px] bg-red-100 text-red-600 px-2 py-1 rounded-full">
{item.discount}% OFF
</span>

</div>

</div>

<div className="text-right">

<p className="text-sm text-gray-500">
Qty : {item.quantity}
</p>

<p className="font-semibold text-[#3B2418] mt-1">
₹{item.price} × {item.quantity}
</p>

<p className="text-2xl font-bold text-[#F97354] mt-1">
₹{(item.price * item.quantity).toFixed(2)}
</p>

</div>

</div>

))}
</div>

{/* ================= Footer ================= */}

<div className="border-t border-orange-100 px-6 py-5">

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

<div>

<p className="text-sm text-gray-500">
Grand Total
</p>

<h3 className="text-3xl font-bold text-[#F97354]">
₹{Number(order.totalPrice).toFixed(2)}
</h3>

</div>

{order.paymentMethod === "ONLINE" &&
order.paymentStatus === "PENDING" && (

<button
onClick={() => navigate("/payment", { state: { order } })}
className="bg-[#F97354] hover:bg-[#ea6847] text-white px-6 py-3 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-lg"
>

💳 Complete Payment

</button>

)}

</div>

</div>

</div>

))}

</div>

) : (

<div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-orange-100">

<div className="text-6xl">
📦
</div>

<h3 className="mt-4 text-2xl font-bold text-[#3B2418]">
No Orders Yet
</h3>

<p className="mt-2 text-gray-500">
You haven't placed any orders yet.
</p>

<button
onClick={() => navigate("/products")}
className="mt-6 bg-[#F97354] hover:bg-[#ea6847] text-white px-6 py-3 rounded-xl font-semibold transition"
>

🛒 Shop Now

</button>

</div>

)}

</div>

)}
{/* ADDRESSES */}

{activeSection==="addresses"&&(

<div>

<h2 className="text-4xl font-bold text-[#3B2418] mb-8">
My Addresses
</h2>

<div className="space-y-5">

{addresses.map((addr,i)=>(

<div key={i} className="bg-white rounded-3xl shadow-lg p-6">

<h3 className="font-bold text-xl text-[#3B2418]">
{addr.fullName}
</h3>

<p className="text-gray-600 mt-2">
{addr.street}
</p>

<p className="text-gray-600">
{addr.city}, {addr.state} - {addr.zip}
</p>

<button
onClick={()=>removeAddress(addr)}

className="mt-5 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2 rounded-xl font-semibold transition">
Remove

</button>

</div>

))}

</div>

</div>

)}

{/* PHONE */}

{activeSection==="phones"&&(

<div>

<h2 className="text-4xl font-bold text-[#3B2418] mb-8">
Phone Numbers
</h2>

<div className="bg-white rounded-3xl shadow-xl p-8">

{phoneNumbers.map((phone,i)=>(

<div key={i} className="flex justify-between items-center border-b border-orange-100 py-4">

<span className="font-medium">
{phone}
</span>

<button
onClick={()=>removePhone(phone)}
className="text-red-500 hover:underline">

Remove

</button>

</div>

))}

<input
value={newPhone}
onChange={e=>setNewPhone(e.target.value)}
placeholder="Add Phone Number"
className="mt-6 w-full rounded-xl border border-orange-200 bg-[#FFF8F1] px-4 py-3"
/>

<button
onClick={handleAddPhone}
className="mt-5 bg-[#F97354] text-white px-6 py-3 rounded-xl">

Add Phone

</button>

</div>

</div>

)}

{/* ================= SUPPORT TICKETS ================= */}

{activeSection === "tickets" && (

<div>

<h2 className="text-3xl font-bold text-[#3B2418] mb-6">
Support Tickets
</h2>

{tickets.length ? (

<div className="space-y-5">

{tickets.map((ticket) => (

<div
key={ticket._id}
className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
>

{/* Header */}

<div className="bg-[#FFF8F1] border-b border-orange-100 px-6 py-4">

<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

<div>

<h3 className="text-lg font-bold text-[#3B2418]">
🎫 {ticket.issueType}
</h3>

<p className="text-sm text-gray-500 mt-1">
Ticket : {ticket.ticketNumber}
</p>

<p className="text-sm text-gray-500">
📅 {new Date(ticket.createdAt).toLocaleString("en-IN")}
</p>

</div>

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
ticket.status === "Resolved"
? "bg-green-100 text-green-700"
: ticket.status === "Open"
? "bg-red-100 text-red-600"
: "bg-yellow-100 text-yellow-700"
}`}
>
{ticket.status}
</span>

</div>

</div>

{/* Body */}

<div className="p-6 space-y-5">

{/* Order */}

<div>

<p className="text-xs uppercase tracking-wider text-gray-500">
Related Order
</p>

<p className="font-semibold text-[#3B2418]">
{ticket.orderId}
</p>

</div>

{/* Products */}

{ticket.productNames?.length > 0 && (

<div>

<p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
Products
</p>

<div className="flex flex-wrap gap-2">

{ticket.productNames.map((product,index)=>(

<span
key={index}
className="px-3 py-1 rounded-full bg-orange-100 text-[#F97354] text-sm font-medium"
>

{product}

</span>

))}

</div>

</div>

)}

{/* Message */}

<div>

<p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
Issue Description
</p>

<div className="bg-orange-50 rounded-xl p-4 text-gray-700 leading-7">

{ticket.message}

</div>

</div>

{/* Images */}

{ticket.images?.length > 0 && (

<div>

<p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
Evidence
</p>

<div className="flex flex-wrap gap-3">

{ticket.images.map((image,index)=>(

<img
key={index}
src={`${API_URL}${image}`}
alt="ticket"
className="w-24 h-24 rounded-xl object-cover border border-orange-100 hover:scale-105 transition"
/>

))}

</div>

</div>

)}

</div>

</div>

))}

</div>

) : (

<div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-12 text-center">

<div className="text-6xl">
🎫
</div>

<h3 className="mt-4 text-2xl font-bold text-[#3B2418]">
No Support Tickets
</h3>

<p className="mt-2 text-gray-500">
You haven't raised any support ticket yet.
</p>

</div>

)}

</div>

)}
</div>

</div>



</div>



);

};

export default Dashboard;