import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import db from "./db.js";
import { signToken, authMiddleware } from "./auth.js";

const app = express();
app.use(cors());                 // permite que la app llame al API
app.use(express.json());

// Da forma "pública" al usuario: nunca devolvemos el hash de la contraseña.

function publicUser(row) {
  return { id: String(row.id), name: row.name, email: row.email, provider: "custom" };
}

// POST /register — crea una cuenta nueva. devuelve el usuario + un token (queda logueado tras registrarse).
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  // Validaciones básicas de server.
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (exists) {
    return res.status(409).json({ error: "Ese email ya está registrado" });
  }

  // bcrypt convierte la contraseña en un hash irreversible.
  const hash = await bcrypt.hash(password, 10);

  const info = db
    .prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")
    .run(name.trim(), normalizedEmail, hash);

  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json({ user: publicUser(row), token: signToken(row) });
});

// POST /login — inicia sesión con email + contraseña.
app.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!row) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  // Compara la contraseña recibida contra el hash.
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  res.json({ user: publicUser(row), token: signToken(row) });
});

// GET /me — ruta protegida. Devuelve el usuario del token.
app.get("/me", authMiddleware, (req, res) => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
  if (!row) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ user: publicUser(row) });
});

const PORT = process.env.PORT || 4000;

// Escuchamos en "0.0.0.0". Permite que el teléfono alcance el backend por la
// IP local de la computadora.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en el puerto ${PORT}`);
});