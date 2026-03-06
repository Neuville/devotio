import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { ScheduleStackParamList } from '../navigation/types';
import { useSessions } from '../hooks/useSessions';
import { usePrayers } from '../hooks/usePrayers';
import { Session } from '../types';
import { recurrenceLabel, prayerItemsSummary } from '../utils/sessionLabels';

type Nav = StackNavigationProp<ScheduleStackParamList, 'ScheduleHome'>;

export default function ScheduleScreen() {
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<Nav>();
  const { sessions, loading, deleteSession, toggleSession } = useSessions();
  const { prayers } = usePrayers();

  function handleLongPress(session: Session) {
    Alert.alert(
      session.name || 'Sessão',
      'O que pretende fazer com esta sessão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteSession(session.id),
        },
      ]
    );
  }

  function renderCard({ item }: { item: Session }) {
    const summary = prayerItemsSummary(item.prayerItems, prayers);
    return (
      <TouchableOpacity
        style={[styles.card, !item.isActive && styles.cardInactive]}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('AddEditSession', { sessionId: item.id })}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.cardLeft}>
          <Text style={[styles.cardTime, !item.isActive && styles.textMuted]}>
            {item.time}
          </Text>
          <Text style={[styles.cardRecurrence, !item.isActive && styles.textMuted]}>
            {recurrenceLabel(item)}
          </Text>
          {summary.length > 0 && (
            <Text style={styles.cardSummary} numberOfLines={2}>{summary}</Text>
          )}
          {item.name ? (
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          ) : null}
        </View>
        <Switch
          value={item.isActive}
          onValueChange={(val) => toggleSession(item.id, val)}
          trackColor={{ false: colors.border, true: colors.goldLight }}
          thumbColor={item.isActive ? colors.gold : colors.inkLight}
        />
      </TouchableOpacity>
    );
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={56} color={colors.inkLight} />
        <Text style={styles.emptyTitle}>Sem rotinas agendadas</Text>
        <Text style={styles.emptySub}>
          Ainda não tens nenhuma rotina de oração.{'\n'}
          Toca no + para criar a primeira.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

      <View style={styles.header}>
        <Text style={styles.heading}>Horário</Text>
        <Text style={styles.subheading}>de Oração</Text>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            sessions.length === 0 && styles.listContentEmpty,
            { paddingBottom: tabBarHeight + spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: tabBarHeight + spacing.md }]}
        onPress={() => navigation.navigate('AddEditSession', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
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
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.inkDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardInactive: { opacity: 0.5 },
  cardLeft: { flex: 1, marginRight: spacing.sm },
  cardTime: {
    fontFamily: fonts.black,
    fontSize: fonts.sizes.xxl,
    color: colors.inkDark,
    lineHeight: fonts.sizes.xxl * 1.1,
  },
  cardRecurrence: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.gold,
    marginTop: 2,
  },
  cardSummary: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.sm,
    color: colors.inkLight,
    marginTop: spacing.xs,
    lineHeight: fonts.sizes.sm * 1.5,
  },
  cardName: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.sm,
    color: colors.inkMid,
    marginTop: spacing.xs,
  },
  textMuted: { color: colors.inkLight },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
