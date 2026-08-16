const express = require('express');
const { pool } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

async function attachItems(order) {
  const [items] = await pool.query(
    'SELECT id, menu_item_id, name, price, quantity FROM order_items WHERE order_id = ?',
    [order.id]
  );
  return {
    ...order,
    total: Number(order.total),
    items: items.map((i) => ({ ...i, price: Number(i.price) })),
  };
}

async function createOrder({ conn, customerId, createdBy, items, notes, orderType, guestName, tableNumber, deliveryAddress }) {
  let total = 0;
  const resolvedItems = [];
  for (const it of items) {
    const [rows] = await conn.query('SELECT * FROM menu_items WHERE id = ?', [it.menu_item_id]);
    const menuItem = rows[0];
    if (!menuItem) throw new Error(`Menu item ${it.menu_item_id} not found`);
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    total += Number(menuItem.price) * qty;
    resolvedItems.push({ menuItem, qty });
  }

  const [orderResult] = await conn.query(
    `INSERT INTO orders
      (customer_id, guest_name, table_number, order_type, delivery_address, created_by, status, total, notes)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [customerId, guestName || null, tableNumber || null, orderType, deliveryAddress || null, createdBy || null, 'pending', total, notes || '']
  );
  const orderId = orderResult.insertId;

  for (const { menuItem, qty } of resolvedItems) {
    await conn.query(
      'INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?,?,?,?,?)',
      [orderId, menuItem.id, menuItem.name, menuItem.price, qty]
    );
  }

  return orderId;
}

// Customer - place an order from the website
router.post('/', authRequired, requireRole('customer'), async (req, res) => {
  const { items, notes, delivery_address, order_type, table_number } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }
  // Customers can order for pickup, delivery, or dine-in (with a table number).
  const validTypes = ['online', 'dine_in'];
  const orderType = validTypes.includes(order_type) ? order_type : 'online';
  if (orderType === 'dine_in' && !table_number) {
    return res.status(400).json({ error: 'Table number is required for dine-in orders' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const orderId = await createOrder({
      conn,
      customerId: req.user.id,
      createdBy: req.user.id,
      items,
      notes,
      orderType,
      tableNumber: orderType === 'dine_in' ? table_number : null,
      deliveryAddress: delivery_address,
    });
    await conn.commit();

    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = await attachItems(orderRows[0]);
    res.status(201).json({ order });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Cashier/Staff/Admin - create a walk-in order from the POS terminal
// (dine-in or takeaway, no customer account required)
router.post('/walkin', authRequired, requireRole('cashier', 'staff', 'admin'), async (req, res) => {
  const { items, notes, order_type, guest_name, table_number } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }
  const validTypes = ['dine_in', 'takeaway'];
  const orderType = validTypes.includes(order_type) ? order_type : 'dine_in';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const orderId = await createOrder({
      conn,
      customerId: null,
      createdBy: req.user.id,
      items,
      notes,
      orderType,
      guestName: guest_name,
      tableNumber: table_number,
    });
    await conn.commit();

    const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = await attachItems(orderRows[0]);
    res.status(201).json({ order });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Customer - view own orders
router.get('/mine', authRequired, requireRole('customer'), async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const withItems = await Promise.all(orders.map(attachItems));
    res.json({ orders: withItems });
  } catch (err) {
    next(err);
  }
});

// Staff/Cashier/Admin - view all orders (optional ?status= and ?order_type= filters)
router.get('/', authRequired, requireRole('staff', 'cashier', 'admin'), async (req, res, next) => {
  try {
    const { status, order_type } = req.query;
    const conditions = [];
    const params = [];
    if (status) { conditions.push('o.status = ?'); params.push(status); }
    if (order_type) { conditions.push('o.order_type = ?'); params.push(order_type); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name FROM orders o
       LEFT JOIN users u ON o.customer_id = u.id
       ${where}
       ORDER BY o.created_at DESC`,
      params
    );
    const withItems = await Promise.all(
      orders.map(async (o) => attachItems({ ...o, customer_name: o.customer_name || o.guest_name || 'Walk-in' }))
    );
    res.json({ orders: withItems });
  } catch (err) {
    next(err);
  }
});

// Staff/Cashier/Admin - update order status
router.put('/:id/status', authRequired, requireRole('staff', 'cashier', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` });
    }
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [
      status,
      req.params.id,
    ]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
