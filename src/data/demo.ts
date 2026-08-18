import { AppState, Mood, RoutineItem } from '../types/app';
import { addDays, dateKey } from '../utils/date';

export const moods: Mood[] = [
  { id: 'very-happy', label: 'Muito feliz', emoji: '😄', color: '#58CB67', score: 5 },
  { id: 'happy', label: 'Feliz', emoji: '🙂', color: '#9AD85D', score: 4 },
  { id: 'neutral', label: 'Neutro', emoji: '😐', color: '#F7C844', score: 3 },
  { id: 'anxious', label: 'Ansioso', emoji: '😟', color: '#FF9138', score: 2 },
  { id: 'sad', label: 'Triste', emoji: '😢', color: '#6AA8E9', score: 1 },
];

export const moodTags = [
  'Escola',
  'Casa',
  'Barulho',
  'Mudança de plano',
  'Pessoas',
  'Cansaço',
  'Fome',
  'Terapia',
  'Algo legal',
  'Não sei',
];

export const supportNeeds = [
  'Quero ficar em silêncio',
  'Quero um abraço',
  'Quero ficar sozinho(a)',
  'Quero usar fones',
  'Quero beber água',
  'Quero falar com meu responsável',
  'Não sei ainda',
];

export const communicationCards = [
  { emoji: '🔇', text: 'Está muito barulhento para mim.' },
  { emoji: '⏸️', text: 'Preciso de uma pausa.' },
  { emoji: '🧍', text: 'Quero ficar sozinho(a) um pouco.' },
  { emoji: '🤐', text: 'Não consigo falar agora.' },
  { emoji: '💧', text: 'Preciso de água.' },
  { emoji: '🚻', text: 'Preciso ir ao banheiro.' },
  { emoji: '🏠', text: 'Quero ir para um lugar mais calmo.' },
  { emoji: '🫂', text: 'Preciso de ajuda de uma pessoa de confiança.' },
  { emoji: '🔁', text: 'Pode repetir de outro jeito?' },
  { emoji: '⌛', text: 'Preciso de mais tempo para responder.' },
  { emoji: '✅', text: 'Sim.' },
  { emoji: '❌', text: 'Não.' },
];

export const routineTemplates = [
  { title: 'Acordar', time: '07:00', emoji: '☀️', category: 'morning' as const },
  { title: 'Tomar café da manhã', time: '08:00', emoji: '🥞', category: 'morning' as const },
  { title: 'Atividade escolar', time: '09:00', emoji: '🎒', category: 'school' as const },
  { title: 'Almoço', time: '12:00', emoji: '🍽️', category: 'self-care' as const },
  { title: 'Pausa sensorial', time: '13:30', emoji: '🎧', category: 'health' as const },
  { title: 'Terapia', time: '15:00', emoji: '💙', category: 'health' as const },
  { title: 'Tempo livre', time: '17:00', emoji: '🎮', category: 'leisure' as const },
  { title: 'Higiene pessoal', time: '20:00', emoji: '🛁', category: 'self-care' as const },
  { title: 'Dormir', time: '21:00', emoji: '🌙', category: 'sleep' as const },
];

function seededRoutine(): RoutineItem[] {
  const today = dateKey();
  return routineTemplates.map((item, index) => {
    // O histórico dos seis dias anteriores deixa os relatórios demonstráveis
    // sem fingir que os dados vieram de um servidor real.
    const pastDates = Array.from({ length: 6 }, (_, offset) => -6 + offset)
      .filter((day) => (index + day + 30) % 5 !== 0)
      .map((day) => dateKey(addDays(new Date(), day)));

    return {
      id: `routine-${index + 1}`,
      ...item,
      active: true,
      completedDates: index < 2 ? [...pastDates, today] : pastDates,
      reminderEnabled: index === 2 || index === 5 || index === 8,
      transitionMinutes: index === 2 || index === 5 ? 10 : 5,
    };
  });
}

export function createInitialState(): AppState {
  const now = new Date();
  const entries = [
    { day: -6, moodId: 'happy' as const, reason: 'Brinquei com meus amigos.', intensity: 3, tags: ['Escola'], need: null },
    { day: -5, moodId: 'neutral' as const, reason: 'Foi um dia tranquilo.', intensity: 2, tags: ['Casa'], need: null },
    { day: -4, moodId: 'anxious' as const, reason: 'A sala estava muito barulhenta.', intensity: 4, tags: ['Barulho', 'Escola'], need: 'Quero usar fones' },
    { day: -3, moodId: 'happy' as const, reason: 'Consegui terminar uma atividade difícil.', intensity: 4, tags: ['Escola', 'Algo legal'], need: null },
    { day: -2, moodId: 'very-happy' as const, reason: 'Passeei com minha família.', intensity: 5, tags: ['Casa', 'Algo legal'], need: null },
    { day: -1, moodId: 'sad' as const, reason: 'Uma mudança de plano me deixou chateado.', intensity: 4, tags: ['Mudança de plano'], need: 'Quero ficar em silêncio' },
  ];

  return {
    dependent: { id: 'dependent-local', name: 'Lucas', avatar: '🧒🏻', birthDate: '2014-05-24' },
    guardian: { id: 'guardian-local', name: 'Fernanda', avatar: '👩🏻' },
    linked: true,
    pairingCode: 'TEA-4827',
    moods: entries.map((e, i) => ({
      id: `mood-demo-${i}`,
      moodId: e.moodId,
      reason: e.reason,
      intensity: e.intensity,
      tags: e.tags,
      need: e.need,
      createdAt: addDays(now, e.day).toISOString(),
    })),
    routine: seededRoutine(),
    helpRequests: [],
    relaxSessions: [
      { id: 'relax-1', tool: 'Chuva suave', durationSeconds: 600, createdAt: addDays(now, -5).toISOString() },
      { id: 'relax-2', tool: 'Ondas do mar', durationSeconds: 420, createdAt: addDays(now, -3).toISOString() },
      { id: 'relax-3', tool: 'Respiração guiada', durationSeconds: 180, createdAt: addDays(now, -1).toISOString() },
      { id: 'relax-4', tool: 'Timer visual', durationSeconds: 300, createdAt: addDays(now, -1).toISOString() },
    ],
    sensory: {
      reducedMotion: false,
      highContrast: false,
      largeControls: true,
      haptics: true,
      soundDefaultVolume: 0.55,
      preferredCalmingTools: ['Chuva suave', 'Respiração guiada', 'Fones'],
      avoidTriggers: ['Barulho intenso', 'Mudanças sem aviso'],
    },
    settings: {
      simpleMode: false,
      routineReminders: true,
      guardianAlerts: true,
      showCelebrations: true,
    },
    lastRole: null,
  };
}
