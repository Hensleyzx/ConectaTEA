import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme/colors';

export function Screen({ children, style, keyboard = false }: { children: React.ReactNode; style?: ViewStyle; keyboard?: boolean }) {
  const body = <View style={[styles.content, style]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {keyboard ? (
        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, backgroundColor: colors.background },
});
