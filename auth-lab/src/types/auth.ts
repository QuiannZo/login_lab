// Identifica con qué método inició sesión el usuario.
export type AuthProvider = "google" | "custom";

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;        // opcional: Google sí trae foto, el auth custom no
  provider: AuthProvider;
}