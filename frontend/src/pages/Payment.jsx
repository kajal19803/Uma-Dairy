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
    <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-teal-200 p-4">
      <h2 className="text-2xl font-bold mb-4 text-yellow-900">Payment Page</h2>

      <div className="mb-6 bg-white p-4 rounded shadow w-full max-w-md">
        <p className="text-sm text-gray-700"><strong>Order ID:</strong> {orderId}</p>

        <div>
          <p className="font-semibold text-yellow-800 mb-2">Items:</p>
          <div className="border rounded">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b p-3 text-sm"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                       item.images?.[0]
                         ? `${BACKEND_BASE_URL}${item.images[0]}`
                        : item.productId?.images?.[0]
                        ? item.productId.images[0].startsWith('/uploads')
                        ? `${BACKEND_BASE_URL}${item.productId.images[0]}`
                        : `${BACKEND_BASE_URL}/uploads/${item.productId.images[0]}`
                        : '/placeholder.jpg'
                        }
                       alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                     }}
                     />

                  <div>
                    <p className="font-semibold text-blue-700">{item.name}</p>
                    <p className="text-gray-500">Product ID: {item._id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p>Qty: {item.quantity}</p>
                  <p>Price: ₹{item.price}</p>
                  <p className="font-semibold text-green-700">Total: ₹{Number(item.price) * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3 className="font-semibold mb-2 text-gray-900 mt-4">Delivery Details</h3>
        <p className="text-gray-700"><strong>Name:</strong> {user?.name}</p>
        <p className="text-gray-700"><strong>Email:</strong> {user?.email}</p>
        <p className="text-gray-700"><strong>Phone:</strong> {phone}</p>
        <p className="text-black"><strong>🏠 Address:</strong></p>
        {typeof address === 'object' ? (
          <p className="ml-2 text-sm text-gray-700">
            {address.street}, {address.city}, {address.state} - {address.zip || address.pincode}
          </p>
        ) : (
          <p className="ml-2 text-sm text-gray-700">{address}</p>
        )}

        <button
          className="text-blue-600 bg-white underline mt-2"
          onClick={() => navigate('/cart')}
        >
          ✏️ Edit Details
        </button>
      </div>

      {/* Payment method selector */}
      <div className="mb-4 w-full max-w-md">
        <p className="font-semibold text-gray-800 mb-2">Select Payment Method:</p>
        <div className="flex items-center gap-6">
          <label className="flex text-gray-700 items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={() => setPaymentMethod('online')}
            />
            Online Payment
          </label>
          <label className="flex text-gray-700 items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
            />
            Cash on Delivery
          </label>
        </div>
      </div>

      <div className="mb-6 text-xl font-semibold text-yellow-900">
        Total Amount to Pay: ₹{totalPrice?.toFixed(2)}
      </div>

      {paymentMethod === 'online' ? (
        <button
          onClick={handlePayment}
          disabled={loading || !cfInstance}
          className="bg-yellow-800 text-white px-6 py-3 rounded hover:bg-yellow-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      ) : (
        <button
          onClick={handleCOD}
          className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-600"
        >
          Confirm Order
        </button>
      )}

      <div
        id="cashfree-checkout"
        className="w-full max-w-md mt-6"
        style={{ minHeight: '700px' }}
      />
    </div>
  );
};

export default Payment;
