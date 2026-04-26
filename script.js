let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, zlutatrava: 0 };
let currentU = "";

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        return `<tr>
            <td style="color:#444">#${Math.floor(1000+Math.random()*9000)}</td>
            <td><span style="color:#3b82f6">${data.rank}</span></td>
            <td>${m}</td>
            <td><button onclick="openDossier('${m}')" style="color:#3b82f6; background:none; border:1px solid #3b82f6; padding:3px 10px; cursor:pointer;">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v; // Oprava NaN
        let img = k === 'zlutatrava' ? '<img src="images/zlutatrava.png" class="st-img" onerror="this.style.display=\'none\'">' : '<i class="fas fa-box fa-2x"></i>';
        return `<div class="st-item">${img}<label>${k.toUpperCase()}</label><span>${val}</span></div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value) || 0;
    if(isNaN(s_data[what])) s_data[what] = 0;
    if(type === 'add') s_data[what] += how;
    else s_data[what] = Math.max(0, s_data[what] - how);
    renderStore();
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "", phone: "", items: "", notes: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-items').value = f.items;
    document.getElementById('dossier-modal').style.display = 'block';
}

function switchTab(e, id) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    e.currentTarget.classList.add('active');
}

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

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

// Spuštění
showPage('home');