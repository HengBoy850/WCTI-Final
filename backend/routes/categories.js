const express = require('express');
const { pool } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public - list categories
router.get('/', async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// Admin - create category
router.post('/', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    next(err);
  }
});

// Admin - update category
router.put('/:id', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query('UPDATE categories SET name = ? WHERE id = ?', [
      name,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category updated' });
  } catch (err) {
    next(err);
  }
});

// Admin - delete category
router.delete('/:id', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
