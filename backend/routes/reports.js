const express = require('express');
const { pool } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Admin - sales summary report
router.get('/summary', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [[{ total }]] = await pool.query(
      "SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE status = 'completed'"
    );

    const [ordersByStatus] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
    );

    const [topItems] = await pool.query(`
      SELECT oi.name, SUM(oi.quantity) AS total_qty, SUM(oi.price * oi.quantity) AS total_sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY oi.name
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    const [[{ count: totalOrders }]] = await pool.query('SELECT COUNT(*) AS count FROM orders');
    const [[{ count: totalCustomers }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE role = 'customer'"
    );

    res.json({
      totalRevenue: Number(total),
      totalOrders,
      totalCustomers,
      ordersByStatus: ordersByStatus.map((s) => ({ ...s, count: Number(s.count) })),
      topItems: topItems.map((i) => ({
        ...i,
        total_qty: Number(i.total_qty),
        total_sales: Number(i.total_sales),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Admin - account / usage analytics for the POS dashboard
router.get('/accounts', authRequired, requireRole('admin'), async (req, res, next) => {
  try {
    const [byRole] = await pool.query('SELECT role, COUNT(*) AS count FROM users GROUP BY role');

    const [[{ count: newToday }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM users WHERE DATE(created_at) = CURDATE()'
    );
    const [[{ count: newThisWeek }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    );
    const [[{ count: activeToday }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM users WHERE DATE(last_login) = CURDATE()'
    );
    const [[{ count: totalUsers }]] = await pool.query('SELECT COUNT(*) AS count FROM users');

    const [signupTrend] = await pool.query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE(created_at)
      ORDER BY day
    `);

    res.json({
      totalUsers,
      newToday,
      newThisWeek,
      activeToday,
      byRole: byRole.map((r) => ({ ...r, count: Number(r.count) })),
      signupTrend: signupTrend.map((s) => ({ day: s.day, count: Number(s.count) })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
