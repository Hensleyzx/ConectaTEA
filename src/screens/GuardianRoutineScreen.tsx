import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { dateKey, formatLongToday } from '../utils/date';

export function GuardianRoutineScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state } = useApp();
  const today = dateKey();
  const items = state.routine.filter((i) => i.active).sort((a, b) => a.time.localeCompare(b.time));
  const done = items.filter((i) => i.completedDates.includes(today)).length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;
  const openAlerts = state.helpRequests.filter((h) => h.status !== 'resolved').length;
  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} onBell={() => navigate('guardian-alerts')} notificationCount={openAlerts} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Rotina de {state.dependent.name}</Text><Text style={styles.date}>{formatLongToday()}</Text>
        <View style={styles.progressCard}><View style={styles.progressTop}><Text style={styles.progressTitle}>Progresso de hoje</Text><Text style={styles.progressValue}>{progress}%</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View><Text style={styles.progressText}>{done} de {items.length} atividades marcadas como concluídas.</Text></View>
        <View style={styles.note}><Ionicons name="eye-outline" size={19} color={colors.green} /><Text style={styles.noteText}>Na área do responsável a rotina é acompanhada. A proposta é preservar a autonomia do dependente para marcar suas atividades.</Text></View>
        <View style={styles.list}>{items.map((item) => { const completed = item.completedDates.includes(today); return <View key={item.id} style={[styles.row, completed && styles.rowDone]}><View style={[styles.check, completed && styles.checkDone]}>{completed && <Ionicons name="checkmark" size={14} color="#fff" />}</View><Text style={styles.emoji}>{item.emoji}</Text><View style={{ flex: 1 }}><Text style={styles.time}>{item.time}</Text><Text style={[styles.itemTitle, completed && styles.itemDone]}>{item.title}</Text><View style={styles.meta}>{item.reminderEnabled && <Text style={styles.metaText}>🔔 lembrete</Text>}{item.transitionMinutes > 0 && <Text style={styles.metaText}>⏳ transição {item.transitionMinutes} min</Text>}</View></View><Text style={[styles.status, { color: completed ? colors.green : colors.muted }]}>{completed ? 'Concluída' : 'Pendente'}</Text></View>; })}</View>
      </ScrollView>
      <BottomNav role="guardian" active="guardian-routine" onNavigate={navigate} alertCount={openAlerts} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  date: { color: colors.muted, fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  progressCard: { backgroundColor: colors.greenSoft, borderRadius: 18, padding: 15, marginTop: 17 },
  progressTop: { flexDirection: 'row', alignItems: 'center' },
  progressTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  progressValue: { marginLeft: 'auto', color: colors.green, fontSize: 21, fontWeight: '900' },
  track: { height: 8, backgroundColor: '#CFEED8', borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.green, borderRadius: 4 },
  progressText: { color: colors.muted, fontSize: 10, marginTop: 7 },
  note: { flexDirection: 'row', gap: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 11, marginTop: 11 },
  noteText: { flex: 1, color: colors.muted, fontSize: 9.7, lineHeight: 14 },
  list: { gap: 9, marginTop: 15 },
  row: { minHeight: 74, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  rowDone: { backgroundColor: '#FBFFFC' },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.green },
  emoji: { fontSize: 27, marginHorizontal: 10 },
  time: { color: colors.muted, fontSize: 9.5, fontWeight: '800' },
  itemTitle: { color: colors.ink, fontWeight: '900', fontSize: 13.5, marginTop: 1 },
  itemDone: { color: colors.muted },
  meta: { flexDirection: 'row', gap: 6, marginTop: 3 },
  metaText: { color: colors.muted, fontSize: 8 },
  status: { fontSize: 9.5, fontWeight: '900', marginLeft: 7 },
});
