const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Nastavení nul na začátku
POLOZKY.forEach(p => { if (typeof fsData[p] !== 'number') fsData[p] = 0; });

function render() {
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => {
            // Tohle je nejjednodušší cesta: vezme název, dá ho na malá písmena a smaže mezery
            // "ZBRANĚ" -> "zbraně.png", "NABOJE PISTOL" -> "nabojepistol.png"
            const imgFileName = name.toLowerCase().replace(/\s+/g, '');
            
            return `
                <div class="item-card">
                    <div class="item-img-box">
                        <img src="images/${imgFileName}.png" onerror="this.src='images/neninic.png'">
                    </div>
                    <div class="item-info">
                        <label>${name}</label>
                        <div class="count-display">${count}</div>
                    </div>
                </div>`;
        }).join('');
    }

    const logBox = document.getElementById('admin-logs');
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<div class="log-entry">${l}</div>`).join('');
    }

    const sel = document.getElementById('folder-select');
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

function modifyStock(action) {
    const item = document.getElementById('folder-select').value;
    const amount = parseInt(document.getElementById('item-amount').value) || 0;
    const opName = document.getElementById('operator-name').value.trim();

    if (!opName) { alert("Zadej jméno operátora!"); return; }
    if (amount <= 0) return;

    const time = new Date().toLocaleTimeString('cs-CZ', {hour: '2-digit', minute:'2-digit'});
    if (action === 'add') {
        fsData[item] += amount;
        logs.unshift(`[${time}] ${opName} PŘIDAL: ${amount}ks -> ${item}`);
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
        logs.unshift(`[${time}] ${opName} ODEBRAL: ${amount}ks -> ${item}`);
    }

    if (logs.length > 15) logs.pop();
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

window.onload = render;
setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);