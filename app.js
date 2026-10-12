(() => {
  'use strict';

  const cfg = window.CONNECTATEA_CONFIG || {};
  const supabaseLib = window.supabase;
  const db = supabaseLib && cfg.supabaseUrl && cfg.supabasePublishableKey
    ? supabaseLib.createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  const moods = [
    { id: 'very-happy', db: 'very_happy', label: 'Muito feliz', emoji: '😄', score: 5 },
    { id: 'happy', db: 'happy', label: 'Feliz', emoji: '🙂', score: 4 },
    { id: 'neutral', db: 'neutral', label: 'Neutro', emoji: '😐', score: 3 },
    { id: 'anxious', db: 'anxious', label: 'Ansioso', emoji: '😟', score: 2 },
    { id: 'sad', db: 'sad', label: 'Triste', emoji: '😢', score: 1 },
  ];

  const communication = [
    ['🔇', 'Está muito barulhento para mim.'],
    ['⏸️', 'Preciso de uma pausa.'],
    ['🧍', 'Quero ficar sozinho(a) um pouco.'],
    ['🤐', 'Não consigo falar agora.'],
    ['💧', 'Preciso de água.'],
    ['🚻', 'Preciso ir ao banheiro.'],
    ['🏠', 'Quero ir para um lugar mais calmo.'],
    ['🫂', 'Preciso de ajuda de uma pessoa de confiança.'],
    ['🔁', 'Pode repetir de outro jeito?'],
    ['⌛', 'Preciso de mais tempo para responder.'],
  ];

  const app = {
    ready: false,
    syncing: false,
    session: null,
    profile: null,
    connection: null,
    linkedProfile: null,
    pairingCode: '',
    moods: [],
    routine: [],
    completions: [],
    helpRequests: [],
    view: 'home',
    modal: null,
    authMode: 'login',
    signupRole: 'dependent',
    toast: '',
    error: '',
    selectedMood: null,
    breathingTimer: null,
    visualTimer: null,
    refreshTimer: null,
  };

  const $ = (sel) => document.querySelector(sel);
  const esc = (s = '') => String(s).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  const fmt = (iso) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  const today = () => new Date().toISOString().slice(0, 10);
  const profileRole = () => app.profile?.role || null;
  const isDependent = () => profileRole() === 'dependent';
  const isGuardian = () => profileRole() === 'guardian';
  const roleLabel = (role = profileRole()) => role === 'guardian' ? 'Responsável' : 'Dependente';
  const displayName = () => app.profile?.display_name || roleLabel();
  const linkedName = () => app.linkedProfile?.display_name || '';
  const moodByUi = (id) => moods.find((m) => m.id === id) || moods[2];
  const moodByDb = (id) => moods.find((m) => m.db === id) || moods[2];
  const currentDependentId = () => isDependent() ? app.profile?.id : app.connection?.dependent_id;
  const completedToday = (item) => app.completions.some((c) => c.routine_item_id === item.id && c.completed_on === today());

  function showToast(message) {
    app.toast = message;
    render();
    setTimeout(() => { if (app.toast === message) { app.toast = ''; render(); } }, 2600);
  }

  function friendlyError(error) {
    const raw = typeof error === 'string' ? error : error?.message || 'Não foi possível concluir a operação.';
    const s = raw.toLowerCase();
    if (s.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (s.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (s.includes('user already registered')) return 'Já existe uma conta com este e-mail.';
    if (s.includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (s.includes('código inválido') || s.includes('codigo invalido') || s.includes('expirado')) return 'Código de vínculo inválido ou expirado.';
    if (s.includes('row-level security') || s.includes('permission denied') || s.includes('rls')) return 'O banco bloqueou essa ação pelas regras de segurança. Confira o setup_v6.sql.';
    if (s.includes('failed to fetch') || s.includes('network')) return 'Falha de conexão com o Supabase. Confira sua internet.';
    return raw;
  }

  async function loadAll({ quiet = false } = {}) {
    if (!db || !app.session?.user) return;
    if (!quiet) { app.syncing = true; render(); }
    app.error = '';
    try {
      const userId = app.session.user.id;
      const { data: profile, error: profileError } = await db
        .from('profiles')
        .select('id, role, display_name, birth_date, avatar_emoji')
        .eq('id', userId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error('Perfil do ConectaTEA não encontrado. Execute o setup_v6.sql no Supabase.');
      app.profile = profile;

      const connectionQuery = db
        .from('connections')
        .select('id, guardian_id, dependent_id, created_at')
        .limit(1);
      const { data: connectionRows, error: connectionError } = profile.role === 'guardian'
        ? await connectionQuery.eq('guardian_id', userId)
        : await connectionQuery.eq('dependent_id', userId);
      if (connectionError) throw connectionError;
      app.connection = connectionRows?.[0] || null;

      app.linkedProfile = null;
      if (app.connection) {
        const linkedId = profile.role === 'guardian' ? app.connection.dependent_id : app.connection.guardian_id;
        const { data: linked, error: linkedError } = await db
          .from('profiles')
          .select('id, role, display_name, birth_date, avatar_emoji')
          .eq('id', linkedId)
          .maybeSingle();
        if (linkedError) throw linkedError;
        app.linkedProfile = linked || null;
      }

      app.pairingCode = '';
      if (profile.role === 'dependent' && !app.connection) {
        const { data: codes, error: codeError } = await db
          .from('pairing_codes')
          .select('code, expires_at, created_at')
          .eq('dependent_id', userId)
          .is('claimed_at', null)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);
        if (codeError) throw codeError;
        app.pairingCode = codes?.[0]?.code || '';
      }

      const depId = profile.role === 'dependent' ? userId : app.connection?.dependent_id;
      app.moods = [];
      app.routine = [];
      app.completions = [];
      app.helpRequests = [];
      if (depId) {
        const [moodRes, routineRes, completionRes, helpRes] = await Promise.all([
          db.from('mood_entries').select('id, dependent_id, mood, reason, intensity, support_need, created_at').eq('dependent_id', depId).order('created_at', { ascending: false }).limit(100),
          db.from('routine_items').select('id, dependent_id, title, scheduled_time, emoji, sort_order, active, created_at, updated_at').eq('dependent_id', depId).eq('active', true).order('scheduled_time', { ascending: true }),
          db.from('routine_completions').select('id, routine_item_id, dependent_id, completed_on, completed_at').eq('dependent_id', depId).gte('completed_on', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
          db.from('help_requests').select('id, dependent_id, urgency, message, status, created_at, acknowledged_at, resolved_at').eq('dependent_id', depId).order('created_at', { ascending: false }).limit(100),
        ]);
        const firstError = moodRes.error || routineRes.error || completionRes.error || helpRes.error;
        if (firstError) throw firstError;
        app.moods = moodRes.data || [];
        app.routine = routineRes.data || [];
        app.completions = completionRes.data || [];
        app.helpRequests = helpRes.data || [];
      }
    } catch (e) {
      app.error = friendlyError(e);
    } finally {
      app.syncing = false;
      app.ready = true;
      render();
    }
  }

  async function bootstrap() {
    if (!db) {
      app.ready = true;
      app.error = 'Supabase não configurado em config.js.';
      render();
      return;
    }
    const { data, error } = await db.auth.getSession();
    if (error) app.error = friendlyError(error);
    app.session = data?.session || null;
    if (app.session) await loadAll();
    else { app.ready = true; render(); }

    db.auth.onAuthStateChange((_event, session) => {
      app.session = session;
      if (session) loadAll();
      else {
        app.profile = null; app.connection = null; app.linkedProfile = null;
        app.moods = []; app.routine = []; app.completions = []; app.helpRequests = [];
        app.pairingCode = ''; app.view = 'home'; app.ready = true; render();
      }
    });

    app.refreshTimer = setInterval(() => {
      if (app.session && !app.syncing) loadAll({ quiet: true });
    }, 15000);
  }

  function render() {
    const root = $('#app');
    if (!root) return;
    if (!app.ready) {
      root.innerHTML = `<section class="welcome"><div class="welcome-box"><img class="welcome-logo" src="assets/conectatea-logo.png" alt="ConectaTEA"><div class="spinner"></div><p>Carregando...</p></div></section>`;
      return;
    }
    if (!app.session) {
      root.innerHTML = authScreen();
      bind();
      return;
    }
    root.innerHTML = `<div class="app-shell">${topbar()}<main class="main">${app.error ? `<div class="alert danger">${esc(app.error)}</div>` : ''}${app.toast ? `<div class="alert ok">${esc(app.toast)}</div>` : ''}${content()}</main>${bottomNav()}${app.modal ? renderModal() : ''}</div>`;
    bind();
  }

  function authScreen() {
    const signup = app.authMode === 'signup';
    return `<section class="welcome"><div class="welcome-box auth-box">
      <img class="welcome-logo" src="assets/conectatea-logo.png" alt="ConectaTEA">
      <h1>${signup ? 'Criar conta' : 'Entrar no ConectaTEA'}</h1>
      <p>${signup ? 'Crie uma conta real. O tipo escolhido não poderá ser trocado depois.' : 'Entre com sua conta de dependente ou responsável.'}</p>
      ${app.error ? `<div class="alert danger">${esc(app.error)}</div>` : ''}
      <div class="auth-tabs"><button class="auth-tab ${!signup ? 'active' : ''}" data-auth-mode="login">Entrar</button><button class="auth-tab ${signup ? 'active' : ''}" data-auth-mode="signup">Criar conta</button></div>
      <div class="card auth-card">
        ${signup ? `<div class="role-pills"><button class="role-pill ${app.signupRole === 'dependent' ? 'active' : ''}" data-signup-role="dependent">🧩 Dependente</button><button class="role-pill ${app.signupRole === 'guardian' ? 'active' : ''}" data-signup-role="guardian">🤝 Responsável</button></div><div class="field"><label>Nome</label><input id="authName" class="input" autocomplete="name" placeholder="Nome completo"></div>` : ''}
        <div class="field"><label>E-mail</label><input id="authEmail" class="input" type="email" autocomplete="email" placeholder="voce@email.com"></div>
        <div class="field"><label>Senha</label><input id="authPassword" class="input" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="Mínimo 6 caracteres"></div>
        <button class="btn ${signup ? 'green' : 'primary'} auth-submit" data-action="${signup ? 'signup' : 'signin'}">${signup ? 'Criar conta' : 'Entrar'}</button>
      </div>
      <div class="alert info"><b>Como funciona:</b> o dependente cria o próprio acesso e gera um código temporário. O responsável cria outra conta e usa esse código para formar o vínculo real no banco.</div>
      <div class="footer-note">Protótipo acadêmico de apoio. Não realiza diagnóstico e não substitui profissionais de saúde ou serviços de emergência.</div>
    </div></section>`;
  }

  function topbar() {
    const syncText = app.syncing ? 'Atualizando…' : (app.connection ? 'Vínculo ativo' : 'Sem vínculo');
    return `<header class="topbar"><div class="topbar-inner"><div class="brand"><img src="assets/conectatea-mark.png" alt=""><div><b>ConectaTEA</b><small>${esc(displayName())} · ${roleLabel()} · ${syncText}</small></div></div><button class="role-chip" data-action="refresh">↻ Atualizar</button></div></header>`;
  }

  function bottomNav() {
    const items = isGuardian()
      ? [['home', '🏠', 'Início'], ['moods', '🙂', 'Emoções'], ['routine', '🗓️', 'Rotina'], ['alerts', '🔔', 'Alertas'], ['more', '⋯', 'Mais']]
      : [['home', '🏠', 'Início'], ['moods', '🙂', 'Emoções'], ['routine', '🗓️', 'Rotina'], ['tools', '🧘', 'Acalmar'], ['more', '⋯', 'Mais']];
    return `<nav class="bottom-nav"><div class="bottom-nav-inner">${items.map(([v, i, l]) => `<button class="nav-btn ${app.view === v ? 'active' : ''}" data-view="${v}"><span class="nicon">${i}</span>${l}</button>`).join('')}</div></nav>`;
  }

  function content() {
    if (app.view === 'home') return isGuardian() ? guardianHome() : dependentHome();
    if (app.view === 'moods') return moodsView();
    if (app.view === 'routine') return routineView();
    if (app.view === 'alerts') return alertsView();
    if (app.view === 'tools') return toolsView();
    return moreView();
  }

  function linkRequired() {
    return `<div class="card link-required"><div class="link-icon">🔗</div><h2>Nenhum perfil vinculado</h2><p>${isGuardian() ? 'Peça ao dependente para gerar um código temporário e faça o vínculo em “Mais”.' : 'Gere um código em “Mais” e envie somente ao responsável que deverá acompanhar você.'}</p><button class="btn primary" data-view="more">Ir para vínculo</button></div>`;
  }

  function dependentHome() {
    const latest = app.moods[0];
    const open = app.helpRequests.filter((x) => x.status !== 'resolved').length;
    const done = app.routine.filter(completedToday).length;
    return `<section class="hero"><h1>Olá, ${esc(displayName())} 👋</h1><p>Registre como você está se sentindo, acompanhe sua rotina e peça apoio quando precisar.</p></section>
      ${app.connection ? `<div class="alert ok"><b>Responsável vinculado:</b> ${esc(linkedName())}</div>` : `<div class="alert warn"><b>Você ainda não tem responsável vinculado.</b> O código de vínculo fica na aba Mais.</div>`}
      <div class="grid">
        <button class="action-card" data-view="moods"><div class="icon purple">🙂</div><div><b>Como estou me sentindo?</b><span>${latest ? `${moodByDb(latest.mood).emoji} ${moodByDb(latest.mood).label}` : 'Nenhum registro ainda'}</span></div></button>
        <button class="action-card" data-view="routine"><div class="icon green">🗓️</div><div><b>Minha rotina</b><span>${done} de ${app.routine.length} concluídas hoje</span></div></button>
        <button class="action-card" data-action="help-modal"><div class="icon red">🆘</div><div><b>Preciso de ajuda</b><span>${open ? `${open} pedido(s) aguardando` : 'Envie um pedido de apoio'}</span></div></button>
        <button class="action-card" data-view="tools"><div class="icon blue">🧘</div><div><b>Me acalmar</b><span>Respiração, grounding e timer visual</span></div></button>
      </div>
      <h2 class="section-title">Hoje</h2>${todaySummary()}
      <h2 class="section-title">Comunicação rápida</h2><div class="comm-grid">${communication.slice(0, 4).map(([e, t]) => `<button class="comm" data-speak="${esc(t)}"><span class="cemoji">${e}</span><b>${esc(t)}</b></button>`).join('')}</div>`;
  }

  function guardianHome() {
    if (!app.connection || !app.linkedProfile) return `<section class="hero"><h1>Painel do responsável</h1><p>Depois de criar um vínculo, os dados do dependente autorizado aparecerão aqui.</p></section>${linkRequired()}`;
    const latest = app.moods[0];
    const open = app.helpRequests.filter((x) => x.status !== 'resolved');
    const done = app.routine.filter(completedToday).length;
    return `<section class="hero"><h1>Painel do responsável</h1><p>Acompanhamento de <b>${esc(linkedName())}</b>. Os dados são carregados do Supabase e protegidos pelas regras de acesso.</p></section>
      ${open.length ? `<div class="alert danger"><b>⚠️ ${open.length} pedido(s) de ajuda em aberto.</b> Abra a aba Alertas para acompanhar.</div>` : ''}
      <div class="grid-3" style="margin-top:16px"><div class="stat"><strong>${latest ? moodByDb(latest.mood).emoji : '—'}</strong><span>${latest ? moodByDb(latest.mood).label : 'Sem humor registrado'}</span></div><div class="stat"><strong>${done}/${app.routine.length}</strong><span>Rotina concluída hoje</span></div><div class="stat"><strong>${open.length}</strong><span>Pedidos em aberto</span></div></div>
      <h2 class="section-title">Último registro emocional</h2>${latest ? moodCard(latest) : `<div class="card muted">Ainda não há registros emocionais.</div>`}
      <h2 class="section-title">Rotina de hoje</h2>${routineMini()}`;
  }

  function todaySummary() {
    if (!app.routine.length) return `<div class="card muted">Sua rotina ainda está vazia. Abra “Rotina” para adicionar atividades.</div>`;
    return `<div class="card"><div class="list">${app.routine.slice(0, 5).map((r) => `<div class="row"><span style="font-size:22px">${esc(r.emoji || '🧩')}</span><div><b>${esc(r.title)}</b><div class="tiny muted">${esc(String(r.scheduled_time).slice(0, 5))}</div></div><div class="spacer"></div><span>${completedToday(r) ? '✅' : '⬜'}</span></div>`).join('')}</div></div>`;
  }

  function routineMini() {
    if (!app.routine.length) return `<div class="card muted">Nenhuma atividade cadastrada.</div>`;
    const pct = Math.round(100 * app.routine.filter(completedToday).length / app.routine.length);
    return `<div class="card"><div class="row"><b>Progresso</b><div class="spacer"></div><span class="muted tiny">${pct}%</span></div><div class="progress" style="margin-top:10px"><i style="width:${pct}%"></i></div><div class="list" style="margin-top:13px">${app.routine.slice(0, 5).map((r) => `<div class="row"><span>${esc(r.emoji || '🧩')}</span><span>${esc(String(r.scheduled_time).slice(0, 5))} · ${esc(r.title)}</span><div class="spacer"></div>${completedToday(r) ? '✅' : '—'}</div>`).join('')}</div></div>`;
  }

  function moodCard(m) {
    const mm = moodByDb(m.mood);
    return `<div class="list-item"><div class="row"><span style="font-size:30px">${mm.emoji}</span><div><b>${mm.label}</b><div class="meta">Intensidade ${m.intensity}/5 · ${fmt(m.created_at)}</div></div></div>${m.reason ? `<p class="tiny">${esc(m.reason)}</p>` : ''}${m.support_need ? `<span class="tag">💙 ${esc(m.support_need)}</span>` : ''}</div>`;
  }

  function moodsView() {
    if (isGuardian()) {
      if (!app.connection) return `<h1>Emoções</h1>${linkRequired()}`;
      return `<h1>Emoções de ${esc(linkedName())}</h1><p class="section-sub">Histórico registrado pela conta do dependente.</p>${app.moods.length ? `<div class="list">${app.moods.map(moodCard).join('')}</div>` : `<div class="card muted">Ainda não existem registros.</div>`}`;
    }
    return `<h1>Como você está?</h1><p class="section-sub">Escolha a opção que mais combina com este momento.</p><div class="card"><div class="moods">${moods.map((m) => `<button class="mood ${app.selectedMood === m.id ? 'active' : ''}" data-mood="${m.id}"><span class="emoji">${m.emoji}</span><span>${m.label}</span></button>`).join('')}</div><div class="field"><label>Intensidade</label><input id="moodIntensity" type="range" min="1" max="5" value="3" style="width:100%"></div><div class="field"><label>O que aconteceu? (opcional)</label><textarea id="moodReason" class="textarea" maxlength="500" placeholder="Ex.: muito barulho na sala..."></textarea></div><div class="field"><label>O que pode ajudar? (opcional)</label><input id="moodNeed" class="input" maxlength="300" placeholder="Ex.: ficar em silêncio, usar fones..."></div><button class="btn primary" style="width:100%;margin-top:14px" data-action="save-mood" ${app.selectedMood ? '' : 'disabled'}>Salvar registro</button></div><h2 class="section-title">Histórico</h2>${app.moods.length ? `<div class="list">${app.moods.slice(0, 10).map(moodCard).join('')}</div>` : `<div class="card muted">Nenhum registro ainda.</div>`}`;
  }

  function routineView() {
    if (isGuardian() && !app.connection) return `<h1>Rotina</h1>${linkRequired()}`;
    const title = isGuardian() ? `Rotina de ${esc(linkedName())}` : 'Minha rotina';
    return `<div class="row"><div><h1>${title}</h1><p class="section-sub">${isGuardian() ? 'Visualização da rotina registrada pelo dependente.' : 'Organize as atividades e marque o que foi concluído hoje.'}</p></div><div class="spacer"></div>${isDependent() ? `<button class="btn primary" data-action="routine-modal">+ Atividade</button>` : ''}</div>${app.routine.length ? `<div class="list">${app.routine.map((r) => `<div class="list-item"><div class="row"><span style="font-size:28px">${esc(r.emoji || '🧩')}</span><div><b>${esc(r.title)}</b><div class="meta">${esc(String(r.scheduled_time).slice(0, 5))}</div></div><div class="spacer"></div>${isDependent() ? `<button class="check-btn ${completedToday(r) ? 'done' : ''}" data-toggle-routine="${r.id}">${completedToday(r) ? '✓' : '○'}</button><button class="icon-btn" title="Excluir" data-delete-routine="${r.id}">🗑️</button>` : `<b>${completedToday(r) ? '✅' : '⬜'}</b>`}</div></div>`).join('')}</div>` : `<div class="card muted">Nenhuma atividade cadastrada.</div>`}`;
  }

  function alertsView() {
    if (!isGuardian()) return '';
    if (!app.connection) return `<h1>Alertas</h1>${linkRequired()}`;
    return `<h1>Pedidos de ajuda</h1><p class="section-sub">Pedidos enviados por ${esc(linkedName())}.</p>${app.helpRequests.length ? `<div class="list">${app.helpRequests.map((h) => `<div class="list-item ${h.urgency === 'urgent' && h.status !== 'resolved' ? 'urgent-item' : ''}"><div class="row"><span style="font-size:24px">${h.urgency === 'urgent' ? '🚨' : '🆘'}</span><div><b>${h.urgency === 'urgent' ? 'Ajuda urgente' : 'Pedido de apoio'}</b><div class="meta">${fmt(h.created_at)} · ${statusLabel(h.status)}</div></div></div><p>${esc(h.message)}</p>${h.status === 'open' ? `<button class="btn soft" data-help-action="ack|${h.id}">Eu vi</button>` : ''}${h.status !== 'resolved' ? `<button class="btn green" style="margin-left:7px" data-help-action="resolve|${h.id}">Resolvido</button>` : ''}</div>`).join('')}</div>` : `<div class="card muted">Nenhum pedido de ajuda registrado.</div>`}`;
  }

  function statusLabel(status) {
    return status === 'resolved' ? 'Resolvido' : status === 'acknowledged' ? 'Responsável avisado' : 'Aberto';
  }

  function toolsView() {
    return `<h1>Me acalmar</h1><p class="section-sub">Ferramentas simples de autorregulação que funcionam diretamente no navegador.</p><div class="grid"><button class="action-card" data-action="breathing-modal"><div class="icon purple">🫁</div><div><b>Respiração guiada</b><span>Inspire, segure e expire devagar</span></div></button><button class="action-card" data-action="grounding-modal"><div class="icon green">🌿</div><div><b>5-4-3-2-1</b><span>Volte a atenção para o momento presente</span></div></button><button class="action-card" data-action="timer-modal"><div class="icon blue">⏱️</div><div><b>Timer visual</b><span>Escolha um tempo para pausa ou atividade</span></div></button><button class="action-card" data-action="communication-modal"><div class="icon red">💬</div><div><b>Comunicação rápida</b><span>Frases com leitura em voz alta</span></div></button></div>`;
  }

  function pairingCard() {
    if (app.connection && app.linkedProfile) {
      return `<div class="card"><h2>🔗 Vínculo ativo</h2><p class="muted">${isDependent() ? `Responsável: <b>${esc(linkedName())}</b>` : `Dependente: <b>${esc(linkedName())}</b>`}</p><div class="alert ok">O vínculo está salvo no Supabase. As regras RLS limitam o acesso aos dois perfis vinculados.</div><button class="btn red" data-action="unlink">Remover vínculo</button></div>`;
    }
    if (isDependent()) {
      return `<div class="card"><h2>🔗 Vincular responsável</h2><p class="muted">Gere um código temporário e envie somente para a pessoa responsável que deverá acompanhar seus dados.</p><div class="pair-code">${app.pairingCode ? esc(app.pairingCode) : '— — —'}</div><button class="btn primary" data-action="generate-code">${app.pairingCode ? 'Gerar outro código' : 'Gerar código'}</button><p class="tiny muted">O código expira em aproximadamente 15 minutos e só pode ser usado uma vez.</p></div>`;
    }
    return `<div class="card"><h2>🔗 Vincular dependente</h2><p class="muted">Peça ao dependente para gerar um código e digite-o aqui.</p><div class="field"><label>Código</label><input id="pairCodeInput" class="input code-input" maxlength="12" placeholder="TEA-1A2B3C4D" autocomplete="off"></div><button class="btn green" data-action="claim-code">Vincular</button></div>`;
  }

  function moreView() {
    return `<h1>Mais</h1><p class="section-sub">Conta, vínculo e informações do projeto.</p>${pairingCard()}<h2 class="section-title">Meu perfil</h2><div class="card"><div class="field"><label>Nome</label><input id="profileName" class="input" maxlength="80" value="${esc(app.profile?.display_name || '')}"></div>${isDependent() ? `<div class="field"><label>Data de nascimento (opcional)</label><input id="profileBirth" class="input" type="date" value="${esc(app.profile?.birth_date || '')}"></div>` : ''}<button class="btn primary" data-action="save-profile">Salvar perfil</button></div><h2 class="section-title">Conta</h2><div class="card"><div class="list"><div class="row"><b>Tipo</b><div class="spacer"></div><span>${roleLabel()}</span></div><div class="row"><b>E-mail</b><div class="spacer"></div><span class="tiny muted">${esc(app.session?.user?.email || '')}</span></div></div><button class="btn ghost" style="margin-top:14px" data-action="logout">Sair da conta</button></div><div class="alert info"><b>Privacidade:</b> o site usa autenticação do Supabase e políticas RLS. Um responsável não consegue consultar os dados de um dependente que não esteja realmente vinculado à conta dele.</div><div class="footer-note">ConectaTEA — protótipo acadêmico de apoio à organização, comunicação e acompanhamento. Não realiza diagnóstico.</div>`;
  }

  function renderModal() {
    if (app.modal === 'help') return modalBox('Preciso de ajuda', `<div class="field"><label>Nível</label><select id="helpUrgency" class="select"><option value="support">Preciso de apoio</option><option value="urgent">Urgente</option></select></div><div class="field"><label>Mensagem</label><textarea id="helpMessage" class="textarea" maxlength="500" placeholder="Explique o que você precisa..."></textarea></div>`, `<button class="btn ghost" data-close>Cancelar</button><button class="btn red" data-action="send-help">Enviar pedido</button>`);
    if (app.modal === 'routine') return modalBox('Adicionar atividade', `<div class="field"><label>Atividade</label><input id="routineTitle" class="input" maxlength="100" placeholder="Ex.: Tomar café"></div><div class="field"><label>Horário</label><input id="routineTime" class="input" type="time" value="08:00"></div><div class="field"><label>Emoji</label><input id="routineEmoji" class="input" maxlength="8" value="🧩"></div>`, `<button class="btn ghost" data-close>Cancelar</button><button class="btn primary" data-action="save-routine">Salvar</button>`);
    if (app.modal === 'breathing') return modalBox('Respiração guiada', `<p class="muted">Faça no seu ritmo. Pare se sentir desconforto.</p><div class="breath-orb" id="breathOrb"><b id="breathText">Pronto?</b></div>`, `<button class="btn ghost" data-close>Fechar</button><button class="btn primary" data-action="start-breath">Começar</button>`);
    if (app.modal === 'grounding') return modalBox('Grounding 5-4-3-2-1', `<div class="card grounding"><p><b>5</b> coisas que você consegue ver</p><p><b>4</b> coisas que consegue tocar</p><p><b>3</b> sons que consegue ouvir</p><p><b>2</b> cheiros que percebe</p><p><b>1</b> sabor ou sensação boa</p></div>`, `<button class="btn primary" data-close>Concluir</button>`);
    if (app.modal === 'timer') return modalBox('Timer visual', `<div class="field"><label>Minutos</label><input id="timerMinutes" class="input" type="number" min="1" max="60" value="5"></div><div class="timer-circle" id="timerCircle"><b id="timerText">05:00</b></div>`, `<button class="btn ghost" data-action="reset-timer">Parar</button><button class="btn primary" data-action="start-timer">Iniciar</button>`);
    if (app.modal === 'communication') return modalBox('Comunicação rápida', `<div class="comm-grid">${communication.map(([e, t]) => `<button class="comm" data-speak="${esc(t)}"><span class="cemoji">${e}</span><b>${esc(t)}</b></button>`).join('')}</div>`, `<button class="btn ghost" data-close>Fechar</button>`);
    return '';
  }

  function modalBox(title, body, actions) {
    return `<div class="modal-backdrop"><div class="modal"><h2>${title}</h2>${body}<div class="modal-actions">${actions}</div></div></div>`;
  }

  function bind() {
    document.querySelectorAll('[data-auth-mode]').forEach((b) => b.onclick = () => { app.authMode = b.dataset.authMode; app.error = ''; render(); });
    document.querySelectorAll('[data-signup-role]').forEach((b) => b.onclick = () => { app.signupRole = b.dataset.signupRole; render(); });
    document.querySelectorAll('[data-view]').forEach((b) => b.onclick = () => { app.view = b.dataset.view; app.modal = null; render(); });
    document.querySelectorAll('[data-close]').forEach((b) => b.onclick = () => { stopTimers(); app.modal = null; render(); });
    document.querySelectorAll('[data-mood]').forEach((b) => b.onclick = () => { app.selectedMood = b.dataset.mood; render(); });
    document.querySelectorAll('[data-toggle-routine]').forEach((b) => b.onclick = () => toggleRoutine(b.dataset.toggleRoutine));
    document.querySelectorAll('[data-delete-routine]').forEach((b) => b.onclick = () => deleteRoutine(b.dataset.deleteRoutine));
    document.querySelectorAll('[data-help-action]').forEach((b) => b.onclick = () => { const [action, id] = b.dataset.helpAction.split('|'); setHelpStatus(id, action); });
    document.querySelectorAll('[data-speak]').forEach((b) => b.onclick = () => speak(b.dataset.speak));

    document.querySelectorAll('[data-action]').forEach((b) => {
      const a = b.dataset.action;
      if (a === 'signin') b.onclick = signIn;
      if (a === 'signup') b.onclick = signUp;
      if (a === 'logout') b.onclick = signOut;
      if (a === 'refresh') b.onclick = () => loadAll();
      if (a === 'save-profile') b.onclick = saveProfile;
      if (a === 'generate-code') b.onclick = generatePairingCode;
      if (a === 'claim-code') b.onclick = claimPairingCode;
      if (a === 'unlink') b.onclick = unlink;
      if (a === 'save-mood') b.onclick = saveMood;
      if (a === 'help-modal') b.onclick = () => { app.modal = 'help'; render(); };
      if (a === 'send-help') b.onclick = sendHelp;
      if (a === 'routine-modal') b.onclick = () => { app.modal = 'routine'; render(); };
      if (a === 'save-routine') b.onclick = saveRoutine;
      if (a === 'breathing-modal') b.onclick = () => { app.modal = 'breathing'; render(); };
      if (a === 'grounding-modal') b.onclick = () => { app.modal = 'grounding'; render(); };
      if (a === 'timer-modal') b.onclick = () => { app.modal = 'timer'; render(); };
      if (a === 'communication-modal') b.onclick = () => { app.modal = 'communication'; render(); };
      if (a === 'start-breath') b.onclick = startBreathing;
      if (a === 'start-timer') b.onclick = startTimer;
      if (a === 'reset-timer') b.onclick = () => resetTimer(false);
    });

    const backdrop = $('.modal-backdrop');
    if (backdrop) backdrop.onclick = (e) => { if (e.target === backdrop) { stopTimers(); app.modal = null; render(); } };
  }

  async function signUp() {
    app.error = '';
    const name = $('#authName')?.value.trim() || '';
    const email = $('#authEmail')?.value.trim().toLowerCase() || '';
    const password = $('#authPassword')?.value || '';
    if (name.length < 2) return showAuthError('Digite um nome com pelo menos 2 caracteres.');
    if (!email.includes('@')) return showAuthError('Digite um e-mail válido.');
    if (password.length < 6) return showAuthError('A senha precisa ter pelo menos 6 caracteres.');
    const { data, error } = await db.auth.signUp({ email, password, options: { data: { display_name: name, role: app.signupRole } } });
    if (error) return showAuthError(friendlyError(error));
    if (!data.session) {
      app.authMode = 'login';
      app.error = '';
      render();
      return alert('Conta criada. Confirme o e-mail recebido e depois entre no ConectaTEA.');
    }
    app.session = data.session;
    await loadAll();
  }

  async function signIn() {
    app.error = '';
    const email = $('#authEmail')?.value.trim().toLowerCase() || '';
    const password = $('#authPassword')?.value || '';
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) return showAuthError(friendlyError(error));
    app.session = data.session;
    await loadAll();
  }

  function showAuthError(message) { app.error = message; render(); }

  async function signOut() {
    stopTimers();
    await db.auth.signOut();
  }

  async function saveProfile() {
    const name = $('#profileName')?.value.trim() || '';
    const birth = isDependent() ? ($('#profileBirth')?.value || null) : null;
    if (name.length < 2) return alert('Digite um nome válido.');
    const payload = { display_name: name };
    if (isDependent()) payload.birth_date = birth || null;
    const { error } = await db.from('profiles').update(payload).eq('id', app.profile.id);
    if (error) return alert(friendlyError(error));
    await loadAll({ quiet: true });
    showToast('Perfil atualizado.');
  }

  async function generatePairingCode() {
    const { data, error } = await db.rpc('create_pairing_code');
    if (error) return alert(friendlyError(error));
    app.pairingCode = typeof data === 'string' ? data : '';
    render();
    showToast('Código criado com sucesso.');
  }

  async function claimPairingCode() {
    const code = ($('#pairCodeInput')?.value || '').trim().toUpperCase();
    if (!/^TEA-[A-F0-9]{8}$/.test(code)) return alert('Digite o código completo no formato TEA-XXXXXXXX.');
    const { error } = await db.rpc('claim_pairing_code', { p_code: code });
    if (error) return alert(friendlyError(error));
    await loadAll();
    showToast('Perfis vinculados com sucesso.');
  }

  async function unlink() {
    if (!confirm('Remover o vínculo atual? Os registros já existentes não serão apagados.')) return;
    const { error } = await db.rpc('unlink_current_connection');
    if (error) return alert(friendlyError(error));
    await loadAll();
    showToast('Vínculo removido.');
  }

  async function saveMood() {
    if (!app.selectedMood) return;
    const m = moodByUi(app.selectedMood);
    const payload = {
      dependent_id: app.profile.id,
      mood: m.db,
      intensity: Number($('#moodIntensity')?.value || 3),
      reason: ($('#moodReason')?.value || '').trim() || null,
      support_need: ($('#moodNeed')?.value || '').trim() || null,
    };
    const { error } = await db.from('mood_entries').insert(payload);
    if (error) return alert(friendlyError(error));
    app.selectedMood = null;
    await loadAll({ quiet: true });
    showToast('Registro emocional salvo.');
  }

  async function saveRoutine() {
    const title = ($('#routineTitle')?.value || '').trim();
    const scheduled_time = $('#routineTime')?.value || '08:00';
    const emoji = ($('#routineEmoji')?.value || '').trim() || '🧩';
    if (!title) return alert('Digite o nome da atividade.');
    const { error } = await db.from('routine_items').insert({ dependent_id: app.profile.id, title, scheduled_time, emoji, sort_order: app.routine.length });
    if (error) return alert(friendlyError(error));
    app.modal = null;
    await loadAll({ quiet: true });
    showToast('Atividade adicionada.');
  }

  async function toggleRoutine(id) {
    const done = app.completions.find((c) => c.routine_item_id === id && c.completed_on === today());
    let error;
    if (done) ({ error } = await db.from('routine_completions').delete().eq('id', done.id));
    else ({ error } = await db.from('routine_completions').insert({ routine_item_id: id, dependent_id: app.profile.id, completed_on: today() }));
    if (error) return alert(friendlyError(error));
    await loadAll({ quiet: true });
  }

  async function deleteRoutine(id) {
    if (!confirm('Apagar esta atividade da rotina?')) return;
    const { error } = await db.from('routine_items').delete().eq('id', id);
    if (error) return alert(friendlyError(error));
    await loadAll({ quiet: true });
    showToast('Atividade removida.');
  }

  async function sendHelp() {
    const urgency = $('#helpUrgency')?.value || 'support';
    const message = ($('#helpMessage')?.value || '').trim() || (urgency === 'urgent' ? 'Preciso de ajuda agora.' : 'Preciso de apoio.');
    const { error } = await db.from('help_requests').insert({ dependent_id: app.profile.id, urgency, message });
    if (error) return alert(friendlyError(error));
    app.modal = null;
    await loadAll({ quiet: true });
    showToast('Pedido de ajuda enviado.');
  }

  async function setHelpStatus(id, action) {
    const fn = action === 'resolve' ? 'resolve_help_request' : 'acknowledge_help_request';
    const { error } = await db.rpc(fn, { p_request_id: id });
    if (error) return alert(friendlyError(error));
    await loadAll({ quiet: true });
    showToast(action === 'resolve' ? 'Pedido marcado como resolvido.' : 'Confirmação registrada.');
  }

  function speak(text) {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR';
      speechSynthesis.speak(u);
    } else alert(text);
  }

  function stopTimers() {
    if (app.breathingTimer) { clearTimeout(app.breathingTimer); app.breathingTimer = null; }
    if (app.visualTimer) { clearInterval(app.visualTimer); app.visualTimer = null; }
  }

  function startBreathing() {
    stopTimers();
    const orb = $('#breathOrb'), txt = $('#breathText');
    if (!orb || !txt) return;
    const seq = [['Inspire', 1.35, 4000], ['Segure', 1.35, 2000], ['Expire', .78, 6000]];
    let i = 0;
    const step = () => {
      const [label, scale, ms] = seq[i % seq.length];
      txt.textContent = label;
      orb.style.transform = `scale(${scale})`;
      app.breathingTimer = setTimeout(() => { i++; step(); }, ms);
    };
    step();
  }

  function startTimer() {
    resetTimer(false);
    const mins = Math.max(1, Math.min(60, Number($('#timerMinutes')?.value) || 5));
    let left = mins * 60;
    const total = left;
    const update = () => {
      const t = $('#timerText'), c = $('#timerCircle');
      if (!t || !c) return;
      const m = Math.floor(left / 60), s = left % 60;
      t.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      c.style.setProperty('--pct', `${100 * (1 - left / total)}%`);
    };
    update();
    app.visualTimer = setInterval(() => {
      left--;
      update();
      if (left <= 0) {
        clearInterval(app.visualTimer);
        app.visualTimer = null;
        alert('Timer concluído.');
      }
    }, 1000);
  }

  function resetTimer() {
    if (app.visualTimer) { clearInterval(app.visualTimer); app.visualTimer = null; }
    const t = $('#timerText'), c = $('#timerCircle');
    if (t) t.textContent = '05:00';
    if (c) c.style.setProperty('--pct', '0%');
  }

  bootstrap();
})();
