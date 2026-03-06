import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { NotebookStackParamList } from '../navigation/types';
import { usePrayers } from '../hooks/usePrayers';

type Route = RouteProp<NotebookStackParamList, 'PrayerDetail'>;
type Nav   = StackNavigationProp<NotebookStackParamList, 'PrayerDetail'>;

export default function PrayerDetailScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { prayers, deletePrayer } = usePrayers();

  const prayer = prayers.find((p) => p.id === route.params.prayerId);

  if (!prayer) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.inkDark} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Oração não encontrada.</Text>
        </View>
      </View>
    );
  }

  function handleDelete() {
    Alert.alert(
      'Eliminar oração',
      `Tem a certeza que pretende eliminar "${prayer!.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deletePrayer(prayer!.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.inkDark} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('AddEditPrayer', { prayerId: prayer.id })}
          >
            <Ionicons name="create-outline" size={22} color={colors.inkDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>{prayer.title}</Text>

        {/* Predefined indicator */}
        {prayer.isPreloaded && (
          <View style={styles.preloadedRow}>
            <Ionicons name="checkmark-circle" size={14} color={colors.gold} />
            <Text style={styles.preloadedLabel}>Oração Predefinida</Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Body */}
        <Text style={styles.body}>{prayer.body}</Text>

        {/* Tags */}
        {prayer.tags.length > 0 && (
          <View style={styles.tagSection}>
            <View style={styles.tagRow}>
              {prayer.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.sm,
    borderRadius: radius.full,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: fonts.sizes.xxl,
    color: colors.inkDark,
    lineHeight: fonts.sizes.xxl * 1.2,
    marginBottom: spacing.sm,
  },
  preloadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  preloadedLabel: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.gold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: fonts.sizes.lg,
    color: colors.inkMid,
    lineHeight: fonts.sizes.lg * 1.9,
    letterSpacing: 0.2,
  },
  tagSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.goldPale,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.gold,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.md,
    color: colors.inkLight,
  },
  backBtn: {
    padding: spacing.md,
  },
  error: {
    color: colors.error,
  },
});
