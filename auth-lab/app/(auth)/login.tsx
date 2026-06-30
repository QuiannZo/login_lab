import { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import * as api from "../../src/services/api";
import { colors, spacing, radius } from "../../src/constants/theme";
import { signInWithGoogle } from "../../src/services/googleAuth";

/**
 * Pantalla de inicio de sesión.
 * "Entrar" valida contra el backend real (auth custom, Parte B).
 */
export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Mensaje de error a mostrar bajo el formulario (credenciales, red, etc.).
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Login real: llama al backend, y si responde OK guarda la sesión.
  const handleLogin = async () => {
    setError("");

    // Validación en client antes de molestar al servidor.
    if (!email.trim() || !password) {
      setError("Completa email y contraseña");
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await api.login(email, password);
      await signIn(user, token); // persiste la sesión; el guard redirige.
    } catch (e) {
      // Los errores vienen ya con mensaje legible desde api.ts.
      setError(e instanceof Error ? e.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // login de google.
  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const { user, token } = await signInWithGoogle();
      await signIn(user, token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🔐</Text>
          </View>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {/* Espacio de error: solo aparece si hay algo que mostrar */}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.primaryBtnText}>Entrar</Text>
              )}
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.line} />
            </View>

            <Pressable style={styles.googleBtn} onPress={handleGoogle} disabled={loading}>
              <Text style={styles.googleBtnText}>Continuar con Google</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push("/(auth)/register")} disabled={loading}>
            <Text style={styles.footer}>
              ¿No tienes cuenta? <Text style={styles.footerLink}>Regístrate</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  logo: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", alignSelf: "center",
    marginBottom: spacing.lg,
  },
  logoText: { fontSize: 32 },
  title: { fontSize: 30, fontWeight: "bold", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: "center", marginTop: spacing.xs },
  form: { marginTop: spacing.xl, gap: spacing.sm },
  label: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, color: colors.text, fontSize: 15,
  },
  error: { color: "#ff8a80", fontSize: 14, marginTop: spacing.xs },
  primaryBtn: {
    backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md,
    alignItems: "center", marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: colors.text, fontWeight: "700", fontSize: 16 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginVertical: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted },
  googleBtn: {
    backgroundColor: colors.google, padding: spacing.md, borderRadius: radius.md,
    alignItems: "center",
  },
  googleBtnText: { color: colors.text, fontWeight: "600", fontSize: 15 },
  footer: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  footerLink: { color: colors.primary, fontWeight: "600" },
});