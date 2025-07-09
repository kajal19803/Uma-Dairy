
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-green-100 p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-4">🎉 Order Placed Successfully!</h1>
      <p className="text-lg text-gray-700 mb-6">Thank you for your purchase. Your items will be delivered soon.</p>
      <Link
        to="/"
        className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default OrderSuccess;
