require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const uploadRoutes = require('./routes/upload');

const app = express();

// Allow both frontend apps (customer website + POS dashboard) to call this API.
const allowedOrigins = [
  process.env.CUSTOMER_WEB_URL || 'http://localhost:5173',
  process.env.POS_DASHBOARD_URL || 'http://localhost:5174',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Serve uploaded menu item photos (e.g. /uploads/169...-abc123.jpg)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Restaurant API server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database. Is MySQL/XAMPP running?');
    console.error(err.message);
    process.exit(1);
  });
