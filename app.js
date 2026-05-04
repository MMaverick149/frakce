// ─── STORAGE ────────────────────────────────
const DB = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

// ─── INIT ────────────────────────────────────
function initSystem() {
  if (!DB.get('nx_users')) {
    DB.set('nx_users', {
      'admin': {
        pass: 'admin2026', role: 'admin',
        displayName: 'Director', rank: 'Director',
        rating: 5, note: 'Command access'
      },
      'test': {
        pass: 'demo123', role: 'member',
        displayName: 'Agent Zero', rank: 'Operative',
        rating: 3, note: 'Demo účet'
      }
    });
  }
  if (!DB.get('nx_tasks')) DB.set('nx_tasks', {});
  if (!DB.get('nx_messages')) DB.set('nx_messages', {});
  if (!DB.get('nx_reports')) DB.set('nx_reports', []);
}

// ─── STATE ───────────────────────────────────
let currentUser = null;

// ─── BOOT SEQUENCE ───────────────────────────
const bootMessages = [
  '> NEXUS FRAMEWORK v4.1.7',
  '> Initializing secure channel...',
  '> Cryptographic handshake: OK',
  '> Loading agent database...',
  '> Verifying clearance levels...',
  '> Establishing encrypted tunnel...',
  '> All systems nominal.',
  '> ACCESS PORTAL READY.',
];

// Konfigurace barev a inicializace systému
const BOOT_LINES = [
  "NEXUS CORE v3.0.4 - INICIALIZACE...",
  "JADRO: NAČTENO OK",
  "DEŠIFROVÁNÍ KVANTOVÝCH PROTOKOLŮ...",
  "OBCHÁZENÍ AUTENTIZAČNÍ BRÁNY...",
  "NAVAZOVÁNÍ ZABEZPEČENÉHO PŘIPOJENÍ...",
  "ESTABLISHING SECURE CONNECTION...",
  "WELCOME BACK, ADMIN."
];

// Spuštění systému ihned po načtení stránky
window.addEventListener('load', () => {
    runBoot();
});

function runBoot() {
    const el = document.getElementById('bootLines');
    if (!el) return; // Ochrana pokud element neexistuje

    let i = 0;
    function next() {
        if (i >= BOOT_LINES.length) {
            setTimeout(() => {
                // AUTOMATICKÝ LOGIN: Nastavení uživatele a přepnutí obrazovky
                window.currentUser = { login: 'admin', role: 'Director' };
                
                // Skrytí boot screenu a zobrazení admin panelu
                document.getElementById('bootScreen').style.display = 'none';
                document.getElementById('adminScreen').style.display = 'grid';
                
                // Spuštění vizuálních efektů pozadí
                startCanvas();
            }, 800);
            return;
        }
        
        const line = document.createElement('div');
        line.className = 'boot-line';
        line.textContent = BOOT_LINES[i++];
        el.appendChild(line);
        
        // Náhodná prodleva pro efekt hackování
        setTimeout(next, 100 + Math.random() * 200);
    }
    
    // Krátká pauza před začátkem bootu
    setTimeout(next, 500);
}

// Funkce pro Canvas (Žlutý neonový efekt)
function startCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Nastavení rozměrů
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function draw() {
        ctx.fillStyle = 'rgba(5, 5, 0, 0.1)'; // Tmavé pozadí s echo efektem
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#ffea00'; // Žlutá barva z vaší palety
        ctx.lineWidth = 0.5;
        
        // Zde by následovala vaše specifická animace (mřížka/částice)
        // ...
        requestAnimationFrame(draw);
    }
    draw();
}

// ─── CANVAS GRID ─────────────────────────────
function startCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particles
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.5 + 0.5
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Particles + connections
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      });
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ─── CLOCKS ──────────────────────────────────
function startClocks() {
  function update() {
    const now = new Date();
    const str = now.toLocaleString('cs-CZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const short = now.toLocaleTimeString('cs-CZ');
    setElText('loginClock', str);
    setElText('dashClock', str);
    setElText('termClock', short);
  }
  update();
  setInterval(update, 1000);
}

function setElText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── SCREEN ──────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ─── LOGIN ───────────────────────────────────
function doLogin() {
  const name = document.getElementById('loginName').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if (!name || !pass) { errEl.textContent = '// VYPLŇTE AGENT ID A AUTH KEY'; return; }

  const users = DB.get('nx_users') || {};
  const user = users[name];

  if (!user || user.pass !== pass) {
    errEl.textContent = '// PŘÍSTUP ODEPŘEN — NEPLATNÉ PŘIHLAŠOVACÍ ÚDAJE';
    return;
  }

  currentUser = { login: name, ...user };

  if (user.role === 'admin') {
    showScreen('adminScreen');
    renderAdminAgents();
    populateTargetSelects();
  } else {
    showScreen('memberScreen');
    renderMemberDashboard();
  }
}

function doLogout() {
  currentUser = null;
  document.getElementById('loginName').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').textContent = '';
  showScreen('loginScreen');
}

// ─── MEMBER DASHBOARD ────────────────────────
function renderMemberDashboard() {
  const u = currentUser;
  setElText('sidebarName', u.displayName);
  setElText('sidebarRank', u.rank);
  setElText('ovName', u.displayName);
  setElText('ovRank', u.rank);
  setElText('ovNote', u.note || '');
  setElText('termAgent', u.login);
  document.getElementById('profileHex').textContent = u.displayName.charAt(0).toUpperCase();

  const stars = ratingStars(u.rating);
  setElText('ovRating', stars);
  setElText('ovRatingLarge', stars);

  const tasks = DB.get('nx_tasks') || {};
  const myTasks = (tasks[u.login] || []).filter(t => !t.done);
  setElText('ovTaskCount', myTasks.length);

  // task badge
  const badge = document.getElementById('taskBadge');
  if (myTasks.length > 0) { badge.textContent = myTasks.length; badge.classList.add('visible'); }
  else badge.classList.remove('visible');

  // messages badge
  const msgs = DB.get('nx_messages') || {};
  const myMsgs = msgs[u.login] || [];
  const msgBadge = document.getElementById('msgBadge');
  if (myMsgs.length > 0) { msgBadge.textContent = myMsgs.length; msgBadge.classList.add('visible'); }
  else msgBadge.classList.remove('visible');

  // last task preview
  const lastTask = myTasks[myTasks.length - 1];
  setElText('ovLastTask', lastTask
    ? `[${priorityLabel(lastTask.priority)}] ${lastTask.title} — ${lastTask.date}`
    : '// Žádné aktivní úkoly');
}

function showMemberTab(tab, btn) {
  document.querySelectorAll('.member-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`mtab-${tab}`).classList.add('active');
  if (btn) btn.classList.add('active');

  if (tab === 'tasks') renderMemberTasks();
  if (tab === 'messages') renderMemberMessages();
  if (tab === 'report') renderSentReports();
}

function renderMemberTasks() {
  const tasks = DB.get('nx_tasks') || {};
  const myTasks = (tasks[currentUser.login] || []).filter(t => !t.done);
  const el = document.getElementById('memberTaskList');

  if (!myTasks.length) {
    el.innerHTML = '<div class="empty-state">// ŽÁDNÉ AKTIVNÍ OPERAČNÍ ROZKAZY</div>';
    return;
  }

  el.innerHTML = myTasks.map((t, i) => `
    <div class="task-card ${t.priority}">
      <div class="task-top">
        <span class="task-name">${esc(t.title)}</span>
        <span class="priority-chip ${t.priority}">${priorityLabel(t.priority)}</span>
      </div>
      <div class="task-brief">${esc(t.desc)}</div>
      <div class="task-meta">
        <span class="task-date">${t.date}</span>
        <button class="btn-done" onclick="markDone('${currentUser.login}', ${i})">✓ SPLNĚNO</button>
      </div>
    </div>
  `).join('');
}

function markDone(login, idx) {
  const tasks = DB.get('nx_tasks') || {};
  if (tasks[login]) { tasks[login][idx].done = true; DB.set('nx_tasks', tasks); renderMemberTasks(); renderMemberDashboard(); }
}

function renderMemberMessages() {
  const msgs = DB.get('nx_messages') || {};
  const myMsgs = msgs[currentUser.login] || [];
  const el = document.getElementById('memberMsgList');

  if (!myMsgs.length) {
    el.innerHTML = '<div class="empty-state">// ŽÁDNÉ PŘÍCHOZÍ PŘENOSY</div>';
    return;
  }

  el.innerHTML = [...myMsgs].reverse().map(m => `
    <div class="msg-card">
      <div class="msg-subject">${esc(m.subject)}</div>
      <div class="msg-body">${esc(m.body)}</div>
      <div class="msg-from">// PŘENOS OD: COMMAND — ${m.date}</div>
    </div>
  `).join('');
}

function submitReport() {
  const text = document.getElementById('memberReport').value.trim();
  const st = document.getElementById('reportStatus');

  if (!text) { st.textContent = '// PRÁZDNÝ PŘENOS'; return; }

  const reports = DB.get('nx_reports') || [];
  reports.push({ from: currentUser.login, displayName: currentUser.displayName, body: text, date: nowStr() });
  DB.set('nx_reports', reports);
  document.getElementById('memberReport').value = '';
  st.textContent = '// PŘENOS ODESLÁN ✓';
  setTimeout(() => st.textContent = '', 3000);
  renderSentReports();
}

function renderSentReports() {
  const reports = DB.get('nx_reports') || [];
  const mine = reports.filter(r => r.from === currentUser.login);
  const el = document.getElementById('reportHistory');

  if (!mine.length) { el.innerHTML = '<div class="empty-state">// ŽÁDNÉ ODESLANÉ PŘENOSY</div>'; return; }

  el.innerHTML = [...mine].reverse().map(r => `
    <div class="sent-entry">
      <span class="sent-entry-date">${r.date}</span>
      ${esc(r.body)}
    </div>
  `).join('');
}

// ─── ADMIN ───────────────────────────────────
function showAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(`atab-${tab}`).classList.add('active');
  if (btn) btn.classList.add('active');

  if (tab === 'agents') renderAdminAgents();
  if (tab === 'tasks') populateTargetSelects();
  if (tab === 'messages') populateTargetSelects();
  if (tab === 'reports') renderAllReports();
}

function renderAdminAgents() {
  const users = DB.get('nx_users') || {};
  const members = Object.entries(users).filter(([, u]) => u.role !== 'admin');
  const el = document.getElementById('agentGrid');

  if (!members.length) { el.innerHTML = '<div class="empty-state">// ŽÁDNÍ REGISTROVANÍ AGENTI</div>'; return; }

  el.innerHTML = members.map(([login, u]) => `
    <div class="agent-card">
      <div class="agent-card-header">
        <div>
          <div class="agent-card-name">${esc(u.displayName)}</div>
          <div class="agent-card-login">ID: ${login}</div>
        </div>
        <div class="rank-chip agent-card-rank">${esc(u.rank)}</div>
      </div>
      <div class="agent-card-rating">${ratingStars(u.rating)}</div>
      ${u.note ? `<div class="agent-card-note">${esc(u.note)}</div>` : ''}
      <div class="agent-card-actions">
        <button class="btn-micro" onclick="editRating('${login}')">RATING</button>
        <button class="btn-micro" onclick="editRank('${login}')">RANK</button>
        <button class="btn-micro" onclick="editNote('${login}')">POZNÁMKA</button>
        <button class="btn-micro danger" onclick="deleteAgent('${login}')">SMAZAT</button>
      </div>
    </div>
  `).join('');
}

function toggleNewAgent() {
  document.getElementById('newAgentPanel').classList.toggle('hidden');
}

function createAgent() {
  const login = document.getElementById('na-login').value.trim().toLowerCase();
  const pass = document.getElementById('na-pass').value.trim();
  const displayName = document.getElementById('na-name').value.trim();
  const rating = parseInt(document.getElementById('na-rating').value);
  const rank = document.getElementById('na-rank').value;
  const note = document.getElementById('na-note').value.trim();
  const st = document.getElementById('createStatus');

  if (!login || !pass || !displayName) { st.textContent = '// VYPLŇTE POVINNÁ POLE'; return; }

  const users = DB.get('nx_users') || {};
  if (users[login]) { st.textContent = `// AGENT ID "${login}" JIŽ EXISTUJE`; return; }

  users[login] = { pass, role: 'member', displayName, rank, rating, note };
  DB.set('nx_users', users);

  st.textContent = `// AGENT ${displayName.toUpperCase()} REGISTROVÁN ✓`;
  setTimeout(() => st.textContent = '', 3000);
  ['na-login','na-pass','na-name','na-note'].forEach(id => document.getElementById(id).value = '');
  renderAdminAgents();
  populateTargetSelects();
}

function editRating(login) {
  const users = DB.get('nx_users') || {};
  const r = prompt(`Nové hodnocení pro ${users[login].displayName} (1–5):`, users[login].rating);
  const n = parseInt(r);
  if (r !== null && n >= 1 && n <= 5) { users[login].rating = n; DB.set('nx_users', users); renderAdminAgents(); }
  else if (r !== null) alert('Zadejte číslo 1–5.');
}

function editRank(login) {
  const ranks = ['Recruit','Operative','Agent','Field Lead','Commander','Director'];
  const users = DB.get('nx_users') || {};
  const r = prompt(`Nový rank (${ranks.join(' / ')}):`, users[login].rank);
  if (r !== null && ranks.includes(r)) { users[login].rank = r; DB.set('nx_users', users); renderAdminAgents(); }
  else if (r !== null) alert('Neplatný rank: ' + ranks.join(', '));
}

function editNote(login) {
  const users = DB.get('nx_users') || {};
  const r = prompt(`Poznámka pro ${users[login].displayName}:`, users[login].note || '');
  if (r !== null) { users[login].note = r; DB.set('nx_users', users); renderAdminAgents(); }
}

function deleteAgent(login) {
  if (!confirm(`Smazat agenta "${login}"?`)) return;
  const users = DB.get('nx_users') || {};
  delete users[login];
  DB.set('nx_users', users);
  renderAdminAgents();
  populateTargetSelects();
}

// ─── TASKS (admin) ────────────────────────────
function assignTask() {
  const target = document.getElementById('task-target').value;
  const title = document.getElementById('task-title').value.trim();
  const desc = document.getElementById('task-desc').value.trim();
  const priority = document.getElementById('task-priority').value;
  const st = document.getElementById('taskStatus');

  if (!target || !title) { st.textContent = '// VYBERTE AGENTA A ZADEJTE OPERACI'; return; }

  const tasks = DB.get('nx_tasks') || {};
  if (!tasks[target]) tasks[target] = [];
  tasks[target].push({ title, desc, priority, date: nowStr(), done: false });
  DB.set('nx_tasks', tasks);
  st.textContent = '// ROZKAZ ODESLÁN ✓';
  setTimeout(() => st.textContent = '', 3000);
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
}

// ─── MESSAGES (admin) ─────────────────────────
function sendMessage() {
  const target = document.getElementById('msg-target').value;
  const subject = document.getElementById('msg-subject').value.trim();
  const body = document.getElementById('msg-body').value.trim();
  const st = document.getElementById('msgStatus');

  if (!target || !subject || !body) { st.textContent = '// VYPLŇTE VŠECHNA POLE'; return; }

  const msgs = DB.get('nx_messages') || {};
  if (!msgs[target]) msgs[target] = [];
  msgs[target].push({ subject, body, date: nowStr() });
  DB.set('nx_messages', msgs);
  st.textContent = '// PŘENOS ODESLÁN ✓';
  setTimeout(() => st.textContent = '', 3000);
  document.getElementById('msg-subject').value = '';
  document.getElementById('msg-body').value = '';
}

// ─── REPORTS (admin) ──────────────────────────
function renderAllReports() {
  const reports = DB.get('nx_reports') || [];
  const el = document.getElementById('allReports');

  if (!reports.length) { el.innerHTML = '<div class="empty-state">// ŽÁDNÁ HLÁŠENÍ OD AGENTŮ</div>'; return; }

  el.innerHTML = [...reports].reverse().map(r => `
    <div class="report-card">
      <div class="report-from">// PŘENOS OD: ${esc(r.displayName)} [${r.from}]</div>
      <div class="report-body">${esc(r.body)}</div>
      <div class="report-date">${r.date}</div>
    </div>
  `).join('');
}

// ─── HELPERS ─────────────────────────────────
function populateTargetSelects() {
  const users = DB.get('nx_users') || {};
  const members = Object.entries(users).filter(([, u]) => u.role !== 'admin');
  const opts = '<option value="">-- Vyberte agenta --</option>' +
    members.map(([l, u]) => `<option value="${l}">${esc(u.displayName)} [${l}]</option>`).join('');
  ['task-target','msg-target'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = opts; });
}

function ratingStars(r) {
  const n = parseInt(r) || 0;
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
}

function priorityLabel(p) {
  return { low: 'LOW', normal: 'NORMAL', high: 'HIGH', urgent: 'URGENT' }[p] || p;
}

function nowStr() {
  return new Date().toLocaleString('cs-CZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/\n/g,'<br>');
}

// ─── START ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  runBoot();
  document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  document.getElementById('loginName').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});

// ═══════════════════════════════════════════
//  WAREHOUSE / SKLAD
// ═══════════════════════════════════════════

const CAT_LABELS = {
  weapons: '⚔ ZBRANĚ',
  ammo: '◎ MUNICE',
  vehicles: '◧ VOZIDLA',
  equipment: '⬢ VYBAVENÍ',
  other: '◆ OSTATNÍ'
};

// Default demo items on first init
function initWarehouse() {
  if (!DB.get('nx_warehouse')) {
    DB.set('nx_warehouse', [
      { id: uid(), name: 'Nabojnice dlouhé', cat: 'ammo',     qty: 0, min: 0,  note: 'Dlouhé náboje',     img: 'nabojdlouhy.png'  },
      { id: uid(), name: 'Nabojnice pistol',  cat: 'ammo',     qty: 0, min: 0, note: 'Pistolové náboje',   img: 'nabojpistol.png'  },
      { id: uid(), name: 'Baterka',           cat: 'equipment',qty: 0,  min: 0,  note: 'Taktická svítilna',  img: 'baterka.png'  },
      { id: uid(), name: 'Tlumič',            cat: 'equipment',  qty: 0,  min: 0,  note: 'Pro pistoli a dlouhé',  img: 'tlumic.png'  },
      { id: uid(), name: 'Zaměřovač',         cat: 'equipment',  qty: 0,  min: 0,  note: 'Optický zaměřovač', img: 'zamerovac.png'  },
      { id: uid(), name: 'Velký zásobník',    cat: 'equipment',  qty: 0,  min: 0,  note: 'Extended mag',       img: 'velkyzasobnik.png'  },
      { id: uid(), name: 'Žlutá Trava',       cat: 'other',    qty: 0,  min: 0,  note: 'Speciální item',     img: 'zlutatrava.png'  },
    ]);
  }
  if (!DB.get('nx_item_requests')) DB.set('nx_item_requests', []);
}

// Helper: render item image (falls back to category icon if no image)
function itemImg(item) {
  const fallback = { weapons:'⚔', ammo:'◎', vehicles:'◧', equipment:'⬢', other:'◆' };
  if (item.img) {
    return `<div class="wh-item-img"><img src="images/${esc(item.img)}" alt="${esc(item.name)}" onerror="this.parentElement.innerHTML='<span class=wh-item-icon>${fallback[item.cat]||'◆'}</span>'" /></div>`;
  }
  return `<div class="wh-item-img"><span class="wh-item-icon">${fallback[item.cat]||'◆'}</span></div>`;
}

// ── MEMBER: view warehouse ────────────────────
let memberWhFilter = 'all';

function renderMemberWarehouse() {
  initWarehouse();
  const items = DB.get('nx_warehouse') || [];
  const el = document.getElementById('memberWarehouseGrid');
  const filtered = memberWhFilter === 'all' ? items : items.filter(i => i.cat === memberWhFilter);

  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">// ŽÁDNÉ ITEMY V TÉTO KATEGORII</div>';
  } else {
    el.innerHTML = filtered.map(item => {
      const qtyClass = item.qty === 0 ? 'empty' : (item.min > 0 && item.qty <= item.min ? 'low' : '');
      return `
        <div class="wh-item">
          ${itemImg(item)}
          <div class="wh-item-cat">${CAT_LABELS[item.cat] || item.cat}</div>
          <div class="wh-item-name">${esc(item.name)}</div>
          ${item.note ? `<div class="wh-item-note">${esc(item.note)}</div>` : ''}
          <div class="wh-item-qty-row">
            <div>
              <span class="wh-item-qty ${qtyClass}">${item.qty}</span>
              <span class="wh-item-unit"> KS</span>
            </div>
          </div>
          ${item.min > 0 && item.qty > 0 && item.qty <= item.min ? '<div class="wh-item-alert">NÍZKÁ ZÁSOBA</div>' : ''}
        </div>
      `;
    }).join('');
  }

  // populate request select
  const avail = items.filter(i => i.qty > 0);
  const sel = document.getElementById('req-item');
  sel.innerHTML = avail.length
    ? avail.map(i => `<option value="${i.id}">${esc(i.name)} (${i.qty} ks)</option>`).join('')
    : '<option value="">-- Žádné dostupné itemy --</option>';

  renderMyRequests();
}

function filterWarehouse(cat, btn) {
  memberWhFilter = cat;
  document.querySelectorAll('#mtab-warehouse .wh-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMemberWarehouse();
}

function submitItemRequest() {
  const itemId = document.getElementById('req-item').value;
  const amount = parseInt(document.getElementById('req-amount').value) || 1;
  const reason = document.getElementById('req-reason').value.trim();
  const st = document.getElementById('reqStatus');

  if (!itemId) { st.textContent = '// VYBERTE ITEM'; return; }
  if (!reason) { st.textContent = '// ZADEJTE DŮVOD ŽÁDOSTI'; return; }

  const items = DB.get('nx_warehouse') || [];
  const item = items.find(i => i.id === itemId);
  if (!item) { st.textContent = '// ITEM NENALEZEN'; return; }
  if (amount > item.qty) { st.textContent = `// NEDOSTATEČNÁ ZÁSOBA (max ${item.qty})`; return; }

  const reqs = DB.get('nx_item_requests') || [];
  reqs.push({
    id: uid(),
    agentLogin: currentUser.login,
    agentName: currentUser.displayName,
    itemId,
    itemName: item.name,
    amount,
    reason,
    status: 'pending',
    date: nowStr()
  });
  DB.set('nx_item_requests', reqs);

  document.getElementById('req-reason').value = '';
  document.getElementById('req-amount').value = '1';
  st.textContent = '// ŽÁDOST ODESLÁNA ✓';
  setTimeout(() => st.textContent = '', 3000);
  renderMyRequests();
}

function renderMyRequests() {
  const reqs = DB.get('nx_item_requests') || [];
  const mine = reqs.filter(r => r.agentLogin === currentUser.login);
  const el = document.getElementById('myRequests');

  if (!mine.length) { el.innerHTML = '<div class="empty-state">// ŽÁDNÉ ODESLANÉ ŽÁDOSTI</div>'; return; }

  el.innerHTML = [...mine].reverse().map(r => `
    <div class="req-entry">
      <div class="req-entry-info">
        <span class="req-entry-date">${r.date}</span>
        <strong style="color:var(--text-bright)">${esc(r.itemName)}</strong> — ${r.amount} ks
        <br><span style="font-style:italic;font-size:0.8rem">${esc(r.reason)}</span>
      </div>
      <span class="wh-req-status ${r.status}">${statusLabel(r.status)}</span>
    </div>
  `).join('');
}

// ── ADMIN: warehouse management ──────────────
let adminWhFilter = 'all';

function renderAdminWarehouse() {
  initWarehouse();
  const items = DB.get('nx_warehouse') || [];
  const el = document.getElementById('adminWarehouseGrid');
  const filtered = adminWhFilter === 'all' ? items : items.filter(i => i.cat === adminWhFilter);

  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1">// SKLAD JE PRÁZDNÝ</div>';
  } else {
    el.innerHTML = filtered.map(item => {
      const qtyClass = item.qty === 0 ? 'empty' : (item.min > 0 && item.qty <= item.min ? 'low' : '');
      return `
        <div class="wh-item">
          ${itemImg(item)}
          <div class="wh-item-cat">${CAT_LABELS[item.cat] || item.cat}</div>
          <div class="wh-item-name">${esc(item.name)}</div>
          ${item.note ? `<div class="wh-item-note">${esc(item.note)}</div>` : ''}
          <div class="wh-item-qty-row">
            <div>
              <span class="wh-item-qty ${qtyClass}">${item.qty}</span>
              <span class="wh-item-unit"> KS</span>
            </div>
          </div>
          ${item.min > 0 && item.qty <= item.min && item.qty > 0 ? '<div class="wh-item-alert">NÍZKÁ ZÁSOBA</div>' : ''}
          <div class="wh-admin-controls">
            <input type="number" class="wh-qty-input" id="qinput-${item.id}" value="1" min="1" title="Množství" />
            <button class="btn-micro" onclick="adjustQty('${item.id}', 1)">+</button>
            <button class="btn-micro" onclick="adjustQty('${item.id}', -1)">−</button>
            <button class="btn-micro danger" onclick="deleteItem('${item.id}')">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAdminRequests();
}

function filterAdminWarehouse(cat, btn) {
  adminWhFilter = cat;
  document.querySelectorAll('#atab-warehouse .wh-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminWarehouse();
}

function toggleAddItem() {
  document.getElementById('addItemPanel').classList.toggle('hidden');
}

function addWarehouseItem() {
  const name = document.getElementById('wi-name').value.trim();
  const cat = document.getElementById('wi-cat').value;
  const qty = parseInt(document.getElementById('wi-qty').value) || 0;
  const min = parseInt(document.getElementById('wi-min').value) || 0;
  const note = document.getElementById('wi-note').value.trim();
  const img = document.getElementById('wi-img').value.trim();
  const st = document.getElementById('addItemStatus');

  if (!name) { st.textContent = '// ZADEJTE NÁZEV ITEMU'; return; }

  const items = DB.get('nx_warehouse') || [];
  items.push({ id: uid(), name, cat, qty, min, note, img });
  DB.set('nx_warehouse', items);

  st.textContent = `// ${name.toUpperCase()} PŘIDÁN ✓`;
  setTimeout(() => st.textContent = '', 3000);
  ['wi-name','wi-note','wi-img'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('wi-qty').value = '1';
  document.getElementById('wi-min').value = '0';
  renderAdminWarehouse();
}

function adjustQty(itemId, dir) {
  const inp = document.getElementById(`qinput-${itemId}`);
  const amount = parseInt(inp ? inp.value : 1) || 1;
  const items = DB.get('nx_warehouse') || [];
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  item.qty = Math.max(0, item.qty + dir * amount);
  DB.set('nx_warehouse', items);
  renderAdminWarehouse();
}

function deleteItem(itemId) {
  if (!confirm('Smazat item ze skladu?')) return;
  let items = DB.get('nx_warehouse') || [];
  items = items.filter(i => i.id !== itemId);
  DB.set('nx_warehouse', items);
  renderAdminWarehouse();
}

// ── ADMIN: item requests ──────────────────────
function renderAdminRequests() {
  const reqs = DB.get('nx_item_requests') || [];
  const el = document.getElementById('adminRequests');
  const badge = document.getElementById('pendingCount');
  const pending = reqs.filter(r => r.status === 'pending');

  if (pending.length > 0) { badge.textContent = pending.length; badge.classList.add('visible'); }
  else badge.classList.remove('visible');

  if (!reqs.length) { el.innerHTML = '<div class="empty-state">// ŽÁDNÉ ŽÁDOSTI O VÝDEJ</div>'; return; }

  el.innerHTML = [...reqs].reverse().map(r => `
    <div class="wh-req-card ${r.status}" id="req-${r.id}">
      <div class="wh-req-info">
        <div class="wh-req-title">${esc(r.itemName)} — ${r.amount} ks</div>
        <div class="wh-req-meta">AGENT: ${esc(r.agentName)} [${r.agentLogin}] · ${r.date}</div>
        <div class="wh-req-reason">${esc(r.reason)}</div>
      </div>
      ${r.status === 'pending' ? `
        <div class="wh-req-actions">
          <button class="btn-approve" onclick="resolveRequest('${r.id}', 'approved')">✓ SCHVÁLIT</button>
          <button class="btn-deny" onclick="resolveRequest('${r.id}', 'denied')">✕ ZAMÍTNOUT</button>
        </div>
      ` : `<span class="wh-req-status ${r.status}">${statusLabel(r.status)}</span>`}
    </div>
  `).join('');
}

function resolveRequest(reqId, decision) {
  const reqs = DB.get('nx_item_requests') || [];
  const req = reqs.find(r => r.id === reqId);
  if (!req) return;

  req.status = decision;

  // If approved → deduct from warehouse
  if (decision === 'approved') {
    const items = DB.get('nx_warehouse') || [];
    const item = items.find(i => i.id === req.itemId);
    if (item) {
      item.qty = Math.max(0, item.qty - req.amount);
      DB.set('nx_warehouse', items);
    }

    // Notify agent via message
    const msgs = DB.get('nx_messages') || {};
    if (!msgs[req.agentLogin]) msgs[req.agentLogin] = [];
    msgs[req.agentLogin].push({
      subject: `✓ Žádost schválena: ${req.itemName}`,
      body: `Vaše žádost o výdej ${req.amount}× ${req.itemName} byla schválena. Item si vyzvedněte u velení.`,
      date: nowStr()
    });
    DB.set('nx_messages', msgs);
  }

  DB.set('nx_item_requests', reqs);
  renderAdminRequests();
  renderAdminWarehouse();
}

// ── Hook into showMemberTab / showAdminTab ────
const _origShowMemberTab = showMemberTab;
showMemberTab = function(tab, btn) {
  _origShowMemberTab(tab, btn);
  if (tab === 'warehouse') renderMemberWarehouse();
};

const _origShowAdminTab = showAdminTab;
showAdminTab = function(tab, btn) {
  _origShowAdminTab(tab, btn);
  if (tab === 'warehouse') renderAdminWarehouse();
};

// ── UTILS ─────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function statusLabel(s) {
  return { pending: 'ČEKÁ', approved: 'SCHVÁLENO', denied: 'ZAMÍTNUTO' }[s] || s;
}

// ── Image preview in add-item form ────────────
document.addEventListener('DOMContentLoaded', () => {
  // (DOMContentLoaded already registered — use event delegation)
  document.body.addEventListener('input', e => {
    if (e.target.id === 'wi-img') {
      const preview = document.getElementById('wi-img-preview');
      if (!preview) return;
      const val = e.target.value.trim();
      if (!val) { preview.innerHTML = '—'; return; }
      preview.innerHTML = `<img src="images/${esc(val)}" alt="preview" onerror="this.parentElement.innerHTML='<span style=color:var(--red)>// Obrázek nenalezen</span>'" />`;
    }
  });
});

// --- MODUL: SPRÁVA ČLENŮ A HISTORIE NEXUS ---

/**
 * Inicializace rozhraní pro jméno a historii
 */
function initNexusHistory() {
    // Najdeme místo, kam sekci vložíme (zkusíme hlavní kontejner nebo konec body)
    const target = document.querySelector('.container') || document.querySelector('main') || document.body;
    
    // Pokud už políčko existuje, nepodruhé nevytváříme
    if (document.getElementById('memberName')) return;

    const html = `
        <div id="nexus-history-section" style="margin-top: 50px; padding: 20px; background: rgba(20, 20, 20, 0.6); border-radius: 8px; border: 1px solid #333;">
            <h2 style="color: #f1c40f; border-bottom: 1px solid #f1c40f; padding-bottom: 10px;">SPRÁVA OPERACE</h2>
            
            <div style="margin: 20px 0;">
                <label style="display: block; color: #888; margin-bottom: 8px;">IDENTIFIKACE ČLENA (Povinné pro zápis):</label>
                <input type="text" id="memberName" placeholder="Zadejte volací znak / jméno..." 
                    style="width: 100%; max-width: 400px; padding: 12px; background: #111; color: #fff; border: 1px solid #444; border-radius: 4px; font-family: monospace;">
            </div>

            <h3 style="color: #f1c40f; margin-top: 30px;">LOGISTICKÁ HISTORIE</h3>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-family: monospace;">
                    <thead>
                        <tr style="text-align: left; color: #555; border-bottom: 2px solid #222;">
                            <th style="padding: 10px;">ČAS</th>
                            <th style="padding: 10px;">OPERÁTOR</th>
                            <th style="padding: 10px;">POLOŽKA</th>
                            <th style="padding: 10px;">ZMĚNA</th>
                        </tr>
                    </thead>
                    <tbody id="history-table-body">
                        <!-- Záznamy se vloží sem -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    target.insertAdjacentHTML('beforeend', html);
    renderNexusHistory(); // Vykreslíme data z DB
}

// Funkce pro zápis do historie
function logNexusMovement(itemName, changeCount) {
    const nameField = document.getElementById('memberName');
    const operator = nameField && nameField.value.trim() !== "" ? nameField.value.trim() : "Neznámý";

    const entry = {
        time: new Date().toLocaleString('cs-CZ'),
        operator: operator,
        item: itemName,
        change: changeCount
    };

    let history = DB.get('nx_history') || [];
    history.unshift(entry);
    DB.set('nx_history', history.slice(0, 20)); // Uložíme posledních 20 změn
    
    renderNexusHistory();
}

// Funkce pro vykreslení tabulky
function renderNexusHistory() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    const history = DB.get('nx_history') || [];
    tbody.innerHTML = history.map(h => `
        <tr style="border-bottom: 1px solid #222;">
            <td style="padding: 8px;">${h.time}</td>
            <td style="padding: 8px;"><strong>${h.operator}</strong></td>
            <td style="padding: 8px;">${h.item}</td>
            <td style="padding: 8px; color: ${h.change > 0 ? '#2ecc71' : '#e74c3c'}">
                ${h.change > 0 ? '+' : ''}${h.change} ks
            </td>
        </tr>
    `).join('');
}

// Spustit hned po načtení, aby se ukázala uložená historie
renderNexusHistory();