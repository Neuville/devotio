import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';

export default function AddEditSessionScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.heading}>Nova Sessão</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  heading: { color: colors.inkDark, fontFamily: fonts.black, fontSize: fonts.sizes.xl },
});
