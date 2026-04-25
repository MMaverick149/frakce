// Inicializace dat s nulovými hodnotami, aby nevznikalo NaN
let s_data = JSON.parse(localStorage.getItem('syn_s_data')) || { 
    zbrane: 0, 
    munice: 0, 
    zlutatrava: 0 
};

function renderStore() {
    const grid = document.getElementById('st-grid');
    if (!grid) return;

    grid.innerHTML = Object.entries(s_data).map(([k, v]) => {
        // Kontrola, zda je hodnota číslo, pokud ne, nastavíme 0
        let displayValue = isNaN(v) ? 0 : v;
        
        // Cesta k obrázku - ujistěte se, že složka images existuje
        let imgHtml = `<div class="st-img"><i class="fas fa-box fa-2x" style="margin-top:25px; color:#334155;"></i></div>`;
        
        if (k === "zlutatrava") {
            // Přidán parametr pro zamezení cache a kontrolu cesty
            imgHtml = `<img src="images/zlutatrava.png" class="st-img" onerror="this.src='https://via.placeholder.com/100?text=Chyba+Cesty'">`;
        }

        return `
            <div class="st-item">
                ${imgHtml}
                <label style="display:block; margin-bottom:5px; font-size:0.7rem; color:#64748b;">${k.toUpperCase()}</label>
                <span style="font-size: 1.8rem; font-weight: bold; color: #3b82f6;">${displayValue}</span>
            </div>
        `;
    }).join('');
    
    localStorage.setItem('syn_s_data', JSON.stringify(s_data));
}

function editStore(type) {
    const who = document.getElementById('st-who').value;
    const what = document.getElementById('st-what').value;
    const inputHow = document.getElementById('st-how').value;
    const how = parseInt(inputHow);

    if(!who || isNaN(how)) {
        alert("Zadejte jméno operátora a platné množství!");
        return;
    }

    // Zajištění, že položka v databázi existuje před výpočtem
    if (s_data[what] === undefined || isNaN(s_data[what])) {
        s_data[what] = 0;
    }

    if(type === 'add') {
        s_data[what] += how;
    } else {
        if(s_data[what] < how) {
            alert("Nedostatečné zásoby!");
            return;
        }
        s_data[what] -= how;
    }

    // Volání logování (pokud máte funkci addLog definovanou)
    if (typeof addLog === "function") {
        addLog(`${who}: ${type === 'add' ? 'PŘIDAL' : 'ODEBRAL'} ${how}x ${what}`);
    }
    
    renderStore();
}

// Spuštění při načtení
document.addEventListener('DOMContentLoaded', renderStore);