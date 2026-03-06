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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../constants/theme';
import { NotebookStackParamList } from '../navigation/types';
import { usePrayers } from '../hooks/usePrayers';

type Route = RouteProp<NotebookStackParamList, 'AddEditPrayer'>;
type Nav   = StackNavigationProp<NotebookStackParamList, 'AddEditPrayer'>;

export default function AddEditPrayerScreen() {
  const insets       = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation   = useNavigation<Nav>();
  const route        = useRoute<Route>();
  const { prayers, addPrayer, updatePrayer } = usePrayers();

  const editingId = route.params?.prayerId;
  const existing  = editingId ? prayers.find((p) => p.id === editingId) : undefined;
  const isEdit    = !!existing;

  const [title,    setTitle]    = useState(existing?.title ?? '');
  const [body,     setBody]     = useState(existing?.body ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags,     setTags]     = useState<string[]>(existing?.tags ?? []);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setBody(existing.body);
      setTags(existing.tags);
    }
  }, [existing?.id]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Título obrigatório', 'Por favor insira um título para a oração.');
      return;
    }
    if (!body.trim()) {
      Alert.alert('Texto obrigatório', 'Por favor insira o texto da oração.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editingId) {
        await updatePrayer(editingId, { title: title.trim(), body: body.trim(), tags });
      } else {
        await addPrayer({ title: title.trim(), body: body.trim(), tags, isPreloaded: false });
      }
      navigation.goBack();
    } catch (e: any) {
      console.error('[AddEditPrayer] save error:', e.code, e.message);
      Alert.alert('Erro', `Não foi possível guardar a oração.\n\n${e.code ?? e.message}`);
    } finally {
      setSaving(false);
    }
  }

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
            {isEdit ? 'Editar Oração' : 'Nova Oração'}
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
            { paddingBottom: tabBarHeight + spacing.md },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Pai Nosso"
            placeholderTextColor={colors.inkLight}
            returnKeyType="next"
            maxLength={100}
          />

          {/* Body */}
          <Text style={styles.label}>Texto da oração</Text>
          <TextInput
            style={styles.bodyInput}
            value={body}
            onChangeText={setBody}
            placeholder="Escreva o texto da oração aqui…"
            placeholderTextColor={colors.inkLight}
            multiline
            textAlignVertical="top"
          />

          {/* Tags */}
          <Text style={styles.label}>Etiquetas</Text>
          <View style={styles.tagInputRow}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Ex: Nossa Senhora"
              placeholderTextColor={colors.inkLight}
              returnKeyType="done"
              onSubmitEditing={addTag}
              blurOnSubmit={false}
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={addTag}>
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Ionicons name="close" size={12} color={colors.gold} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.md,
    color: colors.inkDark,
  },
  saveBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.sm,
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: fonts.sizes.sm,
    color: colors.inkMid,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  titleInput: {
    fontFamily: fonts.black,
    fontSize: fonts.sizes.xl,
    color: colors.inkDark,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderStrong,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
  },
  bodyInput: {
    fontFamily: fonts.serif,
    fontSize: fonts.sizes.md,
    color: colors.inkMid,
    lineHeight: fonts.sizes.md * 1.8,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 200,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.md,
    color: colors.inkDark,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addTagBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.goldPale,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  tagText: {
    fontFamily: fonts.regular,
    fontSize: fonts.sizes.sm,
    color: colors.gold,
  },
});
