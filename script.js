// Konfigurace položek
const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

// Načtení dat a logů s ochranou proti chybám
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Ujistíme se, že každá položka má nulu a není to NaN
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number' || isNaN(fsData[p])) fsData[p] = 0;
});

function saveAll() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

// Funkce pro Admina: Přidat/Odebrat + Zápis do logu
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    if (!select || !input) return;

    const item = select.value;
    const amount = parseInt(input.value) || 0;
    if (amount <= 0) return;

    const nyni = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});

    if (action === 'add') {
        fsData[item] += amount;
        logs.unshift(`[${nyni}] + ${amount}ks ${item}`);
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
        logs.unshift(`[${nyni}] - ${amount}ks ${item}`);
    }

    if (logs.length > 20) logs.pop(); // Uložíme max 20 řádků historie
    saveAll();
}

// Vykreslení všeho najednou
function render() {
    // 1. Sklad (Mřížka karet)
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

    // 2. Admin (Logy a výběr položky)
    const logDiv = document.getElementById('admin-logs');
    const sel = document.getElementById('folder-select');
    
    if (logDiv) {
        logDiv.innerHTML = logs.map(l => `<div class="log-line">${l}</div>`).join('');
    }
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

window.onload = render;

// Hodiny v rohu
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

function accessAdmin() {
    if (prompt("SYSTÉMOVÝ KÓD:") === "syndicate2026") window.location.href = "admin.html";
}