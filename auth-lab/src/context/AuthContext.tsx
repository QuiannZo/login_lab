import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";
import * as SecureStore from "expo-secure-store";
import type { User } from "../types/auth";
import { signOutFromGoogle } from "../services/googleAuth";

interface AuthContextType {
  user: User | null;     // null = sin sesión
  isLoading: boolean;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Claves bajo las que se guarda cada dato en SecureStore.
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  // Arranca en true: aún no sabemos si había una sesión guardada.
  const [isLoading, setIsLoading] = useState(true);

  // Intentamos restaurar la sesión previa desde el
  // almacenamiento. Si existe, el usuario entra directo sin volver a logear.
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        // Si algo falla, simplemente arranca sin sesión.
        console.error("Error restaurando la sesión:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Guarda token + usuario y actualiza el estado.
  const signIn = useCallback(async (newUser: User, token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  // Borra todo rastro de la sesión.
  const signOut = useCallback(async () => {
    // Cierra también la sesión del SDK de Google.
    await signOutFromGoogle();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso al contexto. Lanza error si se usa fuera del AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
}