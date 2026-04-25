// --- CONFIG ---
const PIN = "1234";

// --- DATA ---
let storage = JSON.parse(localStorage.getItem('syn_storage')) || { tlumic: 0, drogy: 0, vesta: 0, vesta: 0, };
let members = JSON.parse(localStorage.getItem('syn_members')) || ["Vito Scaletta"];
let dossiers = JSON.parse(localStorage.getItem('syn_dossiers')) || {}; 
let logSklad = JSON.parse(localStorage.getItem('syn_log_s')) || [];
let logSlozky = JSON.parse(localStorage.getItem('syn_log_m')) || [];
let activeMember = "";

// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    document.getElementById('btn-' + id).classList.add('active');
}

// --- STORAGE ---
function updateStorage(mode) {
    const worker = document.getElementById('worker-name').value;
    const type = document.getElementById('item-type').value;
    const count = parseInt(document.getElementById('item-count').value);

    if (!worker || count <= 0) return alert("Chybějící data!");

    if (mode === 'add') storage[type] += count;
    else {
        if (storage[type] < count) return alert("Nedostatek!");
        storage[type] -= count;
    }

    addLog('sklad', `[SKLAD] ${worker}: ${mode === 'add' ? '+' : '-'}${count} ${type.toUpperCase()}`);
    renderStorage();
}

function renderStorage() {
    const grid = document.getElementById('inventory-render');
    grid.innerHTML = "";
    for (let key in storage) {
        grid.innerHTML += `
            <div class="item-box">
                <i class="fas fa-box"></i>
                <div style="font-size: 0.7rem; color: #555;">${key.toUpperCase()}</div>
                <div class="item-count">${storage[key]}</div>
            </div>`;
    }
    localStorage.setItem('syn_storage', JSON.stringify(storage));
}

// --- SLOŽKY / MEMBERS ---
function renderMembers() {
    const grid = document.getElementById('members-grid');
    grid.innerHTML = "";
    members.sort().forEach(m => {
        const div = document.createElement('div');
        div.className = 'member-tag';
        div.innerHTML = `<strong>${m}</strong>`;
        div.onclick = () => openDossier(m);
        grid.appendChild(div);
    });
}

function openDossier(name) {
    activeMember = name;
    const data = dossiers[name] || { rank: "", phone: "", notes: "" };
    
    document.getElementById('m-name').innerText = "DOSSIER: " + name;
    document.getElementById('m-rank').value = data.rank || "";
    document.getElementById('m-phone').value = data.phone || "";
    document.getElementById('m-notes').value = data.notes || "";
    
    document.getElementById('member-modal').style.display = 'block';
}

function saveMemberFolder() {
    const sig = document.getElementById('editor-name').value;
    if (!sig) return alert("Zadejte podpis!");

    dossiers[activeMember] = {
        rank: document.getElementById('m-rank').value,
        phone: document.getElementById('m-phone').value,
        notes: document.getElementById('m-notes').value
    };

    localStorage.setItem('syn_dossiers', JSON.stringify(dossiers));
    addLog('slozky', `[ÚPRAVA] ${sig} aktualizoval složku: ${activeMember}`);
    closeModal();
}

// --- ADMIN LOGIC ---
function unlockAdmin() {
    if (document.getElementById('admin-pin').value === PIN) {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        switchLog('storage');
    } else { alert("Neplatný přístup!"); }
}

function addNewMember() {
    const name = document.getElementById('new-member-name').value.trim();
    if (!name || members.includes(name)) return alert("Chyba jména!");

    members.push(name);
    localStorage.setItem('syn_members', JSON.stringify(members));
    addLog('slozky', `[SYSTÉM] Byl vytvořen profil pro: ${name}`);
    document.getElementById('new-member-name').value = "";
    renderMembers();
    switchLog('members');
}

function switchLog(type) {
    document.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + type).classList.add('active');
    
    const output = document.getElementById('log-output');
    const data = (type === 'storage') ? logSklad : logSlozky;
    
    output.innerHTML = data.map(l => `<div style="border-bottom: 1px solid #1a1a1a; padding: 5px 0;">${l}</div>`).join('');
}

function addLog(target, msg) {
    const time = new Date().toLocaleString('cs-CZ');
    const entry = `<span style="color:#555;">[${time}]</span> ${msg}`;
    if (target === 'sklad') logSklad.unshift(entry); else logSlozky.unshift(entry);
    
    localStorage.setItem('syn_log_s', JSON.stringify(logSklad));
    localStorage.setItem('syn_log_m', JSON.stringify(logSlozky));
}

function closeModal() { document.getElementById('member-modal').style.display = 'none'; }

// INICIALIZACE
renderStorage();
renderMembers();