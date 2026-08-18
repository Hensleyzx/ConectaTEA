import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatDateTime } from '../utils/date';

export function GuardianAlertsScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state, setHelpStatus, createHelpRequest } = useApp();
  const active = state.helpRequests.filter((h) => h.status !== 'resolved');
  const resolved = state.helpRequests.filter((h) => h.status === 'resolved').slice(0, 6);
  const act = async (id: string, status: 'acknowledged' | 'resolved') => {
    setHelpStatus(id, status);
    if (state.sensory.haptics) await Haptics.selectionAsync().catch(() => undefined);
  };
  return (
    <Screen>
      <AppHeader onMenu={() => navigate('more')} notificationCount={active.length} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pedidos de ajuda</Text><Text style={styles.sub}>Aqui aparecem os pedidos enviados pelo dependente. No modo local, você consegue testar o fluxo completo no mesmo aparelho.</Text>
        {active.length === 0 ? (
          <SectionCard style={styles.empty}><Text style={styles.emptyEmoji}>💚</Text><Text style={styles.emptyTitle}>Nenhum pedido aguardando</Text><Text style={styles.emptyText}>Quando {state.dependent.name} usar “Preciso de ajuda”, o pedido aparecerá aqui.</Text><PrimaryButton label="Criar alerta de demonstração" tone="outline" onPress={() => createHelpRequest('support', 'Pedido de demonstração para testar o painel do responsável.')} style={{ width: '100%', marginTop: 15 }} /></SectionCard>
        ) : (
          <>
            <Text style={styles.section}>Precisam de atenção</Text>
            {active.map((request) => <SectionCard key={request.id} style={[styles.alertCard, request.urgency === 'urgent' && styles.urgentCard]}>
              <View style={styles.alertTop}><View style={[styles.typeIcon, { backgroundColor: request.urgency === 'urgent' ? colors.redSoft : colors.skySoft }]}><Ionicons name={request.urgency === 'urgent' ? 'warning' : 'notifications'} size={22} color={request.urgency === 'urgent' ? colors.red : colors.blue} /></View><View style={{ flex: 1 }}><Text style={styles.alertTitle}>{request.urgency === 'urgent' ? 'Ajuda agora' : 'Pedido de apoio'}</Text><Text style={styles.time}>{formatDateTime(request.createdAt)}</Text></View><View style={[styles.statusPill, { backgroundColor: request.status === 'acknowledged' ? colors.greenSoft : colors.orangeSoft }]}><Text style={[styles.statusText, { color: request.status === 'acknowledged' ? colors.green : colors.orange }]}>{request.status === 'acknowledged' ? 'VISTO' : 'NOVO'}</Text></View></View>
              <Text style={styles.message}>{request.message}</Text>
              <View style={styles.actions}>{request.status === 'open' && <PrimaryButton label="Estou indo / Eu vi" tone="green" onPress={() => act(request.id, 'acknowledged')} style={{ flex: 1 }} />}<PrimaryButton label="Resolvido" tone="outline" onPress={() => act(request.id, 'resolved')} style={{ flex: 1 }} /></View>
            </SectionCard>)}
          </>
        )}
        {resolved.length > 0 && <><Text style={styles.section}>Histórico recente</Text>{resolved.map((request) => <View key={request.id} style={styles.history}><View style={styles.historyIcon}><Ionicons name="checkmark" size={15} color={colors.green} /></View><View style={{ flex: 1 }}><Text style={styles.historyText}>{request.message}</Text><Text style={styles.historyTime}>{formatDateTime(request.createdAt)}</Text></View><Text style={styles.historyStatus}>Resolvido</Text></View>)}</>}
        <View style={styles.note}><Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} /><Text style={styles.noteText}>Na versão online, o backend deve registrar o pedido e disparar push notification para os dispositivos vinculados. O aplicativo não deve prometer resposta imediata nem ser tratado como serviço de emergência.</Text></View>
      </ScrollView>
      <BottomNav role="guardian" active="guardian-alerts" onNavigate={navigate} alertCount={active.length} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 6 },
  empty: { marginTop: 18, alignItems: 'center', backgroundColor: '#FBFFFC' },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 8 },
  emptyText: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 5, maxWidth: 280 },
  section: { color: colors.ink, fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  alertCard: { marginBottom: 10, borderColor: '#DCEAFF' },
  urgentCard: { borderColor: '#FFC7CD', backgroundColor: '#FFFCFC' },
  alertTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  time: { color: colors.muted, fontSize: 9.5, marginTop: 2 },
  statusPill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  statusText: { fontSize: 8.5, fontWeight: '900' },
  message: { color: colors.ink, fontSize: 13, lineHeight: 18, marginTop: 12 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  history: { minHeight: 66, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, marginBottom: 8 },
  historyIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  historyText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  historyTime: { color: colors.muted, fontSize: 8.5, marginTop: 2 },
  historyStatus: { color: colors.green, fontSize: 9, fontWeight: '900' },
  note: { flexDirection: 'row', gap: 8, backgroundColor: colors.skySoft, borderRadius: 15, padding: 12, marginTop: 18 },
  noteText: { flex: 1, color: colors.muted, fontSize: 9.5, lineHeight: 14 },
});
