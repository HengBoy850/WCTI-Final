import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const params = filter === 'all' ? undefined : { status: filter };
      const { orders } = await api.allOrders(token, params);
      setOrders(orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleStatusChange(id, status) {
    try {
      await api.updateOrderStatus(id, status, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <PageHeader title="Orders" subtitle="Live incoming orders from the website and POS" />
      <div className="page-body">
        <div className="tabs">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => { setLoading(true); setFilter(s); }} style={{ textTransform: 'capitalize' }}>
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
              <tr><th>Order</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    #{o.id}
                    <br />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleTimeString()}</span>
                  </td>
                  <td>
                    {o.customer_name}
                    {o.table_number && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Table {o.table_number}</div>}
                  </td>
                  <td><span className="type-pill">{o.order_type.replace('_', ' ')}</span></td>
                  <td style={{ maxWidth: 260 }}>{o.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
                  <td>
                    <select className="status-select" value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
