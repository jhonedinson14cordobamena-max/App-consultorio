const express = require("express");
const db = require("../db");
const { hashPassword, verifyPassword, issueToken, requireAuth } = require("../auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: "Correo inválido." });
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
  }
  if (!name || !name.trim()) return res.status(400).json({ error: "El nombre es obligatorio." });

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: "Ya existe una cuenta con ese correo." });

  const info = db
    .prepare("INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)")
    .run(email.toLowerCase(), hashPassword(password), name.trim());

  db.prepare("INSERT INTO progress (user_id) VALUES (?)").run(info.lastInsertRowid);

  const user = { id: info.lastInsertRowid, email: email.toLowerCase() };
  res.status(201).json({ token: issueToken(user), name: name.trim() });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Correo y contraseña son obligatorios." });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(email).toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos." });
  }

  res.json({ token: issueToken(user), name: user.name });
});

router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.userId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
  const progress = db.prepare("SELECT * FROM progress WHERE user_id = ?").get(user.id);
  res.json({ user, progress });
});

module.exports = router;
