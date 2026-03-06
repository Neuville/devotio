import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, fonts, spacing, radius } from '../../constants/theme';

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background gradient */}
      <LinearGradient
        colors={[colors.navy, '#2C1810', colors.burgundy]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>

        {/* Logo area */}
        <View style={styles.logoArea}>
          <View style={styles.crossContainer}>
            <Text style={styles.crossIcon}>✝</Text>
          </View>
          <Text style={styles.appName}>Devotio</Text>
          <Text style={styles.tagline}>A sua vida de oração, organizada</Text>
        </View>

        {/* Bottom CTAs */}
        <View style={[styles.ctaArea, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Criar conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Já tenho conta</Text>
          </TouchableOpacity>

          <Text style={styles.footnote}>
            Ao continuar, aceita os nossos Termos de Serviço e Política de Privacidade.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  logoArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  crossContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: spacing.sm,
  },
  crossIcon: {
    fontSize: 40,
    color: colors.goldLight,
  },
  appName: {
    fontSize: fonts.sizes.xxl + 8,
    fontFamily: fonts.black,
    color: colors.white,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.serif,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  ctaArea: {
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.lg,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.lg,
  },
  footnote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.xs,
  },
});
