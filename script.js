// DATA
let members = JSON.parse(localStorage.getItem('syn_m')) || ["Vito Scaletta", "David Ricci"];
let folders = JSON.parse(localStorage.getItem('syn_f')) || {};
let storage = JSON.parse(localStorage.getItem('syn_s')) || { zbrane: 0, munice: 0, drogy: 0 };
let logs = JSON.parse(localStorage.getItem('syn_l')) || [];
let activeUser = "";

// NAV
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.mdt-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

// MEMBERS
function renderMembers() {
    const search = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = members.filter(m => m.toLowerCase().includes(search)).sort().map(m => `
        <tr>
            <td style="color:#475569">#${Math.floor(1000+Math.random()*9000)}</td>
            <td><strong>${m}</strong></td>
            <td><span style="color:#10b981">● AKTIVNÍ</span></td>
            <td><button class="btn-v" onclick="openDossier('${m}')">PROFIL</button></td>
        </tr>
    `).join('');
}

function openDossier(name) {
    activeUser = name;
    const f = folders[name] || { rank: "", phone: "", lic: "", rec: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-lic').value = f.lic;
    document.getElementById('in-rec').value = f.rec;
    document.getElementById('dossier-modal').style.display = 'block';
}

function tab(e, id) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    e.target.classList.add('active');
}

function saveFolder() {
    const sig = document.getElementById('in-sig').value;
    if(!sig) return alert("Chybí podpis operátora!");
    folders[activeUser] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        lic: document.getElementById('in-lic').value,
        rec: document.getElementById('in-rec').value
    };
    localStorage.setItem('syn_f', JSON.stringify(folders));
    addLog(`Operátor ${sig} aktualizoval profil: ${activeUser}`);
    closeModal();
}

// STORE
function editStore(type) {
    const who = document.getElementById('st-who').value;
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value);
    if(!who || how <= 0) return;
    if(type === 'add') storage[what] += how;
    else {
        if(storage[what] < how) return alert("Nedostatek!");
        storage[what] -= how;
    }
    addLog(`${who}: ${type === 'add' ? 'Příjem' : 'Výdej'} ${how}x ${what}`);
    renderStore();
}

function renderStore() {
    const g = document.getElementById('st-grid');
    g.innerHTML = Object.entries(storage).map(([k,v]) => `
        <div class="st-card">
            <label style="font-size:0.7rem; color:#475569; text-transform:uppercase">${k}</label>
            <span>${v}</span>
        </div>
    `).join('');
    localStorage.setItem('syn_s', JSON.stringify(storage));
}

// ADMIN
function loginAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-ui').style.display = 'block';
        renderLogs();
    }
}

function addMem() {
    const n = document.getElementById('new-mem-name').value;
    if(!n) return;
    members.push(n);
    localStorage.setItem('syn_m', JSON.stringify(members));
    addLog(`ADMIN: Registrace nového občana ${n}`);
    renderMembers();
}

function addLog(m) {
    logs.unshift(`[${new Date().toLocaleString()}] ${m}`);
    localStorage.setItem('syn_l', JSON.stringify(logs));
}

function renderLogs() {
    document.getElementById('log-list').innerHTML = logs.map(l => `<div style="padding:8px; border-bottom:1px solid var(--border); font-size:0.8rem; color:#64748b">${l}</div>`).join('');
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

// START
showPage('home');