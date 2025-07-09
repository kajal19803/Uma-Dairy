import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      // 🔹 User Data
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => {
        set({ user: null });
        localStorage.removeItem('uma-user-storage');
      },

      // 🔹 Cart Data
      cartItems: [],
      addToCart: (item) => {
        const existing = get().cartItems;
        set({ cartItems: [...existing, item] });
      },
      removeFromCart: (id) => {
        const filtered = get().cartItems.filter((item) => item._id !== id);
        set({ cartItems: filtered });
      },
      clearCart: () => {
        set({ cartItems: [] });
      },
    }),
    {
      name: 'uma-user-storage', // Single localStorage key for both user and cart
    }
  )
);

export default useUserStore;
