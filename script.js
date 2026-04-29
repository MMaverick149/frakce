// Data pro logistiku (klíče musí odpovídat názvům obrázků)
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    "nabojedlouhy": 0, 
    "nabojpistol": 0, 
    "tlumic": 0,
    "flashlight": 0,
    "velkyzasobnik": 0,
    "zamerovac": 0,
    "zlutatrava": 0
};

function renderStore() {
    const grid = document.getElementById('st-grid');
    const sel = document.getElementById('st-what');
    
    // Vykreslení karet
    grid.innerHTML = Object.entries(s_data).map(([key, val]) => `
        <div class="item-card">
            <img src="images/${key.toLowerCase()}.png" onerror="this.src='images/zlutatrava.png'">
            <div class="item-label">${key.toUpperCase()}</div>
            <div class="item-count">${val}</div>
        </div>
    `).join('');

    // Aktualizace výběru v menu
    sel.innerHTML = Object.keys(s_data).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('');
}

function renderMembers() {
    const list = document.getElementById('members-list');
    // m_list jsou tvoji uživatelé z localStorage
    list.innerHTML = m_list.map(m => `
        <div class="table-row">
            <div style="color: #64748b;">#${Math.floor(Math.random()*9000)+1000}</div>
            <div style="color: var(--accent);">${f_data[m]?.rank || 'NEZAŘAZEN'}</div>
            <div style="font-weight: bold;">${m}</div>
            <button class="btn-cyan" onclick="openProfile('${m}')">OTEVŘÍT</button>
        </div>
    `).join('');
}