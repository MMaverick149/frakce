// Načtení dat s ochranou proti NaN
let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data'));

// Kontrola, zda s_data existují a nejsou poškozená (NaN)
if (!s_data || typeof s_data !== 'object') {
    s_data = { zbrane: 0, munice: 0, zlutatrava: 0 };
} else {
    // Oprava případných NaN hodnot v uložených datech
    for (let key in s_data) {
        if (isNaN(s_data[key])) s_data[key] = 0;
    }
}

let currentU = "";

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + id);
    if (targetPage) {
        targetPage.style.display = 'block';
        document.getElementById('nav-' + id).classList.add('active');
        if(id === 'members') renderMembers();
        if(id === 'storage') renderStore();
    }
}

function renderMembers() {
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        return `<tr>
            <td style="color:#444">#${Math.floor(1000+Math.random()*9000)}</td>
            <td><span style="color:#3b82f6">${data.rank}</span></td>
            <td>${m.toUpperCase()}</td>
            <td><button onclick="openDossier('${m}')" class="btn-open">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v;
        let img = k === 'zlutatrava' ? '<img src="images/zlutatrava.png" class="st-img" onerror="this.src=\'https://via.placeholder.com/80?text=ERR\'">' : '<div class="st-img" style="display:flex; align-items:center; justify-content:center;"><i class="fas fa-box fa-2x"></i></div>';
        return `<div class="st-item">${img}<label style="display:block; font-size:0.7rem; color:#64748b;">${k.toUpperCase()}</label><span>${val}</span></div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value) || 0;
    
    if (type === 'add') {
        s_data[what] = (parseInt(s_data[what]) || 0) + how;
    } else {
        s_data[what] = Math.max(0, (parseInt(s_data[what]) || 0) - how);
    }
    renderStore();
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "", phone: "", items: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-items').value = f.items || "";
    document.getElementById('dossier-modal').style.display = 'block';
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

function saveFolder() {
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    closeModal();
    renderMembers();
}

function unlockAdmin() {
    const pin = document.getElementById('admin-pin').value;
    if(pin === "1234") { // Tady si změň PIN
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
    } else {
        alert("PŘÍSTUP ODEPŘEN");
    }
}

function addMem() {
    const name = document.getElementById('new-mem-name').value;
    const rank = document.getElementById('new-mem-rank').value;
    if(!name) return;
    if(!m_list.includes(name)) m_list.push(name);
    f_data[name] = { rank: rank, phone: "", items: "" };
    localStorage.setItem('syn_m_list', JSON.stringify(m_list));
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    alert("Zapsáno.");
    showPage('members');
}

// Spuštění dashboardu
showPage('home');