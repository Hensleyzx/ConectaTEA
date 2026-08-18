import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { MoodFace } from '../components/MoodFace';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { moods } from '../data/demo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { dateKey } from '../utils/date';

export function DependentHomeScreen({ navigate }: { navigate: (screen: string, params?: Record<string, string | number | boolean>) => void }) {
  const { state } = useApp();
  const today = dateKey();
  const activeRoutine = state.routine.filter((i) => i.active);
  const done = activeRoutine.filter((i) => i.completedDates.includes(today)).length;
  const progress = activeRoutine.length ? Math.round((done / activeRoutine.length) * 100) : 0;
  const openHelp = state.helpRequests.filter((h) => h.status !== 'resolved').length;
  const nextTask = activeRoutine.find((i) => !i.completedDates.includes(today));
  const lastMood = state.moods[0];
  const lastMoodInfo = moods.find((m) => m.id === lastMood?.moodId);

  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} onBell={() => navigate('help')} notificationCount={openHelp} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.hello}>Olá, {state.dependent.name}! 👋</Text>
        <Text style={styles.good}>Que bom ter você aqui.</Text>
        <Text style={styles.question}>Como você está se sentindo agora?</Text>
        <View style={styles.moods}>{moods.map((m) => <MoodFace key={m.id} mood={m} onPress={() => navigate('mood-checkin', { moodId: m.id })} />)}</View>

        <Pressable onPress={() => navigate('breathing')} style={({ pressed }) => [styles.calmCard, { opacity: pressed ? 0.88 : 1 }]}>
          <View style={styles.mascotBubble}><Text style={styles.mascot}>🎧</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.calmTitle}>Precisa desacelerar?</Text>
            <Text style={styles.calmStrong}>Respiração guiada de 1 minuto</Text>
            <Text style={styles.calmText}>Sem pontuação, sem cobrança. Só acompanhe o ritmo.</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color={colors.blue} />
        </Pressable>

        <Pressable onPress={() => navigate('help')} style={({ pressed }) => [styles.help, { opacity: pressed ? 0.9 : 1 }]} accessibilityRole="button" accessibilityLabel="Preciso de ajuda">
          <View style={styles.helpIcon}><Ionicons name="notifications" size={30} color={colors.red} /></View>
          <View style={{ flex: 1 }}><Text style={styles.helpTitle}>Preciso de ajuda</Text><Text style={styles.helpText}>Envie um pedido claro para seu responsável.</Text></View>
          <Ionicons name="chevron-forward" size={26} color="#fff" />
        </Pressable>

        <View style={styles.summaryRow}>
          <Pressable style={styles.summary} onPress={() => navigate('routine')}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.purpleSoft }]}><Ionicons name="calendar" size={22} color={colors.purple} /></View>
            <Text style={styles.summaryValue}>{progress}%</Text>
            <Text style={styles.summaryLabel}>Rotina de hoje</Text>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
          </Pressable>
          <Pressable style={styles.summary} onPress={() => navigate('mood-history')}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.yellowSoft }]}><Text style={{ fontSize: 22 }}>{lastMoodInfo?.emoji ?? '🙂'}</Text></View>
            <Text style={styles.summaryValue}>{lastMoodInfo?.label ?? 'Registrar'}</Text>
            <Text style={styles.summaryLabel}>Último humor</Text>
            <Text style={styles.summarySmall}>Toque para ver histórico</Text>
          </Pressable>
        </View>

        {nextTask && (
          <SectionCard style={styles.nextCard}>
            <View style={styles.nextHeader}><Text style={styles.sectionTitle}>Próximo passo</Text><Text style={styles.nextTime}>{nextTask.time}</Text></View>
            <View style={styles.nextBody}><Text style={styles.nextEmoji}>{nextTask.emoji}</Text><View style={{ flex: 1 }}><Text style={styles.nextTitle}>{nextTask.title}</Text><Text style={styles.nextText}>Você pode abrir a rotina e marcar quando terminar.</Text></View><Pressable onPress={() => navigate('routine')}><Ionicons name="open-outline" size={24} color={colors.purple} /></Pressable></View>
          </SectionCard>
        )}

        <Text style={styles.now}>Ferramentas rápidas</Text>
        <View style={styles.actions}>
          <QuickAction emoji="🗓️" title="Minha rotina" text="Veja o que vem depois" onPress={() => navigate('routine')} />
          <QuickAction emoji="🍃" title="Relaxar" text="Sons e exercícios" onPress={() => navigate('relax')} />
          <QuickAction emoji="💬" title="Comunicar" text="Frases com voz" onPress={() => navigate('communicate')} />
          <QuickAction emoji="⏳" title="Timer visual" text="Veja o tempo passar" onPress={() => navigate('timer')} />
          <QuickAction emoji="➡️" title="Primeiro → Depois" text="Só os próximos 2 passos" onPress={() => navigate('first-then')} />
          <QuickAction emoji="🧩" title="Meu plano de calma" text="Opções para me regular" onPress={() => navigate('calm-plan')} />
        </View>
      </ScrollView>
      <BottomNav role="dependent" active="dependent-home" onNavigate={(screen) => navigate(screen)} />
    </Screen>
  );
}

function QuickAction({ emoji, title, text, onPress }: { emoji: string; title: string; text: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.action, { opacity: pressed ? 0.8 : 1 }]} onPress={onPress}>
      <Text style={styles.actionIcon}>{emoji}</Text><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 24 },
  hello: { fontSize: 28, fontWeight: '900', color: colors.ink, marginTop: 5 },
  good: { fontSize: 17, fontWeight: '800', color: colors.ink, marginTop: 3 },
  question: { fontSize: 15.5, color: colors.ink, marginTop: 9, marginBottom: 17 },
  moods: { flexDirection: 'row', justifyContent: 'space-between', gap: 3 },
  calmCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF6FF', borderRadius: 22, padding: 16, marginTop: 23, gap: 11, borderWidth: 1, borderColor: '#DCEBFF' },
  mascotBubble: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#CFE8FF', alignItems: 'center', justifyContent: 'center' },
  mascot: { fontSize: 35 },
  calmTitle: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  calmStrong: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 2 },
  calmText: { color: colors.muted, lineHeight: 16, marginTop: 5, fontSize: 11.5 },
  help: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.red, borderRadius: 21, padding: 16, marginTop: 14, gap: 12 },
  helpIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  helpTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  helpText: { color: '#fff', fontSize: 12, marginTop: 3, opacity: 0.94 },
  summaryRow: { flexDirection: 'row', gap: 11, marginTop: 16 },
  summary: { flex: 1, minHeight: 142, backgroundColor: '#fff', borderRadius: 19, borderWidth: 1, borderColor: colors.border, padding: 14 },
  summaryIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryValue: { color: colors.ink, fontSize: 17, fontWeight: '900', marginTop: 8 },
  summaryLabel: { color: colors.muted, fontSize: 10.5, fontWeight: '800', marginTop: 2 },
  summarySmall: { color: colors.purple, fontSize: 9.5, fontWeight: '800', marginTop: 8 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#EAE6F7', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: colors.purple },
  nextCard: { marginTop: 15 },
  nextHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  nextTime: { marginLeft: 'auto', color: colors.purple, fontWeight: '900' },
  nextBody: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  nextEmoji: { fontSize: 35 },
  nextTitle: { color: colors.ink, fontWeight: '900', fontSize: 15 },
  nextText: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 3 },
  now: { fontSize: 16, color: colors.ink, fontWeight: '900', marginTop: 22, marginBottom: 11 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { width: '48%', minHeight: 116, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 14 },
  actionIcon: { fontSize: 27 },
  actionTitle: { color: colors.ink, fontWeight: '900', marginTop: 7, fontSize: 13.5 },
  actionText: { color: colors.muted, marginTop: 3, fontSize: 10.5 },
});
