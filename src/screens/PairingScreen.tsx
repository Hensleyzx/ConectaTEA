import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function PairingScreen({ onBack }: { onBack: () => void }) {
  const { state, setLinked, generatePairingCode } = useApp();
  const [code, setCode] = useState('');
  const link = () => {
    const normalized = code.trim().toUpperCase();
    if (normalized !== state.pairingCode.toUpperCase()) return Alert.alert('Código não reconhecido', 'Confira o código exibido no perfil do dependente.');
    setLinked(true);
    Alert.alert('Perfis vinculados 💚', `${state.guardian.name} agora está vinculado(a) a ${state.dependent.name} neste protótipo local.`);
  };
  const unlink = () => Alert.alert('Remover vínculo?', 'O histórico local não será apagado, mas os perfis ficarão marcados como desvinculados.', [
    { text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => setLinked(false) },
  ]);
  return (
    <Screen keyboard>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Vincular perfis</Text><Text style={styles.sub}>O vínculo é o que permite ao responsável ver apenas os dados do dependente associado.</Text>
        <SectionCard style={[styles.status, { backgroundColor: state.linked ? colors.greenSoft : colors.redSoft, borderColor: state.linked ? '#CDEDD8' : '#FFD1D6' }]}>
          <View style={styles.statusRow}><Ionicons name={state.linked ? 'link' : 'unlink'} size={24} color={state.linked ? colors.green : colors.red} /><View style={{ flex: 1 }}><Text style={styles.statusTitle}>{state.linked ? 'Vínculo ativo' : 'Perfis ainda não vinculados'}</Text><Text style={styles.statusText}>{state.linked ? `${state.guardian.name} ↔ ${state.dependent.name}` : 'Use o código abaixo para simular a conexão.'}</Text></View></View>
        </SectionCard>
        <Text style={styles.section}>Código do dependente</Text>
        <View style={styles.codeCard}><Text style={styles.codeLabel}>CÓDIGO DE VÍNCULO</Text><Text selectable style={styles.code}>{state.pairingCode}</Text><Text style={styles.codeHelp}>Na versão online, este código será validado no servidor e poderá ter validade curta e uso único.</Text><PrimaryButton label="Gerar outro código" tone="outline" onPress={generatePairingCode} style={{ marginTop: 13 }} /></View>
        <Text style={styles.section}>Inserir código</Text>
        <View style={styles.inputRow}><TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="TEA-0000" placeholderTextColor="#9AA1B5" style={styles.input} /><Pressable onPress={link} style={styles.linkButton}><Ionicons name="arrow-forward" size={23} color="#fff" /></Pressable></View>
        {state.linked && <Pressable onPress={unlink} style={styles.unlink}><Ionicons name="unlink-outline" size={18} color={colors.red} /><Text style={styles.unlinkText}>Remover vínculo de demonstração</Text></Pressable>}
        <View style={styles.security}><Text style={styles.securityTitle}>🔐 Como deve funcionar na versão real</Text><Text style={styles.securityText}>• O responsável autentica a própria conta.{`\n`}• O dependente gera ou recebe um código temporário.{`\n`}• O backend valida os papéis antes de criar o vínculo.{`\n`}• As políticas RLS limitam cada responsável aos dependentes vinculados.{`\n`}• Remover o vínculo corta o acesso futuro sem apagar automaticamente o histórico.</Text></View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 28 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 6 },
  status: { marginTop: 17 },
  statusRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  statusTitle: { color: colors.ink, fontWeight: '900', fontSize: 14 },
  statusText: { color: colors.muted, fontSize: 10.5, marginTop: 3 },
  section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 21, marginBottom: 9 },
  codeCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 18, alignItems: 'center' },
  codeLabel: { color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  code: { color: colors.purple, fontSize: 35, fontWeight: '900', letterSpacing: 2.5, marginTop: 8 },
  codeHelp: { color: colors.muted, fontSize: 9.8, lineHeight: 14, textAlign: 'center', marginTop: 8, maxWidth: 300 },
  inputRow: { flexDirection: 'row', gap: 9 },
  input: { flex: 1, height: 54, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1.3, borderColor: colors.borderStrong, paddingHorizontal: 14, color: colors.ink, fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  linkButton: { width: 54, height: 54, borderRadius: 15, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  unlink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, padding: 14, marginTop: 9 },
  unlinkText: { color: colors.red, fontSize: 11, fontWeight: '900' },
  security: { backgroundColor: colors.skySoft, borderRadius: 17, padding: 14, marginTop: 16 },
  securityTitle: { color: colors.ink, fontWeight: '900', fontSize: 12 },
  securityText: { color: colors.muted, fontSize: 9.7, lineHeight: 16, marginTop: 7 },
});
