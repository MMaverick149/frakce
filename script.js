// Načtení dat (pokud neexistují, vytvoří se základní sada)
let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || [];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    "Nabojedlouhy": 0, 
    "Nabojpistol": 0, 
    "kontraband": 0, 
    "zlutatrava": 0, 
    "Tlumic": 0,
    "Flashlight": 0,
    "velkyzasobnik": 0,
    "Zamerovac": 0,
};

// CESTA K TVÝM OBRÁZKŮM NA GITHUBU (Uprav si název repozitáře, pokud je jiný)
const imgPath = "./images/"; 

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn, .admin-btn-bottom').forEach(b => b.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + id);
    const targetBtn = document.getElementById('nav-' + id);
    
    if(targetPage) targetPage.classList.add('active');
    if(targetBtn) targetBtn.classList.add('active');

    if(id === 'members') renderMembers();
    if(id === 'storage') { renderStore(); updateSelect(); }
}

// Dynamické naplnění výběrového menu (aby tam byly i nové věci)
function updateSelect() {
    const sel = document.getElementById('st-what');
    if(!sel) return;
    // Seřadí položky abecedně a vytvoří možnosti v menu
    sel.innerHTML = Object.keys(s_data).sort().map(k => 
        `<option value="${k}">${k.toUpperCase()}</option>`
    ).join('');
}

// DYNAMICKÉ GENEROVÁNÍ SKLADU S OBRÁZKY
function renderStore() {
    const grid = document.getElementById('st-grid');
    if(!grid) return;

    grid.innerHTML = Object.entries(s_data).map(([item, count]) => {
        // Automaticky hledá obrázek: např. zbrane.png, munice.png
        // Pokud obrázek neexistuje, prohlížeč ukáže prázdné místo nebo alt text
        const imgSrc = `${imgPath}${item.toLowerCase()}.png`;
        
        return `
        <div class="item-card">
            <div class="item-img-container">
                <img src="${imgSrc}" alt="${item}" onerror="this.src='${imgPath}default.png'; this.onerror=null;">
            </div>
            <label>${item.toUpperCase()}</label>
            <span class="count-value">${count || 0}</span>
        </div>`;
    }).join('');
    
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const item = document.getElementById('st-what').value;
    const qty = parseInt(document.getElementById('st-how').value) || 0;
    
    if(!item) return;
    
    if(type === 'add') {
        s_data[item] = (s_data[item] || 0) + qty;
    } else {
        s_data[item] = Math.max(0, (s_data[item] || 0) - qty);
    }
    
    renderStore();
}

// --- ADMIN FUNKCE PRO PŘIDÁVÁNÍ NOVÝCH TYPŮ VĚCÍ ---
function addNewItemType() {
    const name = document.getElementById('new-item-name').value.trim().toLowerCase();
    if(name && s_data[name] === undefined) {
        s_data[name] = 0;
        localStorage.setItem('syn_s_data', JSON.stringify(s_data));
        alert(`Položka ${name} byla přidána do systému.`);
        document.getElementById('new-item-name').value = "";
        renderStore();
        updateSelect();
    } else {
        alert("Chyba: Název chybí nebo položka už existuje.");
    }
}

// Ostatní funkce (Members, Admin Lock) zůstávají stejné...
function unlockAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    }
}

function renderMembers() {
    const q = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    if(!list) return;
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(q)).map(m => {
        const d = f_data[m] || { rank: "NEZAŘAZEN" };
        const code = (m.length * 999 % 9000 + 1000);
        return `<div class="table-row">
            <div class="c-gray">#${code}</div>
            <div class="c-accent"><b>${d.rank.toUpperCase()}</b></div>
            <div>${m}</div>
            <button onclick="openDossier('${m}')" class="btn-cyan">OTEVŘÍT</button>
        </div>`;
    }).join('');
}

setInterval(() => { 
    const clock = document.getElementById('clock');
    if(clock) clock.innerText = new Date().toLocaleTimeString(); 
}, 1000);

showPage('home');