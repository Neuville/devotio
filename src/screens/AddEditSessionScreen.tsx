import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { ScheduleStackParamList } from '../navigation/types';
import { useSessions } from '../hooks/useSessions';
import { usePrayers } from '../hooks/usePrayers';
import { PrayerItem, Recurrence, CustomUnit } from '../types';
import {
  scheduleSessionNotifications,
  cancelNotifications,
} from '../services/notifications';

type Route = RouteProp<ScheduleStackParamList, 'AddEditSession'>;
type Nav   = StackNavigationProp<ScheduleStackParamList, 'AddEditSession'>;

// ── Constants ────────────────────────────────────────────────────────────────

const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'once',    label: 'Uma vez'   },
  { value: 'daily',   label: 'Diária'    },
  { value: 'weekly',  label: 'Semanal'   },
  { value: 'monthly', label: 'Mensal'    },
  { value: 'yearly',  label: 'Anual'     },
  { value: 'custom',  label: 'Personalizado' },
];

const CUSTOM_UNITS: { value: CustomUnit; label: string }[] = [
  { value: 'days',   label: 'Dias'   },
  { value: 'weeks',  label: 'Semanas'},
  { value: 'months', label: 'Meses'  },
  { value: 'years',  label: 'Anos'   },
];

// D S T Q Q S S — maps to Sun … Sat
const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function dateFromTime(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function timeFromDate(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddEditSessionScreen() {
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<Nav>();
  const route        = useRoute<Route>();

  const { sessions, addSession, updateSession } = useSessions();
  const { prayers } = usePrayers();

  const sessionId = route.params?.sessionId;
  const existing  = sessionId ? sessions.find((s) => s.id === sessionId) : undefined;
  const isEdit    = !!existing;

  // ── Form state ──────────────────────────────────────────────────────────
  const [name,           setName]           = useState(existing?.name ?? '');
  const [timeDate,       setTimeDate]       = useState<Date>(
    dateFromTime(existing?.time ?? '08:00')
  );
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [recurrence,     setRecurrence]     = useState<Recurrence>(
    existing?.recurrence ?? 'daily'
  );
  const [daysOfWeek,     setDaysOfWeek]     = useState<number[]>(
    existing?.daysOfWeek ?? [1, 2, 3, 4, 5]
  );
  const [customInterval, setCustomInterval] = useState(
    existing?.customInterval ?? 1
  );
  const [customUnit,     setCustomUnit]     = useState<CustomUnit>(
    existing?.customUnit ?? 'days'
  );
  const [prayerItems,    setPrayerItems]    = useState<PrayerItem[]>(
    existing?.prayerItems ?? []
  );
  const [saving,         setSaving]         = useState(false);
  const [showPrayerPicker, setShowPrayerPicker] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setTimeDate(dateFromTime(existing.time));
      setRecurrence(existing.recurrence);
      setDaysOfWeek(existing.daysOfWeek);
      setCustomInterval(existing.customInterval);
      setCustomUnit(existing.customUnit);
      setPrayerItems(existing.prayerItems);
    }
  }, [existing?.id]);

  // ── Prayer item helpers ──────────────────────────────────────────────────

  function setQuantity(prayerId: string, delta: number) {
    setPrayerItems((prev) =>
      prev
        .map((item) =>
          item.prayerId === prayerId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
    );
  }

  function removePrayerItem(prayerId: string) {
    setPrayerItems((prev) => prev.filter((item) => item.prayerId !== prayerId));
  }

  function addPrayerFromPicker(prayerId: string) {
    const alreadyAdded = prayerItems.some((item) => item.prayerId === prayerId);
    if (!alreadyAdded) {
      setPrayerItems((prev) => [...prev, { prayerId, quantity: 1 }]);
    }
    setShowPrayerPicker(false);
  }

  // ── Day of week toggle ───────────────────────────────────────────────────

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // ── Save ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (prayerItems.length === 0) {
      Alert.alert('Orações obrigatórias', 'Adiciona pelo menos uma oração à rotina.');
      return;
    }
    if (recurrence === 'weekly' && daysOfWeek.length === 0) {
      Alert.alert('Dias obrigatórios', 'Seleciona pelo menos um dia da semana.');
      return;
    }

    const time      = timeFromDate(timeDate);
    const autoName  = name.trim() || `Oração das ${time}`;
    const newId     = sessionId ?? `session_${Date.now()}`;
    const isActive  = existing?.isActive ?? true;

    const sessionData = {
      id:             newId,
      name:           autoName,
      time,
      recurrence,
      customInterval,
      customUnit,
      daysOfWeek:     recurrence === 'weekly' ? [...daysOfWeek].sort() : [],
      prayerItems,
      isActive,
      notificationIds: [] as string[],
    };

    setSaving(true);
    try {
      // Cancel old notifications when editing
      if (isEdit && existing?.notificationIds?.length) {
        await cancelNotifications(existing.notificationIds);
      }

      // Schedule new notifications (include prayer titles for rich body)
      const notificationIds = isActive
        ? await scheduleSessionNotifications(sessionData, prayers)
        : [];

      const fullSession = { ...sessionData, notificationIds };

      if (isEdit) {
        await updateSession(newId, fullSession);
      } else {
        await addSession(fullSession);
      }

      navigation.goBack();
    } catch (e: any) {
      console.error('[AddEditSession] save error:', e.code, e.message);
      Alert.alert('Erro', `Não foi possível guardar a rotina.\n\n${e.code ?? e.message}`);
    } finally {
      setSaving(false);
    }
  }

  // ── Picker: prayers not yet added ────────────────────────────────────────
  const availableToAdd = prayers.filter(
    (p) => !prayerItems.some((item) => item.prayerId === p.id)
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.inkDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? 'Editar Rotina' : 'Nova Rotina'}
          </Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? 'A guardar…' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Name */}
          <Text style={styles.label}>Nome (opcional)</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Oração da manhã"
            placeholderTextColor={colors.inkLight}
            returnKeyType="done"
            maxLength={80}
          />

          {/* Time */}
          <Text style={styles.label}>Hora</Text>
          <TouchableOpacity style={styles.timeBtn} onPress={() => setShowTimePicker(true)}>
            <Ionicons name="time-outline" size={20} color={colors.gold} />
            <Text style={styles.timeBtnText}>{timeFromDate(timeDate)}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.inkLight} />
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={timeDate}
              mode="time"
              is24Hour
              display="default"
              onChange={(_, selected) => {
                setShowTimePicker(false);
                if (selected) setTimeDate(selected);
              }}
            />
          )}

          {/* Recurrence */}
          <Text style={styles.label}>Repetição</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip, recurrence === opt.value && styles.chipActive]}
                onPress={() => setRecurrence(opt.value)}
              >
                <Text style={[styles.chipText, recurrence === opt.value && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Weekly — day selector */}
          {recurrence === 'weekly' && (
            <>
              <Text style={styles.label}>Dias da semana</Text>
              <View style={styles.daysRow}>
                {WEEK_DAYS.map((label, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dayBtn, daysOfWeek.includes(index) && styles.dayBtnActive]}
                    onPress={() => toggleDay(index)}
                  >
                    <Text style={[styles.dayBtnText, daysOfWeek.includes(index) && styles.dayBtnTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Custom interval */}
          {recurrence === 'custom' && (
            <>
              <Text style={styles.label}>Intervalo personalizado</Text>
              <View style={styles.customRow}>
                <Text style={styles.customLabel}>A cada</Text>
                <TouchableOpacity
                  style={styles.intervalBtn}
                  onPress={() => setCustomInterval((v) => Math.max(1, v - 1))}
                >
                  <Ionicons name="remove" size={18} color={colors.inkDark} />
                </TouchableOpacity>
                <Text style={styles.intervalValue}>{customInterval}</Text>
                <TouchableOpacity
                  style={styles.intervalBtn}
                  onPress={() => setCustomInterval((v) => v + 1)}
                >
                  <Ionicons name="add" size={18} color={colors.inkDark} />
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                  {CUSTOM_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u.value}
                      style={[styles.unitChip, customUnit === u.value && styles.chipActive]}
                      onPress={() => setCustomUnit(u.value)}
                    >
                      <Text style={[styles.chipText, customUnit === u.value && styles.chipTextActive]}>
                        {u.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          )}

          {/* Prayers */}
          <Text style={styles.label}>Orações</Text>

          {prayerItems.length === 0 && (
            <Text style={styles.noPrayersHint}>
              Ainda não adicionaste nenhuma oração a esta rotina.
            </Text>
          )}

          {prayerItems.map((item) => {
            const prayer = prayers.find((p) => p.id === item.prayerId);
            if (!prayer) return null;
            return (
              <View key={item.prayerId} style={styles.prayerItemRow}>
                <View style={styles.prayerItemInfo}>
                  <Text style={styles.prayerItemTitle} numberOfLines={1}>
                    {prayer.title}
                  </Text>
                </View>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(item.prayerId, -1)}
                  >
                    <Ionicons name="remove" size={16} color={colors.inkDark} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity(item.prayerId, 1)}
                  >
                    <Ionicons name="add" size={16} color={colors.inkDark} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removePrayerItem(item.prayerId)}
                >
                  <Ionicons name="close-circle" size={22} color={colors.inkLight} />
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.addPrayerBtn}
            onPress={() => setShowPrayerPicker(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.gold} />
            <Text style={styles.addPrayerBtnText}>Adicionar oração</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Prayer picker modal ── */}
      <Modal
        visible={showPrayerPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrayerPicker(false)}
      >
        <View style={styles.pickerContainer}>
          <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Escolher Oração</Text>
              <TouchableOpacity onPress={() => setShowPrayerPicker(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.inkDark} />
              </TouchableOpacity>
            </View>

            {availableToAdd.length === 0 ? (
              <View style={styles.allAddedWrap}>
                <Ionicons name="checkmark-circle" size={40} color={colors.gold} />
                <Text style={styles.allAddedText}>
                  Todas as orações do teu caderno já foram adicionadas.
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableToAdd}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.pickerRow}
                    onPress={() => addPrayerFromPicker(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pickerRowInfo}>
                      <Text style={styles.pickerRowTitle}>{item.title}</Text>
                      <Text style={styles.pickerRowPreview} numberOfLines={1}>
                        {item.body.split('\n')[0]}
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={28} color={colors.gold} />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.cream },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn:       { padding: spacing.sm },
  headerTitle:   { fontFamily: fonts.bold, fontSize: fonts.sizes.md, color: colors.inkDark },
  saveBtn:       { backgroundColor: colors.gold, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:   { fontFamily: fonts.bold, fontSize: fonts.sizes.sm, color: colors.white },

  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  label: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.sm,
    color: colors.inkMid,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  nameInput: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.md,
    color: colors.inkDark,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderStrong,
    paddingVertical: spacing.sm,
  },

  // Time
  timeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  timeBtnText: { fontFamily: fonts.black, fontSize: fonts.sizes.xxl, color: colors.inkDark, flex: 1 },

  // Recurrence chips
  chipScroll: { flexGrow: 0, marginBottom: spacing.xs },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
  },
  chipActive:    { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText:      { fontFamily: fonts.regular, fontSize: fonts.sizes.sm, color: colors.inkMid },
  chipTextActive:{ color: colors.white, fontFamily: fonts.bold },

  // Days of week
  daysRow: { flexDirection: 'row', gap: spacing.sm },
  dayBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  dayBtnActive:    { backgroundColor: colors.gold, borderColor: colors.gold },
  dayBtnText:      { fontFamily: fonts.bold, fontSize: fonts.sizes.sm, color: colors.inkMid },
  dayBtnTextActive:{ color: colors.white },

  // Custom interval
  customRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  customLabel: { fontFamily: fonts.regular, fontSize: fonts.sizes.md, color: colors.inkMid },
  intervalBtn: {
    width: 32, height: 32, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white,
  },
  intervalValue: { fontFamily: fonts.black, fontSize: fonts.sizes.lg, color: colors.inkDark, minWidth: 28, textAlign: 'center' },
  unitScroll:  { flexGrow: 0 },
  unitChip: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    marginRight: spacing.xs, backgroundColor: colors.white,
  },

  // Prayer items
  noPrayersHint: {
    fontFamily: fonts.serifItalic,
    fontSize: fonts.sizes.sm,
    color: colors.inkLight,
    marginBottom: spacing.sm,
  },
  prayerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  prayerItemInfo: { flex: 1 },
  prayerItemTitle: { fontFamily: fonts.bold, fontSize: fonts.sizes.md, color: colors.inkDark },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: {
    width: 28, height: 28, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyValue: { fontFamily: fonts.black, fontSize: fonts.sizes.md, color: colors.inkDark, minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: spacing.xs },

  addPrayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  addPrayerBtnText: { fontFamily: fonts.bold, fontSize: fonts.sizes.md, color: colors.gold },

  // Prayer picker modal
  pickerContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  pickerSheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
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
  closeBtn:    { padding: spacing.xs },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pickerRowInfo:    { flex: 1 },
  pickerRowTitle:   { fontFamily: fonts.bold, fontSize: fonts.sizes.md, color: colors.inkDark },
  pickerRowPreview: { fontFamily: fonts.serifItalic, fontSize: fonts.sizes.sm, color: colors.inkLight, marginTop: 2 },
  separator:        { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  allAddedWrap:     { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  allAddedText:     { fontFamily: fonts.serifItalic, fontSize: fonts.sizes.md, color: colors.inkLight, textAlign: 'center' },
});
