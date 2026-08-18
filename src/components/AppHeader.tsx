import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export function AppHeader({
  onBack,
  onMenu,
  onBell,
  notificationCount = 0,
  title = 'ConectaTEA',
}: {
  onBack?: () => void;
  onMenu?: () => void;
  onBell?: () => void;
  notificationCount?: number;
  title?: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable hitSlop={10} onPress={onBack}><Ionicons name="chevron-back" size={27} color={colors.ink} /></Pressable>
        ) : onMenu ? (
          <Pressable hitSlop={10} onPress={onMenu}><Ionicons name="menu-outline" size={27} color={colors.ink} /></Pressable>
        ) : <View />}
      </View>
      <View style={styles.brand}>
        <Image source={require('../../assets/conectatea-mark.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandText}>{title}</Text>
      </View>
      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {onBell ? (
          <Pressable hitSlop={10} onPress={onBell}>
            <Ionicons name="notifications-outline" size={25} color={colors.ink} />
            {notificationCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text></View>}
          </Pressable>
        ) : <View />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  side: { width: 46, justifyContent: 'center' },
  brand: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  logo: { width: 29, height: 29 },
  brandText: { color: colors.navy, fontSize: 17, fontWeight: '900' },
  badge: { position: 'absolute', right: -7, top: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.red, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});
