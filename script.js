// Konfigurace a data
let inventory = JSON.parse(localStorage.getItem('syn_inventory')) || {
    "Flashlight": 0, "Nabojedlouhy": 0, "nabojpistol": 0, 
    "Tlumic": 0, "Velkyzasobnik": 0, "zamerovac": 0, 
    "zlutatrava": 0, "kontraband": 0
};

let logs = JSON.parse(localStorage.getItem('syn_logs')) || [
    { time: "18:42", msg: "Přístup do skladu autorizován" },
    { time: "19:15", msg: "Systém šifrování aktualizován" }
];

let folderStatus = JSON.parse(localStorage.getItem('syn_folders')) || {
    "sklad": true // true = odemčeno/viditelné
};

// Funkce pro ADMIN HESLO
function accessAdmin() {
    const pass = prompt("ZADEJTE SYNDICATE KÓD:");
    if (pass === "syndicate2026") {
        window.location.href = "admin.html";
    } else {
        addLog("Neúspěšný pokus o vstup do Admin Panelu!");
        alert("PŘÍSTUP ZAMÍTNUT");
    }
}

// Správa logů
function addLog(message) {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}`;
    logs.unshift({ time: timeStr, msg: message });
    if (logs.length > 15) logs.pop(); // Udržujeme max 15 logů
    localStorage.setItem('syn_logs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const logContainer = document.getElementById('admin-logs');
    if (!logContainer) return;
    logContainer.innerHTML = logs.map(l => `
        <p><span class="cyan">[${l.time}]</span> ${l.msg}</p>
    `).join('');
}

// Zamykání složek
function toggleFolder(folderId) {
    folderStatus[folderId] = !folderStatus[folderId];
    localStorage.setItem('syn_folders', JSON.stringify(folderStatus));
    addLog(`Složka ${folderId.toUpperCase()} byla ${folderStatus[folderId] ? 'ODEMČENA' : 'ZAMČENA'}`);
    updateLockUI();
}

function updateLockUI() {
    const btn = document.getElementById('lock-btn-sklad');
    if (btn) {
        btn.innerText = folderStatus.sklad ? "ZAMKNOUT" : "ODEMKNOUT";
        btn.style.background = folderStatus.sklad ? "" : "#ff3e3e";
    }
    // Skrytí/Zobrazení v navigaci
    const navSklad = document.getElementById('nav-sklad');
    if (navSklad) {
        navSklad.style.display = folderStatus.sklad ? "block" : "none";
    }
}

// Původní logika skladu
function updateInventory(action) {
    const item = document.getElementById('item-select').value;
    const amount = parseInt(document.getElementById('item-amount').value) || 0;
    if (action === 'add') {
        inventory[item] += amount;
        addLog(`Zásoby: Přidáno ${amount}x ${item}`);
    } else {
        inventory[item] = Math.max(0, inventory[item] - amount);
        addLog(`Zásoby: Odebráno ${amount}x ${item}`);
    }
    localStorage.setItem('syn_inventory', JSON.stringify(inventory));
    renderInventory();
}

function renderInventory() {
    const grid = document.getElementById('storage-grid');
    if (!grid) return;
    grid.innerHTML = Object.entries(inventory).map(([name, count]) => `
        <div class="item-card">
            <div class="item-img-box"><img src="images/${name}.png" onerror="this.src='images/zlutatrava.png'"></div>
            <div class="item-info">
                <label>${name.toUpperCase()}</label>
                <div class="count-display">${count}</div>
            </div>
        </div>
    `).join('');
}

// Spuštění při načtení
setInterval(() => {
    if(document.getElementById('clock')) document.getElementById('clock').innerText = new Date().toLocaleTimeString();
}, 1000);

renderLogs();
renderInventory();
updateLockUI();