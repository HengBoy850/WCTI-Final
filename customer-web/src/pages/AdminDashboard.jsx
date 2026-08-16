import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Menu Items', 'Categories', 'Orders', 'Reports'];
const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

const emptyItemForm = { id: null, name: '', description: '', price: '', category_id: '', available: true, image_url: '' };

export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState('Menu Items');

  return (
    <section>
      <div className="container">
        <div className="dash-header">
          <div>
            <h2 className="section-title">Admin Dashboard</h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>Manage the menu, categories, orders and view reports.</p>
          </div>
        </div>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Menu Items' && <MenuItemsTab token={token} />}
        {tab === 'Categories' && <CategoriesTab token={token} />}
        {tab === 'Orders' && <OrdersTab token={token} />}
        {tab === 'Reports' && <ReportsTab token={token} />}
      </div>
    </section>
  );
}

// ---------------- Menu Items ----------------
function MenuItemsTab({ token }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyItemForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function load() {
    try {
      const [menuRes, catRes] = await Promise.all([api.getMenu(), api.getCategories()]);
      setItems(menuRes.items);
      setCategories(catRes.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url } = await api.uploadMenuImage(file, token);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category_id: form.category_id || null,
        available: form.available,
        image_url: form.image_url || '',
      };
      if (form.id) {
        await api.updateMenuItem(form.id, payload, token);
      } else {
        await api.createMenuItem(payload, token);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setForm(emptyItemForm);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function editItem(item) {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category_id: item.category_id || '',
      available: !!item.available,
      image_url: item.image_url || '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function deleteItem(id) {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.deleteMenuItem(id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {error && <div className="form-error">{error}</div>}
      <form className="crud-form" onSubmit={handleSubmit}>
        <div className="full" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: 'var(--cream)', border: '1.5px dashed var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {form.image_url ? (
              <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>No photo</span>
            )}
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImagePick} id="admin-menu-image" hidden />
            <label htmlFor="admin-menu-image" className="btn-sm btn-edit" style={{ cursor: 'pointer', display: 'inline-block' }}>
              {uploading ? 'Uploading…' : form.image_url ? 'Change photo' : 'Upload photo'}
            </label>
            {form.image_url && (
              <button type="button" className="btn-sm btn-delete" style={{ marginLeft: 8 }} onClick={() => setForm((f) => ({ ...f, image_url: '' }))}>
                Remove
              </button>
            )}
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>JPG, PNG, WEBP or GIF, up to 5MB</div>
          </div>
        </div>
        <div>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label>Price ($)</label>
          <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="full">
          <label>Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label>Category</label>
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
          />
          <label style={{ margin: 0 }}>Available on menu</label>
        </div>
        <div className="full" style={{ display: 'flex', gap: 10 }}>
          <button className="submit-btn" style={{ width: 'auto', padding: '10px 22px' }} type="submit" disabled={uploading}>
            {form.id ? 'Update Item' : 'Add Item'}
          </button>
          {form.id && (
            <button type="button" className="btn-sm btn-edit" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <table>
        <thead>
          <tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: 'var(--cream)' }}>
                  {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              </td>
              <td>{item.name}</td>
              <td>{item.category_name || '—'}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.available ? 'Yes' : 'No'}</td>
              <td className="action-row">
                <button className="btn-sm btn-edit" onClick={() => editItem(item)}>Edit</button>
                <button className="btn-sm btn-delete" onClick={() => deleteItem(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ---------------- Categories ----------------
function CategoriesTab({ token }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const { categories } = await api.getCategories();
    setCategories(categories);
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateCategory(editingId, { name }, token);
      } else {
        await api.createCategory({ name }, token);
      }
      setName('');
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category? Items in it will become uncategorized.')) return;
    try {
      await api.deleteCategory(id, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      {error && <div className="form-error">{error}</div>}
      <form className="crud-form" onSubmit={handleSubmit}>
        <div>
          <label>Category name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Salads" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <button className="submit-btn" style={{ width: 'auto', padding: '10px 22px' }} type="submit">
            {editingId ? 'Update' : 'Add Category'}
          </button>
          {editingId && (
            <button type="button" className="btn-sm btn-edit" onClick={() => { setEditingId(null); setName(''); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <table>
        <thead><tr><th>Name</th><th>Actions</th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td className="action-row">
                <button className="btn-sm btn-edit" onClick={() => { setEditingId(c.id); setName(c.name); }}>Edit</button>
                <button className="btn-sm btn-delete" onClick={() => deleteCategory(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ---------------- Orders (admin can also manage) ----------------
function OrdersTab({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { orders } = await api.allOrders(token);
      setOrders(orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function handleStatusChange(id, status) {
    try {
      await api.updateOrderStatus(id, status, token);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      {error && <div className="form-error">{error}</div>}
      {orders.length === 0 ? (
        <div className="empty-state">No orders yet.</div>
      ) : (
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customer_name}</td>
                <td>
                  {o.order_type === 'dine_in' ? `Dine-in${o.table_number ? ` · Table ${o.table_number}` : ''}` : o.order_type === 'takeaway' ? 'Takeaway' : 'Pickup'}
                </td>
                <td style={{ maxWidth: 260 }}>{o.items.map((it) => `${it.quantity}× ${it.name}`).join(', ')}</td>
                <td>${o.total.toFixed(2)}</td>
                <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
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
    </>
  );
}

// ---------------- Reports ----------------
function ReportsTab({ token }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getReportSummary(token).then(setReport).catch((err) => setError(err.message));
  }, [token]);

  if (error) return <div className="form-error">{error}</div>;
  if (!report) return <p>Loading report...</p>;

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="num">${report.totalRevenue.toFixed(2)}</div>
          <div className="label">Completed Revenue</div>
        </div>
        <div className="stat-card">
          <div className="num">{report.totalOrders}</div>
          <div className="label">Total Orders</div>
        </div>
        <div className="stat-card">
          <div className="num">{report.totalCustomers}</div>
          <div className="label">Registered Customers</div>
        </div>
        <div className="stat-card">
          <div className="num">{report.topItems.length}</div>
          <div className="label">Best Sellers Tracked</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Orders by Status</h3>
          {report.ordersByStatus.map((s) => (
            <div key={s.status} className="cart-item">
              <span className={`status-badge status-${s.status}`}>{s.status}</span>
              <span>{s.count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Top Selling Items</h3>
          {report.topItems.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 14 }}>No completed orders yet.</p>}
          {report.topItems.map((it) => (
            <div key={it.name} className="cart-item">
              <span>{it.name} ({it.total_qty} sold)</span>
              <span>${it.total_sales.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
