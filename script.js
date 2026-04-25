let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["Vito Scaletta", "David Ricci"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0 };
let l_data = JSON.parse(localStorage.getItem('syn_l_data')) || [];
let currentU = "";

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    document.getElementById('current-path').innerText = id.toUpperCase();
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const s = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(s)).sort().map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        return `
            <tr>
                <td><span class="rank-tag">${data.rank}</span></td>
                <td><strong>${m.toUpperCase()}</strong></td>
                <td><span style="color:#22c55e; font-size: 0.8rem;">● ŠIFROVÁNO</span></td>
                <td style="text-align:right"><button class="btn-open" onclick="openDossier('${m}')">OTEVŘÍT</button></td>
            </tr>
        `;
    }).join('');
}

function openDossier(name) {
    currentU = name;
    const f = f_data[name] || { rank: "NEZAŘAZEN", phone: "", items: "", notes: "" };
    document.getElementById('d-name').innerText = name;
    document.getElementById('in-rank').value = f.rank;
    document.getElementById('in-phone').value = f.phone;
    document.getElementById('in-items').value = f.items;
    document.getElementById('in-notes').value = f.notes;
    document.getElementById('dossier-modal').style.display = 'block';
}

function saveFolder() {
    const sig = document.getElementById('in-sig').value;
    if(!sig) return alert("Autorizace podpisem nutná!");
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value || "NEZAŘAZEN",
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    addLog(`Dossier update: ${currentU} (${sig})`);
    closeModal();
    renderMembers();
}

function editStore(type) {
    const who = document.getElementById('st-who').value;
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value);
    if(!who || isNaN(how)) return alert("Chyba");
    if(type === 'add') s_data[what] += how;
    else {
        if(s_data[what] < how) return alert("Nedostatek!");
        s_data[what] -= how;
    }
    addLog(`${who}: ${type === 'add' ? 'PŘÍJEM' : 'VÝDEJ'} ${how}x ${what}`);
    renderStore();
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k,v]) => `
        <div class="st-item"><label>${k.toUpperCase()}</label><span>${v}</span></div>
    `).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function loginAdmin() {
    if(document.getElementById('admin-pin').value === "1234") {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        renderLogs();
    }
}

function addMem() {
    const name = document.getElementById('new-mem-name').value;
    const rank = document.getElementById('new-mem-rank').value;
    if(!name) return;
    if(!m_list.includes(name)) m_list.push(name);
    f_data[name] = { rank: rank || "NEZAŘAZEN", phone: "", items: "", notes: "" };
    localStorage.setItem('syn_m_list', JSON.stringify(m_list));
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    addLog(`ROOT: Nový subjekt ${name}`);
    document.getElementById('new-mem-name').value = "";
    document.getElementById('new-mem-rank').value = "";
}

function addLog(m) {
    l_data.unshift(`[${new Date().toLocaleTimeString()}] ${m}`);
    localStorage.setItem('syn_l_data', JSON.stringify(l_data));
}

function renderLogs() {
    document.getElementById('log-list').innerHTML = l_data.map(l => `<div>${l}</div>`).join('');
}

function switchTab(e, id) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).style.display = 'block';
    e.target.classList.add('active');
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }
showPage('home');