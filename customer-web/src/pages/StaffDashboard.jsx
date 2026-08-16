import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

export default function StaffDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { orders } = await api.allOrders(token, filter === 'all' ? undefined : filter);
      setOrders(orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleStatusChange(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="container">
        <div className="dash-header">
          <div>
            <h2 className="section-title">Staff Dashboard</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>Manage incoming orders from the kitchen.</p>
          </div>
        </div>

        <div className="tabs">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              className={`tab ${filter === s ? 'active' : ''}`}
              onClick={() => { setLoading(true); setFilter(s); }}
              style={{ textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">No orders in this view.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}<br /><span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleTimeString()}</span></td>
                  <td>{o.customer_name}</td>
                  <td style={{ maxWidth: 260 }}>
                    {o.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                  </td>
                  <td>${o.total.toFixed(2)}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                  <td>
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
