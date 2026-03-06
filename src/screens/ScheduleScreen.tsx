import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../constants/theme';

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      <Text style={styles.heading}>Horário de Oração</Text>
      <Text style={styles.sub}>As suas sessões agendadas aparecerão aqui.</Text>
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
  sub: {
    color: colors.inkLight,
    fontFamily: fonts.serif,
    fontSize: fonts.sizes.md,
    fontStyle: 'italic',
  },
});
