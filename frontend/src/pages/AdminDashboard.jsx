import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const [userList, setUserList] = useState([]);
  const [ordersToday, setOrdersToday] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const [showProductModal, setShowProductModal] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    mrp: '',
    discount: '',
    price: '',
    unit: '',
    ingredients: '',
    nutritionalInfo: '',
    inStock: true,
    category: '',
    images: [],
  });

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    productName: '',
    discount: '',
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('userRole');

    if (!user || role !== 'admin') {
      navigate('/login');
    } else {
      fetchUsers();
      fetchDashboardStats();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setUserList(data.users || []);
      setTotalUsersCount(data.users.length || 0);
    } catch (err) {
      alert('Error fetching user list');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/admin/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setOrdersToday(data.ordersToday || 0);
    } catch (err) {
      alert('Error fetching dashboard stats');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('mrp', productData.mrp);
    formData.append('discount', productData.discount);
    formData.append('price', productData.price);
    formData.append('unit', productData.unit);
    formData.append('ingredients', productData.ingredients);
    formData.append('nutritionalInfo', productData.nutritionalInfo);
    formData.append('inStock', productData.inStock);
    formData.append('category', productData.category);

    for (let i = 0; i < productData.images.length; i++) {
      formData.append('images', productData.images[i]);
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/products/add`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      alert('Product added successfully');
      setShowProductModal(false);
      setProductData({
        name: '',
        description: '',
        mrp: '',
        discount: '',
        price: '',
        unit: '',
        ingredients: '',
        nutritionalInfo: '',
        inStock: true,
        category: '',
        images: [],
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();

    const { title, description, imageUrl, productName, discount } = offerData;

    if (!title || !description || !imageUrl || !productName || !discount) {
      alert('Please fill all offer fields');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/offers/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(offerData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message);
      }

      alert('Offer uploaded and emails sent successfully!');
      setShowOfferModal(false);
      setOfferData({
        title: '',
        description: '',
        imageUrl: '',
        productName: '',
        discount: '',
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete');
      alert('User deleted');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="w-screen min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-md shadow-md">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Admin Dashboard</h1>
        <p className="text-gray-700 mb-6">
          Welcome, <span className="font-semibold">{user?.name || 'Admin'}</span> ({user?.email})
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-100 p-4 rounded-md shadow">
            <h2 className="text-lg font-semibold text-green-800">Total Users</h2>
            <p className="text-2xl text-green-900 mt-2">{totalUsersCount}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-md shadow">
            <h2 className="text-lg font-semibold text-green-800">Orders Today</h2>
            <p className="text-2xl text-green-900 mt-2">{ordersToday}</p>
          </div>
          <div>
            <button
              onClick={() => setShowOfferModal(true)}
              className="mb-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Upload Offer
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowProductModal(true)}
          className="mb-8 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>

        <div>
          <h2 className="text-2xl font-semibold mb-4">User List</h2>
          <div className="overflow-x-auto max-w-full">
            <table className="min-w-full bg-white border border-gray-200 rounded-md">
              <thead>
                <tr className="bg-green-200">
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Email</th>
                  <th className="py-2 px-4 border">Role</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No users found
                    </td>
                  </tr>
                ) : (
                  userList.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border">{u.name}</td>
                      <td className="py-2 px-4 border">{u.email}</td>
                      <td className="py-2 px-4 border capitalize">{u.role}</td>
                      <td className="py-2 px-4 border">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg p-6 w-96 relative overflow-y-auto max-h-screen">
              <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="space-y-3">
                {[
                  ['name', 'Product Name'],
                  ['description', 'Description'],
                  ['mrp', 'MRP'],
                  ['discount', 'Discount (%)'],
                  ['price', 'Price'],
                  ['unit', 'Unit (e.g., 1L, 500g)'],
                  ['ingredients', 'Ingredients'],
                  ['nutritionalInfo', 'Nutritional Info'],
                  ['category', 'Category'],
                ].map(([key, label]) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={label}
                    value={productData[key]}
                    onChange={(e) => setProductData({ ...productData, [key]: e.target.value })}
                    className="w-full border bg-white px-3 py-2 rounded-md"
                    required
                  />
                ))}
                  <label className="block">
                   <span className="text-gray-700">Upload Images</span>
                    <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                    setProductData((prev) => {
                     const newFiles = Array.from(e.target.files);
                     const existingNames = new Set(prev.images.map((f) => f.name));
                     const uniqueFiles = newFiles.filter((f) => !existingNames.has(f.name));

                    return {
                       ...prev,
                       images: [...prev.images, ...uniqueFiles],
                     };
                     })
                      }

                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                    />
                  </label>

                  {/* Show selected filenames */}
                  {productData.images.length > 0 && (
                  <ul className="text-sm text-gray-600 mt-2 list-disc pl-5 max-h-24 overflow-y-auto">
                  {productData.images.map((file, idx) => (
                  <li key={idx}>{file.name}</li>))}
                  </ul>
                   )}

               <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showOfferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg p-6 w-96 relative">
              <h3 className="text-xl font-semibold mb-4">Upload New Offer</h3>
              <form onSubmit={handleAddOffer} className="space-y-3">
                {['title', 'description', 'imageUrl', 'productName', 'discount'].map((key) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={key[0].toUpperCase() + key.slice(1)}
                    value={offerData[key]}
                    onChange={(e) => setOfferData({ ...offerData, [key]: e.target.value })}
                    className="w-full border bg-white px-3 py-2 rounded-md"
                    required
                  />
                ))}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowOfferModal(false)}
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Upload Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;



