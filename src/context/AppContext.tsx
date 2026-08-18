import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createInitialState } from '../data/demo';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import {
  AppSettings,
  AppState,
  HelpRequest,
  HelpStatus,
  HelpUrgency,
  MoodEntry,
  RelaxSession,
  Role,
  RoutineItem,
  SensoryPreferences,
} from '../types/app';
import { dateKey } from '../utils/date';

const STORAGE_KEY = '@conectatea/state/v3';

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type MoodInput = Omit<MoodEntry, 'id' | 'createdAt'>;
type RoutineInput = Omit<RoutineItem, 'id' | 'completedDates'>;
type AuthResult = {
  ok: boolean;
  message?: string;
  needsEmailConfirmation?: boolean;
};

type ProfileRow = {
  role: Role;
  display_name: string;
  avatar_emoji?: string | null;
};

type AppContextValue = {
  state: AppState;
  ready: boolean;
  onlineMode: boolean;
  authUserId: string | null;
  authEmail: string | null;
  authRole: Role | null;
  signIn: (email: string, password: string, expectedRole: Role) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  saveProfileName: (name: string) => Promise<AuthResult>;
  setRole: (role: Role) => void;
  updateDependentName: (name: string) => void;
  updateGuardianName: (name: string) => void;
  addMood: (input: MoodInput) => MoodEntry;
  addRoutine: (input: RoutineInput) => RoutineItem;
  updateRoutine: (id: string, changes: Partial<RoutineItem>) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutineToday: (id: string) => void;
  createHelpRequest: (urgency: HelpUrgency, message: string) => HelpRequest;
  setHelpStatus: (id: string, status: HelpStatus) => void;
  addRelaxSession: (tool: string, durationSeconds: number) => RelaxSession;
  updateSensory: (changes: Partial<SensoryPreferences>) => void;
  updateSettings: (changes: Partial<AppSettings>) => void;
  setLinked: (linked: boolean) => void;
  generatePairingCode: () => void;
  resetDemo: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (normalized.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (normalized.includes('user already registered')) return 'Já existe uma conta com este e-mail.';
  if (normalized.includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (normalized.includes('signup is disabled')) return 'O cadastro está desativado no Supabase.';
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  return message || 'Não foi possível concluir a autenticação.';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [localReady, setLocalReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authRole, setAuthRole] = useState<Role | null>(null);

  const applyProfile = (profile: ProfileRow, fallbackName?: string | null) => {
    const role = profile.role;
    const name = profile.display_name?.trim() || fallbackName?.trim() || '';

    setAuthRole(role);
    setState((old) => ({
      ...old,
      lastRole: role,
      dependent: role === 'dependent' && name
        ? { ...old.dependent, name, avatar: profile?.avatar_emoji || old.dependent.avatar }
        : old.dependent,
      guardian: role === 'guardian' && name
        ? { ...old.guardian, name, avatar: profile?.avatar_emoji || old.guardian.avatar }
        : old.guardian,
    }));
  };

  const fetchOwnProfile = async (userId: string): Promise<ProfileRow | null> => {
    const client = supabase;
    if (!client) return null;
    const { data, error } = await client
      .from('profiles')
      .select('role, display_name, avatar_emoji')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return (data as ProfileRow | null) ?? null;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && active) {
          const parsed = JSON.parse(saved) as AppState;
          setState({ ...createInitialState(), ...parsed });
        }
      } catch {
        // Se o armazenamento estiver indisponível, o app continua com os dados locais padrão.
      } finally {
        if (active) setLocalReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!localReady) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state, localReady]);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setAuthReady(true);
      return;
    }

    let active = true;

    const syncUser = async (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null) => {
      if (!active) return;
      if (!user) {
        setAuthUserId(null);
        setAuthEmail(null);
        setAuthRole(null);
        setAuthReady(true);
        return;
      }

      setAuthUserId(user.id);
      setAuthEmail(user.email ?? null);

      setAuthRole(null);
      const profile = await fetchOwnProfile(user.id);
      if (!active) return;

      if (profile) {
        const fallbackName = typeof user.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : null;
        applyProfile(profile, fallbackName);
      }
      setAuthReady(true);
    };

    client.auth.getSession().then(({ data }) => {
      void syncUser(data.session?.user ?? null);
    }).catch(() => {
      if (active) setAuthReady(true);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    state,
    ready: localReady && authReady,
    onlineMode: isSupabaseConfigured,
    authUserId,
    authEmail,
    authRole,
    signIn: async (email, password, expectedRole) => {
      const client = supabase;
      if (!client) return { ok: false, message: 'Supabase não configurado. Crie o arquivo .env na raiz do projeto.' };

      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error || !data.user) return { ok: false, message: friendlyAuthError(error?.message ?? '') };

      const profile = await fetchOwnProfile(data.user.id);
      const role = profile?.role ?? null;
      if (!profile || !role) {
        await client.auth.signOut();
        return { ok: false, message: 'O usuário existe, mas o perfil do ConectaTEA não foi encontrado. Verifique o trigger de profiles no Supabase.' };
      }
      if (role !== expectedRole) {
        await client.auth.signOut();
        return {
          ok: false,
          message: role === 'guardian'
            ? 'Esta conta foi cadastrada como responsável. Entre pela opção Responsável.'
            : 'Esta conta foi cadastrada como dependente. Entre pela opção Dependente.',
        };
      }

      setAuthUserId(data.user.id);
      setAuthEmail(data.user.email ?? null);
      applyProfile(profile, typeof data.user.user_metadata?.display_name === 'string' ? data.user.user_metadata.display_name : null);
      return { ok: true };
    },
    signUp: async (name, email, password, role) => {
      const client = supabase;
      if (!client) return { ok: false, message: 'Supabase não configurado. Crie o arquivo .env na raiz do projeto.' };

      const cleanName = name.trim();
      const { data, error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            role,
            display_name: cleanName,
          },
        },
      });

      if (error) return { ok: false, message: friendlyAuthError(error.message) };
      if (!data.user) return { ok: false, message: 'O Supabase não retornou o usuário criado.' };

      if (!data.session) {
        return {
          ok: true,
          needsEmailConfirmation: true,
          message: 'Conta criada. Abra o e-mail de confirmação antes de entrar.',
        };
      }

      const profile = await fetchOwnProfile(data.user.id);
      if (!profile) {
        await client.auth.signOut();
        return { ok: false, message: 'A conta foi criada, mas o perfil não apareceu no banco. Verifique o trigger on_auth_user_created no Supabase.' };
      }
      setAuthUserId(data.user.id);
      setAuthEmail(data.user.email ?? null);
      applyProfile(profile, cleanName);
      return { ok: true };
    },
    signOut: async () => {
      const client = supabase;
      if (client) await client.auth.signOut();
      setAuthUserId(null);
      setAuthEmail(null);
      setAuthRole(null);
    },
    saveProfileName: async (name) => {
      const client = supabase;
      const cleanName = name.trim();
      if (cleanName.length < 2) return { ok: false, message: 'Digite um nome com pelo menos 2 caracteres.' };
      if (!client || !authUserId || !authRole) return { ok: false, message: 'Entre na sua conta para atualizar o perfil.' };

      const { error } = await client
        .from('profiles')
        .update({ display_name: cleanName })
        .eq('id', authUserId);
      if (error) return { ok: false, message: error.message };

      setState((old) => ({
        ...old,
        dependent: authRole === 'dependent' ? { ...old.dependent, name: cleanName } : old.dependent,
        guardian: authRole === 'guardian' ? { ...old.guardian, name: cleanName } : old.guardian,
      }));
      return { ok: true };
    },
    setRole: (role) => setState((old) => ({ ...old, lastRole: role })),
    updateDependentName: (name) => setState((old) => ({ ...old, dependent: { ...old.dependent, name: name.trim() || old.dependent.name } })),
    updateGuardianName: (name) => setState((old) => ({ ...old, guardian: { ...old.guardian, name: name.trim() || old.guardian.name } })),
    addMood: (input) => {
      const entry: MoodEntry = { id: uid('mood'), ...input, createdAt: new Date().toISOString() };
      setState((old) => ({ ...old, moods: [entry, ...old.moods] }));
      return entry;
    },
    addRoutine: (input) => {
      const item: RoutineItem = { id: uid('routine'), ...input, completedDates: [] };
      setState((old) => ({ ...old, routine: [...old.routine, item].sort((a, b) => a.time.localeCompare(b.time)) }));
      return item;
    },
    updateRoutine: (id, changes) => setState((old) => ({
      ...old,
      routine: old.routine.map((item) => item.id === id ? { ...item, ...changes } : item).sort((a, b) => a.time.localeCompare(b.time)),
    })),
    deleteRoutine: (id) => setState((old) => ({ ...old, routine: old.routine.filter((item) => item.id !== id) })),
    toggleRoutineToday: (id) => setState((old) => {
      const today = dateKey();
      return {
        ...old,
        routine: old.routine.map((item) => {
          if (item.id !== id) return item;
          const completed = item.completedDates.includes(today);
          return {
            ...item,
            completedDates: completed ? item.completedDates.filter((d) => d !== today) : [...item.completedDates, today],
          };
        }),
      };
    }),
    createHelpRequest: (urgency, message) => {
      const request: HelpRequest = {
        id: uid('help'),
        urgency,
        message: message.trim() || (urgency === 'urgent' ? 'Preciso de ajuda agora.' : 'Preciso de apoio.'),
        createdAt: new Date().toISOString(),
        status: 'open',
      };
      setState((old) => ({ ...old, helpRequests: [request, ...old.helpRequests] }));
      return request;
    },
    setHelpStatus: (id, status) => setState((old) => ({
      ...old,
      helpRequests: old.helpRequests.map((request) => {
        if (request.id !== id) return request;
        const now = new Date().toISOString();
        return {
          ...request,
          status,
          acknowledgedAt: status === 'acknowledged' || status === 'resolved' ? request.acknowledgedAt ?? now : request.acknowledgedAt,
          resolvedAt: status === 'resolved' ? now : request.resolvedAt,
        };
      }),
    })),
    addRelaxSession: (tool, durationSeconds) => {
      const session: RelaxSession = { id: uid('relax'), tool, durationSeconds, createdAt: new Date().toISOString() };
      setState((old) => ({ ...old, relaxSessions: [session, ...old.relaxSessions] }));
      return session;
    },
    updateSensory: (changes) => setState((old) => ({ ...old, sensory: { ...old.sensory, ...changes } })),
    updateSettings: (changes) => setState((old) => ({ ...old, settings: { ...old.settings, ...changes } })),
    setLinked: (linked) => setState((old) => ({ ...old, linked })),
    generatePairingCode: () => setState((old) => ({ ...old, pairingCode: `TEA-${Math.floor(1000 + Math.random() * 9000)}` })),
    resetDemo: async () => {
      const fresh = createInitialState();
      if (authRole) fresh.lastRole = authRole;
      setState(fresh);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    },
  }), [state, localReady, authReady, authUserId, authEmail, authRole]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa estar dentro de AppProvider');
  return context;
}
