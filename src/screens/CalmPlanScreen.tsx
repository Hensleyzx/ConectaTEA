import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const baseSteps = [
  { id: 'reduce', emoji: '🔇', title: 'Diminuir estímulos', text: 'Se for possível, ir para um lugar mais tranquilo e reduzir luz ou barulho.' },
  { id: 'tool', emoji: '🎧', title: 'Usar uma ferramenta que ajuda', text: 'Fones, som relaxante, timer, objeto confortável ou outra preferência pessoal.' },
  { id: 'body', emoji: '💧', title: 'Checar necessidades do corpo', text: 'Água, banheiro, fome, temperatura, dor, cansaço ou roupa desconfortável.' },
  { id: 'communicate', emoji: '💬', title: 'Comunicar sem precisar falar', text: 'Usar um cartão ou uma frase pronta se falar estiver difícil.' },
  { id: 'support', emoji: '🫂', title: 'Pedir apoio', text: 'Chamar uma pessoa de confiança quando precisar de presença ou ajuda.' },
];

export function CalmPlanScreen({ onBack, navigate }: { onBack: () => void; navigate: (screen: string) => void }) {
  const { state } = useApp();
  const [done, setDone] = useState<string[]>([]);
  const toggle = async (id: string) => {
    setDone((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
    if (state.sensory.haptics) await Haptics.selectionAsync().catch(() => undefined);
  };

  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>PLANO PESSOAL</Text>
        <Text style={styles.title}>Meu plano de calma</Text>
        <Text style={styles.sub}>Não precisa fazer tudo. A ideia é lembrar opções quando pensar ou falar estiver difícil.</Text>

        <SectionCard style={styles.personal}>
          <Text style={styles.personalTitle}>Coisas que já sabemos que podem ajudar</Text>
          <View style={styles.chips}>{state.sensory.preferredCalmingTools.map((tool) => <View key={tool} style={styles.chip}><Text style={styles.chipText}>{tool}</Text></View>)}</View>
          {state.sensory.avoidTriggers.length > 0 && <><Text style={styles.avoidTitle}>Estímulos que vale tentar reduzir</Text><Text style={styles.avoid}>{state.sensory.avoidTriggers.join(' · ')}</Text></>}
        </SectionCard>

        <Text style={styles.section}>Passos possíveis</Text>
        {baseSteps.map((step) => {
          const checked = done.includes(step.id);
          return (
            <Pressable key={step.id} onPress={() => toggle(step.id)} style={[styles.step, checked && styles.stepDone]}>
              <View style={[styles.check, checked && styles.checkDone]}>{checked ? <Ionicons name="checkmark" size={17} color="#fff" /> : <Text style={styles.stepEmoji}>{step.emoji}</Text>}</View>
              <View style={{ flex: 1 }}><Text style={styles.stepTitle}>{step.title}</Text><Text style={styles.stepText}>{step.text}</Text></View>
            </Pressable>
          );
        })}

        <View style={styles.shortcuts}>
          <Shortcut icon="volume-high-outline" title="Frases com voz" onPress={() => navigate('communicate')} />
          <Shortcut icon="leaf-outline" title="Abrir Relaxar" onPress={() => navigate('relax')} />
          <Shortcut icon="notifications-outline" title="Pedir ajuda" onPress={() => navigate('help')} danger />
        </View>

        <SectionCard style={styles.safety}>
          <View style={styles.safetyHeader}><Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} /><Text style={styles.safetyTitle}>Importante</Text></View>
          <Text style={styles.safetyText}>Este plano é uma ferramenta de organização e comunicação. Ele não substitui um plano individual feito com a própria pessoa, família e profissionais, nem serviços de emergência quando existir risco imediato.</Text>
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

function Shortcut({ icon, title, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void; danger?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.shortcut, danger && styles.shortcutDanger]}><Ionicons name={icon} size={22} color={danger ? colors.red : colors.purple} /><Text style={[styles.shortcutText, danger && { color: colors.red }]}>{title}</Text></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 30 },
  eyebrow: { color: colors.blue, fontWeight: '900', fontSize: 10, letterSpacing: 1.2, marginTop: 5 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '900', marginTop: 4 },
  sub: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  personal: { marginTop: 18, backgroundColor: colors.skySoft },
  personalTitle: { color: colors.ink, fontWeight: '900', fontSize: 13.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 },
  chip: { backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#D7E8FF' },
  chipText: { color: colors.blue, fontSize: 10, fontWeight: '900' },
  avoidTitle: { color: colors.ink, fontWeight: '900', fontSize: 11.5, marginTop: 13 },
  avoid: { color: colors.muted, fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  section: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  step: { minHeight: 88, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 9 },
  stepDone: { backgroundColor: '#F2FBF5', borderColor: '#BFE8CB' },
  check: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#F4F5FA', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: colors.green },
  stepEmoji: { fontSize: 26 },
  stepTitle: { color: colors.ink, fontSize: 13.5, fontWeight: '900' },
  stepText: { color: colors.muted, fontSize: 10.2, lineHeight: 15, marginTop: 4 },
  shortcuts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  shortcut: { width: '48%', minHeight: 65, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  shortcutDanger: { borderColor: '#FFD0D4', backgroundColor: '#FFF7F7' },
  shortcutText: { flex: 1, color: colors.purple, fontSize: 10.5, fontWeight: '900' },
  safety: { marginTop: 15, backgroundColor: '#F5F9FF' },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  safetyTitle: { color: colors.ink, fontWeight: '900', fontSize: 13 },
  safetyText: { color: colors.muted, fontSize: 9.8, lineHeight: 15, marginTop: 7 },
});
