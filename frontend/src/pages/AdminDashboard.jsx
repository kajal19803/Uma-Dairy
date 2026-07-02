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
  const [showCouponModal, setShowCouponModal] = useState(false);

const [couponData, setCouponData] = useState({
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  expiryDate: "",
  usageLimit: 100,
  firstOrderOnly: false,
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
  const handleCreateCoupon = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/coupon/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(couponData),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("Coupon created successfully!");

    setShowCouponModal(false);

    setCouponData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderValue: "",
      maxDiscount: "",
      expiryDate: "",
      usageLimit: 100,
      firstOrderOnly: false,
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
  <div className="min-h-screen w-screen bg-[#FFF8F1] pt-28 pb-20">

    <div className="max-w-7xl mx-auto px-5">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">

        <div>

          <div className="inline-flex px-5 py-2 rounded-full bg-orange-100 text-[#F97354] font-semibold">
            Admin Panel
          </div>

          <h1 className="mt-5 text-5xl font-bold text-[#3B2418]">
            Dashboard
          </h1>

          <p className="mt-3 text-gray-600 text-lg">
            Welcome back,
            <span className="font-semibold text-[#F97354]">
              {" "}{user?.name || "Admin"}
            </span>
          </p>

        </div>

        <div className="flex gap-4 mt-8 lg:mt-0">

          <button
            onClick={() => setShowOfferModal(true)}
            className="px-6 py-4 rounded-2xl bg-[#3B2418] hover:bg-[#2b1b12] text-white font-semibold shadow-lg transition"
          >
            🎁 Upload Offer
          </button>

          <button
            onClick={() => setShowProductModal(true)}
            className="px-6 py-4 rounded-2xl bg-[#F97354] hover:bg-[#ea6847] text-white font-semibold shadow-lg transition"
          >
            ➕ Add Product
          </button>
          <button
  onClick={() => setShowCouponModal(true)}
  className="px-6 py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg transition"
>
  🎟️ Create Coupon
</button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid md:grid-cols-3 gap-8 mb-12">

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="text-5xl mb-5">👥</div>

          <p className="text-gray-500">
            Total Users
          </p>

          <h2 className="text-5xl font-bold text-[#3B2418] mt-3">
            {totalUsersCount}
          </h2>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="text-5xl mb-5">📦</div>

          <p className="text-gray-500">
            Orders Today
          </p>

          <h2 className="text-5xl font-bold text-[#3B2418] mt-3">
            {ordersToday}
          </h2>

        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          <div className="text-5xl mb-5">💰</div>

          <p className="text-gray-500">
            Store Status
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-4">
            Active
          </h2>

        </div>

      </div>

      {/* Users */}

      <div className="bg-white rounded-[32px] shadow-xl p-8">

        <div className="flex items-center justify-between mb-8">

          <h2 className="text-3xl font-bold text-[#3B2418]">
            Registered Users
          </h2>

          <span className="px-5 py-2 rounded-full bg-orange-100 text-[#F97354] font-semibold">
            {userList.length} Users
          </span>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">
            <thead>

              <tr className="border-b border-orange-100">

                <th className="py-4 text-left text-[#3B2418]">
                  Name
                </th>

                <th className="py-4 text-left text-[#3B2418]">
                  Email
                </th>

                <th className="py-4 text-left text-[#3B2418]">
                  Role
                </th>

                <th className="py-4 text-center text-[#3B2418]">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>
            {userList.length === 0 ? (

<tr>
  <td
    colSpan="4"
    className="py-12 text-center text-gray-500 text-lg"
  >
    No users found.
  </td>
</tr>

) : (

userList.map((u) => (

<tr
  key={u._id}
  className="border-b border-orange-50 hover:bg-orange-50 transition"
>

  <td className="py-5">

    <div className="flex items-center gap-4">

      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#F97354] text-lg">
        {u.name?.charAt(0).toUpperCase()}
      </div>

      <div>

        <p className="font-semibold text-[#3B2418]">
          {u.name}
        </p>

        <p className="text-sm text-gray-500">
          User ID: {u._id.slice(-6)}
        </p>

      </div>

    </div>

  </td>

  <td className="text-gray-600">
    {u.email}
  </td>

  <td>

    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        u.role === "admin"
          ? "bg-purple-100 text-purple-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {u.role}
    </span>

  </td>

  <td className="text-center">

    {u.role !== "admin" && (

      <button
        onClick={() => handleDeleteUser(u._id)}
        className="px-5 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-500 hover:text-white transition"
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

{/* Product Modal */}

{showProductModal && (

<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

<div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">

<h2 className="text-3xl font-bold text-[#3B2418] mb-8">
Add New Product
</h2>

<form
onSubmit={handleAddProduct}
className="space-y-5"
><div className="grid md:grid-cols-2 gap-5">

<input
type="text"
placeholder="Product Name"
value={productData.name}
onChange={(e)=>setProductData({...productData,name:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
required
/>

<input
type="text"
placeholder="Category"
value={productData.category}
onChange={(e)=>setProductData({...productData,category:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
required
/>

<input
type="number"
placeholder="MRP"
value={productData.mrp}
onChange={(e)=>setProductData({...productData,mrp:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none"
required
/>

<input
type="number"
placeholder="Discount (%)"
value={productData.discount}
onChange={(e)=>setProductData({...productData,discount:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none"
required
/>

<input
type="number"
placeholder="Selling Price"
value={productData.price}
onChange={(e)=>setProductData({...productData,price:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none"
required
/>

<input
type="text"
placeholder="Unit (1L,500gm...)"
value={productData.unit}
onChange={(e)=>setProductData({...productData,unit:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none"
required
/>

</div>

<textarea
rows="4"
placeholder="Description"
value={productData.description}
onChange={(e)=>setProductData({...productData,description:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none resize-none"
/>

<textarea
rows="3"
placeholder="Ingredients"
value={productData.ingredients}
onChange={(e)=>setProductData({...productData,ingredients:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none resize-none"
/>

<textarea
rows="3"
placeholder="Nutritional Information"
value={productData.nutritionalInfo}
onChange={(e)=>setProductData({...productData,nutritionalInfo:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none resize-none"
/>

<div>

<label className="block text-[#3B2418] font-semibold mb-2">
Upload Product Images
</label>

<input
type="file"
multiple
accept="image/*"
onChange={(e)=>
setProductData((prev)=>{
const files=Array.from(e.target.files);
const existing=new Set(prev.images.map(f=>f.name));
const unique=files.filter(f=>!existing.has(f.name));

return{
...prev,
images:[...prev.images,...unique],
};
})
}
className="block w-full rounded-xl border border-orange-200 bg-[#FFF8F1] p-3"
/>

{productData.images.length>0&&(

<div className="mt-4 flex flex-wrap gap-2">

{productData.images.map((file,index)=>(

<span
key={index}
className="px-3 py-2 rounded-full bg-orange-100 text-[#F97354] text-sm"
>
{file.name}
</span>

))}

</div>

)}

</div>

<div className="flex items-center gap-3">

<input
type="checkbox"
checked={productData.inStock}
onChange={(e)=>setProductData({...productData,inStock:e.target.checked})}
/>

<span className="text-[#3B2418] font-medium">
Product In Stock
</span>

</div>

<div className="flex justify-end gap-4 pt-4">

<button
type="button"
onClick={()=>setShowProductModal(false)}
className="px-6 py-3 rounded-2xl border border-orange-200 hover:bg-orange-50 transition"
>
Cancel
</button>

<button
type="submit"
className="px-8 py-3 rounded-2xl bg-[#F97354] hover:bg-[#ea6847] text-white font-semibold transition"
>
Add Product
</button>

</div>

</form>

</div>

</div>

)}
{/* Offer Modal */}

{showOfferModal && (

<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

<div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl p-8">

<h2 className="text-3xl font-bold text-[#3B2418] mb-8">
Upload New Offer
</h2>

<form
onSubmit={handleAddOffer}
className="space-y-5"
>

<input
type="text"
placeholder="Offer Title"
value={offerData.title}
onChange={(e)=>setOfferData({...offerData,title:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
required
/>

<textarea
rows="4"
placeholder="Offer Description"
value={offerData.description}
onChange={(e)=>setOfferData({...offerData,description:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none resize-none"
required
/>

<input
type="text"
placeholder="Offer Image URL"
value={offerData.imageUrl}
onChange={(e)=>setOfferData({...offerData,imageUrl:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
required
/>

<input
type="text"
placeholder="Product Name"
value={offerData.productName}
onChange={(e)=>setOfferData({...offerData,productName:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
required
/>

<input
type="number"
placeholder="Discount (%)"
value={offerData.discount}
onChange={(e)=>setOfferData({...offerData,discount:e.target.value})}
className="w-full rounded-2xl border border-orange-200 bg-[#FFF8F1] p-4 outline-none focus:border-[#F97354]"
required
/>

<div className="flex justify-end gap-4 pt-4">

<button
type="button"
onClick={()=>setShowOfferModal(false)}
className="px-6 py-3 rounded-2xl border border-orange-200 hover:bg-orange-50 transition"
>
Cancel
</button>

<button
type="submit"
className="px-8 py-3 rounded-2xl bg-[#3B2418] hover:bg-[#2b1b12] text-white font-semibold transition"
>
🎁 Upload Offer
</button>

</div>

</form>

</div>

</div>

)}
{showCouponModal && (

<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

<div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl p-8">

<h2 className="text-3xl font-bold mb-6">
Create Coupon
</h2>

<form onSubmit={handleCreateCoupon} className="space-y-4">

<input
type="text"
placeholder="Coupon Code"
value={couponData.code}
onChange={(e)=>setCouponData({...couponData,code:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<input
type="text"
placeholder="Description"
value={couponData.description}
onChange={(e)=>setCouponData({...couponData,description:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<select
value={couponData.discountType}
onChange={(e)=>setCouponData({...couponData,discountType:e.target.value})}
className="w-full p-4 rounded-xl border"
>

<option value="PERCENTAGE">Percentage</option>

<option value="FLAT">Flat</option>

</select>

<input
type="number"
placeholder="Discount Value"
value={couponData.discountValue}
onChange={(e)=>setCouponData({...couponData,discountValue:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<input
type="number"
placeholder="Minimum Order"
value={couponData.minOrderValue}
onChange={(e)=>setCouponData({...couponData,minOrderValue:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<input
type="number"
placeholder="Maximum Discount"
value={couponData.maxDiscount}
onChange={(e)=>setCouponData({...couponData,maxDiscount:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<input
type="date"
value={couponData.expiryDate}
onChange={(e)=>setCouponData({...couponData,expiryDate:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<input
type="number"
placeholder="Usage Limit"
value={couponData.usageLimit}
onChange={(e)=>setCouponData({...couponData,usageLimit:e.target.value})}
className="w-full p-4 rounded-xl border"
/>

<label className="flex items-center gap-3">

<input
type="checkbox"
checked={couponData.firstOrderOnly}
onChange={(e)=>setCouponData({...couponData,firstOrderOnly:e.target.checked})}
/>

First Order Only

</label>

<div className="flex justify-end gap-4">

<button
type="button"
onClick={()=>setShowCouponModal(false)}
className="px-6 py-3 rounded-xl border"
>

Cancel

</button>

<button
type="submit"
className="px-6 py-3 rounded-xl bg-green-600 text-white"
>

Create Coupon

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