// Načtení dat (pokud v localStorage nic není, použijeme základy)
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    "Nabojedlouhy": 0, "Nabojpistol": 0, "kontraband": 0, 
    "zlutatrava": 0, "Tlumic": 0, "Flashlight": 0, 
    "velkyzasobnik": 0, "Zamerovac": 0 
};

let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || [];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};

const imgPath = "images/"; 

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');

    if(id === 'storage') renderStore();
    if(id === 'members') renderMembers();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    if(!grid) return;

    // Čisté zobrazení bez ovládacích prvků
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="item-card">
            <div class="item-img-container">
                <img src="${imgPath}${k}.png" onerror="this.src='${imgPath}zlutatrava.png'">
            </div>
            <label>${k.toUpperCase()}</label>
            <span>${v}</span>
        </div>`).join('');
}

function renderMembers() {
    const list = document.getElementById('members-list');
    if(!list) return;
    if(m_list.length === 0) {
        list.innerHTML = "<div style='color:gray; padding:20px;'>DATABÁZE JE PRÁZDNÁ</div>";
        return;
    }
    list.innerHTML = m_list.map(m => `
        <div class="table-row">
            <div>#${Math.floor(Math.random()*9000)+1000}</div>
            <div style="color:var(--accent)">${f_data[m]?.rank || 'NEZAŘAZEN'}</div>
            <div>${m}</div>
            <button class="btn-cyan" style="padding:5px;">DETAIL</button>
        </div>`).join('');
}

setInterval(() => { 
    const clock = document.getElementById('clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString(); 
}, 1000);

showPage('home');