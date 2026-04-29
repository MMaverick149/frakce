function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    if(id === 'storage') renderStore();
    if(id === 'members') renderMembers();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    if(!grid) return;
    const s_data = JSON.parse(localStorage.getItem('syn_s_data')) || {};
    
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="item-card">
            <div class="item-img-container">
                <img src="images/${k}.png" onerror="this.src='images/zlutatrava.png'">
            </div>
            <label>${k.toUpperCase()}</label>
            <span class="item-count">${v}</span>
        </div>`).join('');
}

function renderMembers() {
    const list = document.getElementById('members-list');
    const m_data = [
        { id: "#2989", rank: "DAS", name: "David Ricci" },
        { id: "#4987", rank: "NEZAŘAZEN", name: "Vito Scaletta" },
        { id: "#2998", rank: "AS", name: "we" }
    ];

    list.innerHTML = `
        <div class="table-header">
            <div>KÓD</div><div>HODNOST</div><div>SUBJEKT</div><div>AKCE</div>
        </div>
        ${m_data.map(m => `
            <div class="table-row">
                <div style="color: gray;">${m.id}</div>
                <div style="color: var(--accent); font-weight: bold;">${m.rank}</div>
                <div>${m.name}</div>
                <button class="btn-cyan">OTEVŘÍT</button>
            </div>
        `).join('')}
    `;
}

setInterval(() => {
    const clock = document.getElementById('clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString();
}, 1000);

showPage('home');