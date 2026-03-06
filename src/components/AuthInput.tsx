import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../constants/theme';

interface Props extends TextInputProps {
  label: string;
}

export default function AuthInput({ label, secureTextEntry, ...rest }: Props) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255,255,255,0.3)"
          selectionColor={colors.goldLight}
          secureTextEntry={hidden}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setHidden(h => !h)} style={styles.eyeBtn}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="rgba(255,255,255,0.5)"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.sm,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.md,
  },
  eyeBtn: {
    padding: spacing.xs,
  },
});
