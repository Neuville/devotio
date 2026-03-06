import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, spacing, radius } from '../../constants/theme';
import AuthInput from '../../components/AuthInput';

type Props = StackScreenProps<AuthStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Campos em falta', 'Por favor preencha o email e a senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      Alert.alert('Erro ao entrar', 'Email ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      Alert.alert('Erro', 'Não foi possível entrar com o Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[colors.navy, '#2C1810']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Entre na sua conta Devotio</Text>

        <View style={styles.form}>
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="o.seu@email.com"
          />
          <AuthInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? 'A entrar…' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogle}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={18} color={colors.inkDark} />
            <Text style={styles.googleBtnText}>Continuar com Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.switchText}>
            Não tem conta?{' '}
            <Text style={styles.switchLink}>Criar conta</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
    padding: spacing.xs,
  },
  title: {
    color: colors.white,
    fontSize: fonts.sizes.xxl,
    fontFamily: fonts.black,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fonts.sizes.md,
    fontFamily: fonts.serif,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.lg,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
  },
  googleBtnText: {
    color: colors.inkDark,
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.md,
  },
  switchText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    textAlign: 'center',
  },
  switchLink: {
    color: colors.goldLight,
    fontFamily: fonts.bold,
  },
});
