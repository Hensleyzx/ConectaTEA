import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import { ToggleRow } from '../components/ToggleRow';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const tools = ['Chuva suave', 'Respiração guiada', 'Fones', 'Timer visual', 'Pausa em silêncio', 'Cartões de comunicação'];
const triggers = ['Barulho intenso', 'Luz forte', 'Toque inesperado', 'Cheiros fortes', 'Muita gente', 'Mudanças sem aviso'];

export function SensoryScreen({ onBack }: { onBack: () => void }) {
  const { state, updateSensory } = useApp();
  const toggleList = (key: 'preferredCalmingTools' | 'avoidTriggers', value: string) => {
    const old = state.sensory[key];
    updateSensory({ [key]: old.includes(value) ? old.filter((x) => x !== value) : [...old, value] });
  };
  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Perfil sensorial</Text><Text style={styles.sub}>Preferências pessoais para o app se adaptar melhor. Não é teste diagnóstico e não cria “nível sensorial”.</Text>
        <View style={styles.card}>
          <ToggleRow title="Reduzir animações" description="Já reduz a animação da respiração guiada." value={state.sensory.reducedMotion} onValueChange={(v) => updateSensory({ reducedMotion: v })} />
          <ToggleRow title="Feedback por vibração" description="Usado em confirmações, timer e pedidos de ajuda, quando o aparelho permite." value={state.sensory.haptics} onValueChange={(v) => updateSensory({ haptics: v })} />
        </View>
        <Text style={styles.section}>Volume padrão dos sons</Text>
        <View style={styles.volumeRow}>{[[0.25, 'Baixo'], [0.55, 'Médio'], [0.8, 'Alto']].map(([value, label]) => <Pressable key={String(label)} onPress={() => updateSensory({ soundDefaultVolume: value as number })} style={[styles.volume, Math.abs(state.sensory.soundDefaultVolume - (value as number)) < 0.01 && styles.volumeActive]}><Text style={[styles.volumeLabel, Math.abs(state.sensory.soundDefaultVolume - (value as number)) < 0.01 && styles.volumeLabelActive]}>{label}</Text><Text style={[styles.volumePct, Math.abs(state.sensory.soundDefaultVolume - (value as number)) < 0.01 && styles.volumeLabelActive]}>{Math.round((value as number) * 100)}%</Text></Pressable>)}</View>
        <Text style={styles.section}>Ferramentas que costumam ajudar</Text><Text style={styles.helper}>Marque quantas quiser. Isso pode ajudar a ordenar atalhos no futuro.</Text>
        <View style={styles.chips}>{tools.map((item) => <Chip key={item} label={item} active={state.sensory.preferredCalmingTools.includes(item)} onPress={() => toggleList('preferredCalmingTools', item)} />)}</View>
        <Text style={styles.section}>Estímulos que vale evitar ou antecipar</Text><Text style={styles.helper}>São preferências para planejamento, não conclusões sobre causa de crises.</Text>
        <View style={styles.chips}>{triggers.map((item) => <Chip key={item} label={item} active={state.sensory.avoidTriggers.includes(item)} onPress={() => toggleList('avoidTriggers', item)} />)}</View>
        <View style={styles.future}><Text style={styles.futureTitle}>🧠 Recurso que pode vir depois</Text><Text style={styles.futureText}>Um “modo de baixa estimulação” global pode reduzir contraste decorativo, animações e quantidade de elementos automaticamente quando o usuário ativar.</Text></View>
      </ScrollView>
    </Screen>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{active ? '✓ ' : ''}{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 28 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 14, paddingBottom: 3, marginTop: 17 },
  section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 20, marginBottom: 8 },
  helper: { color: colors.muted, fontSize: 9.7, lineHeight: 14, marginTop: -3, marginBottom: 9 },
  volumeRow: { flexDirection: 'row', gap: 8 },
  volume: { flex: 1, minHeight: 68, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  volumeActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  volumeLabel: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  volumeLabelActive: { color: '#fff' },
  volumePct: { color: colors.muted, fontSize: 9, marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: 11, paddingVertical: 8 },
  chipActive: { backgroundColor: colors.purpleSoft, borderColor: colors.purple },
  chipText: { color: colors.ink, fontSize: 10.5, fontWeight: '700' },
  chipTextActive: { color: colors.purple, fontWeight: '900' },
  future: { backgroundColor: colors.skySoft, borderRadius: 16, padding: 13, marginTop: 22 },
  futureTitle: { color: colors.ink, fontWeight: '900', fontSize: 12 },
  futureText: { color: colors.muted, fontSize: 9.8, lineHeight: 14, marginTop: 5 },
});
