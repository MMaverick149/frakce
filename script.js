const POLOZKY = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA", "TLUMIČ", "DROGY", "VESTA", "FLASHLIGHT", "NABOJE DLOUHY", "NABOJE PISTOL", "VELKY ZASOBNIK", "ZAMEROVAC"];

let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};
let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// Inicializace nul
POLOZKY.forEach(p => {
    if (typeof fsData[p] !== 'number') fsData[p] = 0;
});

function modifyStock(action) {
    const item = document.getElementById('folder-select').value;
    const amount = parseInt(document.getElementById('item-amount').value) || 0;
    const opInput = document.getElementById('operator-name');
    const opName = opInput ? opInput.value.trim() : "Neznámý";

    if (amount <= 0) return;
    if (opName === "") { alert("Zadej jméno!"); return; }

    const time = new Date().toLocaleTimeString('cs-CZ');
    if (action === 'add') {
        fsData[item] += amount;
        logs.unshift(`[${time}] ${opName} PŘIDAL: ${amount}ks ${item}`);
    } else {
        fsData[item] = Math.max(0, fsData[item] - amount);
        logs.unshift(`[${time}] ${opName} ODEBRAL: ${amount}ks ${item}`);
    }

    if (logs.length > 15) logs.pop();
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

function render() {
    const grid = document.getElementById('storage-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(fsData).map(([name, count]) => {
        // Převede "ŽLUTÁ TRÁVA" na "zlutatrava" (bez diakritiky, malá písmena, bez mezer)
        // Aby to přesně sedělo na tvoje soubory v images/
        const fileName = name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '');

        return `
            <div class="item-card">
                <div class="item-img-box">
                    <img src="images/${fileName}.png" onerror="this.src='images/neninic.png'">
                </div>
                <div class="item-info">
                    <div style="color: #0ff; font-size: 11px;">${name}</div>
                    <div class="count-display">${count}</div>
                </div>
            </div>
        `;
    }).join('');

    const logBox = document.getElementById('admin-logs');
    if (logBox) logBox.innerHTML = logs.map(l => `<div>${l}</div>`).join('');

    const sel = document.getElementById('folder-select');
    if (sel && sel.innerHTML === "") {
        sel.innerHTML = POLOZKY.map(p => `<option value="${p}">${p}</option>`).join('');
    }
}

setInterval(() => {
    const c = document.getElementById('clock');
    if (c) c.innerText = new Date().toLocaleTimeString();
}, 1000);

window.onload = render;