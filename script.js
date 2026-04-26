let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0, zlutatrava: 0 };
let currentU = "";

// Oprava NaN chyby
for (let key in s_data) { if(isNaN(s_data[key])) s_data[key] = 0; }

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const search = document.getElementById('m-search').value.toLowerCase();
    const tbody = document.getElementById('members-list');
    tbody.innerHTML = m_list.filter(m => m.toLowerCase().includes(search)).map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        const idCode = Math.floor(1000 + (m.length * 123) % 8999);
        return `<tr>
            <td style="color:#334155; font-weight:700;">#${idCode}</td>
            <td style="color:var(--accent); font-weight:700;">${data.rank.toUpperCase()}</td>
            <td>${m}</td>
            <td><button onclick="openDossier('${m}')" style="background:var(--accent); border:none; color:white; padding:5px 10px; border-radius:4px; cursor:pointer;">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v;
        return `<div class="st-card">
            <label style="color:var(--text-dim); font-size:0.7rem; font-weight:700;">${k.toUpperCase()}</label>
            <span>${val}</span>
        </div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "", phone: "", items: "", notes: "", sig: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank || "";
    document.getElementById('in-phone').value = f.phone || "";
    document.getElementById('in-items').value = f.items || "";
    document.getElementById('in-notes').value = f.notes || "";
    document.getElementById('in-sig').value = f.sig || "";
    document.getElementById('dossier-modal').style.display = 'flex';
}

function switchTab(e, tabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    e.currentTarget.classList.add('active');
}

function saveFolder() {
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value,
        sig: document.getElementById('in-sig').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    closeModal();
    renderMembers();
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

showPage('home');