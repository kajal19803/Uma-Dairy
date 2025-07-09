import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { isTokenValid } from '../utils/auth';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [phone, setPhone] = useState('');

  const getPriceNumber = (price) => {
    if (typeof price === 'number') return price;
    const match = typeof price === 'string' && price.match(/\u20B9(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : parseFloat(price) || 0;
  };

  const totalPrice = cartItems.reduce((total, item) => {
    return total + getPriceNumber(item.price) * (item.quantity || 1);
  }, 0);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserData(data);
      setAddress(data.address || {});
      setPhone(data.phoneNumber || '');
    } catch (err) {
      console.error('Error fetching user:', err);
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') setPhone(value);
    else setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const { fullName, street, city, state, zip } = address;
    if (!fullName || !street || !city || !state || !zip || !phone) {
      alert('Please fill all fields.');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = JSON.parse(atob(token.split('.')[1])).id;

    setLoading(true);

    try {
      await fetch(`${BACKEND_BASE_URL}/api/auth/update-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address, phoneNumber: phone }),
      });

      const orderPayload = {
        userId,
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: getPriceNumber(item.price),
        })),
        totalPrice,
        address,
        phone,
        status: 'Pending',
      };

      const orderRes = await fetch(`${BACKEND_BASE_URL}/api/orders/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderRes.ok) throw new Error('Order failed');
      const orderData = await orderRes.json();
      localStorage.setItem('latestOrderId', orderData._id);

      clearCart();
      navigate('/payment', {
        state: {
          address,
          phone,
          cartItems,
          totalPrice,
          orderId: orderData._id,
        },
      });
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <div className="p-6 text-center text-lg">Loading user info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <form
        onSubmit={handleOrderSubmit}
        className="bg-white rounded-lg p-6 shadow max-w-xl w-full"
      >
        <h2 className="text-2xl font-bold text-yellow-800 mb-4">Checkout</h2>

        {['fullName', 'street', 'city', 'state', 'zip'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={address[field] || ''}
            onChange={handleInputChange}
            placeholder={field === 'zip' ? 'ZIP Code' : field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full border p-2 rounded mb-3"
            required
          />
        ))}

        <input
          type="tel"
          name="phone"
          value={phone}
          onChange={handleInputChange}
          placeholder="Phone Number"
          className="w-full border p-2 rounded mb-4"
          required
        />

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-700 hover:bg-yellow-800 text-white px-6 py-2 rounded font-semibold"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
