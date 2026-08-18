// Supabase Edge Function - send-help-notification
// Deploy depois de configurar Auth, schema.sql e credenciais de push do Expo/EAS.
// A função exige um usuário autenticado e só permite que o próprio dependente
// dispare a notificação de um help_request que pertence a ele.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Authentication required' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !anonKey || !serviceRole) return json({ error: 'Server configuration missing' }, 500);

    // Primeiro descobre quem está chamando com o próprio JWT do aplicativo.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: 'Invalid session' }, 401);

    const body = await req.json().catch(() => ({}));
    const helpRequestId = typeof body.help_request_id === 'string' ? body.help_request_id : '';
    if (!helpRequestId) return json({ error: 'help_request_id is required' }, 400);

    // A secret/service role fica exclusivamente no servidor/Edge Function.
    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const { data: help, error: helpError } = await admin
      .from('help_requests')
      .select('id, dependent_id, urgency, message, created_at, status')
      .eq('id', helpRequestId)
      .single();
    if (helpError || !help) return json({ error: 'Help request not found' }, 404);
    if (help.dependent_id !== userData.user.id) return json({ error: 'Forbidden' }, 403);

    const { data: dependent } = await admin.from('profiles').select('display_name').eq('id', help.dependent_id).single();
    const { data: links, error: linkError } = await admin.from('connections').select('guardian_id').eq('dependent_id', help.dependent_id);
    if (linkError) throw linkError;

    const guardianIds = [...new Set((links ?? []).map((row) => row.guardian_id))];
    if (!guardianIds.length) return json({ ok: true, sent: 0, reason: 'no_guardian_linked' });

    const { data: devices, error: deviceError } = await admin
      .from('notification_devices')
      .select('id, expo_push_token')
      .in('user_id', guardianIds)
      .eq('enabled', true);
    if (deviceError) throw deviceError;

    const validDevices = (devices ?? []).filter((d) => typeof d.expo_push_token === 'string' && d.expo_push_token.length > 10);
    if (!validDevices.length) return json({ ok: true, sent: 0, reason: 'no_registered_device' });

    const dependentName = dependent?.display_name || 'Seu dependente';
    const urgent = help.urgency === 'urgent';
    const messages = validDevices.slice(0, 100).map((device) => ({
      to: device.expo_push_token,
      sound: 'default',
      priority: urgent ? 'high' : 'default',
      title: urgent ? `⚠️ ${dependentName} precisa de ajuda` : `💙 ${dependentName} pediu apoio`,
      body: help.message || 'Abra o ConectaTEA para ver o pedido.',
      data: { type: 'help_request', helpRequestId: help.id, dependentId: help.dependent_id },
      channelId: urgent ? 'help-urgent' : 'help-support',
    }));

    const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
    const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(expoAccessToken ? { Authorization: `Bearer ${expoAccessToken}` } : {}),
      },
      body: JSON.stringify(messages),
    });
    const pushResult = await pushResponse.json().catch(() => ({}));
    if (!pushResponse.ok) return json({ error: 'Expo push service rejected request', details: pushResult }, 502);

    return json({ ok: true, sent: messages.length, tickets: pushResult.data ?? [] });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500);
  }
});

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
