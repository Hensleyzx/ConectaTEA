import React, { useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './src/context/AppContext';
import { AboutScreen } from './src/screens/AboutScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { BreathingScreen } from './src/screens/BreathingScreen';
import { CommunicateScreen } from './src/screens/CommunicateScreen';
import { DependentHomeScreen } from './src/screens/DependentHomeScreen';
import { GroundingScreen } from './src/screens/GroundingScreen';
import { FirstThenScreen } from './src/screens/FirstThenScreen';
import { CalmPlanScreen } from './src/screens/CalmPlanScreen';
import { GuardianAlertsScreen } from './src/screens/GuardianAlertsScreen';
import { GuardianHomeScreen } from './src/screens/GuardianHomeScreen';
import { GuardianMoodsScreen } from './src/screens/GuardianMoodsScreen';
import { GuardianReportsScreen } from './src/screens/GuardianReportsScreen';
import { GuardianRoutineScreen } from './src/screens/GuardianRoutineScreen';
import { HelpScreen } from './src/screens/HelpScreen';
import { MoodCheckInScreen } from './src/screens/MoodCheckInScreen';
import { MoodHistoryScreen } from './src/screens/MoodHistoryScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { PairingScreen } from './src/screens/PairingScreen';
import { RelaxScreen } from './src/screens/RelaxScreen';
import { RoleScreen } from './src/screens/RoleScreen';
import { RoutineEditorScreen } from './src/screens/RoutineEditorScreen';
import { RoutineScreen } from './src/screens/RoutineScreen';
import { SensoryScreen } from './src/screens/SensoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { VisualTimerScreen } from './src/screens/VisualTimerScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LoadingScreen } from './src/components/LoadingScreen';
import { MoodId, Role, Route, ScreenName } from './src/types/app';

export default function App() {
  return <AppProvider><Router /></AppProvider>;
}

function Router() {
  const { ready, onlineMode, authUserId, authRole } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'welcome' });
  const [history, setHistory] = useState<Route[]>([]);

  const navigate = useCallback((name: string, params?: Record<string, string | number | boolean>) => {
    setRoute((current) => {
      setHistory((old) => [...old.slice(-24), current]);
      return { name: name as ScreenName, params };
    });
  }, []);

  const replace = useCallback((name: ScreenName, params?: Route['params']) => {
    setRoute({ name, params });
  }, []);

  const back = useCallback(() => {
    setHistory((old) => {
      const previous = old[old.length - 1];
      if (previous) setRoute(previous);
      else setRoute({ name: 'welcome' });
      return old.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    if (!ready || !onlineMode) return;

    if (authUserId && authRole && route.name === 'welcome') {
      setHistory([]);
      setRoute({ name: authRole === 'guardian' ? 'guardian-home' : 'dependent-home' });
      return;
    }

    const publicScreens: ScreenName[] = ['welcome', 'role', 'auth'];
    if (!authUserId && !publicScreens.includes(route.name)) {
      setHistory([]);
      setRoute({ name: 'welcome' });
    }
  }, [ready, onlineMode, authUserId, authRole, route.name]);

  if (!ready) return <LoadingScreen />;

  switch (route.name) {
    case 'welcome':
      return <WelcomeScreen onStart={() => navigate('role')} onLogin={() => navigate('role')} />;
    case 'role':
      return <RoleScreen onBack={back} onDependent={() => navigate('auth', { role: 'dependent', register: false })} onGuardian={() => navigate('auth', { role: 'guardian', register: false })} />;
    case 'auth': {
      const role = (route.params?.role as Role) ?? 'dependent';
      const register = Boolean(route.params?.register);
      return <AuthScreen role={role} register={register} onBack={back} onSwitch={() => replace('auth', { role, register: !register })} onDone={() => replace(role === 'guardian' ? 'guardian-home' : 'dependent-home')} />;
    }
    case 'dependent-home':
      return <DependentHomeScreen navigate={navigate} />;
    case 'mood-checkin':
      return <MoodCheckInScreen initialMoodId={route.params?.moodId as MoodId | undefined} onBack={back} onDone={() => replace('dependent-home')} />;
    case 'mood-history':
      return <MoodHistoryScreen onBack={back} navigate={navigate} />;
    case 'routine':
      return <RoutineScreen navigate={navigate} />;
    case 'routine-editor':
      return <RoutineEditorScreen id={route.params?.id as string | undefined} onBack={back} onSaved={() => replace('routine')} />;
    case 'relax':
      return <RelaxScreen navigate={navigate} />;
    case 'breathing':
      return <BreathingScreen onBack={back} />;
    case 'grounding':
      return <GroundingScreen onBack={back} />;
    case 'first-then':
      return <FirstThenScreen onBack={back} navigate={navigate} />;
    case 'calm-plan':
      return <CalmPlanScreen onBack={back} navigate={navigate} />;
    case 'timer':
      return <VisualTimerScreen onBack={back} />;
    case 'communicate':
      return <CommunicateScreen navigate={navigate} />;
    case 'help':
      return <HelpScreen onBack={back} />;
    case 'guardian-home':
      return <GuardianHomeScreen navigate={navigate} />;
    case 'guardian-moods':
      return <GuardianMoodsScreen navigate={navigate} />;
    case 'guardian-routine':
      return <GuardianRoutineScreen navigate={navigate} />;
    case 'guardian-alerts':
      return <GuardianAlertsScreen navigate={navigate} />;
    case 'guardian-reports':
      return <GuardianReportsScreen navigate={navigate} />;
    case 'more':
      return <MoreScreen navigate={navigate} />;
    case 'sensory':
      return <SensoryScreen onBack={back} />;
    case 'settings':
      return <SettingsScreen onBack={back} />;
    case 'pairing':
      return <PairingScreen onBack={back} />;
    case 'about':
      return <AboutScreen onBack={back} />;
    default:
      return <WelcomeScreen onStart={() => replace('role')} onLogin={() => replace('role')} />;
  }
}
