import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { MoodFace } from '../components/MoodFace';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { moodTags, moods, supportNeeds } from '../data/demo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { MoodId } from '../types/app';

export function MoodCheckInScreen({ initialMoodId, onBack, onDone }: { initialMoodId?: MoodId; onBack: () => void; onDone: () => void }) {
  const { addMood, state } = useApp();
  const [moodId, setMoodId] = useState<MoodId>(initialMoodId ?? 'neutral');
  const [reason, setReason] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [need, setNeed] = useState<string | null>(null);
  const selected = useMemo(() => moods.find((m) => m.id === moodId) ?? moods[2], [moodId]);

  const toggleTag = (tag: string) => setTags((old) => old.includes(tag) ? old.filter((x) => x !== tag) : [...old, tag].slice(0, 4));
  const save = async () => {
    addMood({ moodId, reason: reason.trim(), intensity, tags, need });
    if (state.sensory.haptics) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    Alert.alert('Registro salvo 💙', 'Seu sentimento ficou registrado no histórico.');
    onDone();
  };

  return (
    <Screen keyboard>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Como você está se sentindo?</Text>
        <Text style={styles.sub}>Você pode mudar a escolha antes de salvar.</Text>
        <View style={styles.moodRow}>{moods.map((m) => <MoodFace key={m.id} mood={m} selected={m.id === moodId} onPress={() => setMoodId(m.id)} />)}</View>

        <View style={styles.selectedCard}>
          <View style={[styles.bigFace, { backgroundColor: selected.color }]}><Text style={styles.bigEmoji}>{selected.emoji}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.selectedSmall}>Você selecionou</Text><Text style={styles.selectedLabel}>{selected.label}</Text></View>
        </View>

        <Text style={styles.label}>Quão forte está esse sentimento?</Text>
        <View style={styles.scale}>{[1, 2, 3, 4, 5].map((n) => <Pressable key={n} onPress={() => setIntensity(n)} style={[styles.scaleButton, intensity === n && styles.scaleSelected]}><Text style={[styles.scaleNumber, intensity === n && styles.scaleNumberSelected]}>{n}</Text></Pressable>)}</View>
        <View style={styles.scaleLegend}><Text style={styles.legend}>Leve</Text><Text style={styles.legend}>Muito forte</Text></View>

        <Text style={styles.label}>O que aconteceu?</Text>
        <View style={styles.inputWrap}>
          <TextInput multiline maxLength={300} placeholder="Conte do seu jeito. Você também pode deixar em branco." value={reason} onChangeText={setReason} style={styles.input} textAlignVertical="top" placeholderTextColor="#9AA1B5" />
          <Text style={styles.count}>{reason.length}/300</Text>
        </View>

        {!state.settings.simpleMode && <>
          <Text style={styles.label}>Tem algo relacionado? <Text style={styles.optional}>(até 4)</Text></Text>
          <View style={styles.chips}>{moodTags.map((tag) => <Chip key={tag} label={tag} selected={tags.includes(tag)} onPress={() => toggleTag(tag)} />)}</View>
          <Text style={styles.label}>O que ajudaria agora?</Text>
          <View style={styles.chips}>{supportNeeds.map((item) => <Chip key={item} label={item} selected={need === item} onPress={() => setNeed(need === item ? null : item)} />)}</View>
        </>}

        <View style={styles.thanks}><Text style={styles.heart}>💜</Text><View style={{ flex: 1 }}><Text style={styles.thanksTitle}>Obrigado por compartilhar.</Text><Text style={styles.thanksText}>Você decide quanto quer contar. Não existe resposta certa ou errada.</Text></View></View>
        <PrimaryButton label="Salvar meu registro" onPress={save} style={{ marginTop: 17 }} />
      </ScrollView>
    </Screen>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{selected ? '✓ ' : ''}{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 13, marginTop: 5 },
  moodRow: { flexDirection: 'row', gap: 2, marginTop: 18 },
  selectedCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14, marginTop: 18 },
  bigFace: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 35 },
  selectedSmall: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  selectedLabel: { color: colors.ink, fontSize: 21, fontWeight: '900', marginTop: 2 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 22, marginBottom: 9 },
  optional: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  scale: { flexDirection: 'row', gap: 9 },
  scaleButton: { flex: 1, height: 46, borderRadius: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  scaleSelected: { backgroundColor: colors.purple, borderColor: colors.purple },
  scaleNumber: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  scaleNumberSelected: { color: '#fff' },
  scaleLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  legend: { color: colors.muted, fontSize: 9.5 },
  inputWrap: { position: 'relative' },
  input: { minHeight: 130, backgroundColor: '#fff', borderWidth: 1.4, borderColor: '#B9A9DF', borderRadius: 15, padding: 14, paddingBottom: 28, fontSize: 15, lineHeight: 21, color: colors.ink },
  count: { position: 'absolute', right: 12, bottom: 9, color: colors.muted, fontSize: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8 },
  chipSelected: { backgroundColor: colors.purpleSoft, borderColor: colors.purple },
  chipText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  chipTextSelected: { color: colors.purple, fontWeight: '900' },
  thanks: { backgroundColor: colors.purpleSoft, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22 },
  heart: { fontSize: 23 },
  thanksTitle: { color: colors.purple, fontWeight: '900' },
  thanksText: { color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 3 },
});
