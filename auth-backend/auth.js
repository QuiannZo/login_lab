import jwt from "jsonwebtoken";

// Utilidades de JWT.

// Genera un token firmado para un usuario. "sub" (subject) = id del usuario.
// Caduca en 7 días.
export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Middleware que protege rutas privadas.

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token faltante" });
  }
  const token = header.slice(7); // quita el prefijo "Bearer "
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}