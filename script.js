let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, kontraband: 0, zlutatrava: 0 };
let currentU = "";

// POJISTKA PROTI NaN: Projde všechna data ve skladu a pokud to není číslo, dá tam 0
for (let k in s_data) { if(isNaN(s_data[k]) || s_data[k] === null) s_data[k] = 0; }

function showPage(id) {
    document.querySelectorAll('.page-content').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
    
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

function renderMembers() {
    const s = document.getElementById('m-search').value.toLowerCase();
    const l = document.getElementById('members-list');
    l.innerHTML = m_list.filter(m => m.toLowerCase().includes(s)).map(m => {
        const d = f_data[m] || { rank: "NEZAŘAZEN" };
        const id = Math.floor(1000 + (m.length * 99) % 8999);
        return `<tr>
            <td style="color:#334155">#${id}</td>
            <td style="color:var(--accent); font-weight:700">${d.rank.toUpperCase()}</td>
            <td>${m}</td>
            <td><button onclick="openDossier('${m}')" style="background:none; border:1px solid var(--accent); color:var(--accent); padding:5px 10px; cursor:pointer;">OTEVŘÍT</button></td>
        </tr>`;
    }).join('');
}

function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let val = isNaN(v) ? 0 : v;
        
        // Výběr ikony podle typu zboží
        let iconHtml = '<i class="fas fa-box fa-2x"></i>'; // Výchozí krabice
        if (k === 'zlutatrava') iconHtml = '<i class="fas fa-leaf fa-2x" style="color: #fbbf24;"></i>'; // Ikona pro trávu
        if (k === 'zbrane') iconHtml = '<i class="fas fa-gun fa-2x"></i>';
        if (k === 'munice') iconHtml = '<i class="fas fa-car-battery fa-2x"></i>'; // Náhrada za munici
        
        return `
            <div class="st-card">
                <div class="st-icon-container" style="margin-bottom: 10px; opacity: 0.7;">
                    ${iconHtml}
                </div>
                <label style="color:#475569; font-size:0.7rem; display:block;">${k.toUpperCase()}</label>
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
    document.querySelectorAll('.tab-p').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.t-btn').forEach(t => t.classList.remove('active'));
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
    } else { alert("CHYBNÝ PIN"); }
}

function addMem() {
    const n = document.getElementById('new-n').value;
    const r = document.getElementById('new-r').value;
    if(!n) return;
    if(!m_list.includes(n)) m_list.push(n);
    f_data[n] = { rank: r, phone: "", items: "", notes: "" };
    localStorage.setItem('syn_m_list', JSON.stringify(m_list));
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    showPage('members');
}

showPage('home');