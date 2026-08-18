import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { Role } from '../types/app';

export function MoreScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state, setRole } = useApp();
  const role: Role = state.lastRole ?? 'dependent';
  const guardian = role === 'guardian';
  const accent = guardian ? colors.green : colors.purple;
  const openAlerts = state.helpRequests.filter((h) => h.status !== 'resolved').length;
  const switchRole = () => {
    const next: Role = guardian ? 'dependent' : 'guardian';
    setRole(next);
    navigate(next === 'guardian' ? 'guardian-home' : 'dependent-home');
  };
  return (
    <Screen>
      <AppHeader onBell={guardian ? () => navigate('guardian-alerts') : () => navigate('help')} notificationCount={guardian ? openAlerts : 0} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}><View style={[styles.avatar, { backgroundColor: `${accent}16` }]}><Text style={styles.avatarEmoji}>{guardian ? state.guardian.avatar : state.dependent.avatar}</Text></View><View><Text style={styles.title}>Mais opções</Text><Text style={styles.profileName}>{guardian ? state.guardian.name : state.dependent.name}</Text><Text style={[styles.role, { color: accent }]}>{guardian ? 'Responsável' : 'Dependente'}</Text></View></View>
        <View style={styles.group}>
          <Menu icon="person-circle-outline" title="Perfil e preferências" text="Nome, modo simples e comportamento do app" onPress={() => navigate('settings')} accent={accent} />
          <Menu icon="options-outline" title="Perfil sensorial" text="Volume, estímulos e ferramentas preferidas" onPress={() => navigate('sensory')} accent={accent} />
          <Menu icon="link-outline" title="Vincular responsável e dependente" text={state.linked ? `Vínculo ativo · código ${state.pairingCode}` : 'Nenhum vínculo ativo'} onPress={() => navigate('pairing')} accent={accent} />
          {guardian && <Menu icon="analytics-outline" title="Relatórios" text="Tendências descritivas dos últimos registros" onPress={() => navigate('guardian-reports')} accent={accent} />}
          {!guardian && <Menu icon="time-outline" title="Histórico de emoções" text="Releia seus próprios registros" onPress={() => navigate('mood-history')} accent={accent} />}
          {!guardian && <Menu icon="git-compare-outline" title="Primeiro → Depois" text="Sequência visual simplificada da rotina" onPress={() => navigate('first-then')} accent={accent} />}
          {!guardian && <Menu icon="heart-circle-outline" title="Meu plano de calma" text="Preferências, passos e atalhos para momentos difíceis" onPress={() => navigate('calm-plan')} accent={accent} />}
          <Menu icon="information-circle-outline" title="Sobre o ConectaTEA" text="Escopo, privacidade e arquitetura do projeto" onPress={() => navigate('about')} accent={accent} />
        </View>
        <Pressable onPress={switchRole} style={[styles.switch, { borderColor: accent }]}><Ionicons name="swap-horizontal" size={21} color={accent} /><View style={{ flex: 1 }}><Text style={[styles.switchTitle, { color: accent }]}>Abrir modo {guardian ? 'dependente' : 'responsável'}</Text><Text style={styles.switchText}>Atalho de demonstração para testar os dois lados no mesmo aparelho.</Text></View></Pressable>
      </ScrollView>
      <BottomNav role={role} active="more" onNavigate={navigate} alertCount={openAlerts} />
    </Screen>
  );
}

function Menu({ icon, title, text, onPress, accent }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; onPress: () => void; accent: string }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.menu, { opacity: pressed ? 0.8 : 1 }]}><View style={[styles.menuIcon, { backgroundColor: `${accent}12` }]}><Ionicons name={icon} size={22} color={accent} /></View><View style={{ flex: 1 }}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuText}>{text}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 26 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 18 },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 43 },
  title: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  profileName: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 2 },
  role: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  group: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menu: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { color: colors.ink, fontSize: 13.5, fontWeight: '900' },
  menuText: { color: colors.muted, fontSize: 9.8, lineHeight: 13, marginTop: 3 },
  switch: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1.4, borderRadius: 17, padding: 14, marginTop: 15, backgroundColor: '#fff' },
  switchTitle: { fontWeight: '900', fontSize: 13 },
  switchText: { color: colors.muted, fontSize: 9.5, lineHeight: 13, marginTop: 3 },
});
