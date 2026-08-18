import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { moods } from '../data/demo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { dateKey, formatDateTime } from '../utils/date';

export function GuardianHomeScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state } = useApp();
  const today = dateKey();
  const activeRoutine = state.routine.filter((i) => i.active);
  const done = activeRoutine.filter((i) => i.completedDates.includes(today)).length;
  const progress = activeRoutine.length ? Math.round((done / activeRoutine.length) * 100) : 0;
  const latestMood = state.moods[0];
  const latestMoodInfo = moods.find((m) => m.id === latestMood?.moodId);
  const openAlerts = state.helpRequests.filter((h) => h.status !== 'resolved');
  const weekEntries = useMemo(() => state.moods.filter((m) => Date.now() - new Date(m.createdAt).getTime() <= 7 * 86400000), [state.moods]);

  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} onBell={() => navigate('guardian-alerts')} notificationCount={openAlerts.length} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.parent}>
          <View style={styles.avatar}><Text style={styles.avatarEmoji}>{state.guardian.avatar}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.title}>Área do responsável</Text><Text style={styles.hello}>Olá, {state.guardian.name}!</Text><Text style={styles.sub}>Acompanhe sinais do dia a dia sem transformar tudo em nota.</Text></View>
        </View>

        <Pressable onPress={() => navigate('pairing')} style={styles.child}>
          <Text style={styles.childAvatar}>{state.dependent.avatar}</Text><View style={{ flex: 1 }}><Text style={styles.childLabel}>Dependente vinculado</Text><Text style={styles.childName}>{state.dependent.name}</Text></View><View style={[styles.linkStatus, { backgroundColor: state.linked ? colors.greenSoft : colors.redSoft }]}><Text style={{ color: state.linked ? colors.green : colors.red, fontSize: 9, fontWeight: '900' }}>{state.linked ? 'VINCULADO' : 'SEM VÍNCULO'}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        {openAlerts.length > 0 && <Pressable onPress={() => navigate('guardian-alerts')} style={styles.alert}>
          <View style={styles.alertBell}><Ionicons name="notifications" size={26} color="#fff" /></View>
          <View style={{ flex: 1 }}><Text style={styles.alertTitle}>{openAlerts.length === 1 ? `${state.dependent.name} pediu ajuda` : `${openAlerts.length} pedidos aguardando`}</Text><Text style={styles.alertText}>{openAlerts[0].message}</Text><Text style={styles.alertTime}>{formatDateTime(openAlerts[0].createdAt)}</Text></View><Ionicons name="chevron-forward" size={24} color="#fff" />
        </Pressable>}

        <View style={styles.stats}>
          <Pressable style={styles.stat} onPress={() => navigate('guardian-moods')}><View style={[styles.statIcon, { backgroundColor: colors.yellowSoft }]}><Text style={{ fontSize: 23 }}>{latestMoodInfo?.emoji ?? '—'}</Text></View><Text style={styles.statValue}>{latestMoodInfo?.label ?? 'Sem registro'}</Text><Text style={styles.statLabel}>Humor mais recente</Text></Pressable>
          <Pressable style={styles.stat} onPress={() => navigate('guardian-routine')}><View style={[styles.statIcon, { backgroundColor: colors.greenSoft }]}><Ionicons name="checkmark-done" size={23} color={colors.green} /></View><Text style={styles.statValue}>{progress}%</Text><Text style={styles.statLabel}>Rotina de hoje</Text></Pressable>
          <Pressable style={styles.stat} onPress={() => navigate('guardian-reports')}><View style={[styles.statIcon, { backgroundColor: colors.purpleSoft }]}><Ionicons name="analytics" size={23} color={colors.purple} /></View><Text style={styles.statValue}>{weekEntries.length}</Text><Text style={styles.statLabel}>Registros em 7 dias</Text></Pressable>
        </View>

        <Text style={styles.section}>Acompanhar</Text>
        <MenuCard emoji="📊" title="Relatórios e padrões" text="Veja tendências descritivas de humor, rotina e ferramentas usadas." color="#ECF9EF" onPress={() => navigate('guardian-reports')} />
        <MenuCard emoji="🙂" title="Humores e motivos" text="Leia o que foi registrado e o que poderia ajudar naquele momento." color="#FFF7E6" onPress={() => navigate('guardian-moods')} />
        <MenuCard emoji="🗓️" title="Rotina de hoje" text="Veja quais atividades foram marcadas como concluídas." color="#F3EEFF" onPress={() => navigate('guardian-routine')} />
        <MenuCard emoji="🔗" title="Vínculo e código" text="Gerencie o pareamento entre responsável e dependente." color="#EDF6FF" onPress={() => navigate('pairing')} />

        <SectionCard style={styles.guidance}>
          <View style={styles.guidanceHeader}><Ionicons name="compass-outline" size={21} color={colors.blue} /><Text style={styles.guidanceTitle}>Leitura cuidadosa dos dados</Text></View>
          <Text style={styles.guidanceText}>Os relatórios servem para observar contexto e conversar melhor. Eles não diagnosticam, classificam gravidade do TEA nem substituem avaliação profissional.</Text>
        </SectionCard>
      </ScrollView>
      <BottomNav role="guardian" active="guardian-home" onNavigate={navigate} alertCount={openAlerts.length} />
    </Screen>
  );
}

function MenuCard({ emoji, title, text, color, onPress }: { emoji: string; title: string; text: string; color: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.menuCard, { backgroundColor: color, opacity: pressed ? 0.82 : 1 }]}><Text style={styles.menuEmoji}>{emoji}</Text><View style={{ flex: 1 }}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuText}>{text}</Text></View><Ionicons name="chevron-forward" size={21} color={colors.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  parent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  avatar: { width: 57, height: 57, borderRadius: 29, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 37 },
  title: { fontSize: 24, fontWeight: '900', color: colors.ink },
  hello: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: 2 },
  sub: { color: colors.muted, fontSize: 10.5, lineHeight: 14, marginTop: 2 },
  child: { minHeight: 70, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginTop: 19, gap: 10 },
  childAvatar: { fontSize: 31 },
  childLabel: { color: colors.muted, fontSize: 9.5, fontWeight: '700' },
  childName: { color: colors.ink, fontSize: 14.5, fontWeight: '900', marginTop: 1 },
  linkStatus: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  alert: { minHeight: 105, borderRadius: 20, backgroundColor: colors.red, flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 13, gap: 11 },
  alertBell: { width: 51, height: 51, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  alertTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  alertText: { color: '#fff', fontSize: 11, marginTop: 3 },
  alertTime: { color: '#fff', opacity: 0.82, fontSize: 9, marginTop: 3 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  stat: { flex: 1, minHeight: 126, backgroundColor: '#fff', borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 11 },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { color: colors.ink, fontSize: 13.5, fontWeight: '900', marginTop: 9 },
  statLabel: { color: colors.muted, fontSize: 9.2, lineHeight: 12, marginTop: 2 },
  section: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 21, marginBottom: 9 },
  menuCard: { minHeight: 86, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  menuEmoji: { fontSize: 31 },
  menuTitle: { color: colors.ink, fontSize: 14.5, fontWeight: '900' },
  menuText: { color: colors.muted, fontSize: 10.5, lineHeight: 14, marginTop: 3 },
  guidance: { marginTop: 8, backgroundColor: colors.skySoft },
  guidanceHeader: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  guidanceTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 },
  guidanceText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7 },
});
