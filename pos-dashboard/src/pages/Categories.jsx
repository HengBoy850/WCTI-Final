import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';

export default function Categories() {
  const { token } = useAuth();
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
      if (editingId) await api.updateCategory(editingId, { name }, token);
      else await api.createCategory({ name }, token);
      setName('');
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category? Items in it will become uncategorized.')) return;
    try { await api.deleteCategory(id, token); load(); } catch (err) { setError(err.message); }
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Group your menu items" />
      <div className="page-body">
        {error && <div className="form-error">{error}</div>}
        <form className="crud-form" onSubmit={handleSubmit}>
          <div><label>Category name</label><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Salads" /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Add Category'}</button>
            {editingId && <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setName(''); }}>Cancel</button>}
          </div>
        </form>

        <table>
          <thead><tr><th>Name</th><th>Actions</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(c.id); setName(c.name); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
