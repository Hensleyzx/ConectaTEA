import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

function RoleCard({ emoji, title, text, bullets, color, onPress }: { emoji: string; title: string; text: string; bullets: string[]; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.86 : 1 }]}>
      <View style={[styles.avatar, { backgroundColor: `${color}18` }]}><Text style={styles.emoji}>{emoji}</Text></View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
        <View style={styles.chips}>{bullets.map((b) => <View key={b} style={[styles.chip, { backgroundColor: `${color}12` }]}><Text style={[styles.chipText, { color }]}>{b}</Text></View>)}</View>
      </View>
      <View style={[styles.arrow, { backgroundColor: color }]}><Ionicons name="arrow-forward" size={21} color="#fff" /></View>
    </Pressable>
  );
}

export function RoleScreen({ onDependent, onGuardian, onBack }: { onDependent: () => void; onGuardian: () => void; onBack: () => void }) {
  return (
    <Screen>
      <View style={styles.wrap}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.back}><Ionicons name="chevron-back" size={28} color={colors.ink} /></Pressable>
        <Text style={styles.title}>Para quem é esta conta?</Text>
        <Text style={styles.subtitle}>Cada perfil recebe uma experiência diferente, sem misturar funções.</Text>
        <RoleCard emoji="🧒🏻" title="Sou o dependente" text="Quero me organizar, comunicar como estou e encontrar ferramentas para me regular." bullets={['Rotina', 'Emoções', 'Relaxar']} color={colors.purple} onPress={onDependent} />
        <RoleCard emoji="👩🏻" title="Sou responsável" text="Quero acompanhar registros, rotina e pedidos de apoio de forma simples." bullets={['Acompanhar', 'Relatórios', 'Alertas']} color={colors.green} onPress={onGuardian} />
        <View style={styles.security}><Ionicons name="shield-checkmark-outline" size={18} color={colors.blue} /><Text style={styles.securityText}>O projeto já está preparado para contas vinculadas e regras de privacidade.</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 22, paddingTop: 13 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  title: { fontSize: 29, fontWeight: '900', color: colors.ink, marginTop: 10 },
  subtitle: { fontSize: 15, lineHeight: 21, color: colors.muted, marginTop: 8, marginBottom: 22 },
  card: { backgroundColor: '#fff', borderRadius: 23, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border, minHeight: 176 },
  avatar: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  emoji: { fontSize: 55 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 19, fontWeight: '900' },
  cardText: { color: colors.ink, lineHeight: 18, marginTop: 5, fontSize: 12.5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  chip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  chipText: { fontSize: 9.5, fontWeight: '900' },
  arrow: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
  security: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 'auto', marginBottom: 20, paddingHorizontal: 8 },
  securityText: { flex: 1, color: colors.muted, fontSize: 11.5, lineHeight: 16 },
});
