let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0, zlutatrava: 0 };
let currentU = "";

// Oprava NaN hned při načtení
for (let k in s_data) { if(isNaN(s_data[k])) s_data[k] = 0; }

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.menu button').forEach(b => b.classList.remove('active'));
    
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const term = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(term)).map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        const idCode = Math.floor(1000 + Math.random() * 9000);
        return `<tr>
            <td style="color:#334155">#${idCode}</td>
            <td style="color:var(--accent); font-weight:600">${data.rank}</td>
            <td>${m}</td>
            <td><button onclick="openDossier('${m}')" class="btn-open">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v;
        return `<div class="st-card">
            <label style="color:#64748b; font-size:0.7rem;">${k.toUpperCase()}</label>
            <span>${val}</span>
        </div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value) || 0;
    if(type === 'add') s_data[what] += how;
    else s_data[what] = Math.max(0, s_data[what] - how);
    renderStore();
}

// Spuštění
showPage('home');