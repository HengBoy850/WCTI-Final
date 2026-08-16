const express = require('express');
const { pool } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public - list menu items (with category name), optional ?category_id= filter
router.get('/', async (req, res, next) => {
  try {
    const { category_id } = req.query;
    let items;
    if (category_id) {
      [items] = await pool.query(
        `SELECT m.*, c.name AS category_name FROM menu_items m
         LEFT JOIN categories c ON m.category_id = c.id
         WHERE m.category_id = ?
         ORDER BY m.name`,
        [category_id]
      );
    } else {
      [items] = await pool.query(
        `SELECT m.*, c.name AS category_name FROM menu_items m
         LEFT JOIN categories c ON m.category_id = c.id
         ORDER BY m.name`
      );
    }
    // MySQL DECIMAL columns come back as strings - normalize to numbers.
    items = items.map((i) => ({ ...i, price: Number(i.price), available: !!i.available }));
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// Public - get single item
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, c.name AS category_name FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = ?`,
      [req.params.id]
    );
    const item = rows[0];
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ item: { ...item, price: Number(item.price), available: !!item.available } });
  } catch (err) {
    next(err);
  }
});

// Admin - create item
router.post('/', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, price, category_id, image_url, available } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO menu_items (name, description, price, category_id, image_url, available)
       VALUES (?,?,?,?,?,?)`,
      [
        name,
        description || '',
        price,
        category_id || null,
        image_url || '',
        available === false ? 0 : 1,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Admin - update item
router.put('/:id', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, price, category_id, image_url, available } = req.body;
    const [existingRows] = await pool.query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
    const existing = existingRows[0];
    if (!existing) return res.status(404).json({ error: 'Item not found' });

    await pool.query(
      `UPDATE menu_items SET name=?, description=?, price=?, category_id=?, image_url=?, available=?
       WHERE id=?`,
      [
        name ?? existing.name,
        description ?? existing.description,
        price ?? existing.price,
        category_id ?? existing.category_id,
        image_url ?? existing.image_url,
        available === undefined ? existing.available : available ? 1 : 0,
        req.params.id,
      ]
    );
    res.json({ message: 'Item updated' });
  } catch (err) {
    next(err);
  }
});

// Admin - delete item
router.delete('/:id', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
