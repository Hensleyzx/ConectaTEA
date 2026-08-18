import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';

export function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}><Image source={require('../../assets/conectatea-mark.png')} style={styles.logo} /><Text style={styles.name}>Conecta<Text style={{ color: colors.cyan }}>TEA</Text></Text><Text style={styles.version}>Protótipo funcional V3</Text></View>
        <SectionCard style={styles.card}><Text style={styles.cardTitle}>O objetivo</Text><Text style={styles.text}>Criar um espaço de apoio ao cotidiano de pessoas no espectro autista e suas famílias, com ferramentas visuais, comunicação, organização de rotina, autorregistro de emoções e pedidos de apoio.</Text></SectionCard>
        <SectionCard style={styles.card}><Text style={styles.cardTitle}>O que esta V3 já faz</Text><Bullet icon="checkmark-circle" text="Usa cadastro, login e sessão reais no Supabase." /><Bullet icon="checkmark-circle" text="Mantém cache local para os módulos ainda não sincronizados." /><Bullet icon="checkmark-circle" text="Registra humor, intensidade, contexto e necessidade." /><Bullet icon="checkmark-circle" text="Cria, edita, exclui e conclui atividades de rotina." /><Bullet icon="checkmark-circle" text="Toca seis sons ambientes incluídos no projeto." /><Bullet icon="checkmark-circle" text="Oferece respiração, grounding 5-4-3-2-1 e timer visual." /><Bullet icon="checkmark-circle" text="Lê cartões de comunicação em voz alta." /><Bullet icon="checkmark-circle" text="Faz o pedido de ajuda aparecer no painel do responsável no mesmo aparelho." /><Bullet icon="checkmark-circle" text="Gera relatórios a partir dos dados realmente registrados." /></SectionCard>
        <SectionCard style={styles.card}><Text style={styles.cardTitle}>Arquitetura planejada para produção</Text><View style={styles.arch}><Box title="APP" text="React Native + Expo" /><Text style={styles.arrow}>↓</Text><Box title="SERVIÇOS" text="Auth · Dados · Áudio · Notificações" /><Text style={styles.arrow}>↓</Text><Box title="BACKEND" text="Supabase Auth + Postgres + RLS + Realtime" /><Text style={styles.arrow}>↓</Text><Box title="DISPOSITIVOS" text="Dependente ↔ Responsável" /></View></SectionCard>
        <SectionCard style={[styles.card, { backgroundColor: colors.redSoft }]}><Text style={styles.cardTitle}>Limites importantes</Text><Text style={styles.text}>O ConectaTEA não é ferramenta de diagnóstico, não mede “grau de autismo”, não deve classificar emoções como certas ou erradas e não substitui atendimento profissional. O recurso “Preciso de ajuda” é comunicação com responsáveis, não um serviço de emergência.</Text></SectionCard>
        <SectionCard style={[styles.card, { backgroundColor: colors.skySoft }]}><Text style={styles.cardTitle}>Privacidade por design</Text><Text style={styles.text}>A fase online foi modelada para usar vínculo explícito entre contas, políticas de segurança no banco, separação entre dados do dependente e do responsável e o mínimo necessário de informações. Antes de uso real, ainda serão necessários termos, política de privacidade, revisão jurídica e testes de segurança.</Text></SectionCard>
      </ScrollView>
    </Screen>
  );
}

function Bullet({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) { return <View style={styles.bullet}><Ionicons name={icon} size={18} color={colors.green} /><Text style={styles.bulletText}>{text}</Text></View>; }
function Box({ title, text }: { title: string; text: string }) { return <View style={styles.box}><Text style={styles.boxTitle}>{title}</Text><Text style={styles.boxText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 30 },
  brand: { alignItems: 'center', marginTop: 5, marginBottom: 14 },
  logo: { width: 90, height: 90, resizeMode: 'contain' },
  name: { color: colors.navy, fontSize: 30, fontWeight: '900', marginTop: -4 },
  version: { color: colors.muted, fontSize: 10.5, fontWeight: '800', marginTop: 3 },
  card: { marginBottom: 11 },
  cardTitle: { color: colors.ink, fontSize: 14.5, fontWeight: '900', marginBottom: 7 },
  text: { color: colors.muted, fontSize: 10.7, lineHeight: 16 },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 7 },
  bulletText: { flex: 1, color: colors.ink, fontSize: 10.5, lineHeight: 15 },
  arch: { alignItems: 'center', marginTop: 5 },
  box: { width: '100%', borderRadius: 14, backgroundColor: '#F7F8FC', borderWidth: 1, borderColor: colors.border, padding: 11, alignItems: 'center' },
  boxTitle: { color: colors.purple, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  boxText: { color: colors.ink, fontSize: 11.5, fontWeight: '800', marginTop: 3 },
  arrow: { color: colors.muted, fontSize: 18, marginVertical: 3 },
});
