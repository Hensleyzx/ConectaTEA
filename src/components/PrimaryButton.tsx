import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme/colors';

export function PrimaryButton({
  label,
  onPress,
  tone = 'purple',
  style,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  tone?: 'purple' | 'green' | 'blue' | 'red' | 'outline';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}) {
  if (tone === 'outline') {
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.base, styles.outline, style, { opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }]}>
        {loading ? <ActivityIndicator color={colors.purple} /> : <Text style={styles.outlineText}>{label}</Text>}
      </Pressable>
    );
  }
  const gradient = tone === 'green' ? gradients.guardian : tone === 'red' ? gradients.help : tone === 'blue' ? ['#4388FF', '#246BFD'] as const : gradients.dependent;
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [style, { opacity: disabled ? 0.45 : pressed ? 0.86 : 1 }]}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  text: { color: '#fff', fontSize: 17, fontWeight: '900' },
  outline: { borderWidth: 1.5, borderColor: colors.purple, backgroundColor: '#fff' },
  outlineText: { color: colors.purple, fontSize: 16, fontWeight: '900' },
});
