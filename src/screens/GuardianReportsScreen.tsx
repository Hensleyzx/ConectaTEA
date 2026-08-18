import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { moods } from '../data/demo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { addDays, dateKey, sameWeekDayLabel } from '../utils/date';

export function GuardianReportsScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state } = useApp();
  const openAlerts = state.helpRequests.filter((h) => h.status !== 'resolved').length;
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i - 6)), []);
  const weekMoods = state.moods.filter((m) => Date.now() - new Date(m.createdAt).getTime() <= 7 * 86400000);
  const moodByDay = days.map((day) => {
    const key = dateKey(day);
    const matches = weekMoods.filter((e) => dateKey(new Date(e.createdAt)) === key);
    const entry = matches[0];
    const info = moods.find((m) => m.id === entry?.moodId);
    return { key, day, entry, info };
  });
  const routineByDay = days.map((day) => {
    const key = dateKey(day);
    const active = state.routine.filter((i) => i.active);
    const completed = active.filter((i) => i.completedDates.includes(key)).length;
    return { key, day, percent: active.length ? Math.round((completed / active.length) * 100) : 0 };
  });
  const moodCounts = moods.map((m) => ({ mood: m, count: weekMoods.filter((e) => e.moodId === m.id).length })).sort((a, b) => b.count - a.count);
  const topMood = moodCounts[0];
  const tagCounts = new Map<string, number>();
  weekMoods.forEach((e) => e.tags.forEach((t) => tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)));
  const topTag = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const relaxWeek = state.relaxSessions.filter((s) => Date.now() - new Date(s.createdAt).getTime() <= 7 * 86400000);
  const relaxMinutes = Math.round(relaxWeek.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);
  const averageRoutine = Math.round(routineByDay.reduce((s, d) => s + d.percent, 0) / routineByDay.length);

  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} onBell={() => navigate('guardian-alerts')} notificationCount={openAlerts} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Relatórios</Text><Text style={styles.sub}>Resumo descritivo dos últimos 7 dias. Sem diagnóstico, pontuação clínica ou comparação com outras pessoas.</Text>
        <View style={styles.kpis}>
          <Kpi icon="happy-outline" label="Registros de humor" value={String(weekMoods.length)} tone="purple" />
          <Kpi icon="checkmark-done-outline" label="Média da rotina" value={`${averageRoutine}%`} tone="green" />
          <Kpi icon="leaf-outline" label="Tempo em relaxar" value={`${relaxMinutes} min`} tone="blue" />
        </View>

        <SectionCard style={styles.card}>
          <Text style={styles.cardTitle}>Emoções ao longo da semana</Text><Text style={styles.cardSub}>Cada coluna mostra o último registro de humor daquele dia.</Text>
          <View style={styles.moodChart}>{moodByDay.map((d) => { const score = d.info?.score ?? 0; return <View key={d.key} style={styles.moodDay}><View style={styles.moodBarSpace}>{d.info ? <View style={[styles.moodBar, { height: 20 + score * 15, backgroundColor: d.info.color }]}><Text style={styles.moodEmoji}>{d.info.emoji}</Text></View> : <View style={styles.noBar} />}</View><Text style={styles.dayLabel}>{sameWeekDayLabel(d.day.toISOString())}</Text></View>; })}</View>
        </SectionCard>

        <SectionCard style={styles.card}>
          <Text style={styles.cardTitle}>Rotina concluída por dia</Text><Text style={styles.cardSub}>Percentual das atividades atuais que foram marcadas naquele dia.</Text>
          <View style={styles.routineChart}>{routineByDay.map((d) => <View key={d.key} style={styles.routineDay}><View style={styles.routineTrack}><View style={[styles.routineFill, { height: `${d.percent}%` }]} /></View><Text style={styles.routinePercent}>{d.percent}%</Text><Text style={styles.dayLabel}>{sameWeekDayLabel(d.day.toISOString())}</Text></View>)}</View>
        </SectionCard>

        <SectionCard style={[styles.card, { backgroundColor: '#FFF9E9' }]}>
          <Text style={styles.cardTitle}>Leituras úteis para conversar</Text>
          <Insight icon="📌" text={topMood?.count ? `O humor “${topMood.mood.label}” apareceu ${topMood.count} vez(es) nos registros desta semana.` : 'Ainda não há registros suficientes de humor nesta semana.'} />
          <Insight icon="🧩" text={topTag ? `O contexto mais marcado foi “${topTag[0]}” (${topTag[1]} vez(es)). Isso não prova que ele causou o sentimento.` : 'Nenhum contexto foi marcado com frequência suficiente para destacar.'} />
          <Insight icon="🗓️" text={`A média de conclusão registrada da rotina foi ${averageRoutine}% nos últimos sete dias.`} />
          <Insight icon="🎧" text={`${relaxWeek.length} sessão(ões) de ferramentas de relaxamento foram registradas, somando cerca de ${relaxMinutes} minuto(s).`} />
        </SectionCard>

        <SectionCard style={styles.ethics}><View style={styles.ethicsHeader}><Ionicons name="shield-checkmark-outline" size={21} color={colors.blue} /><Text style={styles.ethicsTitle}>Proteção contra interpretações erradas</Text></View><Text style={styles.ethicsText}>O aplicativo deve mostrar fatos registrados e tendências simples, sem afirmar que um comportamento é “bom”, “ruim”, “normal” ou “anormal”. Mudanças importantes devem ser discutidas com pessoas de confiança e profissionais que conheçam o contexto.</Text></SectionCard>
      </ScrollView>
      <BottomNav role="guardian" active="guardian-home" onNavigate={navigate} alertCount={openAlerts} />
    </Screen>
  );
}

function Kpi({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: 'purple' | 'green' | 'blue' }) {
  const color = tone === 'green' ? colors.green : tone === 'blue' ? colors.blue : colors.purple;
  const bg = tone === 'green' ? colors.greenSoft : tone === 'blue' ? colors.skySoft : colors.purpleSoft;
  return <View style={styles.kpi}><View style={[styles.kpiIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={21} color={color} /></View><Text style={[styles.kpiValue, { color }]}>{value}</Text><Text style={styles.kpiLabel}>{label}</Text></View>;
}
function Insight({ icon, text }: { icon: string; text: string }) { return <View style={styles.insight}><Text style={styles.insightIcon}>{icon}</Text><Text style={styles.insightText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 28 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  kpis: { flexDirection: 'row', gap: 8, marginTop: 17 },
  kpi: { flex: 1, minHeight: 128, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 11 },
  kpiIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 18, fontWeight: '900', marginTop: 9 },
  kpiLabel: { color: colors.muted, fontSize: 9, lineHeight: 12, marginTop: 2 },
  card: { marginTop: 12 },
  cardTitle: { color: colors.ink, fontSize: 14.5, fontWeight: '900' },
  cardSub: { color: colors.muted, fontSize: 9.7, lineHeight: 14, marginTop: 3 },
  moodChart: { height: 150, flexDirection: 'row', alignItems: 'flex-end', marginTop: 13, gap: 5 },
  moodDay: { flex: 1, alignItems: 'center' },
  moodBarSpace: { height: 120, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  moodBar: { width: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  moodEmoji: { fontSize: 17 },
  noBar: { width: 30, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dayLabel: { color: colors.muted, fontSize: 8.5, marginTop: 6, textTransform: 'capitalize' },
  routineChart: { height: 165, flexDirection: 'row', gap: 7, alignItems: 'flex-end', marginTop: 12 },
  routineDay: { flex: 1, alignItems: 'center' },
  routineTrack: { width: 25, height: 120, backgroundColor: '#E5F4EA', borderRadius: 13, overflow: 'hidden', justifyContent: 'flex-end' },
  routineFill: { width: '100%', backgroundColor: colors.green, borderRadius: 13 },
  routinePercent: { color: colors.green, fontSize: 8, fontWeight: '900', marginTop: 5 },
  insight: { flexDirection: 'row', gap: 9, marginTop: 11 },
  insightIcon: { fontSize: 16 },
  insightText: { flex: 1, color: colors.ink, fontSize: 10.5, lineHeight: 15, fontWeight: '700' },
  ethics: { marginTop: 12, backgroundColor: colors.skySoft },
  ethicsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ethicsTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  ethicsText: { color: colors.muted, fontSize: 9.8, lineHeight: 15, marginTop: 7 },
});
