import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerGuardianDeviceForPush(userId: string) {
  if (!supabase) return { ok: false as const, reason: 'supabase_not_configured' as const };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('help-urgent', {
      name: 'Pedidos urgentes de ajuda',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 350, 200, 350],
    });
    await Notifications.setNotificationChannelAsync('help-support', {
      name: 'Pedidos de apoio',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200],
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const permission = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return { ok: false as const, reason: 'permission_denied' as const };

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return { ok: false as const, reason: 'eas_project_id_missing' as const };

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const { error } = await supabase.from('notification_devices').upsert(
    { user_id: userId, expo_push_token: token, platform: Platform.OS, enabled: true, last_seen_at: new Date().toISOString() },
    { onConflict: 'user_id,expo_push_token' },
  );
  if (error) throw error;

  return { ok: true as const, token };
}

export async function invokeHelpPush(helpRequestId: string) {
  if (!supabase) return { ok: false as const, reason: 'supabase_not_configured' as const };
  const { data, error } = await supabase.functions.invoke('send-help-notification', {
    body: { help_request_id: helpRequestId },
  });
  if (error) throw error;
  return { ok: true as const, data };
}

export async function showLocalNotification(title: string, body: string) {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== 'granted') return false;
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: null,
  });
  return true;
}
