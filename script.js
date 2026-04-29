// Data skladu
let inventory = JSON.parse(localStorage.getItem('syn_inventory')) || {
    "Flashlight": 0, "Nabojedlouhy": 0, "nabojpistol": 0, 
    "Tlumic": 0, "Velkyzasobnik": 0, "zamerovac": 0, 
    "zlutatrava": 0, "kontraband": 0
};

// Funkce pro heslo do ADMIN zóny
function accessAdmin() {
    const pass = prompt("ZADEJ PŘÍSTUPOVÝ KÓD:");
    if (pass === "syndicate2026") {
        window.location.href = "admin.html";
    } else {
        alert("PŘÍSTUP ZAMÍTNUT!");
    }
}

function renderInventory() {
    const grid = document.getElementById('storage-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(inventory).map(([name, count]) => `
        <div class="item-card">
            <div class="item-img-box">
                <img src="images/${name}.png" onerror="this.src='images/zlutatrava.png'">
            </div>
            <div class="item-info">
                <label>${name.toUpperCase()}</label>
                <div class="count-display">${count}</div>
            </div>
        </div>
    `).join('');
    localStorage.setItem('syn_inventory', JSON.stringify(inventory));
}

function updateInventory(action) {
    const item = document.getElementById('item-select').value;
    const amount = parseInt(document.getElementById('item-amount').value) || 0;

    if (action === 'add') {
        inventory[item] += amount;
    } else {
        inventory[item] = Math.max(0, inventory[item] - amount);
    }
    renderInventory();
}

// Hodiny
setInterval(() => {
    const clockEl = document.getElementById('clock');
    if (clockEl) clockEl.innerText = new Date().toLocaleTimeString();
}, 1000);

renderInventory();