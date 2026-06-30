import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GOOGLE_WEB_CLIENT_ID } from "../constants/config";
import type { User } from "../types/auth";

// Servicio de inicio de sesión con Google. Centraliza la configuración del SDK y expone funciones para iniciar y cerrar sesión.

// Se configura una sola vez al cargar el módulo.
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export async function signInWithGoogle(): Promise<{ user: User; token: string }> {
  try {
    // Verifica Google Play Services (solo en Android).
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const result = await GoogleSignin.signIn();

    const data: any = (result as any).data ?? result;
    const idToken: string | undefined = data.idToken;
    const u = data.user ?? data;

    if (!idToken) throw new Error("Google no devolvió un idToken");

    const user: User = {
      id: u.id,
      name: u.name ?? u.givenName ?? "Usuario Google",
      email: u.email,
      photo: u.photo ?? undefined,
      provider: "google",
    };

    return { user, token: idToken };
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error("Inicio de sesión cancelado");
    }
    if (e?.code === statusCodes.IN_PROGRESS) {
      throw new Error("Ya hay un inicio de sesión en curso");
    }
    if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error("Google Play Services no está disponible");
    }
    throw new Error(e?.message || "Error al iniciar sesión con Google");
  }
}

// Cierra la sesión del SDK de Google.
export async function signOutFromGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {
    // Si no había sesión activa, no es un error real.
  }
}