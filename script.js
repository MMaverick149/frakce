// --- KONFIGURACE ---
const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Pojistka pro čísla
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number' || isNaN(fsData[p])) fsData[p] = 0;
});

function saveAll() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

// --- HLAVNÍ OPERACE ---
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    const operatorInput = document.getElementById('operator-name');
    
    if (!select || !input || !operatorInput) return;

    const item = select.value;
    const amount = parseInt(input.value) || 0;
    const operator = operatorInput.value.trim() || "Neznámý";

    if (amount <= 0) return;

    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    let type = "";

    if (action === 'add') {
        fsData[item] += amount;
        type = "PŘIDAL";
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
        type = "ODEBRAL";
    }

    // Vytvoření záznamu do historie
    logs.unshift(`[${time}] ${operator} ${type}: ${amount}ks -> ${item}`);
    if (logs.length > 20) logs.pop();

    saveAll();
}

// --- RENDEROVÁNÍ ---
function render() {
    // Sklad
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
            <div class="item-card">
                <div class="item-img-box"><img src="images/folder.png" onerror="this.src='https://i.imgur.com/8nN7pXv.png'"></div>
                <div class="item-info">
                    <label>${name}</label>
                    <div class="count-display">${count}</div>
                </div>
            </div>
        `).join('');
    }

    // Admin Logy
    const logDiv = document.getElementById('admin-logs');
    const sel = document.getElementById('folder-select');
    
    if (logDiv) {
        logDiv.innerHTML = logs.map(l => `<div class="log-entry">${l}</div>`).join('');
    }
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

window.onload = render;
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

function accessAdmin() {
    if (prompt("KÓD:") === "syndicate2026") window.location.href = "admin.html";
}