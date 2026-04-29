// Načtení dat nebo vytvoření základních hodnot
let storeData = JSON.parse(localStorage.getItem('syn_storage')) || {
    "Flashlight": 0, "Nabojedlouhy": 0, "nabojpistol": 0, 
    "Tlumic": 0, "Velkyzasobnik": 0, "zamerovac": 0, "zlutatrava": 0
};

function renderUI() {
    const grid = document.getElementById('st-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(storeData).map(([name, count]) => `
        <div class="item-card">
            <div class="item-img">
                <img src="images/${name}.png" onerror="this.src='images/zlutatrava.png'">
            </div>
            <label>${name.toUpperCase()}</label>
            <span class="count">${count}</span>
        </div>
    `).join('');
    
    localStorage.setItem('syn_storage', JSON.stringify(storeData));
}

function updateStore(mode) {
    const item = document.getElementById('st-item').value;
    const amount = parseInt(document.getElementById('st-amount').value) || 0;

    if (mode === 'add') storeData[item] += amount;
    else storeData[item] = Math.max(0, storeData[item] - amount);

    renderUI();
}

// Hodiny pro horní roh
setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

renderUI();