// Načtení dat z prohlížeče
let fsData = JSON.parse(localStorage.getItem('syn_fs')) || {
    "ZBRANĚ": 24,
    "MUNICE": 4,
    "ŽLUTÁ TRÁVA": 1
};

let logs = JSON.parse(localStorage.getItem('syn_logs')) || [];

// 1. FUNKCE PRO ADMINA
function createNewFolder() {
    const nameInput = document.getElementById('new-folder-input');
    const name = nameInput.value.toUpperCase().trim();
    if (name && !fsData[name]) {
        fsData[name] = 0;
        addLog(`VYTVOŘENA SLOŽKA: ${name}`);
        nameInput.value = "";
        saveAndRefresh();
    }
}

function deleteFolder(name) {
    if (confirm(`Smazat složku ${name}?`)) {
        delete fsData[name];
        addLog(`SMAZÁNA SLOŽKA: ${name}`);
        saveAndRefresh();
    }
}

function modifyStock(action) {
    const folder = document.getElementById('folder-select').value;
    const amount = parseInt(document.getElementById('item-amount').value) || 0;

    if (action === 'add') {
        fsData[folder] += amount;
        addLog(`AKTUALIZACE: ${folder} +${amount}`);
    } else {
        fsData[folder] = Math.max(0, fsData[folder] - amount);
        addLog(`AKTUALIZACE: ${folder} -${amount}`);
    }
    saveAndRefresh();
}

// 2. LOGOVÁNÍ
function addLog(msg) {
    const time = new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'});
    logs.unshift({ time, msg });
    if (logs.length > 15) logs.pop();
}

// 3. ZOBRAZOVÁNÍ (RENDERING)
function saveAndRefresh() {
    localStorage.setItem('syn_fs', JSON.stringify(fsData));
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    render();
}

function render() {
    // Skladová mřížka
    const grid = document.getElementById('storage-grid');
    if (grid) {
        grid.innerHTML = Object.entries(fsData).map(([name, count]) => `
            <div class="item-card">
                <div class="item-img-box"><img src="images/folder.png" onerror="this.src='images/zlutatrava.png'"></div>
                <div class="item-info">
                    <label>${name}</label>
                    <div class="count-display">${count}</div>
                </div>
            </div>
        `).join('');
    }

    // Admin prvky
    const folderList = document.getElementById('active-folders');
    const select = document.getElementById('folder-select');
    const logBox = document.getElementById('admin-logs');

    if (folderList) {
        folderList.innerHTML = Object.keys(fsData).map(name => `
            <div class="folder-row">
                <span>📁 ${name}</span>
                <button onclick="deleteFolder('${name}')" class="btn-mini">SMAZAT</button>
            </div>
        `).join('');
    }
    if (select) {
        select.innerHTML = Object.keys(fsData).map(name => `<option value="${name}">${name}</option>`).join('');
    }
    if (logBox) {
        logBox.innerHTML = logs.map(l => `<p><span class="cyan">[${l.time}]</span> ${l.msg}</p>`).join('');
    }
}

// Ochrana heslem
function accessAdmin() {
    if (prompt("ZADEJTE SYNDICATE KÓD:") === "syndicate2026") {
        window.location.href = "admin.html";
    }
}

// Hodiny a Start
setInterval(() => {
    const clock = document.getElementById('clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

window.onload = render;