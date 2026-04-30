// --- JÁDRO SYSTÉMU ---
const defaultItems = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA"];

function loadData() {
    let data = JSON.parse(localStorage.getItem('syn_fs')) || {};
    // Pojistka: Každý klíč musí být číslo, jinak 0
    defaultItems.forEach(item => {
        if (typeof data[item] !== 'number' || isNaN(data[item])) {
            data[item] = 0;
        }
    });
    return data;
}

let fsData = loadData();

function save() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    renderAll();
}

// --- LOGIKA TLAČÍTEK ---
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    
    if (!select || !input) return;

    const key = select.value;
    const amount = parseInt(input.value) || 0;

    if (amount <= 0) return;

    if (action === 'add') {
        fsData[key] += amount;
    } else {
        fsData[key] = Math.max(0, fsData[key] - amount);
    }
    save();
}

// --- ZOBRAZENÍ ---
function renderAll() {
    // 1. Skladové karty
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

    // 2. Admin výběr
    const sel = document.getElementById('folder-select');
    if (sel) {
        sel.innerHTML = Object.keys(fsData).map(k => `<option value="${k}">${k}</option>`).join('');
    }
}

// --- START ---
window.onload = renderAll;

setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

function accessAdmin() {
    if (prompt("KÓD:") === "syndicate2026") window.location.href = "admin.html";
}