import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { dateKey, formatLongToday } from '../utils/date';

export function RoutineScreen({ navigate }: { navigate: (screen: string, params?: Record<string, string | number | boolean>) => void }) {
  const { state, toggleRoutineToday } = useApp();
  const today = dateKey();
  const items = useMemo(() => state.routine.filter((i) => i.active).sort((a, b) => a.time.localeCompare(b.time)), [state.routine]);
  const completed = items.filter((i) => i.completedDates.includes(today)).length;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

  const toggle = async (id: string) => {
    toggleRoutineToday(id);
    if (state.sensory.haptics) await Haptics.selectionAsync().catch(() => undefined);
  };

  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}><Text style={styles.title}>Minha rotina</Text><Text style={styles.date}>{formatLongToday()}</Text></View>
          <Pressable onPress={() => navigate('routine-editor')} style={styles.add}><Ionicons name="add" size={23} color="#fff" /></Pressable>
        </View>
        <View style={styles.progressCard}>
          <View><Text style={styles.progressTitle}>Seu dia</Text><Text style={styles.progressText}>{completed} de {items.length} atividades concluídas</Text></View>
          <Text style={styles.progressValue}>{progress}%</Text>
          <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
        </View>
        <Pressable onPress={() => navigate('first-then')} style={styles.tip}><Ionicons name="sparkles-outline" size={19} color={colors.blue} /><Text style={styles.tipText}>Dica: avisos de transição ajudam a preparar mudanças. Toque aqui para abrir a visão “Primeiro → Depois”, com apenas os próximos dois passos.</Text><Ionicons name="chevron-forward" size={18} color={colors.blue} /></Pressable>
        <View style={styles.timeline}>
          {items.map((item, index) => {
            const done = item.completedDates.includes(today);
            return (
              <View key={item.id} style={styles.timelineWrap}>
                <Pressable onPress={() => toggle(item.id)} style={[styles.row, done && styles.rowDone]}>
                  <View style={[styles.dot, done && styles.dotDone]}>{done && <Ionicons name="checkmark" size={11} color="#fff" />}</View>
                  <View style={styles.icon}><Text style={styles.emoji}>{item.emoji}</Text></View>
                  <View style={{ flex: 1 }}><Text style={styles.time}>{item.time}</Text><Text style={[styles.itemTitle, done && styles.done]}>{item.title}</Text><View style={styles.meta}>{item.reminderEnabled && <Text style={styles.metaText}>🔔 lembrete</Text>}{item.transitionMinutes > 0 && <Text style={styles.metaText}>⏳ aviso {item.transitionMinutes} min</Text>}</View></View>
                  <Pressable onPress={() => navigate('routine-editor', { id: item.id })} hitSlop={8} style={styles.edit}><Ionicons name="pencil-outline" size={19} color={colors.muted} /></Pressable>
                </Pressable>
                {index < items.length - 1 && <View style={styles.line} />}
              </View>
            );
          })}
        </View>
        {items.length === 0 && <View style={styles.empty}><Text style={styles.emptyEmoji}>🗓️</Text><Text style={styles.emptyTitle}>Sua rotina está vazia</Text><Text style={styles.emptyText}>Crie a primeira atividade para montar seu dia do seu jeito.</Text></View>}
      </ScrollView>
      <BottomNav role="dependent" active="routine" onNavigate={(screen) => navigate(screen)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  title: { fontSize: 27, fontWeight: '900', color: colors.ink },
  date: { fontSize: 13, color: colors.muted, marginTop: 4, textTransform: 'capitalize' },
  add: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  progressCard: { backgroundColor: colors.purpleSoft, borderRadius: 18, padding: 15, marginTop: 17, position: 'relative' },
  progressTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  progressText: { color: colors.muted, fontSize: 10.5, marginTop: 3 },
  progressValue: { position: 'absolute', right: 15, top: 15, color: colors.purple, fontSize: 22, fontWeight: '900' },
  track: { height: 8, backgroundColor: '#DDD4F5', borderRadius: 4, marginTop: 13, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.purple, borderRadius: 4 },
  tip: { flexDirection: 'row', gap: 9, backgroundColor: colors.skySoft, borderRadius: 15, padding: 12, marginTop: 11 },
  tipText: { flex: 1, color: colors.muted, fontSize: 10.3, lineHeight: 15 },
  timeline: { marginTop: 15 },
  timelineWrap: { position: 'relative', paddingBottom: 8 },
  row: { minHeight: 76, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 17, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  rowDone: { backgroundColor: '#FAF9FF' },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.purple, marginRight: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: colors.purple },
  line: { position: 'absolute', width: 2, height: 8, backgroundColor: '#CABAF2', left: 21, bottom: 0 },
  icon: { width: 45, height: 45, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8FC', marginRight: 11 },
  emoji: { fontSize: 25 },
  time: { fontSize: 10.5, color: colors.muted, fontWeight: '800' },
  itemTitle: { color: colors.ink, fontSize: 14.5, fontWeight: '900', marginTop: 1 },
  done: { textDecorationLine: 'line-through', color: colors.muted },
  meta: { flexDirection: 'row', gap: 7, marginTop: 3 },
  metaText: { color: colors.muted, fontSize: 8.5 },
  edit: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyEmoji: { fontSize: 50 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 12 },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 17, textAlign: 'center', maxWidth: 260, marginTop: 6 },
});
