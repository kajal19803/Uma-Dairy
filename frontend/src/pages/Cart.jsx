import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import useUserStore from "../store/userStore";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Cart = () => {
  const navigate = useNavigate();

  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useUserStore();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [customAddress, setCustomAddress] = useState(false);
  const [customPhone, setCustomPhone] = useState(false);

  const [formAddress, setFormAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const getPriceNumber = (price) => {
    if (typeof price === "number") return price;

    const match = price.match(/\₹(\d+(\.\d+)?)/);

    return match ? parseFloat(match[1]) : parseFloat(price) || 0;
  };

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total + getPriceNumber(item.price) * (item.quantity || 1),
    0
  );

  const gst = totalPrice * 0.03;
  const finalTotal = totalPrice + gst;

  useEffect(() => {
    if (user?.address) {
      if (Array.isArray(user.address))
        setSelectedAddress(user.address[0]);
      else
        setSelectedAddress(user.address);
    }

    if (user?.phoneNumber) {
      if (Array.isArray(user.phoneNumber))
        setSelectedPhone(user.phoneNumber[0]);
      else
        setSelectedPhone(user.phoneNumber);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place order");
      navigate("/login");
      return;
    }

    let addressData = selectedAddress;
    let phoneData = selectedPhone;

    if (customAddress) {
      const { fullName, street, city, state, zip } = formAddress;

      if (!fullName || !street || !city || !state || !zip) {
        return alert("Please fill in all address fields");
      }

      addressData = formAddress;
    }

    if (customPhone && !phone) {
      return alert("Please enter phone number");
    }

    if (customPhone) phoneData = phone;

    const orderPayload = {
      items: cartItems.map((item) => ({
        _id: item._id,
        quantity: item.quantity,
      })),
      totalPrice: finalTotal,
      address: addressData,
      phone: phoneData,
    };

    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_BASE_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: JSON.stringify(orderPayload),
        }
      );

      if (!res.ok) throw new Error("Order failed");

      const data = await res.json();

      localStorage.setItem(
        "latestOrderId",
        data.order.orderId
      );

      navigate("/payment", {
        state: {
          order: data.order,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen w-screen bg-[#FFF8F1] flex items-center justify-center pt-20 lg:pt-24 px-4">

        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-12 text-center max-w-md w-full">

          <div className="text-5xl lg:text-7xl mb-4 lg:mb-6">
            🛒
          </div>

          <h2 className="text-2xl lg:text-4xl font-bold text-[#3B2418]">
            Your Cart is Empty
          </h2>

          <p className="mt-3 lg:mt-4 text-sm lg:text-base text-gray-500">
            Looks like you haven't added any dairy products yet.
          </p>

          <Link
            to="/products"
            className="inline-block mt-6 lg:mt-8 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-[#F97354] text-white font-semibold hover:bg-[#ea6847] transition"
          >
            Continue Shopping
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[#FFF8F1] pt-20 lg:pt-28 pb-12 lg:pb-16 px-3 lg:px-5">

  <div className="max-w-7xl mx-auto">

    {/* Header */}

    <div className="text-center mb-8 lg:mb-12">

      <h1 className="text-3xl lg:text-5xl font-bold text-[#3B2418]">
        Shopping Cart
      </h1>

      <p className="mt-2 lg:mt-3 text-sm lg:text-lg text-gray-500">
        Review your selected dairy products
      </p>

    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

      {/* LEFT */}

      <div className="lg:col-span-2">

        <div className="space-y-4 lg:space-y-6">

          {cartItems.map((item) => (

            <div
              key={item._id}
              onClick={() => navigate(`/product/${item._id}`)}
              className="bg-white rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition duration-300 p-3 lg:p-6 flex flex-col sm:flex-row gap-3 lg:gap-6 cursor-pointer"
            >

              <img
                src={`${BACKEND_BASE_URL}${item.images[0]}`}
                alt={item.name}
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl lg:rounded-2xl object-cover border border-orange-100 mx-auto sm:mx-0"
              />

              <div className="flex-1">

                <h2 className="text-lg lg:text-2xl font-bold text-[#3B2418]">
                  {item.name}
                </h2>

                <p className="mt-1 lg:mt-2 text-xs lg:text-base text-gray-500 line-clamp-2">
                  {item.description}
                </p>

                <p className="mt-2 lg:mt-3 text-xl lg:text-2xl font-bold text-[#F97354]">
                  ₹{item.price}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 lg:gap-3">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      if ((item.quantity || 1) > 1) {
                        updateQuantity(
                          item._id,
                          (item.quantity || 1) - 1
                        );
                      } else {
                        removeFromCart(item._id);
                      }
                    }}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#F97354] text-white text-lg lg:text-xl"
                  >
                    −
                  </button>

                  <span className="min-w-[24px] text-center text-base lg:text-lg font-semibold">
                    {item.quantity || 1}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      updateQuantity(
                        item._id,
                        (item.quantity || 1) + 1
                      );
                    }}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-[#F97354] text-white text-lg lg:text-xl"
                  >
                    +
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      if (
                        window.confirm(
                          `Remove "${item.name}" from cart?`
                        )
                      ) {
                        removeFromCart(item._id);
                      }
                    }}
                    className="ml-auto text-sm lg:text-base bg-red-100 hover:bg-red-500 hover:text-white text-red-600 px-3 lg:px-5 py-2 rounded-xl transition"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* ADDRESS STARTS HERE */}
        <div className="mt-6 lg:mt-8 bg-white rounded-2xl lg:rounded-3xl shadow-xl p-5 lg:p-8">
          <h2 className="text-xl lg:text-2xl font-bold text-[#3B2418] mb-5 lg:mb-6">
  Delivery Address
</h2>

{!customAddress ? (
  <>
    {Array.isArray(user?.address) && user.address.length > 0 ? (

      <div className="space-y-4">

        <div className="rounded-xl lg:rounded-2xl border border-orange-200 bg-[#FFF8F1] p-3 lg:p-4">

          <p className="font-semibold text-[#3B2418] text-sm lg:text-base">
            {selectedAddress?.fullName}
          </p>

          <p className="mt-1 text-gray-600 text-sm lg:text-base leading-6">
            {selectedAddress?.street}
            <br />
            {selectedAddress?.city}, {selectedAddress?.state}
            <br />
            {selectedAddress?.zip}
          </p>

        </div>

        <button
          onClick={() => setCustomAddress(true)}
          className="w-full sm:w-auto bg-[#F97354] text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl hover:bg-[#ea6847] transition"
        >
          Change
        </button>

      </div>

    ) : (

      <p className="text-red-500 text-sm">
        Please add an address to your profile to proceed with the order.
      </p>

    )}
  </>
) : (

<div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">

  <input
    placeholder="Full Name"
    className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 text-sm lg:text-base"
    onChange={(e)=>setFormAddress({...formAddress,fullName:e.target.value})}
  />

  <input
    placeholder="Street"
    className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 text-sm lg:text-base"
    onChange={(e)=>setFormAddress({...formAddress,street:e.target.value})}
  />

  <input
    placeholder="City"
    className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 text-sm lg:text-base"
    onChange={(e)=>setFormAddress({...formAddress,city:e.target.value})}
  />

  <input
    placeholder="State"
    className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 text-sm lg:text-base"
    onChange={(e)=>setFormAddress({...formAddress,state:e.target.value})}
  />

  <input
    placeholder="ZIP Code"
    className="rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 text-sm lg:text-base md:col-span-2"
    onChange={(e)=>setFormAddress({...formAddress,zip:e.target.value})}
  />

  <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">

    <button
      onClick={async()=>{

        const { fullName, street, city, state, zip } = formAddress;

        if(!fullName || !street || !city || !state || !zip){
          return alert("Fill all fields");
        }

        try{

          const token = localStorage.getItem("token");

          const res = await fetch(
            `${BACKEND_BASE_URL}/api/auth/update-contact`,
            {
              method:"PUT",
              headers:{
                "Content-Type":"application/json",
                Authorization:`Bearer ${token}`,
              },
              body:JSON.stringify({
                phoneNumbers:user.phoneNumber || [],
                addresses:[
                  ...(user.address || []),
                  formAddress
                ]
              })
            }
          );

          const data = await res.json();

          if(res.ok){

            alert("Address Added");

            user.address = data.user.address;

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
      className="bg-[#F97354] text-white px-6 py-3 rounded-xl hover:bg-[#ea6847]"
    >
      Add Address
    </button>

    <button
      onClick={()=>{
        if(user?.address){
          setSelectedAddress(
            Array.isArray(user.address)
              ? user.address[0]
              : user.address
          );
          setCustomAddress(false);
        }
      }}
      className="text-[#F97354] font-semibold bg-transparent hover:underline border-none"
    >
      Use Saved Address
    </button>

  </div>

</div>

)}

<hr className="my-6 lg:my-8" />

<h2 className="text-xl lg:text-2xl font-bold text-[#3B2418] mb-5">
  Phone Number
</h2>
{!customPhone ? (

  <>
    {Array.isArray(user?.phoneNumber) &&
    user.phoneNumber.length > 0 ? (

      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">

        <select
          value={selectedPhone}
          onChange={(e) => setSelectedPhone(e.target.value)}
          className="flex-1 w-full rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 lg:p-4 text-sm lg:text-base text-[#3B2418]"
        >
          {user.phoneNumber.map((num, index) => (
            <option key={index} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button
          onClick={() => setCustomPhone(true)}
          className="bg-[#F97354] hover:bg-[#ea6847] text-white px-5 py-3 rounded-xl transition"
        >
          Change
        </button>

      </div>

    ) : (

      <p className="text-red-500 text-sm">
        Please add a phone number to your profile to proceed with the order.
      </p>

    )}
  </>

) : (

  <div>

    <input
      type="tel"
      placeholder="Enter Phone Number"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      className="w-full rounded-xl border border-orange-200 bg-[#FFF8F1] p-3 lg:p-4 text-sm lg:text-base text-[#3B2418]"
    />

    <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-5">

      <button
        onClick={async () => {

          if (!phone) {
            return alert("Enter phone number");
          }

          try {

            const token = localStorage.getItem("token");

            const res = await fetch(
              `${BACKEND_BASE_URL}/api/auth/update-contact`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  phoneNumbers: [
                    ...(user.phoneNumber || []),
                    phone,
                  ],
                  addresses: user.address || [],
                }),
              }
            );

            const data = await res.json();

            if (res.ok) {

              alert("Phone Number Added");

              user.phoneNumber = data.user.phoneNumber;

              setSelectedPhone(phone);

              setPhone("");

              setCustomPhone(false);

            }

          } catch (err) {
            console.log(err);
          }

        }}
        className="bg-[#F97354] hover:bg-[#ea6847] text-white px-6 py-3 rounded-xl"
      >
        Add Phone
      </button>

      <button
        onClick={() => {
          if (user?.phoneNumber) {
            setSelectedPhone(
              Array.isArray(user.phoneNumber)
                ? user.phoneNumber[0]
                : user.phoneNumber
            );

            setCustomPhone(false);
          }
        }}
        className="text-[#F97354] font-semibold bg-transparent hover:underline border-none"
      >
        Use Saved Number
      </button>

    </div>

  </div>

)}

</div>

{/* LEFT COLUMN END */}

</div>

{/* RIGHT SIDE STARTS HERE */}

<div className="lg:col-span-1">
  <div className="lg:sticky lg:top-28 bg-white rounded-2xl lg:rounded-3xl shadow-xl p-5 lg:p-8">

  <h2 className="text-xl lg:text-2xl font-bold text-[#3B2418]">
    Order Summary
  </h2>

  <div className="mt-6 lg:mt-8 space-y-4 lg:space-y-5">

    <div className="flex justify-between text-sm lg:text-base text-gray-600">
      <span>Total Items</span>
      <span>{cartItems.length}</span>
    </div>

    <div className="flex justify-between text-sm lg:text-base text-gray-600">
      <span>Subtotal</span>
      <span>₹{totalPrice.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm lg:text-base text-gray-600">
      <span>GST (3%)</span>
      <span>₹{gst.toFixed(2)}</span>
    </div>

    <div className="flex justify-between text-sm lg:text-base text-gray-600">
      <span>Delivery Charges</span>
      <span className="text-green-600 font-semibold">
        FREE
      </span>
    </div>

    <hr />

    <div className="flex justify-between items-center">

      <span className="text-lg lg:text-xl font-bold text-[#3B2418]">
        Grand Total
      </span>

      <span className="text-2xl lg:text-3xl font-bold text-[#F97354]">
        ₹{finalTotal.toFixed(2)}
      </span>

    </div>

  </div>

  <button
    onClick={handlePlaceOrder}
    disabled={loading}
    className="mt-6 lg:mt-8 w-full py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-[#F97354] hover:bg-[#ea6847] text-white font-bold text-base lg:text-lg transition disabled:opacity-50"
  >
    {loading ? "Placing Order..." : "Place Order"}
  </button>

  <p className="mt-4 text-center text-xs lg:text-sm text-gray-500">
    🔒 Secure Checkout
  </p>

</div>

{/* RIGHT COLUMN END */}
</div>

{/* GRID END */}
</div>

{/* PAGE END */}
</div>
</div>

);
};

export default Cart;
