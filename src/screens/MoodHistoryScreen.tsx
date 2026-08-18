import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { moods } from '../data/demo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatDateTime } from '../utils/date';

export function MoodHistoryScreen({ onBack, navigate }: { onBack: () => void; navigate: (screen: string) => void }) {
  const { state } = useApp();
  const [filter, setFilter] = useState<'7' | 'all'>('7');
  const entries = useMemo(() => {
    if (filter === 'all') return state.moods;
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return state.moods.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
  }, [filter, state.moods]);
  const average = entries.length ? entries.reduce((sum, e) => sum + (moods.find((m) => m.id === e.moodId)?.score ?? 3), 0) / entries.length : 0;

  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}><View><Text style={styles.title}>Meu histórico</Text><Text style={styles.sub}>Um diário simples das suas emoções.</Text></View><Pressable onPress={() => navigate('mood-checkin')} style={styles.add}><Text style={styles.addText}>+ Registrar</Text></Pressable></View>
        <View style={styles.filters}><Filter label="7 dias" active={filter === '7'} onPress={() => setFilter('7')} /><Filter label="Tudo" active={filter === 'all'} onPress={() => setFilter('all')} /></View>
        <SectionCard style={styles.summary}>
          <Text style={styles.summaryTitle}>Visão geral</Text>
          <Text style={styles.summaryValue}>{entries.length}</Text><Text style={styles.summaryLabel}>registros no período</Text>
          <Text style={styles.summaryHint}>{average >= 3.8 ? 'Predominaram registros mais positivos.' : average <= 2.2 ? 'Houve mais registros de emoções difíceis.' : 'Os registros ficaram variados no período.'} Isso é apenas uma descrição, não uma avaliação clínica.</Text>
        </SectionCard>
        <Text style={styles.section}>Registros</Text>
        {entries.length === 0 ? <Text style={styles.empty}>Nenhum registro neste período.</Text> : entries.map((entry) => {
          const mood = moods.find((m) => m.id === entry.moodId) ?? moods[2];
          return <SectionCard key={entry.id} style={styles.entry}>
            <View style={[styles.face, { backgroundColor: mood.color }]}><Text style={styles.emoji}>{mood.emoji}</Text></View>
            <View style={{ flex: 1 }}>
              <View style={styles.entryTop}><Text style={styles.entryMood}>{mood.label}</Text><Text style={styles.date}>{formatDateTime(entry.createdAt)}</Text></View>
              <Text style={styles.intensity}>Intensidade {entry.intensity}/5</Text>
              {entry.reason ? <Text style={styles.reason}>{entry.reason}</Text> : <Text style={styles.noReason}>Sem explicação registrada.</Text>}
              {entry.tags.length > 0 && <View style={styles.tags}>{entry.tags.map((tag) => <Text key={tag} style={styles.tag}>{tag}</Text>)}</View>}
              {entry.need && <Text style={styles.need}>💡 O que ajudaria: {entry.need}</Text>}
            </View>
          </SectionCard>;
        })}
      </ScrollView>
      <BottomNav role="dependent" active="dependent-home" onNavigate={navigate} />
    </Screen>
  );
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 25 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 12, marginTop: 4 },
  add: { marginLeft: 'auto', backgroundColor: colors.purpleSoft, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 },
  addText: { color: colors.purple, fontWeight: '900', fontSize: 11 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 18 },
  filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  filterActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  filterText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  filterTextActive: { color: '#fff' },
  summary: { marginTop: 14, backgroundColor: '#F8F3FF' },
  summaryTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  summaryValue: { color: colors.purple, fontSize: 30, fontWeight: '900', marginTop: 7 },
  summaryLabel: { color: colors.muted, fontSize: 11 },
  summaryHint: { color: colors.ink, fontSize: 10.5, lineHeight: 15, marginTop: 10 },
  section: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  entry: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  face: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  entryTop: { flexDirection: 'row', alignItems: 'center' },
  entryMood: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  date: { marginLeft: 'auto', color: colors.muted, fontSize: 9.5 },
  intensity: { color: colors.muted, fontSize: 9.5, marginTop: 2 },
  reason: { color: colors.ink, fontSize: 12.5, lineHeight: 18, marginTop: 8 },
  noReason: { color: colors.muted, fontSize: 11, fontStyle: 'italic', marginTop: 7 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  tag: { color: colors.purple, backgroundColor: colors.purpleSoft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, fontSize: 9, fontWeight: '800' },
  need: { color: colors.blue, fontSize: 10, fontWeight: '800', marginTop: 8 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 30 },
});
