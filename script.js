// Nastavení položek přesně podle tvého skladu
const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

// Načtení dat a logů
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Oprava dat, aby tam byly nuly místo chyb
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number' || isNaN(fsData[p])) fsData[p] = 0;
});

function saveAll() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    renderSklad();
    if (document.getElementById('admin-logs')) renderAdmin();
}

// Funkce pro přidávání/odebírání + LOGOVÁNÍ
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    if (!select || !input) return;

    const item = select.value;
    const amount = parseInt(input.value) || 0;
    if (amount <= 0) return;

    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});

    if (action === 'add') {
        fsData[item] += amount;
        logs.unshift(`[${time}] PŘIDÁNO: ${amount}x ${item}`);
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
        logs.unshift(`[${time}] ODEBRÁNO: ${amount}x ${item}`);
    }

    if (logs.length > 15) logs.pop(); // Udržíme jen posledních 15 záznamů
    saveAll();
}

function renderSklad() {
    const grid = document.getElementById('storage-grid');
    if (!grid) return;
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

function renderAdmin() {
    const logBox = document.getElementById('admin-logs');
    const select = document.getElementById('folder-select');
    
    if (logBox) logBox.innerHTML = logs.map(l => `<p class="log-entry">${l}</p>`).join('');
    if (select && select.innerHTML === "") {
        select.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

window.onload = () => {
    renderSklad();
    if (document.getElementById('admin-logs')) renderAdmin();
    setInterval(() => {
        const c = document.getElementById('clock');
        if(c) c.innerText = new Date().toLocaleTimeString();
    }, 1000);
};

function accessAdmin() {
    if (prompt("VSTUPNÍ KÓD:") === "syndicate2026") window.location.href = "admin.html";
}