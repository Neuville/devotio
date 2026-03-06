import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { NotebookStackParamList } from '../navigation/types';
import { usePrayers } from '../hooks/usePrayers';
import { seedPrayers } from '../data/seedPrayers';
import { Prayer } from '../types';

type Nav = StackNavigationProp<NotebookStackParamList, 'NotebookHome'>;

export default function NotebookScreen() {
  const insets                                          = useSafeAreaInsets();
  const navigation                                      = useNavigation<Nav>();
  const { prayers, loading, deletePrayer,
          addPreloadedPrayer }                          = usePrayers();

  const [showOptions,     setShowOptions]     = useState(false);
  const [showPreloaded,   setShowPreloaded]   = useState(false);
  const [addingId,        setAddingId]        = useState<string | null>(null);

  // Seed prayers not yet in the user's notebook
  const availableSeeds = seedPrayers.filter(
    (s) => !prayers.some((p) => p.id === s.id)
  );

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

  async function handleAddPreloaded(prayer: Prayer) {
    setAddingId(prayer.id);
    try {
      await addPreloadedPrayer(prayer);
    } catch (e: any) {
      console.error('[NotebookScreen] addPreloaded error:', e.code, e.message);
      Alert.alert('Erro', 'Não foi possível adicionar a oração. Verifica a tua ligação.');
    } finally {
      setAddingId(null);
    }
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
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={56} color={colors.inkLight} />
        <Text style={styles.emptyTitle}>O teu Caderno está vazio</Text>
        <Text style={styles.emptySub}>
          Ainda não tens nenhuma oração no teu Caderno!{'\n'}
          Adiciona a tua primeira oração.
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
        </View>
      ) : (
        <FlatList
          data={prayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPrayerCard}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            prayers.length === 0 && styles.listContentEmpty,
            { paddingBottom: insets.bottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 72 }]}
        onPress={() => setShowOptions(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* ── Options sheet ── */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowOptions(false)}>
          <Pressable style={[styles.optionsSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Adicionar oração</Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowOptions(false);
                setTimeout(() => setShowPreloaded(true), 200);
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.goldPale }]}>
                <Ionicons name="list" size={20} color={colors.gold} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Escolher da lista</Text>
                <Text style={styles.optionSub}>Orações católicas predefinidas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => {
                setShowOptions(false);
                setTimeout(() => navigation.navigate('AddEditPrayer', {}), 200);
              }}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.burgundyPale }]}>
                <Ionicons name="create-outline" size={20} color={colors.burgundy} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Adicionar a minha</Text>
                <Text style={styles.optionSub}>Escreve uma oração personalizada</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inkLight} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Preloaded picker ── */}
      <Modal
        visible={showPreloaded}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPreloaded(false)}
      >
        <View style={styles.pickerContainer}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Orações Predefinidas</Text>
              <TouchableOpacity onPress={() => setShowPreloaded(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.inkDark} />
              </TouchableOpacity>
            </View>

            {availableSeeds.length === 0 ? (
              <View style={styles.allAddedWrap}>
                <Ionicons name="checkmark-circle" size={40} color={colors.gold} />
                <Text style={styles.allAddedText}>
                  Já tens todas as orações predefinidas no teu caderno!
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableSeeds}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isAdding = addingId === item.id;
                  return (
                    <TouchableOpacity
                      style={styles.seedRow}
                      onPress={() => handleAddPreloaded(item)}
                      disabled={isAdding}
                      activeOpacity={0.7}
                    >
                      <View style={styles.seedInfo}>
                        <Text style={styles.seedTitle}>{item.title}</Text>
                        <Text style={styles.seedPreview} numberOfLines={1}>
                          {item.body.split('\n')[0]}
                        </Text>
                      </View>
                      {isAdding ? (
                        <ActivityIndicator size="small" color={colors.gold} />
                      ) : (
                        <View style={styles.addIconWrap}>
                          <Ionicons name="add-circle" size={28} color={colors.gold} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
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
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  listContentEmpty: { flex: 1 },

  // Prayer card
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
  preloadedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  preloadedText: { fontFamily: fonts.regular, fontSize: fonts.sizes.xs, color: colors.gold },
  cardPreview: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.sm,
    color: colors.inkLight,
    lineHeight: fonts.sizes.sm * 1.6,
    marginBottom: spacing.sm,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: colors.goldPale,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: { fontFamily: fonts.regular, fontSize: fonts.sizes.xs, color: colors.gold },

  // Empty
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyTitle: { fontFamily: fonts.bold, fontSize: fonts.sizes.lg, color: colors.inkMid, marginTop: spacing.md, marginBottom: spacing.sm },
  emptySub: { fontFamily: fonts.serifItalic, fontSize: fonts.sizes.md, color: colors.inkLight, textAlign: 'center', lineHeight: fonts.sizes.md * 1.6 },

  // Loader
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // FAB
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

  // Options sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  optionsSheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.lg,
    color: colors.inkDark,
    marginBottom: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: fonts.bold, fontSize: fonts.sizes.md, color: colors.inkDark },
  optionSub: { fontFamily: fonts.regular, fontSize: fonts.sizes.sm, color: colors.inkLight, marginTop: 2 },

  // Preloaded picker
  pickerContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  pickerSheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '75%',
    paddingTop: spacing.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerTitle: { fontFamily: fonts.bold, fontSize: fonts.sizes.lg, color: colors.inkDark },
  closeBtn: { padding: spacing.xs },
  seedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  seedInfo: { flex: 1 },
  seedTitle: { fontFamily: fonts.bold, fontSize: fonts.sizes.md, color: colors.inkDark },
  seedPreview: { fontFamily: fonts.serifItalic, fontSize: fonts.sizes.sm, color: colors.inkLight, marginTop: 2 },
  addIconWrap: { padding: spacing.xs },
  separator: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  allAddedWrap: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  allAddedText: { fontFamily: fonts.serifItalic, fontSize: fonts.sizes.md, color: colors.inkLight, textAlign: 'center' },
});
