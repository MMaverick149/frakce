// --- 1. DATA A OPRAVA CHYB ---
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {};

// Funkce, která vyčistí poškozená data (opraví NaN na 0)
function validateData() {
    const keys = ["ZBRANĚ", "MUNICE", "KONTRABAND", "ŽLUTÁ TRÁVA"];
    keys.forEach(key => {
        if (typeof fsData[key] !== 'number' || isNaN(fsData[key])) {
            fsData[key] = 0;
        }
    });
}
validateData();

let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

function saveAll() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    refreshUI();
}

// --- 2. OVLÁDÁNÍ (ADMIN) ---
function modifyStock(action) {
    const select = document.getElementById('folder-select');
    const amountInput = document.getElementById('item-amount');
    
    if (!select || !amountInput) return;

    const folder = select.value;
    const amount = parseInt(amountInput.value);

    if (isNaN(amount) || amount < 1) {
        alert("Zadej platné číslo!");
        return;
    }

    if (action === 'add') {
        fsData[folder] += amount;
        addLog(`PŘIDÁNO: ${amount}ks -> ${folder}`);
    } else {
        if (fsData[folder] < amount) {
            alert("Nedostatek zásob ve skladu!");
            return;
        }
        fsData[folder] -= amount;
        addLog(`ODEBRÁNO: ${amount}ks -> ${folder}`);
    }
    saveAll();
}

function createNewFolder() {
    const input = document.getElementById('new-folder-input');
    if (!input) return;
    const name = input.value.toUpperCase().trim();
    if (name && fsData[name] === undefined) {
        fsData[name] = 0;
        addLog(`VYTVOŘENA SLOŽKA: ${name}`);
        input.value = "";
        saveAll();
    }
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    logs.unshift({ time, msg });
    if (logs.length > 10) logs.pop();
}

// --- 3. ZOBRAZOVÁNÍ (RENDERING) ---
function refreshUI() {
    // SKLAD
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

    // ADMIN PRVKY
    const select = document.getElementById('folder-select');
    const logBox = document.getElementById('admin-logs');
    const list = document.getElementById('active-folders');

    if (select) {
        select.innerHTML = Object.keys(fsData).map(name => `<option value="${name}">${name}</option>`).join('');
    }
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
    }
    if (list) {
        list.innerHTML = Object.keys(fsData).map(name => `
            <div class="folder-row">
                <span>📁 ${name}</span>
                <button onclick="deleteFolder('${name}')" class="btn-mini">SMAZAT</button>
            </div>
        `).join('');
    }
}

function deleteFolder(name) {
    if (confirm(`Opravdu smazat ${name}?`)) {
        delete fsData[name];
        saveAll();
    }
}

// --- 4. START ---
window.onload = () => {
    refreshUI();
    setInterval(() => {
        const c = document.getElementById('clock');
        if(c) c.innerText = new Date().toLocaleTimeString();
    }, 1000);
};

function accessAdmin() {
    if (prompt("HESLO:") === "syndicate2026") window.location.href = "admin.html";
}