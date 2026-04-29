// --- LOGISTIKA SYNDICATE: CORE ENGINE ---

// Funkce pro načtení dat s automatickou opravou chyb
function loadData() {
    let saved = JSON.parse(localStorage.getItem('syn_fs')) || {};
    // Seznam věcí, které musí existovat
    const keys = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA"];
    
    keys.forEach(k => {
        // Pokud to není číslo nebo je to NaN/null, dej tam 0
        if (typeof saved[k] !== 'number' || isNaN(saved[k])) {
            saved[k] = 0;
        }
    });
    return saved;
}

let fsData = loadData();
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

function saveAndRefresh() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    renderAll();
}

// --- ADMIN FUNKCE ---
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const amountInput = document.getElementById('item-amount');
    
    if (!select || !amountInput) return;

    const item = select.value;
    const count = parseInt(amountInput.value) || 0;

    if (count <= 0) return;

    if (action === 'add') {
        fsData[item] += count;
        addLog(`PŘIDÁNO: ${count}ks -> ${item}`);
    } else {
        fsData[item] = Math.max(0, fsData[item] - count);
        addLog(`ODEBRÁNO: ${count}ks -> ${item}`);
    }
    saveAndRefresh();
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    logs.unshift({ time, msg });
    if (logs.length > 10) logs.pop();
}

// --- VYKRESLOVÁNÍ (RENDER) ---
function renderAll() {
    // 1. SKLAD (Karty s ikonami)
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
            <div class="item-card">
                <div class="item-img-box">
                    <img src="https://i.imgur.com/8nN7pXv.png" alt="folder">
                </div>
                <div class="item-info">
                    <label>${name}</label>
                    <div class="count-display">${count}</div>
                </div>
            </div>
        `).join('');
    }

    // 2. ADMIN (Logy a Výběr)
    const sel = document.getElementById('folder-select');
    const logBox = document.getElementById('admin-logs');

    if (sel) {
        sel.innerHTML = Object.keys(fsData).map(k => `<option value="${k}">${k}</option>`).join('');
    }
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
    }
}

// Spuštění při načtení
window.onload = renderAll;

// Hodiny
setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

function accessAdmin() {
    if (prompt("SYSTÉMOVÝ KÓD:") === "syndicate2026") window.location.href = "admin.html";
}