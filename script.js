const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Inicializace nul, pokud data neexistují
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number') fsData[p] = 0;
});

function modifyStock(action) {
    const sel = document.getElementById('folder-select');
    const input = document.getElementById('item-amount');
    const opInput = document.getElementById('operator-name');
    
    if (!sel || !input || !opInput) return;

    const item = sel.value;
    const amount = parseInt(input.value) || 0;
    const opName = opInput.value.trim();

    if (opName === "") { alert("Zadej jméno operátora!"); return; }
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

function render() {
    // 1. VYKRESLENÍ SKLADU (pokud jsme na sklad.html)
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => {
            // Převede např. "ŽLUTÁ TRÁVA" na "zlutatrava" pro obrázek
            const imgName = name.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '');
            return `
                <div class="item-card">
                    <div class="item-img-box">
                        <img src="images/${imgName}.png" onerror="this.src='images/neninic.png'">
                    </div>
                    <div class="item-info">
                        <label>${name}</label>
                        <div class="count-display">${count}</div>
                    </div>
                </div>`;
        }).join('');
    }

    // 2. VYKRESLENÍ ADMINA (pokud jsme na admin.html)
    const logBox = document.getElementById('admin-logs');
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<div class="log-entry">${l}</div>`).join('');
    }

    const sel = document.getElementById('folder-select');
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

window.onload = render;
setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);