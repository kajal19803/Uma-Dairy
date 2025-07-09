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
      totalPrice,
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
      
      console.log('📦 Response object:', res);
      if (!res.ok) throw new Error('Order failed');
      const data = await res.json();
      localStorage.setItem('latestOrderId', data.order.orderId);
      console.log('📦 Parsed data:', data);
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
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-xl font-semibold text-gray-800 mb-3">Cart is empty</p>
        <Link
          to="/products"
          className="text-base text-yellow-700 hover:underline hover:text-yellow-800"
        >
          View products
        </Link>
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-yellow-900">Your cart</h1>

      {/* Cart Items */}
      <div className="w-full max-w-3xl space-y-4">
        {cartItems.map((item) => (
          <div
            key={item._id}
            className="flex items-center border rounded p-3 shadow-sm bg-white cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(`/product/${item._id}`)}
          >
            <img
              src={`${BACKEND_BASE_URL}${item.images[0]}`}
              alt={item.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-grow ml-4">
              <h2 className="text-lg font-semibold text-blue-700">{item.name}</h2>
              <p className="text-sm text-gray-700">{item.description}</p>
              <p className="text-green-800 font-semibold mt-1">₹{item.price}</p>
              <p className="text-gray-600 text-sm">Quantity: {item.quantity || 1}</p>
              <div className="mt-2 flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(item._id, (item.quantity || 1) - 1);
                  }}
                  disabled={(item.quantity || 1) <= 1}
                  className="px-2 py-1 bg-yellow-700 text-white rounded disabled:opacity-50"
                >
                  -
                </button>
                <span>{item.quantity || 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(item._id, (item.quantity || 1) + 1);
                  }}
                  className="px-2 py-1 bg-yellow-700 text-white rounded"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Remove "${item.name}" from cart?`)) {
                  removeFromCart(item._id);
                }
              }}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Total Price */}
      <div className="mt-6 w-full max-w-3xl text-right text-xl font-bold text-yellow-900">
        Total price: ₹{totalPrice.toFixed(2)}
      </div>

      { /* Address and Phone Section */}
<div className="mt-6 w-full max-w-3xl bg-white p-4 rounded shadow space-y-4">
  <h2 className="text-lg font-semibold text-yellow-800">Delivery Address</h2>

  {!customAddress ? (
    <>
      {Array.isArray(user?.address) && user.address.length > 0 ? (
        <div className="flex justify-between items-center">
          <select
            value={JSON.stringify(selectedAddress)}
            onChange={(e) => setSelectedAddress(JSON.parse(e.target.value))}
            className="w-full border p-2 rounded bg-gray-50 text-gray-800"
          >
            {user.address.map((addr, index) => (
              <option key={index} value={JSON.stringify(addr)}>
                {addr.fullName}, {addr.street}, {addr.city}, {addr.state}, {addr.zip}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCustomAddress(true)}
            className="text-sm text-blue-600 bg-white underline ml-3"
          >
            Add new address
          </button>
        </div>
      ) : (
        <p className="text-red-500">No saved address found</p>
      )}
    </>
  ) : (
    <>
      <input
        type="text"
        placeholder="Full Name"
        className="w-full border bg-white p-2 rounded"
        onChange={(e) => setFormAddress({ ...formAddress, fullName: e.target.value })}
      />
      <input
        type="text"
        placeholder="Street"
        className="w-full border bg-white p-2 rounded"
        onChange={(e) => setFormAddress({ ...formAddress, street: e.target.value })}
      />
      <input
        type="text"
        placeholder="City"
        className="w-full border bg-white p-2 rounded"
        onChange={(e) => setFormAddress({ ...formAddress, city: e.target.value })}
      />
      <input
        type="text"
        placeholder="State"
        className="w-full border bg-white p-2 rounded"
        onChange={(e) => setFormAddress({ ...formAddress, state: e.target.value })}
      />
      <input
        type="text"
        placeholder="ZIP Code"
        className="w-full border bg-white p-2 rounded"
        onChange={(e) => setFormAddress({ ...formAddress, zip: e.target.value })}
      />
      <button
        onClick={() => {
          if (user?.address) {
            setSelectedAddress(Array.isArray(user.address) ? user.address[0] : user.address);
            setCustomAddress(false);
          }
        }}
        className="text-sm text-blue-600 bg-white underline"
      >
        Use saved address
      </button>
    </>
  )}

  <h2 className="text-lg font-semibold text-yellow-800 mt-4">Phone Number</h2>

  {!customPhone ? (
    <>
      {Array.isArray(user?.phoneNumber) && user.phoneNumber.length > 0 ? (
        <div className="flex justify-between items-center">
          <select
            value={selectedPhone}
            onChange={(e) => setSelectedPhone(e.target.value)}
            className="w-full border p-2 rounded bg-gray-50 text-gray-800"
          >
            {user.phoneNumber.map((num, index) => (
              <option key={index} value={num}>
                {num}
              </option>
            ))}
          </select>
          <button
            onClick={() => setCustomPhone(true)}
            className="text-sm text-blue-600  bg-white underline ml-3"
          >
            Use different number
          </button>
        </div>
      ) : (
        <p className="text-red-500">No saved phone number found</p>
      )}
    </>
  ) : (
    <>
      <input
        type="tel"
        placeholder="Enter Phone Number"
        className="w-full border bg-white p-2 rounded"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={() => {
          if (user?.phoneNumber) {
            setSelectedPhone(
              Array.isArray(user.phoneNumber) ? user.phoneNumber[0] : user.phoneNumber
            );
            setCustomPhone(false);
          }
        }}
        className="text-sm text-blue-600 bg-white underline"
      >
        Use saved number
      </button>
    </>
  )}
</div>


      {/* Place Order Button */}
      <div className="mt-6 w-full max-w-3xl text-right">
        <button
          onClick={handlePlaceOrder}
          className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          disabled={loading}
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Cart;



