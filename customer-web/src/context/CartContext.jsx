import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({}); // { menu_item_id: qty }

  function updateQty(id, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) delete next[id];
      else next[id] = updated;
      return next;
    });
  }

  function removeItem(id) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  const itemCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, updateQty, removeItem, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
