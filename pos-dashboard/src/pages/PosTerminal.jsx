import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';

export default function PosTerminal() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [orderType, setOrderType] = useState('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      const [menuRes, catRes] = await Promise.all([api.getMenu(), api.getCategories()]);
      setItems(menuRes.items.filter((i) => i.available));
      setCategories(catRes.categories);
      setLoading(false);
    }
    load();
  }, []);

  const filteredItems = activeCategory === 'all' ? items : items.filter((i) => String(i.category_id) === String(activeCategory));

  function updateQty(id, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const updated = Math.max(0, (next[id] || 0) + delta);
      if (updated === 0) delete next[id];
      else next[id] = updated;
      return next;
    });
  }

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => ({ item: items.find((i) => String(i.id) === String(id)), qty }))
    .filter((e) => e.item);
  const total = cartEntries.reduce((sum, e) => sum + e.item.price * e.qty, 0);

  async function submitOrder() {
    setPlacing(true);
    setMessage('');
    try {
      await api.placeWalkinOrder(
        {
          items: cartEntries.map((e) => ({ menu_item_id: e.item.id, quantity: e.qty })),
          order_type: orderType,
          table_number: orderType === 'dine_in' ? tableNumber : undefined,
          guest_name: orderType === 'takeaway' ? guestName : undefined,
        },
        token
      );
      setCart({});
      setTableNumber('');
      setGuestName('');
      setMessage('Order sent to the kitchen.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading menu...</div>;

  const canSubmit = cartEntries.length > 0 && (orderType === 'takeaway' || tableNumber.trim() !== '');

  return (
    <>
      <PageHeader title="New Order" subtitle="Take a walk-in dine-in or takeaway order" />
      <div className="page-body">
        <div className="pos-grid">
          <div>
            <div className="tabs">
              <button className={`tab ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>All</button>
              {categories.map((c) => (
                <button key={c.id} className={`tab ${String(activeCategory) === String(c.id) ? 'active' : ''}`} onClick={() => setActiveCategory(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <div className="pos-item-grid">
              {filteredItems.map((item) => (
                <button key={item.id} className="pos-item" onClick={() => updateQty(item.id, 1)}>
                  <div className="pos-item-thumb">
                    {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span className="pos-item-thumb-empty">🍽</span>}
                    {cart[item.id] > 0 && <span className="pos-item-qty-pill">{cart[item.id]}</span>}
                  </div>
                  <div className="pname">{item.name}</div>
                  <div className="pprice">${item.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card pos-cart">
            <h3 style={{ marginBottom: 14, fontSize: 15.5 }}>Current Order</h3>

            <div className="segmented">
              <button className={orderType === 'dine_in' ? 'active' : ''} onClick={() => setOrderType('dine_in')}>Dine-in</button>
              <button className={orderType === 'takeaway' ? 'active' : ''} onClick={() => setOrderType('takeaway')}>Takeaway</button>
            </div>

            {orderType === 'dine_in' ? (
              <div className="form-group">
                <label>Table number</label>
                <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. 5" />
              </div>
            ) : (
              <div className="form-group">
                <label>Guest name (optional)</label>
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="e.g. Sok" />
              </div>
            )}

            {cartEntries.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13.5, padding: '10px 0' }}>Tap menu items to add them.</p>
            ) : (
              cartEntries.map((e) => (
                <div className="pos-cart-line" key={e.item.id}>
                  <span>{e.item.name}</span>
                  <div className="pos-qty-controls">
                    <button onClick={() => updateQty(e.item.id, -1)}>−</button>
                    <span>{e.qty}</span>
                    <button onClick={() => updateQty(e.item.id, 1)}>+</button>
                  </div>
                </div>
              ))
            )}

            {cartEntries.length > 0 && (
              <div className="pos-total-row">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            )}

            {message && <div className={message.includes('sent') ? 'form-success' : 'form-error'} style={{ marginTop: 14 }}>{message}</div>}

            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={!canSubmit || placing} onClick={submitOrder}>
              {placing ? 'Sending...' : 'Send to Kitchen'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
