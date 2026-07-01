import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext();

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL;

export const CartProvider = ({ children }) => {

  const [cartItems, setCartItems] = useState([]);
  const GUEST_CART_KEY = "guestCart";

const getGuestCart = () => {
  return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
};

const saveGuestCart = (cart) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
};

  // ===========================
  // Fetch Cart
  // ===========================

  const fetchCart = async () => {
     const token = localStorage.getItem("token");
    if (!token) {
      setCartItems(getGuestCart());
      return;
    }

    try {

      const res = await fetch(
        `${BACKEND_BASE_URL}/api/cart`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

  const data = await res.json();

if (!res.ok) {
  return;
}

const guestCart = getGuestCart();

if (guestCart.length > 0) {

  const mergeRes = await fetch(
    `${BACKEND_BASE_URL}/api/cart/merge`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        cart: guestCart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      }),
    }
  );

  if (mergeRes.ok) {
    localStorage.removeItem(GUEST_CART_KEY);
    return fetchCart();
  }
}

const formatted = data.cart.map((item) => ({
  ...item.product,
  quantity: item.quantity,
}));

setCartItems(formatted);

    } catch (err) {

      console.error("Fetch Cart Error:", err);

    }

  };

 useEffect(() => {

  fetchCart();

  const handleUserUpdate = () => {
    fetchCart();
  };

  window.addEventListener("userUpdated", handleUserUpdate);

  return () => {
    window.removeEventListener("userUpdated", handleUserUpdate);
  };

}, []);

  // ===========================
  // Add To Cart
  // ===========================

const addToCart = async (product, quantity = 1) => {

  const token = localStorage.getItem("token");

  // ===========================
  // Guest User
  // ===========================

  if (!token) {

    const guestCart = getGuestCart();

    const existing = guestCart.find(
      (item) => item._id === product._id
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      guestCart.push({
        ...product,
        quantity,
      });
    }

    saveGuestCart(guestCart);
    setCartItems(guestCart);

    return;
  }

  // ===========================
  // Logged In User
  // ===========================

  try {

    const res = await fetch(
      `${BACKEND_BASE_URL}/api/cart/add`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      }
    );

    const data = await res.json();

    if (res.ok) {

      const formatted = data.cart.map((item) => ({
        ...item.product,
        quantity: item.quantity,
      }));

      setCartItems(formatted);

    }

  } catch (err) {

    console.error("Add Cart Error:", err);

  }

};
    // ===========================
  // Update Quantity
  // ===========================

  const updateQuantity = async (productId, quantity) => {

    const token = localStorage.getItem("token");

if (!token) {

  const guestCart = getGuestCart();

  const updated = guestCart
  .map((item) =>
    item._id === productId
      ? { ...item, quantity }
      : item
  )
  .filter((item) => item.quantity > 0);

saveGuestCart(updated);
setCartItems(updated);

  return;
}

    try {

      const res = await fetch(
        `${BACKEND_BASE_URL}/api/cart/update`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId,
            quantity,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        const formatted = data.cart.map((item) => ({
          ...item.product,
          quantity: item.quantity,
        }));

        setCartItems(formatted);

      }

    } catch (err) {

      console.error("Update Cart Error:", err);

    }

  };

  // ===========================
  // Remove From Cart
  // ===========================

  const removeFromCart = async (productId) => {

    const token = localStorage.getItem("token");

if (!token) {

  const guestCart = getGuestCart();

  const updated = guestCart.filter(
    item => item._id !== productId
  );

  saveGuestCart(updated);
  setCartItems(updated);

  return;
}

    try {

      const res = await fetch(
        `${BACKEND_BASE_URL}/api/cart/remove`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        const formatted = data.cart.map((item) => ({
          ...item.product,
          quantity: item.quantity,
        }));

        setCartItems(formatted);

      }

    } catch (err) {

      console.error("Remove Cart Error:", err);

    }

  };

  // ===========================
  // Clear Cart
  // ===========================

  const clearCart = async () => {

   const token = localStorage.getItem("token");

if (!token) {

  localStorage.removeItem(GUEST_CART_KEY);

  setCartItems([]);

  return;
}
    try {

      const res = await fetch(
        `${BACKEND_BASE_URL}/api/cart/clear`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        localStorage.removeItem(GUEST_CART_KEY);
        setCartItems([]);
      }

    } catch (err) {

      console.error("Clear Cart Error:", err);

    }

  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );

};

export const useCart = () => {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return context;

};