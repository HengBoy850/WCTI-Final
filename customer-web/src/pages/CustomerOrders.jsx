import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['pending', 'preparing', 'ready', 'completed'];

export default function CustomerOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { orders } = await api.myOrders(token);
      setOrders(orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000); // light polling for status updates
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="container" style={{ padding: '60px 0' }}>Loading your orders...</div>;

  return (
    <section>
      <div className="container">
        <div className="dash-header">
          <div>
            <h2 className="section-title">My Orders</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>Track the status of your recent orders.</p>
          </div>
        </div>
        {error && <div className="form-error">{error}</div>}

        {orders.length === 0 ? (
          <div className="empty-state">You haven't placed any orders yet.</div>
        ) : (
          orders.map((order) => (
            <div className="card" key={order.id} style={{ marginBottom: 18 }}>
              <div className="dash-header" style={{ marginBottom: 12 }}>
                <div>
                  <strong>Order #{order.id}</strong>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                    {new Date(order.created_at).toLocaleString()}
                    {order.order_type === 'dine_in' && order.table_number && (
                      <> · Dine-in · Table {order.table_number}</>
                    )}
                    {order.order_type === 'online' && <> · Pickup</>}
                  </div>
                </div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>

              {order.status !== 'cancelled' && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {STEPS.map((step, idx) => {
                    const currentIdx = STEPS.indexOf(order.status);
                    const done = idx <= currentIdx;
                    return (
                      <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                          height: 6, borderRadius: 4,
                          background: done ? 'var(--orange)' : 'var(--line)',
                          marginBottom: 6,
                        }} />
                        <span style={{ fontSize: 11, textTransform: 'capitalize', color: done ? 'var(--ink)' : 'var(--muted)' }}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {order.items.map((it) => (
                <div className="cart-item" key={it.id}>
                  <span>{it.quantity} × {it.name}</span>
                  <span>${(it.price * it.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="cart-total">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
