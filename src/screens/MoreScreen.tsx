import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { Screen } from '../components/Screen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { Role } from '../types/app';

export function MoreScreen({ navigate }: { navigate: (screen: string) => void }) {
  const { state, authRole, authEmail, signOut } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);
  const role: Role = authRole ?? state.lastRole ?? 'dependent';
  const guardian = role === 'guardian';
  const accent = guardian ? colors.green : colors.purple;
  const openAlerts = state.helpRequests.filter((h) => h.status !== 'resolved').length;

  const logout = () => {
    Alert.alert('Sair da conta?', 'Você precisará entrar novamente com e-mail e senha.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await signOut();
            navigate('welcome');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppHeader onBell={guardian ? () => navigate('guardian-alerts') : () => navigate('help')} notificationCount={guardian ? openAlerts : 0} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: `${accent}16` }]}><Text style={styles.avatarEmoji}>{guardian ? state.guardian.avatar : state.dependent.avatar}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Mais opções</Text>
            <Text style={styles.profileName}>{guardian ? state.guardian.name : state.dependent.name}</Text>
            <Text style={[styles.role, { color: accent }]}>{guardian ? 'Responsável' : 'Dependente'}</Text>
            {!!authEmail && <Text style={styles.email} numberOfLines={1}>{authEmail}</Text>}
          </View>
        </View>

        <View style={styles.sessionCard}>
          <Ionicons name="shield-checkmark-outline" size={21} color={colors.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>Sessão protegida pelo Supabase</Text>
            <Text style={styles.sessionText}>Seu tipo de conta é conferido no banco antes de abrir a área de dependente ou responsável.</Text>
          </View>
        </View>

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

        <Pressable disabled={loggingOut} onPress={logout} style={({ pressed }) => [styles.logout, { opacity: loggingOut ? 0.5 : pressed ? 0.78 : 1 }]}>
          <Ionicons name="log-out-outline" size={21} color={colors.red} />
          <View style={{ flex: 1 }}>
            <Text style={styles.logoutTitle}>{loggingOut ? 'Saindo...' : 'Sair da conta'}</Text>
            <Text style={styles.logoutText}>Encerra a sessão neste aparelho sem apagar seus registros.</Text>
          </View>
        </Pressable>
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
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 14 },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 43 },
  title: { color: colors.ink, fontSize: 24, fontWeight: '900' },
  profileName: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 2 },
  role: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  email: { color: colors.muted, fontSize: 10, marginTop: 3, maxWidth: 230 },
  sessionCard: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#EFFAF4', borderRadius: 16, padding: 13, marginBottom: 15 },
  sessionTitle: { color: colors.ink, fontSize: 12.5, fontWeight: '900' },
  sessionText: { color: colors.muted, fontSize: 9.8, lineHeight: 13.5, marginTop: 3 },
  group: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menu: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { color: colors.ink, fontSize: 13.5, fontWeight: '900' },
  menuText: { color: colors.muted, fontSize: 9.8, lineHeight: 13, marginTop: 3 },
  logout: { flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1.4, borderColor: '#F4B6B6', borderRadius: 17, padding: 14, marginTop: 15, backgroundColor: '#FFF8F8' },
  logoutTitle: { color: colors.red, fontWeight: '900', fontSize: 13 },
  logoutText: { color: colors.muted, fontSize: 9.5, lineHeight: 13, marginTop: 3 },
});
