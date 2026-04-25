// --- DATABASE ---
let members = JSON.parse(localStorage.getItem('mdt_mem')) || ["Vito Scaletta", "David Ricci"];
let folders = JSON.parse(localStorage.getItem('mdt_fol')) || {};
let storage = JSON.parse(localStorage.getItem('mdt_sto')) || { "Zbraně": 0, "Munice": 0, "Léky": 0 };
let logs = JSON.parse(localStorage.getItem('mdt_log')) || [];
let activeUser = "";

// --- NAVIGATION ---
function showPage(id) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    document.getElementById('current-path').innerText = id.charAt(0).toUpperCase() + id.slice(1);
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStorage();
}

// --- MEMBERS LOGIC ---
function renderMembers() {
    const tbody = document.getElementById('members-list-body');
    tbody.innerHTML = members.sort().map(m => `
        <tr>
            <td>#${Math.floor(1000 + Math.random() * 9000)}</td>
            <td><strong>${m.toUpperCase()}</strong></td>
            <td><span style="color:#22c55e">AKTIVNÍ</span></td>
            <td style="text-align:right"><button class="btn-open" onclick="openDossier('${m}')">OTEVŘÍT</button></td>
        </tr>
    `).join('');
}

function openDossier(name) {
    activeUser = name;
    const f = folders[name] || { rank: "", phone: "", licence: "", records: "" };
    
    document.getElementById('dos-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-licence').value = f.licence;
    document.getElementById('in-records').value = f.records;
    
    switchDossierTab('info');
    document.getElementById('dossier-modal').style.display = 'block';
}

function switchDossierTab(tab) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('d-' + tab).style.display = 'block';
    event.target.classList.add('active');
}

function saveDossier() {
    const editor = document.getElementById('in-editor').value;
    if(!editor) return alert("Musíte se podepsat!");

    folders[activeUser] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        licence: document.getElementById('in-licence').value,
        records: document.getElementById('in-records').value
    };

    localStorage.setItem('mdt_fol', JSON.stringify(folders));
    addLog(`Uživatel ${editor} aktualizoval složku: ${activeUser}`);
    closeModal();
}

// --- STORAGE ---
function updateStorage(type) {
    const user = document.getElementById('st-user').value;
    const item = document.getElementById('st-item').value;
    const qty = parseInt(document.getElementById('st-qty').value);

    if(!user || qty <= 0) return alert("Chyba údajů!");

    if(type === 'add') storage[item] += qty;
    else {
        if(storage[item] < qty) return alert("Nedostatek!");
        storage[item] -= qty;
    }

    addLog(`${user}: ${type === 'add' ? 'PŘIDAL' : 'ODEBRAL'} ${qty}x ${item}`);
    renderStorage();
}

function renderStorage() {
    const grid = document.getElementById('storage-grid');
    grid.innerHTML = Object.entries(storage).map(([k, v]) => `
        <div class="st-card">
            <div style="font-size:0.7rem; color:#555">${k.toUpperCase()}</div>
            <div class="st-val">${v}</div>
        </div>
    `).join('');
    localStorage.setItem('mdt_sto', JSON.stringify(storage));
}

// --- ADMIN ---
function unlockAdmin() {
    if(document.getElementById('admin-pass').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-ui').style.display = 'block';
        renderLogs();
    }
}

function addMember() {
    const n = document.getElementById('add-name').value;
    if(!n) return;
    members.push(n);
    localStorage.setItem('mdt_mem', JSON.stringify(members));
    addLog(`ADMIN vytvořil občana: ${n}`);
    document.getElementById('add-name').value = "";
}

function addLog(msg) {
    const time = new Date().toLocaleString();
    logs.unshift(`[${time}] ${msg}`);
    localStorage.setItem('mdt_log', JSON.stringify(logs));
}

function renderLogs() {
    document.getElementById('sys-logs').innerHTML = logs.map(l => `<div>${l}</div>`).join('');
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }