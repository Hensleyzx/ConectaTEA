import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { dateKey } from '../utils/date';

export function FirstThenScreen({ onBack, navigate }: { onBack: () => void; navigate: (screen: string) => void }) {
  const { state, toggleRoutineToday } = useApp();
  const today = dateKey();
  const pending = useMemo(
    () => state.routine.filter((item) => item.active && !item.completedDates.includes(today)).sort((a, b) => a.time.localeCompare(b.time)),
    [state.routine, today],
  );
  const first = pending[0];
  const then = pending[1];

  const completeFirst = async () => {
    if (!first) return;
    toggleRoutineToday(first.id);
    if (state.sensory.haptics) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>SEQUÊNCIA VISUAL</Text>
        <Text style={styles.title}>Primeiro → Depois</Text>
        <Text style={styles.sub}>Uma visão simples de apenas dois passos. Pode ajudar quando olhar a rotina inteira parece informação demais.</Text>

        {first ? (
          <>
            <View style={styles.board}>
              <StepCard label="PRIMEIRO" item={first} tone="purple" />
              <View style={styles.arrow}><Ionicons name="arrow-forward" size={28} color={colors.muted} /></View>
              {then ? <StepCard label="DEPOIS" item={then} tone="blue" /> : <FinishedCard />}
            </View>
            <PrimaryButton label={`Terminei: ${first.title}`} onPress={completeFirst} style={{ marginTop: 18 }} />
            <Pressable onPress={() => navigate('timer')} style={styles.timerLink}><Ionicons name="timer-outline" size={21} color={colors.purple} /><Text style={styles.timerText}>Abrir timer visual para este passo</Text></Pressable>
          </>
        ) : (
          <SectionCard style={styles.finished}>
            <Text style={styles.finishedEmoji}>🎉</Text>
            <Text style={styles.finishedTitle}>Os passos de hoje estão concluídos</Text>
            <Text style={styles.finishedText}>Você pode descansar, revisar a rotina ou adicionar outra atividade quando fizer sentido.</Text>
          </SectionCard>
        )}

        <SectionCard style={styles.tip}>
          <View style={styles.tipHeader}><Ionicons name="bulb-outline" size={20} color={colors.blue} /><Text style={styles.tipTitle}>Por que esta tela existe?</Text></View>
          <Text style={styles.tipText}>Ela reduz a quantidade de informações mostradas de uma vez. No ConectaTEA ela usa a própria rotina, então o quadro muda automaticamente quando o primeiro passo é marcado como concluído.</Text>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

function StepCard({ label, item, tone }: { label: string; item: { title: string; time: string; emoji: string }; tone: 'purple' | 'blue' }) {
  const accent = tone === 'purple' ? colors.purple : colors.blue;
  const bg = tone === 'purple' ? colors.purpleSoft : colors.skySoft;
  return (
    <View style={[styles.step, { borderColor: accent, backgroundColor: bg }]}>
      <Text style={[styles.stepLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.stepEmoji}>{item.emoji}</Text>
      <Text style={styles.stepTime}>{item.time}</Text>
      <Text style={styles.stepTitle}>{item.title}</Text>
    </View>
  );
}

function FinishedCard() {
  return <View style={[styles.step, { borderColor: colors.green, backgroundColor: colors.greenSoft }]}><Text style={[styles.stepLabel, { color: colors.green }]}>DEPOIS</Text><Text style={styles.stepEmoji}>✅</Text><Text style={styles.stepTitle}>Tudo pronto</Text><Text style={styles.stepTime}>Você concluiu a sequência.</Text></View>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 30 },
  eyebrow: { color: colors.purple, fontWeight: '900', fontSize: 10, letterSpacing: 1.2, marginTop: 5 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900', marginTop: 4 },
  sub: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  board: { flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 8 },
  step: { flex: 1, minHeight: 225, borderWidth: 2, borderRadius: 24, padding: 14, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  stepEmoji: { fontSize: 52, marginTop: 17 },
  stepTime: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  stepTitle: { color: colors.ink, fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  arrow: { width: 31, alignItems: 'center' },
  timerLink: { marginTop: 11, minHeight: 52, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  timerText: { color: colors.purple, fontSize: 12, fontWeight: '900' },
  tip: { marginTop: 18, backgroundColor: colors.skySoft },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipTitle: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  tipText: { color: colors.muted, fontSize: 10.5, lineHeight: 16, marginTop: 7 },
  finished: { marginTop: 23, alignItems: 'center', paddingVertical: 30 },
  finishedEmoji: { fontSize: 52 },
  finishedTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 10, textAlign: 'center' },
  finishedText: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 6, textAlign: 'center' },
});
