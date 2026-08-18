import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { communicationCards } from '../data/demo';
import { colors } from '../theme/colors';

export function CommunicateScreen({ navigate }: { navigate: (screen: string) => void }) {
  const [custom, setCustom] = useState('');
  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'pt-BR', rate: 0.88, pitch: 1.0, onError: () => Alert.alert('Não foi possível usar a voz', 'Você ainda pode mostrar a frase na tela.') });
  };
  return (
    <Screen keyboard>
      <AppHeader onMenu={() => navigate('more')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Comunicar sem precisar falar</Text>
        <Text style={styles.sub}>Toque em uma frase para o aparelho falar em voz alta. Você também pode apenas mostrar a tela para alguém.</Text>
        <View style={styles.feature}><Ionicons name="volume-high-outline" size={21} color={colors.purple} /><Text style={styles.featureText}>Comunicação aumentativa simples: frases prontas + texto para voz.</Text></View>
        <View style={styles.grid}>{communicationCards.map((card) => <Pressable key={card.text} onPress={() => speak(card.text)} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.78 : 1 }]}><Text style={styles.emoji}>{card.emoji}</Text><Text style={styles.cardText}>{card.text}</Text><Ionicons name="volume-medium-outline" size={17} color={colors.purple} /></Pressable>)}</View>
        <Text style={styles.section}>Quero escrever outra coisa</Text>
        <TextInput multiline maxLength={180} value={custom} onChangeText={setCustom} placeholder="Digite uma frase..." placeholderTextColor="#9AA1B5" style={styles.input} textAlignVertical="top" />
        <PrimaryButton label="Falar esta frase 🔊" onPress={() => custom.trim() && speak(custom.trim())} disabled={!custom.trim()} style={{ marginTop: 10 }} />
        <Pressable onPress={() => Speech.stop()} style={styles.stop}><Ionicons name="stop-circle-outline" size={19} color={colors.muted} /><Text style={styles.stopText}>Parar voz</Text></Pressable>
        <View style={styles.note}><Text style={styles.noteTitle}>💡 Para o futuro</Text><Text style={styles.noteText}>Esta área pode evoluir para cartões personalizados com fotos, rotinas visuais e vocabulário escolhido pelo próprio usuário e pela família.</Text></View>
      </ScrollView>
      <BottomNav role="dependent" active="communicate" onNavigate={navigate} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 6 },
  feature: { flexDirection: 'row', gap: 8, backgroundColor: colors.purpleSoft, borderRadius: 14, padding: 12, marginTop: 14 },
  featureText: { flex: 1, color: colors.purple, fontSize: 10.5, lineHeight: 15, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 16 },
  card: { width: '48%', minHeight: 125, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: 13 },
  emoji: { fontSize: 29 },
  cardText: { flex: 1, color: colors.ink, fontSize: 12.2, lineHeight: 17, fontWeight: '800', marginTop: 7, marginBottom: 6 },
  section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 21, marginBottom: 9 },
  input: { minHeight: 100, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1.3, borderColor: colors.borderStrong, padding: 13, fontSize: 14.5, color: colors.ink },
  stop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 13 },
  stopText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  note: { backgroundColor: colors.skySoft, borderRadius: 15, padding: 13, marginTop: 5 },
  noteTitle: { color: colors.ink, fontWeight: '900', fontSize: 12 },
  noteText: { color: colors.muted, fontSize: 10.3, lineHeight: 15, marginTop: 4 },
});
