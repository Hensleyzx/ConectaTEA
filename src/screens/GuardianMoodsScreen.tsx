import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { moods } from '../data/demo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatDateTime, sameWeekDayLabel } from '../utils/date';

export function GuardianMoodsScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state } = useApp();
  const openAlerts = state.helpRequests.filter((h) => h.status !== 'resolved').length;
  const week = useMemo(() => state.moods.filter((m) => Date.now() - new Date(m.createdAt).getTime() <= 7 * 86400000).slice().reverse(), [state.moods]);
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    week.forEach((entry) => entry.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [week]);
  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} onBell={() => navigate('guardian-alerts')} notificationCount={openAlerts} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Humores de {state.dependent.name}</Text><Text style={styles.sub}>Registros feitos pelo próprio dependente, com contexto e necessidades escolhidas por ele.</Text>
        <SectionCard style={styles.weekCard}>
          <Text style={styles.cardTitle}>Últimos 7 dias</Text>
          <View style={styles.weekRow}>{week.length ? week.map((entry) => { const mood = moods.find((m) => m.id === entry.moodId) ?? moods[2]; return <View key={entry.id} style={styles.day}><View style={[styles.dayFace, { backgroundColor: mood.color }]}><Text style={styles.dayEmoji}>{mood.emoji}</Text></View><Text style={styles.dayLabel}>{sameWeekDayLabel(entry.createdAt)}</Text></View>; }) : <Text style={styles.empty}>Sem registros ainda.</Text>}</View>
        </SectionCard>
        {topTags.length > 0 && <SectionCard style={styles.tagsCard}><Text style={styles.cardTitle}>Contextos mais marcados</Text><View style={styles.tags}>{topTags.map(([tag, count]) => <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text><Text style={styles.tagCount}>{count}×</Text></View>)}</View><Text style={styles.helper}>Frequência não significa causa. Use esses dados como ponto de conversa.</Text></SectionCard>}
        <Text style={styles.section}>Registros recentes</Text>
        {state.moods.map((entry) => { const mood = moods.find((m) => m.id === entry.moodId) ?? moods[2]; return <SectionCard key={entry.id} style={styles.entry}><View style={[styles.face, { backgroundColor: mood.color }]}><Text style={styles.emoji}>{mood.emoji}</Text></View><View style={{ flex: 1 }}><View style={styles.entryTop}><Text style={styles.entryTitle}>{mood.label}</Text><Text style={styles.date}>{formatDateTime(entry.createdAt)}</Text></View><Text style={styles.intensity}>Intensidade informada: {entry.intensity}/5</Text>{entry.reason ? <Text style={styles.reason}>“{entry.reason}”</Text> : <Text style={styles.noReason}>Sem motivo escrito.</Text>}{entry.tags.length > 0 && <View style={styles.entryTags}>{entry.tags.map((t) => <Text key={t} style={styles.entryTag}>{t}</Text>)}</View>}{entry.need && <Text style={styles.need}>💡 {entry.need}</Text>}</View></SectionCard>; })}
      </ScrollView>
      <BottomNav role="guardian" active="guardian-moods" onNavigate={navigate} alertCount={openAlerts} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  weekCard: { marginTop: 17 },
  cardTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  day: { alignItems: 'center', flex: 1 },
  dayFace: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayEmoji: { fontSize: 20 },
  dayLabel: { color: colors.muted, fontSize: 8.5, marginTop: 6, textTransform: 'capitalize' },
  empty: { color: colors.muted, fontSize: 11 },
  tagsCard: { marginTop: 11, backgroundColor: '#FFF9EB' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  tagText: { color: colors.ink, fontSize: 10, fontWeight: '800' },
  tagCount: { color: colors.orange, fontSize: 9, fontWeight: '900' },
  helper: { color: colors.muted, fontSize: 9.5, lineHeight: 14, marginTop: 10 },
  section: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  entry: { flexDirection: 'row', gap: 11, marginBottom: 10 },
  face: { width: 47, height: 47, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  entryTop: { flexDirection: 'row', alignItems: 'center' },
  entryTitle: { color: colors.ink, fontSize: 14.5, fontWeight: '900' },
  date: { marginLeft: 'auto', color: colors.muted, fontSize: 9 },
  intensity: { color: colors.muted, fontSize: 9.5, marginTop: 2 },
  reason: { color: colors.ink, fontSize: 12, lineHeight: 17, marginTop: 8 },
  noReason: { color: colors.muted, fontSize: 10, fontStyle: 'italic', marginTop: 7 },
  entryTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  entryTag: { color: colors.orange, backgroundColor: colors.orangeSoft, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4, fontSize: 8.5, fontWeight: '800' },
  need: { color: colors.blue, fontSize: 10, fontWeight: '800', marginTop: 8 },
});
