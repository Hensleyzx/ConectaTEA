import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ToggleRow } from '../components/ToggleRow';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { RoutineItem } from '../types/app';

const emojiOptions = ['☀️', '🥞', '🎒', '🍽️', '🎧', '💙', '🎮', '🛁', '🌙', '📚', '🚌', '🏃', '💊', '🧩', '🎨', '🦷'];
const categories: Array<{ key: RoutineItem['category']; label: string }> = [
  { key: 'morning', label: 'Manhã' }, { key: 'school', label: 'Escola' }, { key: 'health', label: 'Saúde' }, { key: 'self-care', label: 'Autocuidado' }, { key: 'leisure', label: 'Lazer' }, { key: 'sleep', label: 'Sono' }, { key: 'other', label: 'Outro' },
];

export function RoutineEditorScreen({ id, onBack, onSaved }: { id?: string; onBack: () => void; onSaved: () => void }) {
  const { state, addRoutine, updateRoutine, deleteRoutine } = useApp();
  const existing = useMemo(() => state.routine.find((i) => i.id === id), [id, state.routine]);
  const [title, setTitle] = useState(existing?.title ?? '');
  const [time, setTime] = useState(existing?.time ?? '08:00');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🧩');
  const [category, setCategory] = useState<RoutineItem['category']>(existing?.category ?? 'other');
  const [reminderEnabled, setReminder] = useState(existing?.reminderEnabled ?? true);
  const [transitionMinutes, setTransition] = useState(existing?.transitionMinutes ?? 5);

  const save = () => {
    if (title.trim().length < 2) return Alert.alert('Dê um nome à atividade', 'Exemplo: arrumar mochila, almoço ou pausa.');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return Alert.alert('Horário inválido', 'Use o formato 08:30.');
    const data = { title: title.trim(), time, emoji, category, active: true, reminderEnabled, transitionMinutes };
    existing ? updateRoutine(existing.id, data) : addRoutine(data);
    onSaved();
  };

  const remove = () => Alert.alert('Excluir atividade?', 'Ela será removida da rotina deste aparelho.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => { if (existing) deleteRoutine(existing.id); onSaved(); } },
  ]);

  return (
    <Screen keyboard>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{existing ? 'Editar atividade' : 'Nova atividade'}</Text>
        <Text style={styles.sub}>Deixe a rotina visual e previsível do jeito que funciona melhor.</Text>
        <Text style={styles.label}>Nome da atividade</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Arrumar a mochila" placeholderTextColor="#9AA1B5" style={styles.input} maxLength={60} />
        <Text style={styles.label}>Horário</Text>
        <TextInput value={time} onChangeText={setTime} placeholder="08:00" placeholderTextColor="#9AA1B5" style={styles.input} keyboardType="numbers-and-punctuation" maxLength={5} />
        <Text style={styles.label}>Escolha um símbolo</Text>
        <View style={styles.emojis}>{emojiOptions.map((e) => <Pressable key={e} onPress={() => setEmoji(e)} style={[styles.emojiButton, emoji === e && styles.emojiSelected]}><Text style={styles.emoji}>{e}</Text></Pressable>)}</View>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categories}>{categories.map((c) => <Pressable key={c.key} onPress={() => setCategory(c.key)} style={[styles.category, category === c.key && styles.categorySelected]}><Text style={[styles.categoryText, category === c.key && styles.categoryTextSelected]}>{c.label}</Text></Pressable>)}</View>
        <View style={styles.settingsCard}>
          <ToggleRow title="Lembrete da atividade" description="Prepara o app para avisar quando a fase online de notificações estiver ativa." value={reminderEnabled} onValueChange={setReminder} />
          <Text style={styles.transitionTitle}>Aviso de transição</Text>
          <Text style={styles.transitionSub}>Quanto tempo antes você quer se preparar para a próxima atividade?</Text>
          <View style={styles.minutes}>{[0, 5, 10, 15, 30].map((m) => <Pressable key={m} onPress={() => setTransition(m)} style={[styles.minute, transitionMinutes === m && styles.minuteActive]}><Text style={[styles.minuteText, transitionMinutes === m && styles.minuteTextActive]}>{m === 0 ? 'Sem' : `${m} min`}</Text></Pressable>)}</View>
        </View>
        <PrimaryButton label={existing ? 'Salvar alterações' : 'Adicionar à rotina'} onPress={save} style={{ marginTop: 18 }} />
        {existing && <Pressable onPress={remove} style={styles.delete}><Ionicons name="trash-outline" size={18} color={colors.red} /><Text style={styles.deleteText}>Excluir atividade</Text></Pressable>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 5 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '900', marginTop: 20, marginBottom: 8 },
  input: { height: 54, borderWidth: 1.3, borderColor: colors.borderStrong, backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 14, fontSize: 15.5, color: colors.ink },
  emojis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiButton: { width: 47, height: 47, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  emojiSelected: { borderColor: colors.purple, backgroundColor: colors.purpleSoft, borderWidth: 2 },
  emoji: { fontSize: 24 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  category: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  categorySelected: { backgroundColor: colors.purple, borderColor: colors.purple },
  categoryText: { color: colors.muted, fontWeight: '800', fontSize: 10.5 },
  categoryTextSelected: { color: '#fff' },
  settingsCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 15, paddingBottom: 15, marginTop: 20 },
  transitionTitle: { color: colors.ink, fontWeight: '900', fontSize: 14, marginTop: 14 },
  transitionSub: { color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  minutes: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  minute: { backgroundColor: '#F6F7FB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  minuteActive: { backgroundColor: colors.purpleSoft },
  minuteText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  minuteTextActive: { color: colors.purple },
  delete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, padding: 12 },
  deleteText: { color: colors.red, fontWeight: '900' },
});
