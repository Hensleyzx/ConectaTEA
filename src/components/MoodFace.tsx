import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mood } from '../types/app';
import { colors } from '../theme/colors';

export function MoodFace({ mood, selected, onPress, compact = false }: { mood: Mood; selected?: boolean; onPress?: () => void; compact?: boolean }) {
  const content = (
    <View style={styles.wrap}>
      <View style={[compact ? styles.faceCompact : styles.face, { backgroundColor: mood.color }, selected && styles.selected]}>
        <Text style={compact ? styles.emojiCompact : styles.emoji}>{mood.emoji}</Text>
      </View>
      {!compact && <Text style={[styles.label, selected && { color: colors.purple }]}>{mood.label}</Text>}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, flex: 1 })}>{content}</Pressable> : content;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  face: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  faceCompact: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: colors.purple, transform: [{ scale: 1.06 }] },
  emoji: { fontSize: 29 },
  emojiCompact: { fontSize: 21 },
  label: { fontSize: 10.2, fontWeight: '800', color: colors.ink, textAlign: 'center', marginTop: 6 },
});
