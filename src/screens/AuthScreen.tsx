import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { Role } from '../types/app';
import { useApp } from '../context/AppContext';

export function AuthScreen({ role, register, onBack, onDone, onSwitch }: { role: Role; register: boolean; onBack: () => void; onDone: () => void; onSwitch: () => void }) {
  const { updateDependentName, updateGuardianName, setRole } = useApp();
  const guardian = role === 'guardian';
  const accent = guardian ? colors.green : colors.purple;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = () => {
    if (register && name.trim().length < 2) return Alert.alert('Confira o nome', 'Digite um nome com pelo menos 2 caracteres.');
    if (guardian && !email.includes('@')) return Alert.alert('Confira o e-mail', 'Digite um e-mail válido para continuar.');
    if (password.length > 0 && password.length < 4) return Alert.alert('Senha muito curta', 'Para esta demonstração use pelo menos 4 caracteres.');
    if (register && password !== confirm) return Alert.alert('Senhas diferentes', 'A confirmação da senha precisa ser igual.');
    if (register && name.trim()) guardian ? updateGuardianName(name) : updateDependentName(name);
    setRole(role);
    onDone();
  };

  return (
    <Screen keyboard>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} style={styles.back} hitSlop={10}><Ionicons name="chevron-back" size={28} color={colors.ink} /></Pressable>
        <View style={[styles.avatar, { backgroundColor: `${accent}15` }]}><Text style={styles.emoji}>{guardian ? '👩🏻' : '🧒🏻'}</Text></View>
        <Text style={[styles.title, { color: accent }]}>{register ? 'Criar conta' : `Login do ${guardian ? 'responsável' : 'dependente'}`}</Text>
        <Text style={styles.subtitle}>{guardian ? 'Acompanhe e apoie cada conquista 💚' : 'Um espaço simples para sua jornada 💜'}</Text>

        {register && <Field icon="person-outline" placeholder={guardian ? 'Nome completo' : 'Como quer ser chamado(a)'} value={name} onChangeText={setName} />}
        {guardian && <Field icon="mail-outline" placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />}
        {!guardian && !register && <Field icon="person-outline" placeholder="Nome de usuário" value={name} onChangeText={setName} />}
        {!guardian && register && <Field icon="calendar-outline" placeholder="Data de nascimento (opcional)" value={email} onChangeText={setEmail} />}
        <View style={styles.passwordWrap}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.muted} />
          <TextInput placeholder="Senha" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={styles.passwordInput} placeholderTextColor="#9AA1B5" />
          <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}><Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} /></Pressable>
        </View>
        {register && <Field icon="lock-closed-outline" placeholder="Confirmar senha" value={confirm} onChangeText={setConfirm} secureTextEntry />}
        {!register && <Text style={[styles.forgot, { color: accent }]}>Esqueci minha senha</Text>}

        <PrimaryButton label={register ? 'Criar conta  →' : 'Entrar  →'} tone={guardian ? 'green' : 'purple'} onPress={submit} style={styles.button} />
        <Pressable onPress={onSwitch}><Text style={styles.switch}>{register ? 'Já tem uma conta? ' : 'Não tem uma conta? '}<Text style={{ color: accent, fontWeight: '900' }}>{register ? 'Entrar' : 'Criar conta'}</Text></Text></Pressable>
        <View style={styles.local}><Ionicons name="phone-portrait-outline" size={17} color={colors.blue} /><Text style={styles.localText}><Text style={{ fontWeight: '900' }}>Modo local funcional:</Text> nesta versão, registros ficam salvos no aparelho. Ao conectar o Supabase, as contas passam a sincronizar entre celulares.</Text></View>
      </ScrollView>
    </Screen>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { icon: keyof typeof Ionicons.glyphMap }) {
  const { icon, style, ...rest } = props;
  return <View style={styles.field}><Ionicons name={icon} size={20} color={colors.muted} /><TextInput {...rest} style={[styles.fieldInput, style]} placeholderTextColor="#9AA1B5" /></View>;
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: 25, paddingTop: 10, paddingBottom: 28, alignItems: 'center' },
  back: { alignSelf: 'flex-start', width: 44, height: 44, justifyContent: 'center' },
  avatar: { width: 118, height: 118, borderRadius: 59, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  emoji: { fontSize: 70 },
  title: { fontSize: 25, fontWeight: '900', marginTop: 13, textAlign: 'center' },
  subtitle: { color: colors.ink, marginTop: 7, marginBottom: 21, fontSize: 14.5, fontWeight: '600', textAlign: 'center' },
  field: { width: '100%', minHeight: 56, borderWidth: 1.3, borderColor: colors.border, backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  fieldInput: { flex: 1, fontSize: 15.5, color: colors.ink, paddingVertical: 14 },
  passwordWrap: { width: '100%', minHeight: 56, borderWidth: 1.3, borderColor: colors.border, backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  passwordInput: { flex: 1, fontSize: 15.5, color: colors.ink, paddingVertical: 14 },
  forgot: { fontWeight: '800', marginTop: 2 },
  button: { width: '100%', marginTop: 17 },
  switch: { marginTop: 22, color: colors.muted, fontWeight: '700' },
  local: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.skySoft, borderRadius: 14, padding: 12, marginTop: 19 },
  localText: { flex: 1, color: colors.muted, fontSize: 10.5, lineHeight: 15 },
});
