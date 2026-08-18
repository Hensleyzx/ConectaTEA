import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

const steps = [
  { count: 5, emoji: '👀', title: 'coisas que você consegue ver', color: '#EAF4FF' },
  { count: 4, emoji: '✋', title: 'coisas que você consegue sentir com o toque', color: '#F1ECFF' },
  { count: 3, emoji: '👂', title: 'sons que você consegue perceber', color: '#FFF4E7' },
  { count: 2, emoji: '👃', title: 'cheiros que você consegue notar', color: '#EAF9EF' },
  { count: 1, emoji: '💙', title: 'coisa que pode te fazer sentir um pouco mais seguro(a)', color: '#FFF0F2' },
];

export function GroundingScreen({ onBack }: { onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const step = steps[index];
  const done = index === steps.length - 1;
  return (
    <Screen keyboard>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Exercício 5-4-3-2-1</Text>
        <Text style={styles.sub}>Uma forma de trazer a atenção para o que está ao seu redor. Você não precisa preencher tudo.</Text>
        <View style={styles.progress}>{steps.map((_, i) => <View key={i} style={[styles.progressDot, i <= index && styles.progressDotActive]} />)}</View>
        <View style={[styles.card, { backgroundColor: step.color }]}>
          <Text style={styles.big}>{step.count}</Text>
          <Text style={styles.emoji}>{step.emoji}</Text>
          <Text style={styles.prompt}>{step.title}</Text>
          <TextInput multiline value={notes[index] ?? ''} onChangeText={(text) => setNotes((old) => ({ ...old, [index]: text }))} placeholder="Se quiser, escreva aqui..." placeholderTextColor="#9AA1B5" style={styles.input} textAlignVertical="top" />
        </View>
        <View style={styles.buttons}>
          {index > 0 && <PrimaryButton label="Anterior" tone="outline" onPress={() => setIndex((i) => i - 1)} style={{ flex: 1 }} />}
          {!done ? <PrimaryButton label="Próximo" onPress={() => setIndex((i) => i + 1)} style={{ flex: 1 }} /> : <PrimaryButton label="Concluir" onPress={onBack} style={{ flex: 1 }} />}
        </View>
        <Pressable onPress={onBack} style={styles.skip}><Ionicons name="close-circle-outline" size={18} color={colors.muted} /><Text style={styles.skipText}>Parar o exercício</Text></Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 25 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, textAlign: 'center', marginTop: 7 },
  progress: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 18 },
  progressDot: { width: 28, height: 6, borderRadius: 3, backgroundColor: '#E1E4EC' },
  progressDotActive: { backgroundColor: colors.purple },
  card: { borderRadius: 25, padding: 23, alignItems: 'center', marginTop: 24, minHeight: 365 },
  big: { color: colors.ink, fontSize: 70, fontWeight: '900', lineHeight: 78 },
  emoji: { fontSize: 45 },
  prompt: { color: colors.ink, fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 24, maxWidth: 300, marginTop: 9 },
  input: { width: '100%', minHeight: 110, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.83)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', marginTop: 18, padding: 13, fontSize: 14, color: colors.ink },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 18 },
  skip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, marginTop: 5 },
  skipText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
});
