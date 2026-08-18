import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Screen } from './Screen';
import { colors } from '../theme/colors';

export function LoadingScreen() {
  return (
    <Screen>
      <View style={styles.wrap}>
        <Image source={require('../../assets/conectatea-mark.png')} style={styles.logo} />
        <ActivityIndicator size="large" color={colors.purple} />
        <Text style={styles.text}>Preparando seu espaço...</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  text: { color: colors.muted, fontWeight: '800' },
});
