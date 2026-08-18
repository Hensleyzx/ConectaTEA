import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ToggleRow } from '../components/ToggleRow';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { state, authRole, authEmail, updateSettings, saveProfileName, resetDemo } = useApp();
  const role = authRole ?? state.lastRole ?? 'dependent';
  const guardian = role === 'guardian';
  const accent = guardian ? colors.green : colors.purple;
  const [name, setName] = useState(guardian ? state.guardian.name : state.dependent.name);
  const [savingName, setSavingName] = useState(false);

  const saveName = async () => {
    setSavingName(true);
    try {
      const result = await saveProfileName(name);
      Alert.alert(result.ok ? 'Perfil atualizado' : 'Não foi possível salvar', result.ok ? 'O nome foi atualizado no Supabase e neste aparelho.' : (result.message || 'Tente novamente.'));
    } finally {
      setSavingName(false);
    }
  };

  const reset = () => Alert.alert('Restaurar dados locais?', 'Isso apaga os registros locais criados durante os testes e volta aos dados iniciais. Sua conta do Supabase não será apagada.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Restaurar', style: 'destructive', onPress: () => resetDemo() },
  ]);

  return (
    <Screen keyboard>
      <AppHeader onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Perfil e preferências</Text>
        <Text style={styles.sub}>A conta e o nome do perfil já usam o Supabase. As demais preferências ainda ficam no aparelho nesta etapa.</Text>

        <Text style={styles.section}>Perfil online</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{guardian ? 'Nome do responsável' : 'Nome exibido'}</Text>
          <View style={styles.nameRow}>
            <TextInput value={name} onChangeText={setName} style={styles.input} maxLength={50} />
            <Pressable disabled={savingName} onPress={saveName} style={[styles.save, { backgroundColor: accent, opacity: savingName ? 0.55 : 1 }]}>
              <Ionicons name={savingName ? 'hourglass-outline' : 'checkmark'} size={22} color="#fff" />
            </Pressable>
          </View>
          {!!authEmail && <Text style={styles.accountEmail}>Conta: {authEmail}</Text>}
        </View>

        <Text style={styles.section}>Experiência</Text>
        <View style={styles.card}>
          <ToggleRow title="Modo simples" description="Esconde campos extras no registro de humor e reduz decisões na tela." value={state.settings.simpleMode} onValueChange={(v) => updateSettings({ simpleMode: v })} accent={accent} />
          <ToggleRow title="Lembretes de rotina" description="Preferência salva para os avisos de rotina quando as notificações forem ativadas." value={state.settings.routineReminders} onValueChange={(v) => updateSettings({ routineReminders: v })} accent={accent} />
          <ToggleRow title="Celebrações discretas" description="Permite feedback positivo leve ao concluir tarefas, sem transformar rotina em competição." value={state.settings.showCelebrations} onValueChange={(v) => updateSettings({ showCelebrations: v })} accent={accent} />
          {guardian && <ToggleRow title="Alertas do responsável" description="Preferência para receber notificações de pedidos de ajuda no modo online." value={state.settings.guardianAlerts} onValueChange={(v) => updateSettings({ guardianAlerts: v })} accent={accent} />}
        </View>

        <Text style={styles.section}>Dados desta etapa</Text>
        <View style={styles.card}>
          <Text style={styles.dataTitle}>Supabase + armazenamento local</Text>
          <Text style={styles.dataText}>Cadastro, login, sessão e nome do perfil já são reais no Supabase. Humores, rotina, preferências, relaxamento e pedidos de ajuda continuam no AsyncStorage até a próxima etapa de sincronização.</Text>
          <PrimaryButton label="Restaurar somente dados locais" tone="outline" onPress={reset} style={{ marginTop: 13 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 19, paddingBottom: 28 },
  title: { color: colors.ink, fontSize: 26, fontWeight: '900', marginTop: 5 },
  sub: { color: colors.muted, fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  section: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 20, marginBottom: 9 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 4 },
  label: { color: colors.ink, fontSize: 11, fontWeight: '900', marginTop: 12, marginBottom: 7 },
  nameRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, height: 49, backgroundColor: colors.background, borderRadius: 13, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, color: colors.ink, fontSize: 14 },
  save: { width: 49, height: 49, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  accountEmail: { color: colors.muted, fontSize: 10, marginBottom: 12 },
  dataTitle: { color: colors.ink, fontWeight: '900', fontSize: 13, marginTop: 12 },
  dataText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5 },
});
