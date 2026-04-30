// --- SEZNAM POLOŽEK ---
const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

// Načtení dat (sklad + logy)
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Pojistka: Nastavení nul u všech položek, pokud neexistují
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number' || isNaN(fsData[p])) fsData[p] = 0;
});

// Funkce pro uložení a okamžité překreslení
function saveAndRefresh() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

// --- LOGIKA PRO ADMINA (PŘIDAT/ODEBRAT + JMÉNO) ---
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    const operator = document.getElementById('operator-name');
    
    if (!select || !input || !operator) return;

    const item = select.value;
    const amount = parseInt(input.value) || 0;
    const opName = operator.value.trim() || "Neznámý";

    if (amount <= 0) return;

    const nyni = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    let typAkce = "";

    if (action === 'add') {
        fsData[item] += amount;
        typAkce = "PŘIDAL";
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
        typAkce = "ODEBRAL";
    }

    // Zápis do historie: [Čas] Jméno Akce: Množství -> Položka
    logs.unshift(`[${nyni}] ${opName} ${typAkce}: ${amount}ks -> ${item}`);
    if (logs.length > 15) logs.pop();

    saveAndRefresh();
}

// --- RENDER (VYKRESLENÍ) ---
function render() {
    // 1. Skladová mřížka
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

    // 2. Admin sekce (Výběr a Logy)
    const logBox = document.getElementById('admin-logs');
    const sel = document.getElementById('folder-select');
    
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<div class="log-entry">${l}</div>`).join('');
    }
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

// Spuštění při načtení
window.onload = render;

// Hodiny
setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

function accessAdmin() {
    if (prompt("VSTUPNÍ KÓD:") === "syndicate2026") window.location.href = "admin.html";
}