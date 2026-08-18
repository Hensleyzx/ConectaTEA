import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { colors } from '../theme/colors';

type Source = number;

export function RelaxSoundCard({
  id,
  emoji,
  name,
  description,
  source,
  activeId,
  setActiveId,
  volume,
  onSession,
}: {
  id: string;
  emoji: string;
  name: string;
  description: string;
  source: Source;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  volume: number;
  onSession: (seconds: number) => void;
}) {
  const player = useAudioPlayer(source);
  const [playing, setPlaying] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    player.loop = true;
    player.volume = volume;
  }, [player, volume]);

  useEffect(() => {
    if (activeId !== id && playing) {
      player.pause();
      if (startedAt.current) onSession(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
      startedAt.current = null;
      setPlaying(false);
    }
  }, [activeId, id, onSession, player, playing]);

  const toggle = () => {
    if (playing) {
      player.pause();
      if (startedAt.current) onSession(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
      startedAt.current = null;
      setPlaying(false);
      setActiveId(null);
    } else {
      setActiveId(id);
      startedAt.current = Date.now();
      player.play();
      setPlaying(true);
    }
  };

  return (
    <View style={[styles.row, playing && styles.active]}>
      <View style={styles.icon}><Text style={styles.emoji}>{emoji}</Text></View>
      <View style={{ flex: 1 }}><Text style={styles.name}>{name}</Text><Text style={styles.description}>{description}</Text></View>
      <Pressable style={[styles.play, playing && styles.pause]} onPress={toggle} accessibilityLabel={playing ? `Pausar ${name}` : `Tocar ${name}`}>
        <Ionicons name={playing ? 'pause' : 'play'} size={21} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 78, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 10 },
  active: { borderColor: '#BDAAF1', backgroundColor: '#FBF9FF' },
  icon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5F7FB', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  emoji: { fontSize: 29 },
  name: { fontSize: 14.5, fontWeight: '900', color: colors.ink },
  description: { fontSize: 10.5, color: colors.muted, marginTop: 3, lineHeight: 14 },
  play: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  pause: { backgroundColor: colors.blue },
});
