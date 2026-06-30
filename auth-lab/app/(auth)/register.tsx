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

// Pantalla de registro. Crea la cuenta en el backend y, si todo va bien, deja al usuario logueado.
export default function Register() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");

    // Validaciones en cliente (el backend también valida).
    if (!name.trim() || !email.trim() || !password) {
      setError("Completa todos los campos");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await api.register(name, email, password);
      await signIn(user, token); // queda logueado; el guard va al perfil
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrarse");
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
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para empezar</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />

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

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.primaryBtnText}>Registrarme</Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={() => router.back()} disabled={loading}>
            <Text style={styles.footer}>
              ¿Ya tienes cuenta? <Text style={styles.footerLink}>Inicia sesión</Text>
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
  footer: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
  footerLink: { color: colors.primary, fontWeight: "600" },
});