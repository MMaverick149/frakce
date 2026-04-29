function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    if(id === 'storage') renderStore();
    if(id === 'members') renderMembers();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    // Načtení dat ze sdílené paměti
    const s_data = JSON.parse(localStorage.getItem('syn_s_data')) || {};
    
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="item-card">
            <div class="item-img-container">
                <img src="images/${k}.png" onerror="this.src='images/zlutatrava.png'">
            </div>
            <label>${k.toUpperCase()}</label>
            <span>${v}</span>
        </div>`).join('');
}

function renderMembers() {
    const list = document.getElementById('members-list');
    // Ukázková data pro databázi
    const m_list = ["David Ricci", "Vito Scaletta", "we"];
    const ranks = {"David Ricci": "DAS", "Vito Scaletta": "NEZAŘAZEN", "we": "AS"};

    list.innerHTML = m_list.map(m => `
        <div class="table-row">
            <div style="color:gray;">#${Math.floor(Math.random()*9000)+1000}</div>
            <div style="color:var(--accent); font-weight:bold;">${ranks[m]}</div>
            <div>${m}</div>
            <button class="btn-cyan">OTEVŘÍT</button>
        </div>`).join('');
}

setInterval(() => { 
    const c = document.getElementById('clock');
    if(c) c.innerText = new Date().toLocaleTimeString(); 
}, 1000);

showPage('home');