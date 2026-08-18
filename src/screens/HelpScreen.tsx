import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatDateTime } from '../utils/date';
import { HelpUrgency } from '../types/app';

const quickMessages = [
  'Está muito barulhento.',
  'Preciso sair deste lugar.',
  'Não consigo falar agora.',
  'Estou muito sobrecarregado(a).',
  'Preciso que você venha até mim.',
];

export function HelpScreen({ onBack }: { onBack: () => void }) {
  const { state, createHelpRequest } = useApp();
  const [message, setMessage] = useState('');
  const latest = state.helpRequests[0];

  const send = async (urgency: HelpUrgency) => {
    if (state.sensory.haptics) {
      await Haptics.notificationAsync(urgency === 'urgent' ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    }
    createHelpRequest(urgency, message);
    setMessage('');
    Alert.alert('Pedido enviado 💙', state.linked ? 'Ele já aparece na área do responsável deste protótipo.' : 'O pedido foi registrado, mas ainda não existe um responsável vinculado.');
  };

  return (
    <Screen keyboard>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pedir ajuda</Text>
        <Text style={styles.sub}>Você não precisa explicar tudo. Escolha uma frase ou escreva apenas o que conseguir.</Text>

        {latest && latest.status !== 'resolved' && <SectionCard style={[styles.statusCard, latest.status === 'acknowledged' && styles.statusAck]}>
          <View style={styles.statusHeader}><Text style={styles.statusIcon}>{latest.status === 'open' ? '📨' : '✅'}</Text><View style={{ flex: 1 }}><Text style={styles.statusTitle}>{latest.status === 'open' ? 'Seu pedido foi enviado' : 'Seu responsável viu o pedido'}</Text><Text style={styles.statusTime}>{formatDateTime(latest.createdAt)}</Text></View></View>
          <Text style={styles.statusText}>{latest.message}</Text>
        </SectionCard>}

        <Text style={styles.section}>Frases rápidas</Text>
        <View style={styles.chips}>{quickMessages.map((item) => <Pressable key={item} onPress={() => setMessage(item)} style={[styles.chip, message === item && styles.chipActive]}><Text style={[styles.chipText, message === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</View>
        <Text style={styles.section}>Ou escreva do seu jeito</Text>
        <TextInput multiline maxLength={180} value={message} onChangeText={setMessage} placeholder="Ex.: preciso ir para um lugar mais quieto..." placeholderTextColor="#9AA1B5" style={styles.input} textAlignVertical="top" />

        <PrimaryButton label="Enviar pedido de apoio" tone="blue" onPress={() => send('support')} style={{ marginTop: 15 }} />
        <View style={styles.urgentBox}>
          <Ionicons name="warning-outline" size={24} color={colors.red} />
          <View style={{ flex: 1 }}><Text style={styles.urgentTitle}>Preciso de ajuda agora</Text><Text style={styles.urgentText}>Para evitar toque acidental, mantenha o botão pressionado.</Text></View>
        </View>
        <Pressable onLongPress={() => send('urgent')} delayLongPress={800} style={({ pressed }) => [styles.urgentButton, { opacity: pressed ? 0.8 : 1 }]}>
          <Ionicons name="notifications" size={27} color="#fff" /><Text style={styles.urgentButtonText}>SEGURE PARA PEDIR AJUDA AGORA</Text>
        </Pressable>
        <View style={styles.safety}><Ionicons name="information-circle-outline" size={19} color={colors.muted} /><Text style={styles.safetyText}>O ConectaTEA é um recurso de apoio e comunicação com responsáveis. Ele não é um serviço de emergência e não garante resposta imediata.</Text></View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 28 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  statusCard: { marginTop: 17, backgroundColor: colors.skySoft, borderColor: '#D9E9FF' },
  statusAck: { backgroundColor: colors.greenSoft, borderColor: '#CDEED8' },
  statusHeader: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  statusIcon: { fontSize: 28 },
  statusTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  statusTime: { color: colors.muted, fontSize: 9.5, marginTop: 2 },
  statusText: { color: colors.ink, fontSize: 12, lineHeight: 17, marginTop: 10 },
  section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 21, marginBottom: 9 },
  chips: { gap: 7 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12 },
  chipActive: { borderColor: colors.blue, backgroundColor: colors.skySoft },
  chipText: { color: colors.ink, fontSize: 11.5, fontWeight: '700' },
  chipTextActive: { color: colors.blue, fontWeight: '900' },
  input: { minHeight: 110, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1.3, borderColor: colors.borderStrong, padding: 13, fontSize: 14.5, color: colors.ink },
  urgentBox: { flexDirection: 'row', gap: 10, backgroundColor: colors.redSoft, borderRadius: 15, padding: 13, marginTop: 19 },
  urgentTitle: { color: colors.redDark, fontWeight: '900', fontSize: 13.5 },
  urgentText: { color: colors.muted, fontSize: 10.2, lineHeight: 14, marginTop: 3 },
  urgentButton: { minHeight: 66, borderRadius: 18, backgroundColor: colors.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 10, paddingHorizontal: 14 },
  urgentButtonText: { color: '#fff', fontWeight: '900', fontSize: 12.5, textAlign: 'center' },
  safety: { flexDirection: 'row', gap: 8, padding: 12, marginTop: 12 },
  safetyText: { flex: 1, color: colors.muted, fontSize: 9.5, lineHeight: 14 },
});
