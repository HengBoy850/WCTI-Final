// // import React, { useEffect, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { api } from '../api';
// // import { useAuth } from '../context/AuthContext';
// // import { useCart } from '../context/CartContext';

// // const ACCENTS = ['accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'];

// // export default function Menu() {
// //   const { user, token } = useAuth();
// //   const { cart, updateQty, removeItem, clearCart } = useCart();
// //   const navigate = useNavigate();

// //   const [items, setItems] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [activeCategory, setActiveCategory] = useState('all');
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [placing, setPlacing] = useState(false);
// //   const [orderMessage, setOrderMessage] = useState('');
// //   const [orderType, setOrderType] = useState('online'); // 'online' = pickup, 'dine_in' = eat in
// //   const [tableNumber, setTableNumber] = useState('');

// //   useEffect(() => {
// //     async function load() {
// //       try {
// //         const [menuRes, catRes] = await Promise.all([api.getMenu(), api.getCategories()]);
// //         setItems(menuRes.items);
// //         setCategories(catRes.categories);
// //       } catch (err) {
// //         setError(err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     load();
// //   }, []);

// //   const filteredItems =
// //     activeCategory === 'all'
// //       ? items
// //       : items.filter((i) => String(i.category_id) === String(activeCategory));

// //   const cartEntries = Object.entries(cart).map(([id, qty]) => {
// //     const item = items.find((i) => String(i.id) === String(id));
// //     return { item, qty };
// //   }).filter((e) => e.item);

// //   const total = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);
// //   const needsTable = orderType === 'dine_in';
// //   const canSubmit = cartEntries.length > 0 && (!needsTable || tableNumber.trim() !== '');

// //   async function placeOrder() {
// //     if (!user) {
// //       navigate('/login');
// //       return;
// //     }
// //     if (user.role !== 'customer') {
// //       setOrderMessage('Only customer accounts can place orders.');
// //       return;
// //     }
// //     if (needsTable && !tableNumber.trim()) {
// //       setOrderMessage('Please enter your table number for dine-in orders.');
// //       return;
// //     }
// //     setPlacing(true);
// //     setOrderMessage('');
// //     try {
// //       const payload = {
// //         items: cartEntries.map((e) => ({ menu_item_id: e.item.id, quantity: e.qty })),
// //         order_type: orderType,
// //         table_number: needsTable ? tableNumber.trim() : undefined,
// //       };
// //       await api.placeOrder(payload, token);
// //       clearCart();
// //       setTableNumber('');
// //       setOrderMessage('Order placed! Track it under "My Orders".');
// //     } catch (err) {
// //       setOrderMessage(err.message);
// //     } finally {
// //       setPlacing(false);
// //     }
// //   }

// //   if (loading) return <div className="container" style={{ padding: '60px 0' }}>Loading menu...</div>;

// //   return (
// //     <>
// //       <div className="info-hero">
// //         <div className="container">
// //           <h1>Our Menu</h1>
// //         </div>
// //       </div>
// //       <section>
// //         <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 30, alignItems: 'start' }}>
// //           <div>
// //             {error && <div className="form-error">{error}</div>}
// //             <div className="menu-filters">
// //               <button
// //                 className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
// //                 onClick={() => setActiveCategory('all')}
// //               >
// //                 All
// //               </button>
// //               {categories.map((c) => (
// //                 <button
// //                   key={c.id}
// //                   className={`filter-chip ${String(activeCategory) === String(c.id) ? 'active' : ''}`}
// //                   onClick={() => setActiveCategory(c.id)}
// //                 >
// //                   {c.name}
// //                 </button>
// //               ))}
// //             </div>

// //             <div className="grid-3">
// //               {filteredItems.map((item, idx) => (
// //                 <div className={`menu-item ${ACCENTS[idx % ACCENTS.length]}`} key={item.id}>
// //                   <div className="menu-item-media">
// //                     {item.image_url ? (
// //                       <img src={item.image_url} alt={item.name} />
// //                     ) : (
// //                       <span className="no-photo">🍽</span>
// //                     )}
// //                     {item.category_name && <span className="menu-item-rating">{item.category_name}</span>}
// //                   </div>
// //                   <div className="menu-item-body">
// //                     <div className="menu-item-top">
// //                       <h3>{item.name}</h3>
// //                       <span className="price">${item.price.toFixed(2)}</span>
// //                     </div>
// //                     <p className="desc">{item.description}</p>
// //                     {!item.available ? (
// //                       <span className="badge-unavailable">Unavailable</span>
// //                     ) : (
// //                       <>
// //                         <div className="qty-row">
// //                           <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
// //                           <span>{cart[item.id] || 0}</span>
// //                           <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
// //                         </div>
// //                         <button className="add-btn" onClick={() => updateQty(item.id, 1)}>
// //                           Add to order
// //                         </button>
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //               {filteredItems.length === 0 && (
// //                 <p style={{ color: 'var(--muted)' }}>No items in this category yet.</p>
// //               )}
// //             </div>
// //           </div>

// //           <div className="cart-panel">
// //             <h3 style={{ marginBottom: 14 }}>Your Order</h3>

// //             <div className="order-type-toggle">
// //               <button className={orderType === 'online' ? 'active' : ''} onClick={() => setOrderType('online')}>Pickup</button>
// //               <button className={orderType === 'dine_in' ? 'active' : ''} onClick={() => setOrderType('dine_in')}>Dine-in</button>
// //             </div>

// //             {needsTable && (
// //               <div className="form-group">
// //                 <label>Table number</label>
// //                 <input
// //                   value={tableNumber}
// //                   onChange={(e) => setTableNumber(e.target.value)}
// //                   placeholder="e.g. 5"
// //                 />
// //               </div>
// //             )}

// //             {cartEntries.length === 0 && (
// //               <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your cart is empty. Add items from the menu.</p>
// //             )}
// //             {cartEntries.map((e) => (
// //               <div className="cart-item" key={e.item.id}>
// //                 <span>{e.qty} × {e.item.name}</span>
// //                 <span>
// //                   ${(e.item.price * e.qty).toFixed(2)}{' '}
// //                   <span className="remove-link" onClick={() => removeItem(e.item.id)}>
// //                     remove
// //                   </span>
// //                 </span>
// //               </div>
// //             ))}
// //             {cartEntries.length > 0 && (
// //               <div className="cart-total">
// //                 <span>Total</span>
// //                 <span>${total.toFixed(2)}</span>
// //               </div>
// //             )}
// //             {orderMessage && (
// //               <div className={orderMessage.startsWith('Order placed') ? 'form-success' : 'form-error'} style={{ marginTop: 14 }}>
// //                 {orderMessage}
// //               </div>
// //             )}
// //             <button
// //               className="submit-btn"
// //               disabled={!canSubmit || placing}
// //               onClick={placeOrder}
// //               style={{ marginTop: 14 }}
// //             >
// //               {placing ? 'Placing order...' : user ? 'Place Order' : 'Log in to Order'}
// //             </button>
// //           </div>
// //         </div>
// //       </section>
// //     </>
// //   );
// // }


// // import React, { useEffect, useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { api } from '../api';
// // import { useAuth } from '../context/AuthContext';
// // import { useCart } from '../context/CartContext';

// // const ACCENTS = ['accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'];

// // export default function Menu() {
// //   const { user, token } = useAuth();
// //   const { cart, updateQty, removeItem, clearCart } = useCart();
// //   const navigate = useNavigate();

// //   const [items, setItems] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [activeCategory, setActiveCategory] = useState('all');
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [placing, setPlacing] = useState(false);
// //   const [orderMessage, setOrderMessage] = useState('');
// //   const [orderType, setOrderType] = useState('online'); // 'online' = pickup, 'dine_in' = eat in
// //   const [tableNumber, setTableNumber] = useState('');

// //   useEffect(() => {
// //     async function load() {
// //       try {
// //         const [menuRes, catRes] = await Promise.all([api.getMenu(), api.getCategories()]);
// //         setItems(menuRes.items);
// //         setCategories(catRes.categories);
// //       } catch (err) {
// //         setError(err.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     load();
// //   }, []);

// //   const filteredItems =
// //     activeCategory === 'all'
// //       ? items
// //       : items.filter((i) => String(i.category_id) === String(activeCategory));

// //   const cartEntries = Object.entries(cart).map(([id, qty]) => {
// //     const item = items.find((i) => String(i.id) === String(id));
// //     return { item, qty };
// //   }).filter((e) => e.item);

// //   const total = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);
// //   const needsTable = orderType === 'dine_in';
// //   const canSubmit = cartEntries.length > 0 && (!needsTable || tableNumber.trim() !== '');

// //   async function placeOrder() {
// //     if (!user) {
// //       navigate('/login');
// //       return;
// //     }
// //     if (user.role !== 'customer') {
// //       setOrderMessage('Only customer accounts can place orders.');
// //       return;
// //     }
// //     if (needsTable && !tableNumber.trim()) {
// //       setOrderMessage('Please enter your table number for dine-in orders.');
// //       return;
// //     }
// //     setPlacing(true);
// //     setOrderMessage('');
// //     try {
// //       const payload = {
// //         items: cartEntries.map((e) => ({ menu_item_id: e.item.id, quantity: e.qty })),
// //         order_type: orderType,
// //         table_number: needsTable ? tableNumber.trim() : undefined,
// //       };
// //       await api.placeOrder(payload, token);
// //       clearCart();
// //       setTableNumber('');
// //       setOrderMessage('Order placed! Track it under "My Orders".');
// //     } catch (err) {
// //       setOrderMessage(err.message);
// //     } finally {
// //       setPlacing(false);
// //     }
// //   }

// //   if (loading) return <div className="container" style={{ padding: '60px 0' }}>Loading menu...</div>;

// //   return (
// //     <>
// //       <div className="info-hero">
// //         <div className="container">
// //           <h1>Our Menu</h1>
// //         </div>
// //       </div>
// //       <section>
// //         {/* was: inline style with hardcoded '1fr 340px' grid — replaced with a
// //             responsive class defined in menu-responsive.css */}
// //         <div className="container menu-layout">
// //           <div>
// //             {error && <div className="form-error">{error}</div>}
// //             <div className="menu-filters">
// //               <button
// //                 className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
// //                 onClick={() => setActiveCategory('all')}
// //               >
// //                 All
// //               </button>
// //               {categories.map((c) => (
// //                 <button
// //                   key={c.id}
// //                   className={`filter-chip ${String(activeCategory) === String(c.id) ? 'active' : ''}`}
// //                   onClick={() => setActiveCategory(c.id)}
// //                 >
// //                   {c.name}
// //                 </button>
// //               ))}
// //             </div>

// //             <div className="grid-3">
// //               {filteredItems.map((item, idx) => (
// //                 <div className={`menu-item ${ACCENTS[idx % ACCENTS.length]}`} key={item.id}>
// //                   <div className="menu-item-media">
// //                     {item.image_url ? (
// //                       <img src={item.image_url} alt={item.name} />
// //                     ) : (
// //                       <span className="no-photo">🍽</span>
// //                     )}
// //                     {item.category_name && <span className="menu-item-rating">{item.category_name}</span>}
// //                   </div>
// //                   <div className="menu-item-body">
// //                     <div className="menu-item-top">
// //                       <h3>{item.name}</h3>
// //                       <span className="price">${item.price.toFixed(2)}</span>
// //                     </div>
// //                     <p className="desc">{item.description}</p>
// //                     {!item.available ? (
// //                       <span className="badge-unavailable">Unavailable</span>
// //                     ) : (
// //                       <>
// //                         <div className="qty-row">
// //                           <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
// //                           <span>{cart[item.id] || 0}</span>
// //                           <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
// //                         </div>
// //                         <button className="add-btn" onClick={() => updateQty(item.id, 1)}>
// //                           Add to order
// //                         </button>
// //                       </>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //               {filteredItems.length === 0 && (
// //                 <p style={{ color: 'var(--muted)' }}>No items in this category yet.</p>
// //               )}
// //             </div>
// //           </div>

// //           <div className="cart-panel">
// //             <h3 style={{ marginBottom: 14 }}>Your Order</h3>

// //             <div className="order-type-toggle">
// //               <button className={orderType === 'online' ? 'active' : ''} onClick={() => setOrderType('online')}>Pickup</button>
// //               <button className={orderType === 'dine_in' ? 'active' : ''} onClick={() => setOrderType('dine_in')}>Dine-in</button>
// //             </div>

// //             {needsTable && (
// //               <div className="form-group">
// //                 <label>Table number</label>
// //                 <input
// //                   value={tableNumber}
// //                   onChange={(e) => setTableNumber(e.target.value)}
// //                   placeholder="e.g. 5"
// //                 />
// //               </div>
// //             )}

// //             {cartEntries.length === 0 && (
// //               <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your cart is empty. Add items from the menu.</p>
// //             )}
// //             {cartEntries.map((e) => (
// //               <div className="cart-item" key={e.item.id}>
// //                 <span>{e.qty} × {e.item.name}</span>
// //                 <span>
// //                   ${(e.item.price * e.qty).toFixed(2)}{' '}
// //                   <span className="remove-link" onClick={() => removeItem(e.item.id)}>
// //                     remove
// //                   </span>
// //                 </span>
// //               </div>
// //             ))}
// //             {cartEntries.length > 0 && (
// //               <div className="cart-total">
// //                 <span>Total</span>
// //                 <span>${total.toFixed(2)}</span>
// //               </div>
// //             )}
// //             {orderMessage && (
// //               <div className={orderMessage.startsWith('Order placed') ? 'form-success' : 'form-error'} style={{ marginTop: 14 }}>
// //                 {orderMessage}
// //               </div>
// //             )}
// //             <button
// //               className="submit-btn"
// //               disabled={!canSubmit || placing}
// //               onClick={placeOrder}
// //               style={{ marginTop: 14 }}
// //             >
// //               {placing ? 'Placing order...' : user ? 'Place Order' : 'Log in to Order'}
// //             </button>
// //           </div>
// //         </div>
// //       </section>
// //     </>
// //   );
// // }


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '../api';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext';
// import { getImageUrl } from '../api'; // adjust path if needed based on file location

// const ACCENTS = ['accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'];

// export default function Menu() {
//   const { user, token } = useAuth();
//   const { cart, updateQty, removeItem, clearCart } = useCart();
//   const navigate = useNavigate();

//   const [items, setItems] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [activeCategory, setActiveCategory] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [placing, setPlacing] = useState(false);
//   const [orderMessage, setOrderMessage] = useState('');
//   const [orderType, setOrderType] = useState('online'); // 'online' = pickup, 'dine_in' = eat in
//   const [tableNumber, setTableNumber] = useState('');

//   // NEW: controls the mobile slide-up cart sheet (Foodpanda/WoWnow style)
//   const [cartSheetOpen, setCartSheetOpen] = useState(false);

//   useEffect(() => {
//     async function load() {
//       try {
//         const [menuRes, catRes] = await Promise.all([api.getMenu(), api.getCategories()]);
//         setItems(menuRes.items);
//         setCategories(catRes.categories);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   // Lock page scroll while the mobile cart sheet is open
//   useEffect(() => {
//     document.body.style.overflow = cartSheetOpen ? 'hidden' : '';
//     return () => { document.body.style.overflow = ''; };
//   }, [cartSheetOpen]);

//   const filteredItems =
//     activeCategory === 'all'
//       ? items
//       : items.filter((i) => String(i.category_id) === String(activeCategory));

//   const cartEntries = Object.entries(cart).map(([id, qty]) => {
//     const item = items.find((i) => String(i.id) === String(id));
//     return { item, qty };
//   }).filter((e) => e.item);

//   const itemCount = cartEntries.reduce((sum, e) => sum + e.qty, 0);
//   const total = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);
//   const needsTable = orderType === 'dine_in';
//   const canSubmit = cartEntries.length > 0 && (!needsTable || tableNumber.trim() !== '');

//   async function placeOrder() {
//     if (!user) {
//       navigate('/login');
//       return;
//     }
//     if (user.role !== 'customer') {
//       setOrderMessage('Only customer accounts can place orders.');
//       return;
//     }
//     if (needsTable && !tableNumber.trim()) {
//       setOrderMessage('Please enter your table number for dine-in orders.');
//       return;
//     }
//     setPlacing(true);
//     setOrderMessage('');
//     try {
//       const payload = {
//         items: cartEntries.map((e) => ({ menu_item_id: e.item.id, quantity: e.qty })),
//         order_type: orderType,
//         table_number: needsTable ? tableNumber.trim() : undefined,
//       };
//       await api.placeOrder(payload, token);
//       clearCart();
//       setTableNumber('');
//       setOrderMessage('Order placed! Track it under "My Orders".');
//       setCartSheetOpen(false);
//     } catch (err) {
//       setOrderMessage(err.message);
//     } finally {
//       setPlacing(false);
//     }
//   }

//   if (loading) return <div className="container" style={{ padding: '60px 0' }}>Loading menu...</div>;

//   // Shared cart contents — rendered inside the desktop sidebar AND the mobile sheet
//   const cartContents = (
//     <>
//       <div className="order-type-toggle">
//         <button className={orderType === 'online' ? 'active' : ''} onClick={() => setOrderType('online')}>Pickup</button>
//         <button className={orderType === 'dine_in' ? 'active' : ''} onClick={() => setOrderType('dine_in')}>Dine-in</button>
//       </div>

//       {needsTable && (
//         <div className="form-group">
//           <label>Table number</label>
//           <input
//             value={tableNumber}
//             onChange={(e) => setTableNumber(e.target.value)}
//             placeholder="e.g. 5"
//           />
//         </div>
//       )}

//       {cartEntries.length === 0 && (
//         <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your cart is empty. Add items from the menu.</p>
//       )}
//       {cartEntries.map((e) => (
//         <div className="cart-item" key={e.item.id}>
//           <span>{e.qty} × {e.item.name}</span>
//           <span>
//             ${(e.item.price * e.qty).toFixed(2)}{' '}
//             <span className="remove-link" onClick={() => removeItem(e.item.id)}>
//               remove
//             </span>
//           </span>
//         </div>
//       ))}
//       {cartEntries.length > 0 && (
//         <div className="cart-total">
//           <span>Total</span>
//           <span>${total.toFixed(2)}</span>
//         </div>
//       )}
//       {orderMessage && (
//         <div className={orderMessage.startsWith('Order placed') ? 'form-success' : 'form-error'} style={{ marginTop: 14 }}>
//           {orderMessage}
//         </div>
//       )}
//       <button
//         className="submit-btn"
//         disabled={!canSubmit || placing}
//         onClick={placeOrder}
//         style={{ marginTop: 14 }}
//       >
//         {placing ? 'Placing order...' : user ? 'Place Order' : 'Log in to Order'}
//       </button>
//     </>
//   );

//   return (
//     <>
//       <div className="info-hero">
//         <div className="container">
//           <h1>Our Menu</h1>
//         </div>
//       </div>
//       <section>
//         <div className="container menu-layout">
//           <div>
//             {error && <div className="form-error">{error}</div>}
//             <div className="menu-filters">
//               <button
//                 className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
//                 onClick={() => setActiveCategory('all')}
//               >
//                 All
//               </button>
//               {categories.map((c) => (
//                 <button
//                   key={c.id}
//                   className={`filter-chip ${String(activeCategory) === String(c.id) ? 'active' : ''}`}
//                   onClick={() => setActiveCategory(c.id)}
//                 >
//                   {c.name}
//                 </button>
//               ))}
//             </div>

//             <div className="grid-3">
//               {filteredItems.map((item, idx) => (
//                 <div className={`menu-item ${ACCENTS[idx % ACCENTS.length]}`} key={item.id}>
//                   <div className="menu-item-media">
//                     {item.image_url ? (
//                       <img src={getImageUrl(item.image_url)} alt={item.name} />
//                     ) : (
//                       <span className="no-photo">🍽</span>
//                     )}
//                     {item.category_name && <span className="menu-item-rating">{item.category_name}</span>}
//                   </div>
//                   <div className="menu-item-body">
//                     <div className="menu-item-top">
//                       <h3>{item.name}</h3>
//                       <span className="price">${item.price.toFixed(2)}</span>
//                     </div>
//                     <p className="desc">{item.description}</p>
//                     {!item.available ? (
//                       <span className="badge-unavailable">Unavailable</span>
//                     ) : (
//                       <>
//                         <div className="qty-row">
//                           <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
//                           <span>{cart[item.id] || 0}</span>
//                           <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
//                         </div>
//                         <button className="add-btn" onClick={() => updateQty(item.id, 1)}>
//                           Add to order
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//               {filteredItems.length === 0 && (
//                 <p style={{ color: 'var(--muted)' }}>No items in this category yet.</p>
//               )}
//             </div>
//           </div>

//           {/* Desktop sidebar cart — hidden on mobile via CSS */}
//           <div className="cart-panel">
//             <h3 style={{ marginBottom: 14 }}>Your Order</h3>
//             {cartContents}
//           </div>
//         </div>
//       </section>

//       {/* MOBILE: sticky bottom bar, shows only when cart has items */}
//       {itemCount > 0 && !cartSheetOpen && (
//         <button className="mobile-cart-bar" onClick={() => setCartSheetOpen(true)}>
//           <span className="mobile-cart-bar-count">{itemCount}</span>
//           <span className="mobile-cart-bar-label">View Order</span>
//           <span className="mobile-cart-bar-total">${total.toFixed(2)}</span>
//         </button>
//       )}

//       {/* MOBILE: slide-up cart sheet, like Foodpanda/WoWnow checkout drawer */}
//       {cartSheetOpen && (
//         <div className="cart-sheet-overlay" onClick={() => setCartSheetOpen(false)}>
//           <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
//             <div className="cart-sheet-handle" />
//             <div className="cart-sheet-header">
//               <h3>Your Order</h3>
//               <button className="cart-sheet-close" onClick={() => setCartSheetOpen(false)} aria-label="Close cart">
//                 ✕
//               </button>
//             </div>
//             <div className="cart-sheet-body">
//               {cartContents}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ACCENTS = ['accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5'];

// How often to silently re-check for menu changes (new items, new photos,
// availability toggles) made from the POS dashboard. Kept short enough to
// feel live, long enough to not hammer the API.
const POLL_INTERVAL_MS = 20000;

export default function Menu() {
  const { user, token } = useAuth();
  const { cart, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderType, setOrderType] = useState('online'); // 'online' = pickup, 'dine_in' = eat in
  const [tableNumber, setTableNumber] = useState('');

  // NEW: controls the mobile slide-up cart sheet (Foodpanda/WoWnow style)
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // isInitialLoad only shows the full-page "Loading menu..." state once —
    // background polling refreshes should update silently without flashing
    // a loading screen or resetting the category filter / cart the user is
    // already interacting with.
    async function load(isInitialLoad) {
      try {
        const [menuRes, catRes] = await Promise.all([api.getMenu(), api.getCategories()]);
        if (cancelled) return;
        setItems(menuRes.items);
        setCategories(catRes.categories);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (isInitialLoad && !cancelled) setLoading(false);
      }
    }

    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Lock page scroll while the mobile cart sheet is open
  useEffect(() => {
    document.body.style.overflow = cartSheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartSheetOpen]);

  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((i) => String(i.category_id) === String(activeCategory));

  const cartEntries = Object.entries(cart).map(([id, qty]) => {
    const item = items.find((i) => String(i.id) === String(id));
    return { item, qty };
  }).filter((e) => e.item);

  const itemCount = cartEntries.reduce((sum, e) => sum + e.qty, 0);
  const total = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);
  const needsTable = orderType === 'dine_in';
  const canSubmit = cartEntries.length > 0 && (!needsTable || tableNumber.trim() !== '');

  async function placeOrder() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      setOrderMessage('Only customer accounts can place orders.');
      return;
    }
    if (needsTable && !tableNumber.trim()) {
      setOrderMessage('Please enter your table number for dine-in orders.');
      return;
    }
    setPlacing(true);
    setOrderMessage('');
    try {
      const payload = {
        items: cartEntries.map((e) => ({ menu_item_id: e.item.id, quantity: e.qty })),
        order_type: orderType,
        table_number: needsTable ? tableNumber.trim() : undefined,
      };
      await api.placeOrder(payload, token);
      clearCart();
      setTableNumber('');
      setOrderMessage('Order placed! Track it under "My Orders".');
      setCartSheetOpen(false);
    } catch (err) {
      setOrderMessage(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div className="container" style={{ padding: '60px 0' }}>Loading menu...</div>;

  // Shared cart contents — rendered inside the desktop sidebar AND the mobile sheet
  const cartContents = (
    <>
      <div className="order-type-toggle">
        <button className={orderType === 'online' ? 'active' : ''} onClick={() => setOrderType('online')}>Pickup</button>
        <button className={orderType === 'dine_in' ? 'active' : ''} onClick={() => setOrderType('dine_in')}>Dine-in</button>
      </div>

      {needsTable && (
        <div className="form-group">
          <label>Table number</label>
          <input
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>
      )}

      {cartEntries.length === 0 && (
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your cart is empty. Add items from the menu.</p>
      )}
      {cartEntries.map((e) => (
        <div className="cart-item" key={e.item.id}>
          <span>{e.qty} × {e.item.name}</span>
          <span>
            ${(e.item.price * e.qty).toFixed(2)}{' '}
            <span className="remove-link" onClick={() => removeItem(e.item.id)}>
              remove
            </span>
          </span>
        </div>
      ))}
      {cartEntries.length > 0 && (
        <div className="cart-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      )}
      {orderMessage && (
        <div className={orderMessage.startsWith('Order placed') ? 'form-success' : 'form-error'} style={{ marginTop: 14 }}>
          {orderMessage}
        </div>
      )}
      <button
        className="submit-btn"
        disabled={!canSubmit || placing}
        onClick={placeOrder}
        style={{ marginTop: 14 }}
      >
        {placing ? 'Placing order...' : user ? 'Place Order' : 'Log in to Order'}
      </button>
    </>
  );

  return (
    <>
      <div className="info-hero">
        <div className="container">
          <h1>Our Menu</h1>
        </div>
      </div>
      <section>
        <div className="container menu-layout">
          <div>
            {error && <div className="form-error">{error}</div>}
            <div className="menu-filters">
              <button
                className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`filter-chip ${String(activeCategory) === String(c.id) ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="grid-3">
              {filteredItems.map((item, idx) => (
                <div className={`menu-item ${ACCENTS[idx % ACCENTS.length]}`} key={item.id}>
                  <div className="menu-item-media">
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url)} alt={item.name} />
                    ) : (
                      <span className="no-photo">🍽</span>
                    )}
                    {item.category_name && <span className="menu-item-rating">{item.category_name}</span>}
                  </div>
                  <div className="menu-item-body">
                    <div className="menu-item-top">
                      <h3>{item.name}</h3>
                      <span className="price">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="desc">{item.description}</p>
                    {!item.available ? (
                      <span className="badge-unavailable">Unavailable</span>
                    ) : (
                      <>
                        <div className="qty-row">
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                          <span>{cart[item.id] || 0}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>
                        <button className="add-btn" onClick={() => updateQty(item.id, 1)}>
                          Add to order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <p style={{ color: 'var(--muted)' }}>No items in this category yet.</p>
              )}
            </div>
          </div>

          {/* Desktop sidebar cart — hidden on mobile via CSS */}
          <div className="cart-panel">
            <h3 style={{ marginBottom: 14 }}>Your Order</h3>
            {cartContents}
          </div>
        </div>
      </section>

      {/* MOBILE: sticky bottom bar, shows only when cart has items */}
      {itemCount > 0 && !cartSheetOpen && (
        <button className="mobile-cart-bar" onClick={() => setCartSheetOpen(true)}>
          <span className="mobile-cart-bar-count">{itemCount}</span>
          <span className="mobile-cart-bar-label">View Order</span>
          <span className="mobile-cart-bar-total">${total.toFixed(2)}</span>
        </button>
      )}

      {/* MOBILE: slide-up cart sheet, like Foodpanda/WoWnow checkout drawer */}
      {cartSheetOpen && (
        <div className="cart-sheet-overlay" onClick={() => setCartSheetOpen(false)}>
          <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cart-sheet-handle" />
            <div className="cart-sheet-header">
              <h3>Your Order</h3>
              <button className="cart-sheet-close" onClick={() => setCartSheetOpen(false)} aria-label="Close cart">
                ✕
              </button>
            </div>
            <div className="cart-sheet-body">
              {cartContents}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
