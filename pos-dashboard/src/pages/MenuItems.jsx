import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';

const emptyForm = { id: null, name: '', description: '', price: '', category_id: '', available: true, image_url: '' };

export default function MenuItems() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
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
      if (form.id) await api.updateMenuItem(form.id, payload, token);
      else await api.createMenuItem(payload, token);
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function editItem(item) {
    setForm({
      id: item.id, name: item.name, description: item.description || '',
      price: String(item.price), category_id: item.category_id || '', available: !!item.available,
      image_url: item.image_url || '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteItem(id) {
    if (!confirm('Delete this menu item?')) return;
    try { await api.deleteMenuItem(id, token); load(); } catch (err) { setError(err.message); }
  }

  return (
    <>
      <PageHeader title="Menu Items" subtitle="Manage what's available to order — add a photo so customers know what they're getting" />
      <div className="page-body">
        {error && <div className="form-error">{error}</div>}

        <form className="crud-form" onSubmit={handleSubmit}>
          <div className="full image-upload-row">
            <label>Item photo</label>
            <div className="image-upload-box">
              <div className="image-preview">
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" />
                ) : (
                  <span className="image-preview-empty">No photo yet</span>
                )}
              </div>
              <div className="image-upload-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImagePick}
                  id="menu-image-input"
                  hidden
                />
                <label htmlFor="menu-image-input" className="btn btn-outline btn-sm">
                  {uploading ? 'Uploading…' : form.image_url ? 'Change photo' : 'Upload photo'}
                </label>
                {form.image_url && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm((f) => ({ ...f, image_url: '' }))}>
                    Remove
                  </button>
                )}
                <span className="hint-text">JPG, PNG, WEBP or GIF, up to 5MB</span>
              </div>
            </div>
          </div>

          <div><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>Price ($)</label><input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div className="full"><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <label>Category</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="checkbox-row" style={{ marginTop: 22 }}>
            <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
            <label>Available on menu</label>
          </div>
          <div className="full" style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="submit" disabled={uploading}>{form.id ? 'Update Item' : 'Add Item'}</button>
            {form.id && <button type="button" className="btn btn-outline" onClick={resetForm}>Cancel</button>}
          </div>
        </form>

        {loading ? <p>Loading...</p> : (
          <div className="menu-admin-grid">
            {items.map((item) => (
              <div className="menu-admin-card" key={item.id}>
                <div className="menu-admin-thumb">
                  {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span>No photo</span>}
                  {!item.available && <span className="thumb-badge">Unavailable</span>}
                </div>
                <div className="menu-admin-info">
                  <div className="menu-admin-top">
                    <h4>{item.name}</h4>
                    <span className="price">${item.price.toFixed(2)}</span>
                  </div>
                  <span className="muted-text">{item.category_name || 'Uncategorized'}</span>
                  <div className="action-row" style={{ marginTop: 10 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => editItem(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="empty-state">No menu items yet — add your first one above.</p>}
          </div>
        )}
      </div>
    </>
  );
}
