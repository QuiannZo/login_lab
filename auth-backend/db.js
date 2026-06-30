import Database from "better-sqlite3";

/**
 * Base de datos local (un solo archivo: auth.db).
 */
const db = new Database("auth.db");

// Crea la tabla de usuarios la primera vez que arranca.
// La contraseña no se guarda en texto plano, almacenamos el hash.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,        -- UNIQUE evita duplicados
    password TEXT NOT NULL,            -- aquí va el hash
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;