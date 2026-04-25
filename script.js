// DATA
let storage = JSON.parse(localStorage.getItem('s_data')) || { zbrane: 0, munice: 0, drogy: 0 };
let members = JSON.parse(localStorage.getItem('m_data')) || ["Vito Scaletta"];
let folders = JSON.parse(localStorage.getItem('f_data')) || {};
let logsS = JSON.parse(localStorage.getItem('l_s')) || [];
let logsM = JSON.parse(localStorage.getItem('l_m')) || [];
let activeM = "";

// NAVIGATION
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
}

// STORAGE
function editStore(type) {
    const who = document.getElementById('op-name').value;
    const item = document.getElementById('it-name').value;
    const qty = parseInt(document.getElementById('it-qty').value);

    if(!who || qty <= 0) return alert("Zadej jméno a počet!");

    if(type === 'add') storage[item] += qty;
    else {
        if(storage[item] < qty) return alert("Není dostatek!");
        storage[item] -= qty;
    }

    addLog('s', `${who} ${type === 'add' ? 'PŘIDAL' : 'VZAL'} ${qty}x ${item.toUpperCase()}`);
    renderStore();
}

function renderStore() {
    const view = document.getElementById('inv-view');
    view.innerHTML = Object.entries(storage).map(([k, v]) => `
        <div class="inv-card">
            <div style="font-size:0.7rem; color:#555">${k.toUpperCase()}</div>
            <div class="qty">${v}</div>
        </div>
    `).join('');
    localStorage.setItem('s_data', JSON.stringify(storage));
}

// MEMBERS
function renderMem() {
    const view = document.getElementById('mem-view');
    view.innerHTML = members.map(m => `
        <div class="mem-item" onclick="openModal('${m}')">
            <strong>${m}</strong>
        </div>
    `).join('');
}

function openModal(name) {
    activeM = name;
    const data = folders[name] || { rank: "", phone: "", notes: "" };
    document.getElementById('target-name').innerText = name;
    document.getElementById('f-rank').value = data.rank;
    document.getElementById('f-phone').value = data.phone;
    document.getElementById('f-notes').value = data.notes;
    document.getElementById('modal').style.display = 'block';
}

function saveFolder() {
    const sign = document.getElementById('f-sign').value;
    if(!sign) return alert("Zadej podpis!");

    folders[activeM] = {
        rank: document.getElementById('f-rank').value,
        phone: document.getElementById('f-phone').value,
        notes: document.getElementById('f-notes').value
    };

    localStorage.setItem('f_data', JSON.stringify(folders));
    addLog('m', `${sign} UPRAVIL SLOŽKU: ${activeM}`);
    closeModal();
}

// ADMIN
function login() {
    if(document.getElementById('pass').value === "1234") {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        viewLog('s');
    } else alert("Chyba!");
}

function addMem() {
    const name = document.getElementById('new-mem').value.trim();
    if(!name || members.includes(name)) return;
    members.push(name);
    localStorage.setItem('m_data', JSON.stringify(members));
    addLog('m', `ADMIN VYTVOŘIL AGENTA: ${name}`);
    document.getElementById('new-mem').value = "";
    renderMem();
}

function viewLog(type) {
    document.getElementById('tab-s').className = type === 's' ? 'active' : '';
    document.getElementById('tab-m').className = type === 'm' ? 'active' : '';
    const screen = document.getElementById('log-screen');
    const data = type === 's' ? logsS : logsM;
    screen.innerHTML = data.map(l => `<div style="margin-bottom:5px">${l}</div>`).join('');
}

function addLog(type, msg) {
    const time = new Date().toLocaleString();
    const entry = `[${time}] ${msg}`;
    if(type === 's') logsS.unshift(entry); else logsM.unshift(entry);
    localStorage.setItem('l_s', JSON.stringify(logsS));
    localStorage.setItem('l_m', JSON.stringify(logsM));
}

function closeModal() { document.getElementById('modal').style.display = 'none'; }

// START
renderStore();
renderMem();