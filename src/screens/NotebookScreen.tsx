import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { NotebookStackParamList } from '../navigation/types';
import { usePrayers } from '../hooks/usePrayers';
import { Prayer } from '../types';

type Nav = StackNavigationProp<NotebookStackParamList, 'NotebookHome'>;

export default function NotebookScreen() {
  const insets                             = useSafeAreaInsets();
  const navigation                         = useNavigation<Nav>();
  const { prayers, loading, deletePrayer } = usePrayers();

  function handleLongPress(prayer: Prayer) {
    Alert.alert(
      prayer.title,
      'O que pretende fazer com esta oração?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePrayer(prayer.id),
        },
      ]
    );
  }

  function renderPrayerCard({ item }: { item: Prayer }) {
    const preview = item.body.split('\n')[0];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('PrayerDetail', { prayerId: item.id })}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          {item.isPreloaded && (
            <View style={styles.preloadedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={colors.gold} />
              <Text style={styles.preloadedText}>Predefinida</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardPreview} numberOfLines={2}>{preview}</Text>
        {item.tags.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={48} color={colors.inkLight} />
        <Text style={styles.emptyTitle}>Caderno vazio</Text>
        <Text style={styles.emptySub}>
          Toque no botão + para adicionar a sua primeira oração.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      <View style={styles.header}>
        <Text style={styles.heading}>Caderno</Text>
        <Text style={styles.subheading}>de Orações</Text>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.loadingText}>A carregar as suas orações…</Text>
        </View>
      ) : (
        <FlatList
          data={prayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPrayerCard}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 72 }]}
        onPress={() => navigation.navigate('AddEditPrayer', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  heading: {
    fontFamily: fonts.black,
    fontSize: fonts.sizes.xxl,
    color: colors.inkDark,
    lineHeight: fonts.sizes.xxl * 1.1,
  },
  subheading: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.lg,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.inkDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.md,
    color: colors.inkDark,
    flex: 1,
    marginRight: spacing.sm,
  },
  preloadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  preloadedText: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.xs,
    color: colors.gold,
  },
  cardPreview: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.sm,
    color: colors.inkLight,
    lineHeight: fonts.sizes.sm * 1.6,
    marginBottom: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.goldPale,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.xs,
    color: colors.gold,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.lg,
    color: colors.inkMid,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySub: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.md,
    color: colors.inkLight,
    textAlign: 'center',
    lineHeight: fonts.sizes.md * 1.6,
  },

  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.md,
    color: colors.inkLight,
  },

  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
