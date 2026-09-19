// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'shop.db'));

db.serialize(() => {
  // PRODUCTS
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    emoji TEXT
  )`);

  // CATEGORIES
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // CART
  db.run(`CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(session_id, product_id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);

  // CONTACTS
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // SAMPLE DATA (isang beses lang)
  db.get("SELECT COUNT(*) as c FROM products", (err, row) => {
    if (row && row.c === 0) {
      const stmt = db.prepare("INSERT INTO products (name, price, category, emoji) VALUES (?, ?, ?, ?)");
      stmt.run("Running Shoes", 1500, "Men", "👟");
      stmt.run("Pantalon", 700, "Men", "👖");
      stmt.run("Summer Dress", 1200, "Women", "👗");
      stmt.run("Handbag", 950, "Women", "👜");
      stmt.run("Kids Sneakers", 900, "Kids", "👟");
      stmt.run("Baby Onesie", 350, "Kids", "🧸");
      stmt.run("Backpack", 800, "Accessories", "🎒");
      stmt.run("Smart Watch", 2500, "Accessories", "⌚");
      stmt.finalize();

      db.run(`INSERT OR IGNORE INTO categories (name) VALUES 
        ('Men'), ('Women'), ('Kids'), ('Accessories')`);
      
      console.log("Sample data inserted (8 products)");
    }
  });
});

console.log("Database ready: shop.db");
module.exports = db;