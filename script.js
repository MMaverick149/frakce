let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || [];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    Nabojedlouhy: 0, Nabojpistol: 0, Kontraband: 0, zlutatrava: 0, 
    Tlumic: 0, Flashlight: 0, velkyzasobnik: 0, Zamerovac: 0 
};

// Mapa ikon pro sklad
const itemIcons = {
    Nabojedlouhy: "fa-solid fa-box-archive",
    Nabojpistol: "fa-solid fa-gun",
    Kontraband: "fa-solid fa-box",
    zlutatrava: "fa-solid fa-leaf",
    Tlumic: "fa-solid fa-screwdriver-wrench",
    Flashlight: "fa-solid fa-flashlight",
    velkyzasobnik: "fa-solid fa-plus-square",
    Zamerovac: "fa-solid fa-crosshairs"
};

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn, .admin-btn-bottom').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    
    let navBtn = document.getElementById('nav-' + id);
    if(navBtn) navBtn.classList.add('active');

    if(id === 'members') renderMembers();
    if(id === 'storage') { renderStore(); updateSelect(); }
}

function updateSelect() {
    const sel = document.getElementById('st-what');
    sel.innerHTML = Object.keys(s_data).map(k => `<option value="${k}">${k.toUpperCase()}</option>`).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        const icon = itemIcons[k] || "fa-solid fa-cubes";
        return `
        <div class="item-card">
            <i class="${icon}"></i>
            <label style="color:var(--accent); font-size:0.8rem; font-weight:800;">${k.toUpperCase()}</label>
            <span>${v || 0}</span>
        </div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function renderMembers() {
    const q = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(q)).map(m => {
        const d = f_data[m] || { rank: "NEZAŘAZEN" };
        const code = (m.length * 999 % 9000 + 1000);
        return `<div class="table-row">
            <div style="color:#64748b">#${code}</div>
            <div style="color:var(--accent); font-weight:800;">${d.rank.toUpperCase()}</div>
            <div>${m}</div>
            <button onclick="openDossier('${m}')" class="btn-cyan" style="padding:5px; font-size:0.7rem; width:80px;">OTEVŘÍT</button>
        </div>`;
    }).join('');
}

function editStore(type) {
    const item = document.getElementById('st-what').value;
    const qty = parseInt(document.getElementById('st-how').value) || 0;
    if(type === 'add') s_data[item] += qty;
    else s_data[item] = Math.max(0, s_data[item] - qty);
    renderStore();
}

function unlockAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        alert("PŘÍSTUP ODEPŘEN");
    }
}

function addMem() {
    const name = document.getElementById('new-mem-name').value;
    const rank = document.getElementById('new-mem-rank').value;
    if(name && !m_list.includes(name)) {
        m_list.push(name);
        f_data[name] = { rank: rank, phone: "", items: "", notes: "" };
        localStorage.setItem('syn_m_list', JSON.stringify(m_list));
        localStorage.setItem('syn_f_data', JSON.stringify(f_data));
        document.getElementById('new-mem-name').value = "";
        alert("Subjekt zapsán do systému.");
    }
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || {};
    document.getElementById('d-name').innerText = name;
    document.getElementById('d-id-code').innerText = "#" + (name.length * 999 % 9000 + 1000);
    document.getElementById('in-rank').value = f.rank || "";
    document.getElementById('in-phone').value = f.phone || "";
    document.getElementById('in-items').value = f.items || "";
    document.getElementById('in-notes').value = f.notes || "";
    document.getElementById('dossier-modal').style.display = 'flex';
}

function saveFolder() {
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    closeModal(); renderMembers();
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

function switchTab(e, id) {
    document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    e.currentTarget.classList.add('active');
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
showPage('home');