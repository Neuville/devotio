import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, spacing, radius } from '../constants/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logOut } = useAuth();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      <Text style={styles.heading}>Perfil</Text>
      <Text style={styles.username}>{user?.displayName ?? 'Devoto'}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.signOutBtn} onPress={logOut} activeOpacity={0.85}>
        <Text style={styles.signOutText}>Terminar sessão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  heading: {
    color: colors.inkDark,
    fontFamily: fonts.black,
    fontSize: fonts.sizes.xxl,
    marginBottom: spacing.sm,
  },
  username: {
    color: colors.inkDark,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.lg,
  },
  email: {
    color: colors.inkLight,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    marginBottom: spacing.xl,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.inkMid,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.md,
  },
});
