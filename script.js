// Definice všech tvých složek ve skladu
const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

// Načtení dat (Sklad + Logy)
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Pojistka: Každá položka musí mít číslo (oprava NaN/null)
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number' || isNaN(fsData[p])) fsData[p] = 0;
});

function saveAll() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

// Funkce pro ADMINA (Přidat/Odebrat + Jméno + Log)
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    const operator = document.getElementById('operator-name');
    
    if (!select || !input || !operator) return;

    const item = select.value;
    const amount = parseInt(input.value) || 0;
    const opName = operator.value.trim();

    if (!opName) {
        alert("Zadej jméno operátora!");
        return;
    }
    if (amount <= 0) return;

    const time = new Date().toLocaleTimeString('cs-CZ');
    let type = action === 'add' ? "PŘIDAL" : "ODEBRAL";

    if (action === 'add') {
        fsData[item] += amount;
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
    }

    // Zápis logu: [Čas] Jméno Akce: Kolik -> Co
    logs.unshift(`[${time}] ${opName} ${type}: ${amount}ks -> ${item}`);
    if (logs.length > 20) logs.pop();

    saveAll();
}

function render() {
    // Vykreslení SKLADU (Mřížka)
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

    // Vykreslení ADMINA (Výběr + Historie)
    const logBox = document.getElementById('admin-logs');
    const sel = document.getElementById('folder-select');
    
    if (logBox) logBox.innerHTML = logs.map(l => `<div class="log-entry">${l}</div>`).join('');
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

window.onload = render;
setInterval(() => {
    const c = document.getElementById('clock');
    if(c) c.innerText = new Date().toLocaleTimeString();
}, 1000);