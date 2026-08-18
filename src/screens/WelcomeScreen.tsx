import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';

export function WelcomeScreen({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  return (
    <Screen>
      <LinearGradient colors={['#FFFFFF', '#F6F1FF', '#EEF8FF']} style={styles.wrap}>
        <View style={styles.brand}>
          <Image source={require('../../assets/conectatea-mark.png')} style={styles.mark} />
          <Text style={styles.logoText}>Conecta<Text style={styles.tea}>TEA</Text></Text>
        </View>
        <Text style={styles.subtitle}>Mais conexão, mais autonomia e mais apoio no dia a dia 💙</Text>
        <View style={styles.hero}>
          <View style={styles.glow} />
          <Text style={styles.kid}>🧒🏻</Text>
          <Text style={[styles.float, { left: 22, top: 32 }]}>⭐</Text>
          <Text style={[styles.float, { right: 26, top: 36 }]}>☁️</Text>
          <Text style={[styles.float, { left: 44, bottom: 38 }]}>💚</Text>
          <Text style={[styles.float, { right: 35, bottom: 42 }]}>🎧</Text>
        </View>
        <View style={styles.messageCard}>
          <Text style={styles.pitch}>Um espaço feito para apoiar cada conquista</Text>
          <Text style={styles.pitchSub}>Rotina visual, emoções, comunicação, recursos sensoriais e conexão com quem cuida.</Text>
        </View>
        <PrimaryButton label="Vamos começar! 🚀" onPress={onStart} style={styles.button} />
        <Pressable onPress={onLogin} hitSlop={10}><Text style={styles.login}>Já tem uma conta? <Text style={styles.link}>Entrar</Text></Text></Pressable>
        <Text style={styles.disclaimer}>Ferramenta de apoio ao cotidiano. Não substitui acompanhamento profissional ou serviços de emergência.</Text>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingTop: 18, paddingBottom: 20 },
  brand: { alignItems: 'center' },
  mark: { width: 85, height: 85, resizeMode: 'contain' },
  logoText: { color: colors.navy, fontSize: 36, fontWeight: '900', marginTop: -4 },
  tea: { color: colors.cyan },
  subtitle: { marginTop: 10, color: colors.ink, fontSize: 15.5, lineHeight: 22, textAlign: 'center', fontWeight: '700', maxWidth: 330 },
  hero: { height: 205, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: '#E9DCFF' },
  kid: { fontSize: 116, zIndex: 2 },
  float: { position: 'absolute', fontSize: 34, zIndex: 3 },
  messageCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.74)', borderRadius: 20, padding: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.95)' },
  pitch: { fontSize: 21, fontWeight: '900', color: colors.ink, textAlign: 'center', lineHeight: 27 },
  pitchSub: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 19, marginTop: 7 },
  button: { width: '100%', marginTop: 18 },
  login: { marginTop: 17, color: colors.muted, fontWeight: '700' },
  link: { color: colors.purple, fontWeight: '900' },
  disclaimer: { color: colors.muted, fontSize: 9.5, textAlign: 'center', lineHeight: 14, marginTop: 15, maxWidth: 335 },
});
