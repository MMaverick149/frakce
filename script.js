let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0, zlutatrava: 0 };
let currentU = "";

function showPage(id) {
    document.querySelectorAll('.page-frame').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.getElementById('nav-' + id).classList.add('active');
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const search = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(search)).map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        const idCode = (m.length * 777 % 9000 + 1000);
        return `
            <div class="grid-row">
                <div style="color:var(--text-dim)">#${idCode}</div>
                <div style="color:var(--accent); font-weight:800; font-size:0.7rem;">${data.rank.toUpperCase()}</div>
                <div style="font-weight:600;">${m}</div>
                <button onclick="openDossier('${m}')" class="save-btn" style="padding:5px 10px; font-size:0.6rem;">PROTOKOL</button>
            </div>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => `
        <div class="inv-card">
            <h4>${k.toUpperCase()}</h4>
            <span>${isNaN(v) ? 0 : v}</span>
        </div>`).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "", phone: "", items: "", notes: "", sig: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('d-id-code').innerText = "#" + (name.length * 777 % 9000 + 1000);
    document.getElementById('in-rank').value = f.rank || "";
    document.getElementById('in-phone').value = f.phone || "";
    document.getElementById('in-items').value = f.items || "";
    document.getElementById('in-notes').value = f.notes || "";
    document.getElementById('in-sig').value = f.sig || "";
    document.getElementById('dossier-modal').style.display = 'flex';
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
    closeModal(); renderMembers();
}

function switchTab(e, tabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    e.currentTarget.classList.add('active');
}

function editStore(type) {
    const item = document.getElementById('st-what').value;
    const qty = parseInt(document.getElementById('st-how').value) || 0;
    if(type === 'add') s_data[item] += qty;
    else s_data[item] = Math.max(0, s_data[item] - qty);
    renderStore();
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }
showPage('home');