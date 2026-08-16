const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'restaurant_db';

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Runs an ALTER TABLE and silently ignores "already exists" style errors,
// so this is safe to run every time the server starts (including against
// a database that was already created by an earlier version of this app).
// Returns true only if the column/index was actually newly added this run
// (false if it already existed), so callers can do one-time follow-up work.
async function safeAlter(sql) {
  try {
    await pool.query(sql);
    return true;
  } catch (err) {
    const ignorable = ['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_CANT_DROP_FIELD_OR_KEY'];
    if (!ignorable.includes(err.code)) {
      console.warn(`Migration warning (${err.code}): ${err.message}`);
    }
    return false;
  }
}

async function initDb() {
  // Step 1: ensure the database exists
  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4`);
  await rootConn.end();

  // Step 2: create tables (fresh installs)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer','staff','cashier','admin') NOT NULL DEFAULT 'customer',
      avatar_url VARCHAR(500) NULL,
      last_login TIMESTAMP NULL,
      verified TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INT NULL,
      image_url VARCHAR(500),
      available TINYINT(1) NOT NULL DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NULL,
      guest_name VARCHAR(255) NULL,
      table_number VARCHAR(50) NULL,
      order_type ENUM('online','dine_in','takeaway') NOT NULL DEFAULT 'online',
      delivery_address VARCHAR(500) NULL,
      created_by INT NULL,
      status ENUM('pending','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      menu_item_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    ) ENGINE=InnoDB
  `);

  // Step 3: migrations for databases created by an earlier version of this app
  // (e.g. you imported schema.sql before cashier/POS support was added).
  await safeAlter(`ALTER TABLE users MODIFY COLUMN role ENUM('customer','staff','cashier','admin') NOT NULL DEFAULT 'customer'`);
  await safeAlter(`ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL`);
  await safeAlter(`ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL`);
  const verifiedColumnIsNew = await safeAlter(`ALTER TABLE users ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0`);
  if (verifiedColumnIsNew) {
    // One-time only: accounts that already existed before email verification
    // was introduced are grandfathered in as verified, so nobody who could
    // already log in gets locked out. This never runs again once the column
    // exists, so it won't touch genuinely new unverified signups later.
    await pool.query('UPDATE users SET verified = 1');
  }
  await safeAlter(`ALTER TABLE orders MODIFY COLUMN customer_id INT NULL`);
  await safeAlter(`ALTER TABLE orders ADD COLUMN guest_name VARCHAR(255) NULL`);
  await safeAlter(`ALTER TABLE orders ADD COLUMN table_number VARCHAR(50) NULL`);
  await safeAlter(`ALTER TABLE orders ADD COLUMN order_type ENUM('online','dine_in','takeaway') NOT NULL DEFAULT 'online'`);
  await safeAlter(`ALTER TABLE orders ADD COLUMN delivery_address VARCHAR(500) NULL`);
  await safeAlter(`ALTER TABLE orders ADD COLUMN created_by INT NULL`);

  // Step 4: seed demo data only if empty
  const [[{ c: userCount }]] = await pool.query('SELECT COUNT(*) AS c FROM users');
  if (userCount === 0) {
    const hash = (pw) => bcrypt.hashSync(pw, 10);

    await pool.query('INSERT INTO users (name, email, password, role, verified) VALUES (?,?,?,?,1)', [
      'Admin User', 'admin@restaurant.com', hash('admin123'), 'admin',
    ]);
    await pool.query('INSERT INTO users (name, email, password, role, verified) VALUES (?,?,?,?,1)', [
      'Staff User', 'staff@restaurant.com', hash('staff123'), 'staff',
    ]);
    await pool.query('INSERT INTO users (name, email, password, role, verified) VALUES (?,?,?,?,1)', [
      'Cashier User', 'cashier@restaurant.com', hash('cashier123'), 'cashier',
    ]);
    await pool.query('INSERT INTO users (name, email, password, role, verified) VALUES (?,?,?,?,1)', [
      'John Customer', 'customer@restaurant.com', hash('customer123'), 'customer',
    ]);

    const catIds = {};
    for (const name of ['Appetizers', 'Main Course', 'Desserts', 'Drinks']) {
      const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
      catIds[name] = result.insertId;
    }

    const items = [
      ['Spring Rolls', 'Crispy vegetable spring rolls with sweet chili sauce', 4.5, catIds['Appetizers']],
      ['Garlic Bread', 'Toasted bread with garlic butter', 3.5, catIds['Appetizers']],
      ['Grilled Chicken', 'Grilled chicken breast with herbs and mashed potatoes', 9.99, catIds['Main Course']],
      ['Beef Burger', 'Juicy beef patty with cheese, lettuce and tomato', 8.5, catIds['Main Course']],
      ['Margherita Pizza', 'Classic pizza with tomato, mozzarella and basil', 10.5, catIds['Main Course']],
      ['Chocolate Cake', 'Rich chocolate layer cake', 4.0, catIds['Desserts']],
      ['Ice Cream', 'Vanilla ice cream with chocolate syrup', 3.0, catIds['Desserts']],
      ['Iced Lemon Tea', 'Refreshing iced lemon tea', 2.0, catIds['Drinks']],
      ['Fresh Orange Juice', 'Freshly squeezed orange juice', 2.5, catIds['Drinks']],
    ];
    for (const [name, description, price, category_id] of items) {
      await pool.query(
        'INSERT INTO menu_items (name, description, price, category_id, image_url, available) VALUES (?,?,?,?,?,1)',
        [name, description, price, category_id, '']
      );
    }

    console.log('Seed data inserted:');
    console.log('  admin@restaurant.com / admin123');
    console.log('  staff@restaurant.com / staff123');
    console.log('  cashier@restaurant.com / cashier123');
    console.log('  customer@restaurant.com / customer123');
  }
}

module.exports = { pool, initDb };
