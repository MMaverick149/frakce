// Načtení dat (Složky + Počty)
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {
    "ZBRANĚ": 24,
    "MUNICE": 4,
    "KONTRABAND": 0,
    "ŽLUTÁ TRÁVA": 1
};

let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

function save() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    refreshAll();
}

// ADMIN: Vytvoření složky
function createNewFolder() {
    const name = document.getElementById('new-folder-input').value.toUpperCase().trim();
    if (name && !fsData[name]) {
        fsData[name] = 0;
        addLog(`Vytvořena složka: ${name}`);
        document.getElementById('new-folder-input').value = "";
        save();
    }
}

// ADMIN: Smazání složky
function deleteFolder(name) {
    if (confirm(`Smazat složku ${name}?`)) {
        delete fsData[name];
        addLog(`Složka ${name} odstraněna`);
        save();
    }
}

// ADMIN: Manipulace se zbožím
function modifyStock(action) {
    const folder = document.getElementById('folder-select').value;
    const amount = parseInt(document.getElementById('item-amount').value) || 0;
    if (action === 'add') {
        fsData[folder] += amount;
        addLog(`Změna: ${folder} +${amount}`);
    } else {
        fsData[folder] = Math.max(0, fsData[folder] - amount);
        addLog(`Změna: ${folder} -${amount}`);
    }
    save();
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    logs.unshift({ time, msg });
    if (logs.length > 15) logs.pop();
}

// Zobrazení ve Skladu
function renderStorage() {
    const grid = document.getElementById('storage-grid');
    if (!grid) return;
    grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
        <div class="item-card">
            <div class="item-img-box"><img src="images/folder.png" onerror="this.src='images/zlutatrava.png'"></div>
            <div class="item-info">
                <label>${name}</label>
                <div class="count-display">${count}</div>
            </div>
        </div>
    `).join('');
}

// Zobrazení v Adminu
function renderAdmin() {
    const list = document.getElementById('active-folders');
    const select = document.getElementById('folder-select');
    const logBox = document.getElementById('admin-logs');
    if (!list) return;

    list.innerHTML = Object.keys(fsData).map(name => `
        <div class="folder-row">
            <span>📁 ${name}</span>
            <button onclick="deleteFolder('${name}')" class="btn-mini">SMAZAT</button>
        </div>
    `).join('');

    select.innerHTML = Object.keys(fsData).map(name => `<option value="${name}">${name}</option>`).join('');
    logBox.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
}

function refreshAll() {
    renderStorage();
    renderAdmin();
}

// Heslo
function accessAdmin() {
    if (prompt("SYNDICATE KÓD:") === "syndicate2026") window.location.href = "admin.html";
}

// Init
setInterval(() => { if(document.getElementById('clock')) document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
refreshAll();