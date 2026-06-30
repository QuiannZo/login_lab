import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { colors } from "../src/constants/theme";

/**
 * Observa el estado de sesión y el grupo de rutas actual, y redirige
 * para que nadie sin sesión entre a (app) ni nadie con sesión se quede
 * en (auth). */
function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments(); // p.ej. ["(auth)", "login"]
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Sin sesión intentando entrar a una zona privada -> al login.
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Con sesión pero parado en login/registro -> directo al perfil.
      router.replace("/(app)/profile");
    }
  }, [user, isLoading, segments]);

  // Pantalla de carga mientras lee la sesión guardada.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

/**
 * Layout raíz. Envuelve toda la app con el AuthProvider para que la
 * sesión esté disponible en cualquier pantalla, y monta el guard.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}