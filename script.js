// --- JÁDRO (DATA) ---
function getFreshData() {
    let data = JSON.parse(localStorage.getItem('syn_fs')) || {};
    // Seznam věcí, které tam MUSÍ být a MUSÍ to být čísla
    const keys = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA"];
    keys.forEach(k => {
        if (typeof data[k] !== 'number' || isNaN(data[k])) data[k] = 0;
    });
    return data;
}

let fsData = getFreshData();
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

function save() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render(); // Okamžitě překresli
}

// --- AKCE (ADMIN) ---
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    
    if (!select || !input) return;

    const key = select.value;
    const val = parseInt(input.value) || 0;

    if (val <= 0) return;

    if (action === 'add') {
        fsData[key] += val;
        addLog(`PŘIDÁNO: ${val}ks -> ${key}`);
    } else {
        fsData[key] = Math.max(0, fsData[key] - val);
        addLog(`ODEBRÁNO: ${val}ks -> ${key}`);
    }
    save();
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    logs.unshift({ time, msg });
    if (logs.length > 8) logs.pop();
}

// --- VZHLED (RENDER) ---
function render() {
    // 1. SKLAD (Karty)
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
            <div class="item-card">
                <div class="item-img-box"><img src="https://i.imgur.com/8nN7pXv.png"></div>
                <div class="item-info">
                    <label>${name}</label>
                    <div class="count-display">${count}</div>
                </div>
            </div>
        `).join('');
    }

    // 2. ADMIN (Výběr a Logy)
    const sel = document.getElementById('folder-select');
    const logBox = document.getElementById('admin-logs');
    
    if (sel) {
        sel.innerHTML = Object.keys(fsData).map(k => `<option value="${k}">${k}</option>`).join('');
    }
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
    }
}

// --- SPUŠTĚNÍ ---
window.onload = render;

// Hodiny
setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

function accessAdmin() {
    if (prompt("HESLO:") === "syndicate2026") window.location.href = "admin.html";
}