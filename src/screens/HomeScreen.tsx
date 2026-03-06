import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      <Text style={styles.date}>{today}</Text>
      <Text style={styles.heading}>Bom dia</Text>
      <Text style={styles.sub}>As suas sessões de oração de hoje aparecerão aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
  },
  date: {
    color: colors.inkLight,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  heading: {
    color: colors.inkDark,
    fontFamily: fonts.black,
    fontSize: fonts.sizes.xxl,
    marginBottom: spacing.sm,
  },
  sub: {
    color: colors.inkLight,
    fontFamily: fonts.serif,
    fontSize: fonts.sizes.md,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
