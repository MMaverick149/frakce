// Definice tvých nových věcí
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    "Nabojedlouhy": 0, 
    "Nabojpistol": 0, 
    "kontraband": 0, 
    "zlutatrava": 0, 
    "Tlumic": 0,
    "Flashlight": 0,
    "velkyzasobnik": 0,
    "Zamerovac": 0
};

let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || [];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};

const imgPath = "images/"; 

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn, .admin-btn-bottom').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    
    if(id === 'storage') renderStore();
    if(id === 'members') renderMembers();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    const sel = document.getElementById('st-what');
    
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="item-card">
            <div class="item-img-container">
                <img src="${imgPath}${k.toLowerCase()}.png" onerror="this.src='${imgPath}default.png'">
            </div>
            <label>${k.toUpperCase()}</label>
            <span>${v || 0}</span>
        </div>`).join('');

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
    list.innerHTML = m_list.map(m => `
        <div class="table-row">
            <div>#0000</div>
            <div>${f_data[m].rank || 'N/A'}</div>
            <div>${m}</div>
            <button class="btn-cyan">OTEVŘÍT</button>
        </div>`).join('');
}

function unlockAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    }
}

function clearSystem() {
    if(confirm("Smazat vše?")) {
        localStorage.clear();
        location.reload();
    }
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
showPage('home');