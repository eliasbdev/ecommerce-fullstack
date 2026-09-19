// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// SERVE FRONTEND
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function getSession(req) {
  return req.headers['x-session-id'] || 'guest';
}

// ============== PRODUCTS ==============
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============== CATEGORIES ==============
app.get('/api/categories', (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ============== CART ==============
app.get('/api/cart', (req, res) => {
  const sid = getSession(req);
  db.all(`
    SELECT cart.id, cart.product_id, cart.quantity,
           products.name, products.price, products.emoji, products.category
    FROM cart JOIN products ON cart.product_id = products.id
    WHERE cart.session_id = ?
  `, [sid], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/cart', (req, res) => {
  const sid = getSession(req);
  const { product_id, quantity = 1 } = req.body;
  if (!product_id) return res.status(400).json({ error: "product_id required" });

  db.get("SELECT * FROM cart WHERE session_id = ? AND product_id = ?", [sid, product_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      db.run("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, row.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Naidagdag!", id: row.id });
      });
    } else {
      db.run("INSERT INTO cart (session_id, product_id, quantity) VALUES (?, ?, ?)",
        [sid, product_id, quantity], function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Naidagdag!", id: this.lastID });
        });
    }
  });
});

app.patch('/api/cart/:id', (req, res) => {
  const sid = getSession(req);
  const { quantity } = req.body;
  if (quantity < 1) {
    return db.run("DELETE FROM cart WHERE id = ? AND session_id = ?", [req.params.id, sid], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Natanggal" });
    });
  }
  db.run("UPDATE cart SET quantity = ? WHERE id = ? AND session_id = ?",
    [quantity, req.params.id, sid], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Updated" });
    });
});

app.delete('/api/cart/:id', (req, res) => {
  const sid = getSession(req);
  db.run("DELETE FROM cart WHERE id = ? AND session_id = ?", [req.params.id, sid], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Natanggal" });
  });
});

// ============== CHECKOUT ==============
app.post('/api/checkout', (req, res) => {
  const sid = getSession(req);
  db.all(`
    SELECT cart.quantity, products.name, products.price
    FROM cart JOIN products ON cart.product_id = products.id
    WHERE cart.session_id = ?
  `, [sid], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!items.length) return res.status(400).json({ error: "Empty cart" });

    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    db.run("DELETE FROM cart WHERE session_id = ?", [sid], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Salamat!", total, items });
    });
  });
});

// ============== CONTACT ==============
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: "Kumpletohin ang form" });
  db.run("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
    [name, email, message], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Salamat! Natanggap na namin." });
    });
});

// ============== START ==============
app.listen(PORT, () => {
  console.log("Server running!");
  console.log("Buksan: http://localhost:" + PORT);
});