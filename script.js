// Nastavení databáze a položek
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    "nabojedlouhy": 0, 
    "nabojpistol": 0, 
    "kontraband": 0, 
    "zlutatrava": 0, 
    "tlumic": 0,
    "flashlight": 0,
    "velkyzasobnik": 0,
    "zamerovac": 0
};

// Aby byla databáze na začátku prázdná, necháme pole prázdné
let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || [];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};

const imgPath = "images/"; // Cesta ke tvým obrázkům

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    if(document.getElementById('nav-' + id)) document.getElementById('nav-' + id).classList.add('active');

    if(id === 'storage') renderStore();
    if(id === 'members') renderMembers();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    const sel = document.getElementById('st-what');
    
    // Generování karet s obrázky
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="item-card">
            <div class="item-img-container">
                <img src="${imgPath}${k.toLowerCase()}.png" onerror="this.src='${imgPath}zlutatrava.png'">
            </div>
            <label>${k.toUpperCase()}</label>
            <span>${v || 0}</span>
        </div>`).join('');

    // Naplnění výběru v menu
    sel.innerHTML = Object.keys(s_data).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const item = document.getElementById('st-what').value;
    const qty = parseInt(document.getElementById('st-how').value) || 0;
    if(type === 'add') s_data[item] += qty;
    else s_data[item] = Math.max(0, s_data[item] - qty);
    renderStore();
}

function renderMembers() {
    const list = document.getElementById('members-list');
    if (m_list.length === 0) {
        list.innerHTML = "<div style='padding:20px; color:gray;'>ŽÁDNÁ DATA NALEZENA</div>";
        return;
    }
    
    list.innerHTML = m_list.map(m => `
        <div class="table-row">
            <div style="color:gray;">#${Math.floor(Math.random()*9000)+1000}</div>
            <div style="color:var(--accent);">${(f_data[m] && f_data[m].rank) ? f_data[m].rank : 'NEZAŘAZEN'}</div>
            <div style="font-weight:bold;">${m}</div>
            <button class="btn-cyan" style="padding:5px 10px;">OTEVŘÍT</button>
        </div>`).join('');
}

function unlockAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    }
}

function clearSystem() {
    if(confirm("OPRAVDU SMAZAT VŠE?")) {
        localStorage.clear();
        location.reload();
    }
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
showPage('home');