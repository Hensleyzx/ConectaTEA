import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createInitialState } from '../data/demo';
import {
  AppSettings,
  AppState,
  HelpRequest,
  HelpStatus,
  HelpUrgency,
  MoodEntry,
  MoodId,
  RelaxSession,
  Role,
  RoutineItem,
  SensoryPreferences,
} from '../types/app';
import { dateKey } from '../utils/date';

const STORAGE_KEY = '@conectatea/state/v2';

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type MoodInput = Omit<MoodEntry, 'id' | 'createdAt'>;
type RoutineInput = Omit<RoutineItem, 'id' | 'completedDates'>;

type AppContextValue = {
  state: AppState;
  ready: boolean;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [ready, setReady] = useState(false);

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
        // Se o armazenamento estiver indisponível, o app continua com o modo local padrão.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state, ready]);

  const value = useMemo<AppContextValue>(() => ({
    state,
    ready,
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
      setState(fresh);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    },
  }), [state, ready]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp precisa estar dentro de AppProvider');
  return context;
}
