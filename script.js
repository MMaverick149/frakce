// --- JÁDRO SYSTÉMU (Data a ukládání) ---
const DEFAULT_DATA = {
    "ZBRANĚ": 0,
    "MUNICE": 0,
    "KONTRABAND": 0,
    "ŽLUTÁ TRÁVA": 0
};

let fsData = JSON.parse(localStorage.getItem('syn_fs')) || DEFAULT_DATA;
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

function saveAll() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
}

// --- FUNKCE PRO ADMINA (Tlačítka v konzoli) ---
function createNewFolder() {
    const input = document.getElementById('new-folder-input');
    if (!input) return;
    const name = input.value.toUpperCase().trim();
    if (name && !fsData[name]) {
        fsData[name] = 0;
        addLog(`VYTVOŘENA SLOŽKA: ${name}`);
        input.value = "";
        saveAll();
        refreshUI();
    }
}

function deleteFolder(name) {
    if (confirm(`Smazat složku ${name}?`)) {
        delete fsData[name];
        addLog(`SMAZÁNA SLOŽKA: ${name}`);
        saveAll();
        refreshUI();
    }
}

function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const amountInput = document.getElementById('item-amount');
    
    // Ochrana: pokud prvky neexistují, skript se nezastaví
    if (!select || !amountInput) return;

    const folder = select.value;
    const amount = parseInt(amountInput.value) || 0;

    if (action === 'add') {
        fsData[folder] += amount;
        addLog(`PŘIDÁNO: ${amount}ks -> ${folder}`);
    } else {
        fsData[folder] = Math.max(0, fsData[folder] - amount);
        addLog(`ODEBRÁNO: ${amount}ks -> ${folder}`);
    }
    saveAll();
    refreshUI();
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    logs.unshift({ time, msg });
    if (logs.length > 10) logs.pop();
}

// --- ZOBRAZOVÁNÍ (RENDERING) ---
function refreshUI() {
    // 1. Vykreslení SKLADU (Karty se jménem a číslem)
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
            <div class="item-card">
                <div class="item-img-box">
                    <img src="images/folder.png" onerror="this.src='https://i.imgur.com/8nN7pXv.png'">
                </div>
                <div class="item-info">
                    <label>${name}</label>
                    <div class="count-display">${count}</div>
                </div>
            </div>
        `).join('');
    }

    // 2. Vykreslení ADMINA (Seznam složek a Logy)
    const list = document.getElementById('active-folders');
    const select = document.getElementById('folder-select');
    const logBox = document.getElementById('admin-logs');

    if (list) {
        list.innerHTML = Object.keys(fsData).map(name => `
            <div class="folder-row">
                <span>📁 ${name}</span>
                <button onclick="deleteFolder('${name}')" class="btn-mini">SMAZAT</button>
            </div>
        `).join('');
    }
    if (select) {
        select.innerHTML = Object.keys(fsData).map(name => `<option value="${name}">${name}</option>`).join('');
    }
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
    }
}

// --- SPOUŠTĚNÍ ---
function accessAdmin() {
    if (prompt("ZADEJTE KÓD:") === "syndicate2026") window.location.href = "admin.html";
}

// Spustit hned po načtení
window.addEventListener('DOMContentLoaded', () => {
    refreshUI();
    setInterval(() => {
        const c = document.getElementById('clock');
        if(c) c.innerText = new Date().toLocaleTimeString();
    }, 1000);
});