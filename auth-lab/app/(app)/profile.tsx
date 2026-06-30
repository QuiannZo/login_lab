import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { colors, spacing, radius } from "../../src/constants/theme";

export default function Profile() {
  // Los datos ahora vienen de la sesión.
  const { user, signOut } = useAuth();

  // Limpia la sesión. El guard, al ver user = null, vuelve al login solo.
  const handleLogout = () => signOut();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          {/* Protege con ?. por si el render pasa antes de redirigir */}
          <Text style={styles.avatarText}>{user?.name.charAt(0)}</Text>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Método de acceso</Text>
            <Text style={styles.rowValue}>{user?.provider}</Text>
          </View>
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg, alignItems: "center" },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: colors.text },
  name: { fontSize: 24, fontWeight: "bold", color: colors.text },
  email: { fontSize: 15, color: colors.textMuted, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
    width: "100%", marginTop: spacing.xl,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { color: colors.textMuted, fontSize: 14 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
  logoutBtn: {
    backgroundColor: colors.danger, padding: spacing.md, borderRadius: radius.md,
    alignItems: "center", width: "100%", marginTop: spacing.xl,
  },
  logoutText: { color: colors.text, fontWeight: "700", fontSize: 16 },
});