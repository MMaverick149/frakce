// Inicializace dat
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {
    "ZBRANĚ": 24,
    "MUNICE": 4,
    "KONTRABAND": 0,
    "ŽLUTÁ TRÁVA": 1
};

let logs = JSON.parse(localStorage.getItem('syn_logs')) || [
    { time: "10:00", msg: "FS System Initialized" }
];

// Funkce pro vytváření složek
function createNewFolder() {
    const name = document.getElementById('new-folder-input').value.toUpperCase().trim();
    if (name && !fsData[name]) {
        fsData[name] = 0;
        addLog(`Vytvořena nová složka: ${name}`);
        saveAndRefresh();
        document.getElementById('new-folder-input').value = "";
    }
}

// Odstranění složky (Zamykání/Mazání)
function deleteFolder(name) {
    if (confirm(`Opravdu smazat složku ${name}?`)) {
        delete fsData[name];
        addLog(`Složka ${name} byla odstraněna ze systému`);
        saveAndRefresh();
    }
}

// Logování aktivity
function addLog(message) {
    const time = new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    logs.unshift({ time, msg: message });
    if (logs.length > 20) logs.pop();
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    renderLogs();
}

// Manipulace se zbožím ve složkách
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
    saveAndRefresh();
}

function saveAndRefresh() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    renderAdminUI();
    renderInventory();
}

// Vykreslování Admin prvků
function renderAdminUI() {
    const folderList = document.getElementById('active-folders');
    const select = document.getElementById('folder-select');
    if (!folderList || !select) return;

    folderList.innerHTML = Object.keys(fsData).map(name => `
        <div class="folder-item">
            <span>📁 ${name}</span>
            <button onclick="deleteFolder('${name}')" class="btn-mini-rem">SMAZAT</button>
        </div>
    `).join('');

    select.innerHTML = Object.keys(fsData).map(name => `
        <option value="${name}">${name}</option>
    `).join('');
}

function renderLogs() {
    const container = document.getElementById('admin-logs');
    if (container) {
        container.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
    }
}

// Vykreslování skladu (sklad.html)
function renderInventory() {
    const grid = document.getElementById('storage-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
        <div class="item-card">
            <div class="item-img-box">
                <img src="images/folder_icon.png" onerror="this.src='images/zlutatrava.png'">
            </div>
            <div class="item-info">
                <label>${name}</label>
                <div class="count-display">${count}</div>
            </div>
        </div>
    `).join('');
}

// Init
renderAdminUI();
renderLogs();
renderInventory();