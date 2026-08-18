import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function ToggleRow({ title, description, value, onValueChange, accent = colors.purple }: { title: string; description?: string; value: boolean; onValueChange: (v: boolean) => void; accent?: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: accent, false: '#D7DCE7' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
});
