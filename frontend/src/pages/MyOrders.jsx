import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_BASE_URL}/api/payment/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Orders response:', res.data);
        setOrders(res.data.orders);
      } catch (err) {
        console.error ('Fetch orders error:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="w-screen h-screen text-center mt-10 text-gray-600">Loading your orders...</div>;

  if (error) return <div className="w-screen h-screen text-center mt-10 text-red-600 font-semibold">{error}</div>;

  if (!Array.isArray(orders) || orders.length === 0)
    return <div className="w-screen h-screen text-center mt-10 text-gray-700">You have no orders yet.</div>;

  return (
    <div className="flex flex-col w-screen h-screen p-4">
      <h2 className="text-2xl text-gray-800 font-semibold mb-4">My Orders</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border text-gray-800 border-gray-700 px-4 py-2">Order ID</th>
            <th className="border text-gray-800 border-gray-700 px-4 py-2">Amount (₹)</th>
            <th className="border text-gray-800 border-gray-700 px-4 py-2">Status</th>
            <th className="border text-gray-800 border-gray-700 px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td className="border text-gray-800 border-gray-700 px-4 py-2">{order._id}</td>
              <td className="border text-gray-800 border-gray-700 px-4 py-2">{order.totalPrice || order.amount || 'N/A'}</td>
              <td
                className={`border border-gray-700 px-4 py-2 font-semibold ${
                  order.status?.toLowerCase() === 'paid'
                    ? 'text-green-600'
                    : order.status?.toLowerCase() === 'failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {order.status || 'pending'}
              </td>
              <td className="border text-gray-800 border-gray-700 px-4 py-2">
                {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyOrders;

