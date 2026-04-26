let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0, zlutatrava: 0 };
let currentU = "";

// Oprava NaN při načítání
for (let key in s_data) { if (isNaN(s_data[key])) s_data[key] = 0; }

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
    
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const search = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(search)).map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        const id = Math.floor(1000 + (m.length * 123) % 8999);
        return `<tr>
            <td style="color:#444">#${id}</td>
            <td style="color:var(--accent); font-weight:bold;">${data.rank.toUpperCase()}</td>
            <td style="font-weight:bold;">${m}</td>
            <td><button onclick="openDossier('${m}')" style="background:none; border:1px solid var(--accent); color:var(--accent); padding:5px 15px; cursor:pointer; border-radius:4px;">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v;
        let img = k === 'zlutatrava' ? '<img src="images/zlutatrava.png" class="st-img" onerror="this.src=\'https://via.placeholder.com/60?text=TRÁVA\'">' : '<div class="st-img" style="display:flex; align-items:center; justify-content:center;"><i class="fas fa-box fa-2x"></i></div>';
        return `<div class="st-item">${img}<label style="display:block; font-size:0.7rem; color:var(--dim); margin-bottom:5px;">${k.toUpperCase()}</label><span>${val}</span></div>`;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value) || 0;
    if (type === 'add') s_data[what] += how;
    else s_data[what] = Math.max(0, s_data[what] - how);
    renderStore();
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "", phone: "", items: "", notes: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-items').value = f.items || "";
    document.getElementById('in-notes').value = f.notes || "";
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
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    closeModal();
    renderMembers();
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

function unlockAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-lock').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else { alert("NEOPRÁVNĚNÝ PŘÍSTUP"); }
}

function addMem() {
    const n = document.getElementById('new-mem-name').value;
    const r = document.getElementById('new-mem-rank').value;
    if(!n) return;
    if(!m_list.includes(n)) m_list.push(n);
    f_data[n] = { rank: r, phone: "", items: "", notes: "" };
    localStorage.setItem('syn_m_list', JSON.stringify(m_list));
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    showPage('members');
}

// Spuštění
showPage('home');