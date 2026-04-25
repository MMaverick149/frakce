// --- CONFIG ---
const PIN = "1234";

// --- DATA LOAD ---
let storage = JSON.parse(localStorage.getItem('syn_storage')) || { tlumic: 0, drogy: 0, vesta: 0 };
let members = JSON.parse(localStorage.getItem('syn_members')) || ["Vito Scaletta", "Joe Barbaro"];
let folders = JSON.parse(localStorage.getItem('syn_folders')) || {};
let logSklad = JSON.parse(localStorage.getItem('syn_log_sklad')) || [];
let logSlozky = JSON.parse(localStorage.getItem('syn_log_slozky')) || [];
let activeMember = "";

// --- NAVIGATION ---
function showSection(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    document.getElementById('btn-' + id).classList.add('active');
}

// --- STORAGE ---
function updateStorage(action) {
    const worker = document.getElementById('worker-name').value;
    const type = document.getElementById('item-type').value;
    const count = parseInt(document.getElementById('item-count').value) || 0;
    if (!worker || count <= 0) return alert("VYPLŇ JMÉNO A POČET!");

    if (action === 'add') storage[type] += count;
    else {
        if (storage[type] < count) return alert("NENÍ SKLADEM!");
        storage[type] -= count;
    }

    addLog('storage', `**${worker}** ${action === 'add' ? 'přidal' : 'vzal'} **${count}x ${type.toUpperCase()}**`);
    renderStorage();
}

function renderStorage() {
    const grid = document.getElementById('inventory-render');
    grid.innerHTML = "";
    for (let key in storage) {
        grid.innerHTML += `
            <div class="item-card">
                <i class="fas fa-box" style="font-size:2rem; color:#222; margin-bottom:10px;"></i>
                <div style="font-size:0.7rem; color:#555">${key.toUpperCase()}</div>
                <div class="item-val">${storage[key]}</div>
            </div>`;
    }
    localStorage.setItem('syn_storage', JSON.stringify(storage));
}

// --- SLOŽKY ---
function renderMembers() {
    const grid = document.getElementById('members-grid');
    grid.innerHTML = "";
    members.sort().forEach(m => {
        const d = document.createElement('div');
        d.className = 'item-card';
        d.innerHTML = `<i class="fas fa-user-secret" style="font-size:2rem; color:var(--red)"></i><br><br><strong>${m}</strong>`;
        d.onclick = () => openMemberFolder(m);
        grid.appendChild(d);
    });
}

function openMemberFolder(name) {
    activeMember = name;
    const data = folders[name] || { rank: "", phone: "", gear: "", notes: "" };
    
    document.getElementById('m-name').innerText = name;
    document.getElementById('m-rank').value = data.rank || "";
    document.getElementById('m-phone').value = data.phone || "";
    document.getElementById('m-gear').value = data.gear || "";
    document.getElementById('m-notes').value = data.notes || "";
    
    openFolderTab('basic');
    document.getElementById('member-modal').style.display = 'block';
}

function openFolderTab(tabId) {
    document.querySelectorAll('.folder-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.f-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('folder-' + tabId).style.display = 'block';
    document.getElementById('ftab-' + tabId).classList.add('active');
}

function saveMemberFolder() {
    const editor = document.getElementById('editor-name').value;
    if (!editor) return alert("PODEPIŠ SE!");

    folders[activeMember] = {
        rank: document.getElementById('m-rank').value,
        phone: document.getElementById('m-phone').value,
        gear: document.getElementById('m-gear').value,
        notes: document.getElementById('m-notes').value
    };

    localStorage.setItem('syn_folders', JSON.stringify(folders));
    addLog('members', `**${editor}** upravil složku: **${activeMember}**`);
    closeModal();
}

// --- ADMIN ---
function unlockAdmin() {
    if (document.getElementById('admin-pin').value === PIN) {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        switchLog('storage');
    } else alert("ŠPATNÝ PIN!");
}

function addNewMember() {
    const name = document.getElementById('new-member-name').value.trim();
    if (!name || members.includes(name)) return alert("NEPLATNÉ JMÉNO!");
    members.push(name);
    localStorage.setItem('syn_members', JSON.stringify(members));
    addLog('members', `**ADMIN** vytvořil složku: **${name}**`);
    document.getElementById('new-member-name').value = "";
    renderMembers();
}

function switchLog(type) {
    document.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + type).classList.add('active');
    const out = document.getElementById('log-output');
    const data = (type === 'storage') ? logSklad : logSlozky;
    out.innerHTML = data.map(l => `<div style="padding:5px; border-bottom:1px solid #111;">${l}</div>`).join('') || "PRÁZDNO";
}

function addLog(target, msg) {
    const time = new Date().toLocaleString('cs-CZ');
    const entry = `<span style="color:#444">[${time}]</span> ${msg}`;
    if (target === 'storage') logSklad.unshift(entry); else logSlozky.unshift(entry);
    localStorage.setItem('syn_log_sklad', JSON.stringify(logSklad));
    localStorage.setItem('syn_log_slozky', JSON.stringify(logSlozky));
}

function closeModal() { document.getElementById('member-modal').style.display = 'none'; }

// --- START ---
renderStorage();
renderMembers();