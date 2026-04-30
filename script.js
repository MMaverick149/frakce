// --- KONFIGURACE DAT ---
const SEZNAM_POLOZEK = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

function nactiData() {
    let ulozenaData = JSON.parse(localStorage.getItem('syn_fs')) || {};
    // Pojistka: Pokud položka neexistuje nebo není číslo, nastavíme 0
    SEZNAM_POLOZEK.forEach(item => {
        if (typeof ulozenaData[item] !== 'number' || isNaN(ulozenaData[item])) {
            ulozenaData[item] = 0;
        }
    });
    return ulozenaData;
}

let fsData = nactiData();

function uloz() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    vykresliVse();
}

// --- FUNKCE PRO ADMIN PANEL ---
function modifyStock(akce) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    
    if (!select || !input) return;

    const polozka = select.value;
    const mnozstvi = parseInt(input.value) || 0;

    if (mnozstvi <= 0) return;

    if (akce === 'add') {
        fsData[polozka] += mnozstvi;
    } else {
        fsData[polozka] = Math.max(0, fsData[polozka] - mnozstvi);
    }
    uloz();
}

// --- VYKRESLOVÁNÍ ---
function vykresliVse() {
    // 1. Karty ve skladu
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

    // 2. Výběr v adminu
    const sel = document.getElementById('folder-select');
    if (sel) {
        sel.innerHTML = Object.keys(fsData).map(k => `<option value="${k}">${k}</option>`).join('');
    }
}

// Inicializace
window.onload = vykresliVse;

// Hodiny
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString('cs-CZ');
}, 1000);

function accessAdmin() {
    if (prompt("SYSTÉMOVÝ KÓD:") === "syndicate2026") window.location.href = "admin.html";
}