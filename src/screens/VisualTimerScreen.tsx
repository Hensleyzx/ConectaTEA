import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function VisualTimerScreen({ onBack }: { onBack: () => void }) {
  const { state } = useApp();
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const total = minutes * 60;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setRemaining((r) => {
      if (r <= 1) {
        setRunning(false);
        if (state.sensory.haptics) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        return 0;
      }
      return r - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [running, state.sensory.haptics]);
  const label = useMemo(() => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`, [remaining]);
  const progress = total ? remaining / total : 0;
  const choose = (m: number) => { setMinutes(m); setRemaining(m * 60); setRunning(false); };
  const toggle = () => {
    if (remaining === 0) setRemaining(total);
    setRunning((v) => !v);
  };
  const reset = () => { setRunning(false); setRemaining(total); };
  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <View style={styles.wrap}>
        <Text style={styles.title}>Timer visual</Text><Text style={styles.sub}>Útil para pausas, transições ou para saber quanto tempo falta sem precisar olhar o relógio toda hora.</Text>
        <View style={styles.presets}>{[2, 5, 10, 15, 30].map((m) => <Pressable key={m} onPress={() => choose(m)} style={[styles.preset, minutes === m && styles.presetActive]}><Text style={[styles.presetText, minutes === m && styles.presetTextActive]}>{m} min</Text></Pressable>)}</View>
        <View style={styles.timerCircle}>
          <View style={styles.ring}><View style={[styles.progressShade, { height: `${Math.max(0, Math.min(100, progress * 100))}%` }]} /><View style={styles.timerInner}><Text style={styles.timerLabel}>{label}</Text><Text style={styles.status}>{remaining === 0 ? 'Terminou 💙' : running ? 'Em andamento' : 'Pausado'}</Text></View></View>
        </View>
        <View style={styles.bar}><View style={[styles.barFill, { width: `${progress * 100}%` }]} /></View>
        <Text style={styles.explain}>{Math.round(progress * 100)}% do tempo ainda falta</Text>
        <View style={styles.buttons}><PrimaryButton label={running ? 'Pausar' : remaining === 0 ? 'Recomeçar' : 'Iniciar'} onPress={toggle} style={{ flex: 1 }} /><PrimaryButton label="Reiniciar" tone="outline" onPress={reset} style={{ flex: 1 }} /></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 20, paddingBottom: 25, alignItems: 'center' },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, textAlign: 'center', marginTop: 7, maxWidth: 335 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7, marginTop: 18 },
  preset: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  presetActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  presetText: { color: colors.muted, fontSize: 10.5, fontWeight: '900' },
  presetTextActive: { color: '#fff' },
  timerCircle: { flex: 1, justifyContent: 'center' },
  ring: { width: 260, height: 260, borderRadius: 130, overflow: 'hidden', backgroundColor: '#E7E0F8', borderWidth: 10, borderColor: '#D5C6F4', justifyContent: 'center', alignItems: 'center' },
  progressShade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#9E7DEB' },
  timerInner: { width: 190, height: 190, borderRadius: 95, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  timerLabel: { color: colors.ink, fontSize: 43, fontWeight: '900' },
  status: { color: colors.muted, fontSize: 11, fontWeight: '800', marginTop: 5 },
  bar: { width: '100%', height: 11, borderRadius: 6, overflow: 'hidden', backgroundColor: '#E7EAF1' },
  barFill: { height: 11, backgroundColor: colors.purple },
  explain: { color: colors.muted, fontSize: 10.5, marginTop: 7 },
  buttons: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 18 },
});
