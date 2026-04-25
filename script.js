// --- KONFIGURACE ---
const ADMIN_PIN = "1234";

// --- DATA ---
let mdtStorage = JSON.parse(localStorage.getItem('mdt_storage')) || { zbrane: 0, munice: 0, med: 0 };
let mdtMembers = JSON.parse(localStorage.getItem('mdt_members')) || ["Vito Scaletta"];
let mdtFolders = JSON.parse(localStorage.getItem('mdt_folders')) || {};
let logsStorage = JSON.parse(localStorage.getItem('mdt_logs_s')) || [];
let logsRegistry = JSON.parse(localStorage.getItem('mdt_logs_r')) || [];
let currentMember = "";

// --- NAVIGACE ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + pageId).style.display = 'block';
    document.getElementById('btn-' + pageId).classList.add('active');
}

// --- SKLAD ---
function handleStore(mode) {
    const user = document.getElementById('store-user').value;
    const item = document.getElementById('store-item').value;
    const qty = parseInt(document.getElementById('store-qty').value);

    if(!user || qty <= 0) return alert("Chybí jméno nebo neplatný počet.");

    if(mode === 'add') mdtStorage[item] += qty;
    else {
        if(mdtStorage[item] < qty) return alert("Nedostatečné zásoby!");
        mdtStorage[item] -= qty;
    }

    addLog('s', `${user}: ${mode === 'add' ? 'VYDAL' : 'ODEBRAL'} ${qty}x ${item.toUpperCase()}`);
    renderStore();
}

function renderStore() {
    const view = document.getElementById('storage-view');
    view.innerHTML = "";
    Object.entries(mdtStorage).forEach(([key, val]) => {
        view.innerHTML += `
            <div class="item-box">
                <small>${key.toUpperCase()}</small>
                <span>${val}</span>
            </div>`;
    });
    localStorage.setItem('mdt_storage', JSON.stringify(mdtStorage));
}

// --- REGISTR OSOB ---
function renderMembers() {
    const view = document.getElementById('members-view');
    view.innerHTML = mdtMembers.sort().map(m => `
        <div class="member-box" onclick="openDossier('${m}')">
            <i class="fas fa-user-circle" style="font-size: 2rem; color: #2d3748; margin-bottom: 10px; display: block;"></i>
            <strong>${m}</strong>
        </div>
    `).join('');
}

function openDossier(name) {
    currentMember = name;
    const data = mdtFolders[name] || { rank: "", phone: "", notes: "" };
    
    document.getElementById('d-full-name').innerText = name;
    document.getElementById('d-id-tag').innerText = "#ID-" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById('d-rank').value = data.rank;
    document.getElementById('d-phone').value = data.phone;
    document.getElementById('d-notes').value = data.notes;
    
    document.getElementById('mdt-modal').style.display = 'block';
}

function saveDossier() {
    const sign = document.getElementById('d-editor').value;
    if(!sign) return alert("Záznam musí být podepsán.");

    mdtFolders[currentMember] = {
        rank: document.getElementById('d-rank').value,
        phone: document.getElementById('d-phone').value,
        notes: document.getElementById('d-notes').value
    };

    localStorage.setItem('mdt_folders', JSON.stringify(mdtFolders));
    addLog('r', `${sign} aktualizoval dossier: ${currentMember}`);
    closeModal();
}

// --- ADMIN ---
function tryLogin() {
    if(document.getElementById('pin-input').value === ADMIN_PIN) {
        document.getElementById('admin-gate').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        switchLog('s');
    } else alert("Neautorizovaný přístup!");
}

function createNewMember() {
    const name = document.getElementById('new-name').value.trim();
    if(!name || mdtMembers.includes(name)) return alert("Chybné jméno nebo již existuje.");
    
    mdtMembers.push(name);
    localStorage.setItem('mdt_members', JSON.stringify(mdtMembers));
    addLog('r', `ADMIN vytvořil nového občana: ${name}`);
    document.getElementById('new-name').value = "";
    renderMembers();
}

function switchLog(type) {
    document.getElementById('tab-s').className = type === 's' ? 'active' : '';
    document.getElementById('tab-m').className = type === 'm' ? 'active' : '';
    const screen = document.getElementById('log-screen');
    const data = type === 's' ? logsStorage : logsRegistry;
    screen.innerHTML = data.map(l => `<div style="border-bottom: 1px solid #1a1f26; padding: 5px 0;">${l}</div>`).join('');
}

function addLog(type, msg) {
    const time = new Date().toLocaleString('cs-CZ');
    const entry = `[${time}] ${msg}`;
    if(type === 's') logsStorage.unshift(entry); else logsRegistry.unshift(entry);
    localStorage.setItem('mdt_logs_s', JSON.stringify(logsStorage));
    localStorage.setItem('mdt_logs_r', JSON.stringify(logsRegistry));
}

function closeModal() { document.getElementById('mdt-modal').style.display = 'none'; }

// START
renderStore();
renderMembers();