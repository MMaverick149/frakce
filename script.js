let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0, zlutatrava: 0 };
let currentU = "";

// Ochrana proti NaN
for (let key in s_data) { if(isNaN(s_data[key])) s_data[key] = 0; }

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const search = document.getElementById('m-search').value.toLowerCase();
    const tbody = document.getElementById('members-list');
    tbody.innerHTML = m_list.filter(m => m.toLowerCase().includes(search)).map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        const idCode = Math.floor(1000 + (m.length * 123) % 8999);
        return `<tr>
            <td style="color:#334155; font-weight:700;">#${idCode}</td>
            <td style="color:var(--accent); font-weight:700;">${data.rank.toUpperCase()}</td>
            <td style="font-weight:600;">${m}</td>
            <td><button onclick="openDossier('${m}')" style="background:none; border:1px solid var(--accent); color:var(--accent); padding:6px 12px; cursor:pointer; border-radius:4px; font-weight:bold; font-size:0.7rem;">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v;
        let icon = '<i class="fas fa-box fa-2x"></i>';
        if(k === 'zlutatrava') icon = '<i class="fas fa-leaf fa-2x" style="color:#fbbf24"></i>';
        if(k === 'zbrane') icon = '<i class="fas fa-gun fa-2x"></i>';
        
        return `<div class="st-card">
            <div style="opacity:0.5; margin-bottom:10px;">${icon}</div>
            <label style="color:var(--text-dim); font-size:0.7rem; font-weight:700; letter-spacing:1px;">${k.toUpperCase()}</label>
            <span>${val}</span>
        </div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const item = document.getElementById('st-what').value;
    const qty = parseInt(document.getElementById('st-how').value) || 0;
    if(type === 'add') s_data[item] += qty;
    else s_data[item] = Math.max(0, s_data[item] - qty);
    renderStore();
}

function openDossier(name) {
    currentU = name;
    const data = f_data[name] || { rank: "", phone: "", items: "", notes: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = data.rank || "";
    document.getElementById('in-phone').value = data.phone || "";
    document.getElementById('in-items').value = data.items || "";
    document.getElementById('in-notes').value = data.notes || "";
    document.getElementById('dossier-modal').style.display = 'flex';
}

function switchTab(e, tabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    e.currentTarget.classList.add('active');
}

function saveFolder() {
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    closeModal();
    renderMembers();
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

function unlockAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else { alert("ACCESS DENIED"); }
}

function addMem() {
    const name = document.getElementById('new-mem-name').value;
    const rank = document.getElementById('new-mem-rank').value;
    if(!name) return;
    if(!m_list.includes(name)) m_list.push(name);
    f_data[name] = { rank: rank, phone: "", items: "", notes: "" };
    localStorage.setItem('syn_m_list', JSON.stringify(m_list));
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    showPage('members');
}

// Inicializace
showPage('home');