import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const phases = [
  { label: 'Inspire', seconds: 4, scale: 1.28, hint: 'Puxe o ar devagar, se for confortável.' },
  { label: 'Pausa', seconds: 2, scale: 1.28, hint: 'Só uma pausa curta. Você pode pular.' },
  { label: 'Expire', seconds: 6, scale: 0.86, hint: 'Solte o ar devagar.' },
];

export function BreathingScreen({ onBack }: { onBack: () => void }) {
  const { state, addRelaxSession } = useApp();
  const [minutes, setMinutes] = useState(1);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseRemaining, setPhaseRemaining] = useState(phases[0].seconds);
  const scale = useRef(new Animated.Value(0.86)).current;
  const startedAt = useRef<number | null>(null);
  const phase = phases[phaseIndex];

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          if (startedAt.current) addRelaxSession('Respiração guiada', Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
          startedAt.current = null;
          return 0;
        }
        return r - 1;
      });
      setPhaseRemaining((p) => {
        if (p <= 1) {
          const next = (phaseIndex + 1) % phases.length;
          setPhaseIndex(next);
          return phases[next].seconds;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, phaseIndex, addRelaxSession]);

  useEffect(() => {
    if (!running || state.sensory.reducedMotion) return;
    Animated.timing(scale, { toValue: phase.scale, duration: Math.max(500, phase.seconds * 1000 - 120), useNativeDriver: true }).start();
  }, [phaseIndex, phase.scale, phase.seconds, running, scale, state.sensory.reducedMotion]);

  const timeLabel = useMemo(() => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);

  const start = () => {
    setRemaining(minutes * 60);
    setPhaseIndex(0);
    setPhaseRemaining(phases[0].seconds);
    startedAt.current = Date.now();
    setRunning(true);
  };
  const stop = () => {
    if (startedAt.current) addRelaxSession('Respiração guiada', Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
    startedAt.current = null;
    setRunning(false);
  };

  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <View style={styles.wrap}>
        <Text style={styles.title}>Respiração guiada</Text>
        <Text style={styles.sub}>Acompanhe apenas se estiver confortável. Se prender a respiração incomodar, passe direto para expirar.</Text>
        {!running && <View style={styles.durationRow}>{[1, 3, 5].map((m) => <Pressable key={m} onPress={() => setMinutes(m)} style={[styles.duration, minutes === m && styles.durationActive]}><Text style={[styles.durationText, minutes === m && styles.durationTextActive]}>{m} min</Text></Pressable>)}</View>}
        <View style={styles.center}>
          <Animated.View style={[styles.circleOuter, !state.sensory.reducedMotion && { transform: [{ scale }] }]}>
            <View style={styles.circleInner}><Text style={styles.phase}>{running ? phase.label : 'Pronto?'}</Text><Text style={styles.phaseSeconds}>{running ? `${phaseRemaining}s` : '💙'}</Text></View>
          </Animated.View>
          <Text style={styles.hint}>{running ? phase.hint : 'Escolha um tempo e comece quando quiser.'}</Text>
          <Text style={styles.remaining}>{running ? timeLabel : `${minutes}:00`}</Text>
        </View>
        <View style={styles.controls}>
          {!running ? <PrimaryButton label="Começar" onPress={start} style={{ width: '100%' }} /> : <PrimaryButton label="Parar por agora" tone="outline" onPress={stop} style={{ width: '100%' }} />}
          <Pressable onPress={onBack} style={styles.leave}><Ionicons name="arrow-back-outline" size={18} color={colors.muted} /><Text style={styles.leaveText}>Voltar para outras ferramentas</Text></Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 21, paddingBottom: 24 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 5, textAlign: 'center' },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, textAlign: 'center', marginTop: 7 },
  durationRow: { flexDirection: 'row', justifyContent: 'center', gap: 9, marginTop: 18 },
  duration: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  durationActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  durationText: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  durationTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circleOuter: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#DCCEFF', alignItems: 'center', justifyContent: 'center' },
  circleInner: { width: 170, height: 170, borderRadius: 85, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', shadowColor: colors.purple, shadowOpacity: 0.22, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  phase: { color: '#fff', fontSize: 24, fontWeight: '900' },
  phaseSeconds: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 5 },
  hint: { color: colors.ink, fontSize: 13, fontWeight: '800', textAlign: 'center', maxWidth: 300, lineHeight: 19, marginTop: 30 },
  remaining: { color: colors.purple, fontSize: 25, fontWeight: '900', marginTop: 12 },
  controls: { width: '100%' },
  leave: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, padding: 14, marginTop: 6 },
  leaveText: { color: colors.muted, fontWeight: '800', fontSize: 11 },
});
