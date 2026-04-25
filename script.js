// --- DATA (LocalStorage) ---
let m_data = JSON.parse(localStorage.getItem('syn_m')) || ["Vito Scaletta", "David Ricci"];
let f_data = JSON.parse(localStorage.getItem('syn_f')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s')) || { zbrane: 0, munice: 0, kontraband: 0 };
let l_data = JSON.parse(localStorage.getItem('syn_l')) || [];
let currentU = "";

// --- NAVIGATION ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    document.getElementById('current-path').innerText = id.charAt(0).toUpperCase() + id.slice(1);
    
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

// --- MEMBERS / SLOŽKY ---
function renderMembers() {
    const s = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    
    list.innerHTML = m_data.filter(m => m.toLowerCase().includes(s)).sort().map(m => `
        <tr>
            <td style="color:#222; font-weight:bold">#${Math.floor(1000+Math.random()*9000)}</td>
            <td><strong>${m.toUpperCase()}</strong></td>
            <td><span style="color:#2563eb">● RECORD ACTIVE</span></td>
            <td style="text-align:right"><button class="btn-open" onclick="openDossier('${m}')">DECRYPT</button></td>
        </tr>
    `).join('');
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "", phone: "", items: "", notes: "" };
    
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-items').value = f.items;
    document.getElementById('in-notes').value = f.notes;
    
    document.getElementById('dossier-modal').style.display = 'block';
}

function switchTab(e, id) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    e.target.classList.add('active');
}

function saveFolder() {
    const sig = document.getElementById('in-sig').value;
    if(!sig) return alert("Podpis povinný!");
    
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value
    };
    
    localStorage.setItem('syn_f', JSON.stringify(f_data));
    addLog(`Dossier update: ${currentU} (by ${sig})`);
    closeModal();
}

// --- STORAGE ---
function editStore(type) {
    const who = document.getElementById('st-who').value;
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value);
    
    if(!who || isNaN(how) || how <= 0) return alert("Neplatné údaje!");
    
    if(type === 'add') s_data[what] += how;
    else {
        if(s_data[what] < how) return alert("Nedostatečné zásoby!");
        s_data[what] -= how;
    }
    
    addLog(`${who}: ${type === 'add' ? 'PŘÍJEM' : 'VÝDEJ'} ${how}x ${what}`);
    renderStore();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k,v]) => `
        <div class="st-item">
            <label>${k.toUpperCase()}</label>
            <span>${v}</span>
        </div>
    `).join('');
    localStorage.setItem('syn_s', JSON.stringify(s_data));
}

// --- ADMIN ---
function loginAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        renderLogs();
    } else {
        alert("ACCESS DENIED");
    }
}

function addMem() {
    const n = document.getElementById('new-mem-name').value;
    if(!n) return;
    m_data.push(n);
    localStorage.setItem('syn_m', JSON.stringify(m_data));
    addLog(`ROOT: Vytvořen nový profil ${n}`);
    document.getElementById('new-mem-name').value = "";
}

function addLog(m) {
    l_data.unshift(`[${new Date().toLocaleTimeString()}] ${m}`);
    localStorage.setItem('syn_l', JSON.stringify(l_data));
}

function renderLogs() {
    document.getElementById('log-list').innerHTML = l_data.map(l => `<div>${l}</div>`).join('');
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

// Inicializace
showPage('home');