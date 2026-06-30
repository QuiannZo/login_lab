import { API_URL } from "../constants/config";
import type { User } from "../types/auth";

// Capa de acceso al backend. Centraliza las llamadas HTTP.

// Forma de la respuesta exitosa de /register y /login.
interface AuthResponse {
  user: User;
  token: string;
}

// Envuelve fetch para hablar JSON con el backend y unificar el manejo de errores.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    // fetch solo falla así cuando no hay conexión con el servidor.
    throw new Error("No se pudo conectar con el servidor. Revisa tu conexión.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Ocurrió un error inesperado");
  }
  return data as T;
}

// Crea una cuenta. Devuelve el usuario ya logueado + su token.
export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// Inicia sesión con email + contraseña.
export function login(email: string, password: string) {
  return request<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}