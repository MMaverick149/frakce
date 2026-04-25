// Data
let m_list = JSON.parse(localStorage.getItem('syn_m_list')) || ["David Ricci", "Vito Scaletta"];
let f_data = JSON.parse(localStorage.getItem('syn_f_data')) || {};
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { zbrane: 0, munice: 0, zlutatrava: 0 };
let l_data = JSON.parse(localStorage.getItem('syn_l_data')) || [];
let currentU = "";

// Navigace
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
    document.getElementById('current-path').innerText = id.toUpperCase();
    if(id === 'members') renderMembers();
    if(id === 'storage') renderStore();
}

// Render složek (Registr)
function renderMembers() {
    const search = document.getElementById('m-search').value.toLowerCase();
    const list = document.getElementById('members-list');
    list.innerHTML = m_list.filter(m => m.toLowerCase().includes(search)).sort().map(m => {
        const data = f_data[m] || { rank: "NEZAŘAZEN" };
        const randomID = Math.floor(1000 + Math.random() * 9000); 
        return `
            <tr>
                <td style="color: #444; font-weight: bold;">#${randomID}</td>
                <td><span style="color:#3b82f6;">${data.rank}</span></td>
                <td><strong>${m.toUpperCase()}</strong></td>
                <td><span style="color:#22c55e;">● AKTIVNÍ</span></td>
                <td style="text-align:right"><button class="btn-open" onclick="openDossier('${m}')" style="cursor:pointer; background:rgba(59,130,246,0.1); border:1px solid #3b82f6; color:#3b82f6; padding:5px 15px; border-radius:4px;">OTEVŘÍT</button></td>
            </tr>
        `;
    }).join('');
}

// Sklad
function renderStore() {
    const grid = document.getElementById('st-grid');
    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        let imgHtml = `<div class="st-img"><i class="fas fa-box fa-2x" style="margin-top:25px; color:#334155;"></i></div>`;
        if (k === "zlutatrava") {
            imgHtml = `<img src="images/zlutatrava.png" class="st-img" onerror="this.src='https://via.placeholder.com/100?text=Chybí+Obrázek'">`;
        }
        return `
            <div class="st-item">
                ${imgHtml}
                <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:#64748b;">${k.toUpperCase()}</label>
                <span>${v}</span>
            </div>
        `;
    }).join('');
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const who = document.getElementById('st-who').value;
    const what = document.getElementById('st-what').value;
    const how = parseInt(document.getElementById('st-how').value);
    if(!who || isNaN(how)) return alert("Chyba dat");
    if(type === 'add') s_data[what] += how;
    else {
        if(s_data[what] < how) return alert("Nedostatek!");
        s_data[what] -= how;
    }
    addLog(`${who}: ${type === 'add' ? 'PŘIDAL' : 'ODEBRAL'} ${how}x ${what}`);
    renderStore();
}

// Dossier (Karta subjektu)
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

function switchTab(event, tabId) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.d-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function saveFolder() {
    const sig = document.getElementById('in-sig').value;
    if(!sig) return alert("Podpis nutný!");
    f_data[currentU] = {
        rank: document.getElementById('in-rank').value,
        phone: document.getElementById('in-phone').value,
        items: document.getElementById('in-items').value,
        notes: document.getElementById('in-notes').value
    };
    localStorage.setItem('syn_f_data', JSON.stringify(f_data));
    addLog(`Aktualizace složky: ${currentU} (Autor: ${sig})`);
    closeModal();
    renderMembers();
}

function closeModal() { document.getElementById('dossier-modal').style.display = 'none'; }

// Pomocné funkce
function addLog(m) {
    l_data.unshift(`[${new Date().toLocaleTimeString()}] ${m}`);
    localStorage.setItem('syn_l_data', JSON.stringify(l_data));
}

// Init
showPage('home');