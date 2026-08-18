import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { RelaxSoundCard } from '../components/RelaxSoundCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const sounds = [
  { id: 'rain', emoji: '🌧️', name: 'Chuva suave', description: 'Ruído de chuva sintetizado no próprio projeto.', source: require('../../assets/audio/rain.wav') },
  { id: 'ocean', emoji: '🌊', name: 'Ondas do mar', description: 'Movimento contínuo com intensidade tranquila.', source: require('../../assets/audio/ocean.wav') },
  { id: 'forest', emoji: '🌲', name: 'Floresta', description: 'Ambiente leve, sem mudanças bruscas.', source: require('../../assets/audio/forest.wav') },
  { id: 'birds', emoji: '🐦', name: 'Pássaros', description: 'Chilreios suaves com fundo ambiente.', source: require('../../assets/audio/birds.wav') },
  { id: 'wind', emoji: '💨', name: 'Vento tranquilo', description: 'Som contínuo e macio.', source: require('../../assets/audio/wind.wav') },
  { id: 'brown', emoji: '🎧', name: 'Ruído marrom', description: 'Ruído grave e estável para mascarar sons externos.', source: require('../../assets/audio/brown.wav') },
];

export function RelaxScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state, addRelaxSession } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [volume, setVolume] = useState(state.sensory.soundDefaultVolume);
  const logSession = useCallback((tool: string, seconds: number) => addRelaxSession(tool, seconds), [addRelaxSession]);

  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Relaxar e se regular</Text>
        <Text style={styles.subtitle}>Escolha o que parece mais confortável agora. Você pode parar a qualquer momento.</Text>
        <SectionCard style={styles.volumeCard}>
          <View style={styles.volumeHeader}><Ionicons name="volume-medium-outline" size={20} color={colors.purple} /><Text style={styles.volumeTitle}>Volume inicial</Text><Text style={styles.volumePercent}>{Math.round(volume * 100)}%</Text></View>
          <View style={styles.volumeOptions}>{[
            ['Baixo', 0.25], ['Médio', 0.55], ['Alto', 0.8],
          ].map(([label, value]) => <Pressable key={String(label)} onPress={() => setVolume(value as number)} style={[styles.volumeOption, Math.abs(volume - (value as number)) < 0.01 && styles.volumeSelected]}><Text style={[styles.volumeText, Math.abs(volume - (value as number)) < 0.01 && styles.volumeTextSelected]}>{label}</Text></Pressable>)}</View>
        </SectionCard>
        <Text style={styles.section}>Sons contínuos</Text>
        {sounds.map((s) => <RelaxSoundCard key={s.id} {...s} activeId={activeId} setActiveId={setActiveId} volume={volume} onSession={(seconds) => logSession(s.name, seconds)} />)}

        <Text style={styles.section}>Outras ferramentas</Text>
        <View style={styles.tools}>
          <Tool emoji="🫁" title="Respiração guiada" text="Círculo visual com ritmo simples" onPress={() => navigate('breathing')} />
          <Tool emoji="🖐️" title="5-4-3-2-1" text="Exercício de aterramento pelos sentidos" onPress={() => navigate('grounding')} />
          <Tool emoji="⏳" title="Timer visual" text="Ajuda a enxergar quanto tempo falta" onPress={() => navigate('timer')} />
          <Tool emoji="⚙️" title="Perfil sensorial" text="Ajuste estímulos e preferências" onPress={() => navigate('sensory')} />
        </View>
        <View style={styles.note}><Ionicons name="information-circle-outline" size={20} color={colors.blue} /><Text style={styles.noteText}>Os áudios incluídos nesta versão foram gerados para o protótipo e não usam músicas comerciais. Se algum som incomodar, interrompa e escolha outro recurso.</Text></View>
      </ScrollView>
      <BottomNav role="dependent" active="relax" onNavigate={navigate} />
    </Screen>
  );
}

function Tool({ emoji, title, text, onPress }: { emoji: string; title: string; text: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.tool, { opacity: pressed ? 0.8 : 1 }]}><Text style={styles.toolEmoji}>{emoji}</Text><Text style={styles.toolTitle}>{title}</Text><Text style={styles.toolText}>{text}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  title: { fontSize: 27, fontWeight: '900', color: colors.ink, marginTop: 5 },
  subtitle: { fontSize: 12.5, color: colors.muted, lineHeight: 18, marginTop: 6 },
  volumeCard: { marginTop: 17, backgroundColor: '#F8F4FF' },
  volumeHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  volumeTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 },
  volumePercent: { marginLeft: 'auto', color: colors.purple, fontWeight: '900', fontSize: 12 },
  volumeOptions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  volumeOption: { flex: 1, paddingVertical: 9, borderRadius: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  volumeSelected: { backgroundColor: colors.purple, borderColor: colors.purple },
  volumeText: { color: colors.muted, fontSize: 10.5, fontWeight: '900' },
  volumeTextSelected: { color: '#fff' },
  section: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: { width: '48%', minHeight: 128, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: '#fff', padding: 14 },
  toolEmoji: { fontSize: 29 },
  toolTitle: { color: colors.ink, fontWeight: '900', fontSize: 13, marginTop: 7 },
  toolText: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 4 },
  note: { flexDirection: 'row', gap: 8, backgroundColor: colors.skySoft, borderRadius: 15, padding: 12, marginTop: 18 },
  noteText: { flex: 1, color: colors.muted, fontSize: 9.8, lineHeight: 14 },
});
