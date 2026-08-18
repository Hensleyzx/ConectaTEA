import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Role } from '../types/app';

const dependent = [
  ['home-outline', 'Início', 'dependent-home'],
  ['calendar-outline', 'Rotina', 'routine'],
  ['leaf-outline', 'Relaxar', 'relax'],
  ['chatbubbles-outline', 'Comunicar', 'communicate'],
  ['grid-outline', 'Mais', 'more'],
] as const;

const guardian = [
  ['home-outline', 'Início', 'guardian-home'],
  ['happy-outline', 'Humor', 'guardian-moods'],
  ['calendar-outline', 'Rotina', 'guardian-routine'],
  ['notifications-outline', 'Alertas', 'guardian-alerts'],
  ['grid-outline', 'Mais', 'more'],
] as const;

export function BottomNav({ role, active, onNavigate, alertCount = 0 }: { role: Role; active: string; onNavigate: (screen: string) => void; alertCount?: number }) {
  const items = role === 'guardian' ? guardian : dependent;
  const accent = role === 'guardian' ? colors.green : colors.purple;
  return (
    <View style={styles.bar}>
      {items.map(([icon, label, key]) => {
        const selected = active === key;
        const showBadge = key === 'guardian-alerts' && alertCount > 0;
        return (
          <Pressable key={key} accessibilityRole="button" accessibilityLabel={label} style={styles.item} onPress={() => onNavigate(key)}>
            <View>
              <Ionicons name={icon} size={22} color={selected ? accent : colors.muted} />
              {showBadge && <View style={styles.badge}><Text style={styles.badgeText}>{alertCount > 9 ? '9+' : alertCount}</Text></View>}
            </View>
            <Text style={[styles.label, selected && { color: accent }]} numberOfLines={1}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 76, flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: 7, paddingTop: 5 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 0 },
  label: { fontSize: 9.5, color: colors.muted, fontWeight: '800' },
  badge: { position: 'absolute', right: -10, top: -7, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
});
