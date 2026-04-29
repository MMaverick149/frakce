let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    "nabojedlouhy": 10, 
    "nabojpistol": 5, 
    "tlumic": 2,
    "flashlight": 1,
    "zlutatrava": 0 
};

let m_list = ["David Ricci", "Vito Scaletta"]; // Testovací data
let f_data = { "David Ricci": {rank: "DAS"}, "Vito Scaletta": {rank: "NEZAŘAZEN"} };

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    if(id === 'storage') renderStore();
    if(id === 'members') renderMembers();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    const sel = document.getElementById('st-what');
    
    // Klíčem je název souboru. Pokud máš Flashlight.png, kód ho najde.
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="item-card">
            <img src="images/${k}.png" onerror="this.src='images/zlutatrava.png'">
            <div>${k.toUpperCase()}</div>
            <div style="font-size: 20px; color: var(--accent)">${v}</div>
        </div>`).join('');

    sel.innerHTML = Object.keys(s_data).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('');
}

function renderMembers() {
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.map(m => `
        <div class="table-row">
            <div style="color: gray">#${Math.floor(Math.random()*9000)+1000}</div>
            <div style="color: var(--accent)">${f_data[m]?.rank || '??'}</div>
            <div>${m}</div>
            <button class="btn-cyan">INFO</button>
        </div>`).join('');
}

// Hodiny a start
setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
showPage('home');