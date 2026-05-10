/* NEXUS v6 — app.js */

var DB={
  get:function(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set:function(k,v){localStorage.setItem(k,JSON.stringify(v));}
};

var POSITIONS=['Boss','Right hand','Counselor',"Devil's Advocate",'Chief of Arms','Advisor','Intelligence Chief','Keeper of secrets','Member'];
var VEDENI_POS=['Boss','Right hand','Counselor',"Devil's Advocate"];
var CAT={weapons:'ZBRANĚ',ammo:'MUNICE',drugs:'DROGY',equipment:'VYBAVENÍ',other:'OSTATNÍ'};
var PRIO={low:'LOW',normal:'NORMAL',high:'HIGH',urgent:'URGENT'};
var CLOTH_CAT={masks:'Masky & Vousy',jackets:'Bundy & Trička',pants:'Kalhoty & Boty',acc:'Doplňky',sets:'Sety'};

var currentMemberId=null; // only store ID, always re-read from DB
var pendingLoginId=null;

function getMember(id){var members=DB.get('members')||[];return members.find(function(m){return m.id===(id||currentMemberId);})||null;}
function isAdmin(){var m=getMember();return m&&m.adminAccess;}
function isVedeni(pos){return VEDENI_POS.indexOf(pos)!==-1;}
function getWeekKey(){var d=new Date();var yr=d.getFullYear();var start=new Date(yr,0,1);var wk=Math.ceil(((d-start)/86400000+start.getDay()+1)/7);return yr+'-W'+wk;}

// ── TOAST ────────────────────────────────────
function toast(msg,type,dur){
  type=type||'info';dur=dur||3000;
  var c=document.getElementById('toastContainer');
  if(!c) return;
  var d=document.createElement('div');d.className='toast '+type;d.textContent=msg;c.appendChild(d);
  setTimeout(function(){d.style.animation='toastOut .3s ease forwards';setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},300);},dur);
}

// ── UTILS ────────────────────────────────────
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/\n/g,'<br>');}
function nowStr(){return new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}
function nowFull(){return new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});}
function setText(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function setHtml(id,v){var e=document.getElementById(id);if(e)e.innerHTML=v;}

// ── LOG ──────────────────────────────────────
function addLog(type,text){
  var m=getMember();var actor=m?m.displayName:'Systém';
  var log=DB.get('syslog')||[];
  log.unshift({time:nowFull(),type:type,actor:actor,text:text});
  if(log.length>500)log=log.slice(0,500);
  DB.set('syslog',log);
  sendToDiscord('['+type.toUpperCase()+'] ['+actor+'] '+text);
}
function sendToDiscord(msg){
  var s=DB.get('settings')||{};if(!s.webhook)return;
  fetch(s.webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:s.webhookName||'NEXUS LOG',content:'`'+nowStr()+'` '+msg})}).catch(function(){});
}

// ── ADMIN TABS (OPRAVENO) ────────────────────
function aTab(tab, btn) {
    document.querySelectorAll('.at').forEach(function(t) { t.classList.add('hidden'); });
    var el = document.getElementById('as-' + tab);
    if (el) el.classList.remove('hidden');

    document.querySelectorAll('#adminScreen .nb').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    if (tab === 'members') renderAdminMembers();
    if (tab === 'warehouse') renderAdminWarehouse();
    if (tab === 'clothing') renderAdminClothing();
    if (tab === 'finance') renderAdminFinance();
    if (tab === 'excuses') renderAdminExcuses();
    if (tab === 'reports') renderAdminReports();
    if (tab === 'radio') renderAdminRadio();
    if (tab === 'log') renderLog();
    if (tab === 'settings') renderSettings();
}

// ── INIT ─────────────────────────────────────
function initData(){
  if(!DB.get('members'))DB.set('members',generateMembers());
  if(!DB.get('tasks'))DB.set('tasks',{});
  if(!DB.get('messages'))DB.set('messages',{});
  if(!DB.get('reports'))DB.set('reports',[]);
  if(!DB.get('warehouse'))DB.set('warehouse',defaultWarehouse());
  if(!DB.get('clothing'))DB.set('clothing',[]);
  if(!DB.get('board'))DB.set('board',[]);
  if(!DB.get('boardConfirmed'))DB.set('boardConfirmed',{});
  if(!DB.get('excuses'))DB.set('excuses',[]);
  if(!DB.get('syslog'))DB.set('syslog',[]);
  if(!DB.get('finance'))DB.set('finance',{payments:[],expenses:[{id:uid(),name:'Týdenní příspěvek',amount:5000,type:'weekly',note:'Povinný příspěvek'}]});
  if(!DB.get('finsettings'))DB.set('finsettings',{weeklyFee:5000,feeDay:0});
  if(!DB.get('panicList'))DB.set('panicList',[]);
  if(!DB.get('settings'))DB.set('settings',{webhook:'',webhookName:'Frakce LOG'});
  if(!DB.get('radios'))DB.set('radios',{primary:'',secondary:'',action:'',vedeni:''});
  if(!DB.get('contacts'))DB.set('contacts',{});
}

function generateMembers(){
  var names=['48392017','71580432','29468175','86041329','53719284','14867593','92631480','37582041','68419375','25174860','79035148','41398267','56812493','83270516','19483725','64728190','30597418','78143625','52901847','96374210','27481569','85019374','41672835','69254781','13846092','57482916','92136548','34718025','80529471','26391758','71845039','49268173','15693784','64027591','38912467'];
  var positions=['Boss','Right hand','Counselor',"Devil's Advocate",'Chief of Arms','Advisor','Intelligence Chief','Keeper of secrets','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member','Member'];
  return names.map(function(name,i){
    return {id:'clen'+(i+1),displayName:name,position:positions[i]||'Member',password:'heslo'+(i+1),adminAccess:(i<10),note:'',panic:false};
  });
}

function defaultWarehouse(){
  return [
    {id:uid(),name:'Náboje dlouhe',cat:'ammo',qty:0,min:0,note:'Dlouhé náboje',img:'nabojdlouhy.png'},
    {id:uid(),name:'Náboje krátké',cat:'ammo',qty:0,min:0,note:'Pistolové náboje',img:'nabojpistol.png'},
    {id:uid(),name:'Baterka',cat:'equipment',qty:0,min:0,note:'Taktická svítilna',img:'baterka.png'},
    {id:uid(),name:'Tlumič',cat:'weapons',qty:0,min:0,note:'Pro pistoli i SMG',img:'tlumic.png'},
    {id:uid(),name:'Zaměřovač',cat:'weapons',qty:0,min:0,note:'Optický zaměřovač',img:'zamerovac.png'},
    {id:uid(),name:'Velký zásobník',cat:'weapons',qty:0,min:0,note:'Extended mag',img:'velkyzasobnik.png'},
    {id:uid(),name:'Žlutá Tráva',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'zlutatrava.png'},
    {id:uid(),name:'Červena Tráva',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'cervenatrava.png'},
    {id:uid(),name:'Modrá Tráva',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'modratrava.png'},
    {id:uid(),name:'Fialová Tráva',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'fialovatrava.png'},
    {id:uid(),name:'Extáze',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'extaze.png'},
    {id:uid(),name:'Sáček s Extází',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'balicekextaze.png'},
    {id:uid(),name:'Metamfetamin',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'metak.png'},
    {id:uid(),name:'Sáček s Metamfetaminem',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'sacekmetak.png'},
    {id:uid(),name:'Modrý Kanabis',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'modrykanabis.png'},
    {id:uid(),name:'Žlutý Kanabis',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'zlutykanabis.png'},
    {id:uid(),name:'Červený Kanabis',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'cervenykanabis.png'},
    {id:uid(),name:'Fialový Kanabis',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'fialovykanabis.png'},
    {id:uid(),name:'Joy',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'joy.png'},
    {id:uid(),name:'Prášky na bolest',cat:'drugs',qty:0,min:0,note:'Speciální item',img:'praskynabolest.png'},
    {id:uid(),name:'Prazdný sáček',cat:'other',qty:0,min:0,note:'Speciální item',img:'prazdnysacek.png'}
  ];
}

// ── CLOCK & SCREENS ──────────────────────────
function startClock(){
  function tick(){var s=new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});setText('mClock',s);}
  tick();setInterval(tick,1000);
}

function showScreen(id){
  ['selectScreen','memberScreen','adminScreen'].forEach(function(s){
    var e=document.getElementById(s);
    if(e) { e.classList.remove('active'); e.classList.add('hidden'); }
  });
  var t=document.getElementById(id);
  if(t) { t.classList.remove('hidden'); t.classList.add('active'); }
}

function goBack(){
  currentMemberId=null;pendingLoginId=null;
  renderMemberSelect();showScreen('selectScreen');
}

// ── LOGIN ────────────────────────────────────
function openLoginModal(id){
  var m=getMember(id);if(!m)return;
  pendingLoginId=id;
  document.getElementById('loginModalTitle').textContent='// '+m.displayName.toUpperCase();
  document.getElementById('loginModal').classList.remove('hidden');
}

function doMemberLogin(){
  var pass=document.getElementById('memberPassInput').value;
  var m=getMember(pendingLoginId);
  if(m && pass===m.password){
    currentMemberId=m.id;
    document.getElementById('loginModal').classList.add('hidden');
    showScreen('memberScreen');
    mTab('board', document.querySelector('#memberScreen .nb'));
  } else {
    document.getElementById('memberPassErr').textContent='// ŠPATNÉ HESLO';
  }
}

function doAdminLogin(){
  var pass=document.getElementById('adminPassInput').value;
  if(pass==='nexusadmin2025'){
    document.getElementById('adminModal').classList.add('hidden');
    showScreen('adminScreen');
    aTab('members',document.querySelector('#adminScreen .nb'));
  } else {
    document.getElementById('adminPassErr').textContent='// NESPRÁVNÉ HESLO';
  }
}

function goToAdmin(){
  showScreen('adminScreen');
  aTab('members',document.querySelector('#adminScreen .nb'));
}

// ── TABS ─────────────────────────────────────
function mTab(tab,btn){
  document.querySelectorAll('.mt').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('#memberScreen .nb').forEach(function(b){b.classList.remove('active');});
  var el=document.getElementById('mt-'+tab);if(el)el.classList.add('active');
  if(btn)btn.classList.add('active');
  if(tab==='clothing') renderClothing();
}

// ── CLOTHING (PLNÁ VERZE) ─────────────────────
var CLOTH_CATS=[
  {key:'masks',  label:'Masky & Vousy'},
  {key:'chains', label:'Šály & Řetízky'},
  {key:'jackets',label:'Bundy & Trička'},
  {key:'under',  label:'Podtrička & Sukně'},
  {key:'vests',  label:'Vesty & Doplňky'},
  {key:'bags',   label:'Batohy & Padáky'},
  {key:'hands',  label:'Ruce & Rukavice'},
  {key:'pants',  label:'Kalhoty'},
  {key:'shoes',  label:'Boty'},
  {key:'decals', label:'Nášivky & Doplňky'}
];

function renderClothing(){
  var sets=DB.get('clothing')||[];
  var el=document.getElementById('clothSets');
  if(!el)return;
  if(!sets.length){el.innerHTML='<div class="empty-s">// Žádné sety</div>';return;}
  el.innerHTML=sets.map(function(s){
    var imgH = s.img ? '<div class="cs-img-wrap"><img src="images/'+esc(s.img)+'" class="cs-img" onerror="this.style.display=\'none\'"></div>' : '<div class="cs-img-wrap cs-img-ph">👕</div>';
    var rows=CLOTH_CATS.map(function(c){
        return '<tr><td class="cs-cat">'+esc(c.label)+'</td><td class="cs-label">Model</td><td class="cs-val">'+(s[c.key+'_m']||0)+'</td><td class="cs-label">Design</td><td class="cs-val">'+(s[c.key+'_d']||0)+'</td></tr>';
    }).join('');
    return '<div class="cloth-set-col"><div class="cs-title">'+esc(s.name)+'</div>'+imgH+'<table class="cs-table">'+rows+'</table></div>';
  }).join('');
}

// ── ADMIN CLOTHING (OPRAVENO) ─────────────────
function previewClothImg(val){
  var el=document.getElementById('cl-img-preview');if(!el)return;
  if(!val||!val.trim()){el.innerHTML='—';return;}
  el.innerHTML = '<img src="images/' + esc(val) + '" style="max-width:100%;max-height:110px;object-fit:contain;" onerror="this.parentElement.innerHTML=\'<span style=\\\'color:var(--red)\\\'>nenalezeno</span>\'"/>';
}

function renderAdminClothing(){
  var sets = DB.get('clothing') || [];
  var el = document.getElementById('aClothCols');
  if(!el) return;
  el.innerHTML = sets.map(function(s){
    var imgH = s.img ? '<div class="cs-img-wrap"><img src="images/'+esc(s.img)+'" class="cs-img" onerror="this.style.display=\'none\'"/></div>' : '<div class="cs-img-wrap cs-img-ph">👕</div>';
    return '<div class="cloth-set-col"><div class="cs-title">'+esc(s.name)+'</div>'+imgH+'<button class="cloth-del-btn" style="width:100%" onclick="delCloth(\''+s.id+'\')">✕ SMAZAT SET</button></div>';
  }).join('');
}

function delCloth(id){
  if(!confirm('Smazat set?')) return;
  DB.set('clothing',(DB.get('clothing')||[]).filter(function(i){return i.id!==id;}));
  renderAdminClothing();
}

// ── LOG & SELECT ─────────────────────────────
function renderLog(){
  var log=DB.get('syslog')||[]; var el=document.getElementById('aLog');
  if(!el) return;
  el.innerHTML=log.map(function(e){
    return '<div class="log-entry"><span class="log-time">'+e.time+'</span> <span class="log-text">'+esc(e.text)+'</span></div>';
  }).join('');
}

function renderMemberSelect(){
  var members=DB.get('members')||[];
  var el=document.getElementById('memberButtons');
  if(el) el.innerHTML=members.map(function(m){
    return '<button class="member-btn" onclick="openLoginModal(\''+m.id+'\')"><div class="mb-hex">'+esc(m.displayName.charAt(0))+'</div><div><span class="mb-name">'+esc(m.displayName)+'</span></div></button>';
  }).join('');
}

// ── FINANCE / SETTINGS (Zbytek tvého kódu) ────
function renderAdminFinance(){ /* Zde doplň své renderovací funkce */ }
function renderSettings(){ /* Zde doplň své renderovací funkce */ }

document.addEventListener('DOMContentLoaded',function(){
  initData(); startClock(); renderMemberSelect();
});
// ── FINANCE ADMIN ────────────────────────────
function toggleAddExpense(){document.getElementById('addExpensePanel').classList.toggle('hidden');}
function addExpense(){
  var name=document.getElementById('exp-name').value.trim();
  var amount=parseInt(document.getElementById('exp-amount').value)||0;
  var type=document.getElementById('exp-type').value;
  var note=document.getElementById('exp-note').value.trim();
  var st=document.getElementById('expStatus');
  if(!name||!amount){st.textContent='// VYPLŇTE POLE';return;}
  var fin=DB.get('finance')||{payments:[],expenses:[]};
  fin.expenses.push({id:uid(),name:name,amount:amount,type:type,note:note});
  DB.set('finance',fin);
  addLog('fin','Admin přidal výdajovou položku: "'+name+'" $'+amount+'.');
  st.textContent='// PŘIDÁNO';setTimeout(function(){st.textContent='';},3000);
  ['exp-name','exp-note'].forEach(function(i){document.getElementById(i).value='';});document.getElementById('exp-amount').value='';
  toast('Položka přidána','success');renderAdminFinance();
}
function delExpense(id){
  if(!confirm('Smazat položku?'))return;
  var fin=DB.get('finance')||{payments:[],expenses:[]};
  fin.expenses=fin.expenses.filter(function(e){return e.id!==id;});DB.set('finance',fin);
  addLog('fin','Admin smazal výdajovou položku.');renderAdminFinance();
}
function renderAdminFinance(){
  var fin=DB.get('finance')||{payments:[],expenses:[]};
  var fs=DB.get('finsettings')||{weeklyFee:5000};
  var members=DB.get('members')||[];
  var wk=getWeekKey();
  var total=fin.payments.reduce(function(s,p){return s+p.amount;},0);
  var totalExp=fin.expenses.reduce(function(s,e){return s+e.amount;},0);
  var el=document.getElementById('financeAdminPanel');
  var summary='<div class="fa-summary">'+
    '<div class="fa-card"><div class="fa-card-title">CELKEM PŘIJATO</div><div class="fa-card-val acc">$'+total+'</div></div>'+
    '<div class="fa-card"><div class="fa-card-title">CELKEM VÝDAJE</div><div class="fa-card-val red">$'+totalExp+'</div></div>'+
    '<div class="fa-card"><div class="fa-card-title">BILANCE</div><div class="fa-card-val '+(total-totalExp>=0?'green':'red')+'">$'+(total-totalExp)+'</div></div>'+
  '</div>';
  var expenses='<div class="fa-expenses"><div class="fa-exp-title">// VÝDAJOVÉ POLOŽKY</div>'+
    (fin.expenses.length?fin.expenses.map(function(e){
      return '<div class="fa-exp-item"><span class="fa-exp-name">'+esc(e.name)+(e.note?' — <em>'+esc(e.note)+'</em>':'')+'</span>'+
        '<div style="display:flex;gap:.5rem;align-items:center;"><span class="fa-exp-amt">$'+e.amount+' '+(e.type==='weekly'?'/ týden':'jednorázově')+'</span>'+
        '<button class="btn-micro del" onclick="delExpense(\''+e.id+'\')">✕</button></div></div>';
    }).join(''):'<div class="empty-s">// Žádné položky</div>')+
  '</div>';
  var payments='<div class="fa-member-payments"><div class="fa-exp-title">// PLATBY ČLENŮ — '+wk+'</div>'+
    members.map(function(m){
      var paid=fin.payments.some(function(p){return p.memberId===m.id&&p.weekKey===wk;});
      return '<div class="fa-pay-row '+(paid?'paid':'unpaid')+'">'+
        '<span class="fa-pay-name">'+esc(m.displayName)+'</span>'+
        '<div style="display:flex;gap:.5rem;align-items:center;">'+
          '<span class="fa-pay-status '+(paid?'paid':'unpaid')+'">'+(paid?'✓ ZAPLACENO':'✗ NEZAPLACENO')+'</span>'+
          (!paid?'<button class="btn-record-pay" onclick="recordPayment(\''+m.id+'\',\''+m.displayName+'\')">EVIDOVAT</button>':'')+
        '</div></div>';
    }).join('')+
  '</div>';
  el.innerHTML=summary+expenses+payments;
}
function recordPayment(memberId,memberName){
  var fs=DB.get('finsettings')||{weeklyFee:5000};
  var fin=DB.get('finance')||{payments:[],expenses:[]};
  var wk=getWeekKey();
  fin.payments.push({id:uid(),memberId:memberId,memberName:memberName,weekKey:wk,amount:fs.weeklyFee,date:nowStr(),note:'Týdenní příspěvek'});
  DB.set('finance',fin);
  addLog('fin','Admin evidoval platbu od "'+memberName+'" — $'+fs.weeklyFee+' ('+wk+').');
  toast('Platba evidována','success');renderAdminFinance();
}

// ── EXCUSES ADMIN ────────────────────────────
function renderAdminExcuses(){
  var excuses=DB.get('excuses')||[];
  var el=document.getElementById('allExcuses');
  if(!excuses.length){el.innerHTML='<div class="empty-s">// Žádné omluvenky</div>';return;}
  el.innerHTML=excuses.slice().reverse().map(function(e){
    return '<div class="excuse-card excuse-'+e.status+'">'+
      '<div class="excuse-head"><span class="excuse-member">'+esc(e.memberName)+' — '+esc(e.event)+'</span>'+
      '<span class="excuse-chip '+e.status+'">'+(e.status==='pending'?'ČEKÁ':e.status==='accepted'?'PŘIJATO':'ZAMÍTNUTO')+'</span></div>'+
      '<div class="excuse-detail">Datum: <strong>'+esc(e.date)+'</strong> — '+esc(e.reason)+'</div>'+
      (e.note?'<div class="excuse-detail" style="color:var(--muted)">'+esc(e.note)+'</div>':'')+
      '<div class="excuse-date-info">Odesláno: '+e.submitted+'</div>'+
      (e.status==='pending'?'<div class="excuse-actions"><button class="btn-acc small" onclick="resolveExcuse(\''+e.id+'\',\'accepted\')">PŘIJMOUT</button><button class="btn-danger" onclick="resolveExcuse(\''+e.id+'\',\'denied\')">ZAMÍTNOUT</button></div>':'')+
    '</div>';
  }).join('');
}
function resolveExcuse(id,decision){
  var excuses=DB.get('excuses')||[];var e=excuses.find(function(x){return x.id===id;});
  if(!e)return;e.status=decision;DB.set('excuses',excuses);
  addLog('sys','Admin '+(decision==='accepted'?'přijal':'zamítl')+' omluvenku od "'+e.memberName+'".');
  toast('Omluvenka '+(decision==='accepted'?'přijata':'zamítnuta'),'success');renderAdminExcuses();
}

// ── REPORTS ADMIN ────────────────────────────
function renderAdminReports(){
  var reports=DB.get('reports')||[];
  var el=document.getElementById('aReports');
  if(!reports.length){el.innerHTML='<div class="empty-s">// Žádná hlášení</div>';return;}
  el.innerHTML=reports.slice().reverse().map(function(r){
    return '<div class="rep-card"><div class="rep-from">// OD: '+esc(r.memberName)+' — '+r.date+'</div><div class="rep-body">'+esc(r.body)+'</div></div>';
  }).join('');
}

// ── RADIO ADMIN ──────────────────────────────
function renderAdminRadio(){
  var radios=DB.get('radios')||{primary:'',secondary:'',action:'',vedeni:''};
  document.getElementById('rPrimary').value=radios.primary||'';
  document.getElementById('rSecondary').value=radios.secondary||'';
  document.getElementById('rAction').value=radios.action||'';
  document.getElementById('rVedeni').value=radios.vedeni||'';
}
function saveRadios(){
  var radios={
    primary:document.getElementById('rPrimary').value.trim(),
    secondary:document.getElementById('rSecondary').value.trim(),
    action:document.getElementById('rAction').value.trim(),
    vedeni:document.getElementById('rVedeni').value.trim()
  };
  DB.set('radios',radios);
  addLog('sys','Admin aktualizoval frekvence vysílaček.');
  setText('radioSaveStatus','// ULOŽENO');setTimeout(function(){setText('radioSaveStatus','');},2000);
  toast('Frekvence uloženy','success');
}

// ── SETTINGS ─────────────────────────────────
function renderSettings(){
  var s=DB.get('settings')||{webhook:'',webhookName:'NEXUS LOG'};
  var fs=DB.get('finsettings')||{weeklyFee:5000,feeDay:0};
  document.getElementById('discordWebhook').value=s.webhook||'';
  document.getElementById('discordName').value=s.webhookName||'NEXUS LOG';
  document.getElementById('weeklyFee').value=fs.weeklyFee||5000;
  document.getElementById('feeDay').value=fs.feeDay||0;
  renderPanicList();
}
function saveWebhook(){
  var s=DB.get('settings')||{};
  s.webhook=document.getElementById('discordWebhook').value.trim();
  s.webhookName=document.getElementById('discordName').value.trim()||'NEXUS LOG';
  DB.set('settings',s);setText('webhookStatus','// ULOŽENO');setTimeout(function(){setText('webhookStatus','');},2000);toast('Webhook uložen','success');
}
function testWebhook(){
  var s=DB.get('settings')||{};
  if(!s.webhook){toast('Zadejte webhook URL','error');return;}
  fetch(s.webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:s.webhookName||'NEXUS LOG',content:'✅ Test z NEXUS portálu — '+nowStr()})})
    .then(function(){toast('Test odeslán','success');}).catch(function(){toast('Chyba odesílání','error');});
}
function saveFinanceSettings(){
  var fs={weeklyFee:parseInt(document.getElementById('weeklyFee').value)||0,feeDay:parseInt(document.getElementById('feeDay').value)||0};
  DB.set('finsettings',fs);setText('feeStatus','// ULOŽENO');setTimeout(function(){setText('feeStatus','');},2000);toast('Nastavení uloženo','success');
}
function renderPanicList(){
  var pList=DB.get('panicList')||[];var members=DB.get('members')||[];
  var el=document.getElementById('panicList');if(!el)return;
  if(!pList.length){el.innerHTML='<div class="empty-s">// Žádní blokovaní členové</div>';return;}
  el.innerHTML=pList.map(function(id){
    var m=members.find(function(x){return x.id===id;});
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:.5rem .8rem;background:var(--card);border-left:3px solid var(--red);margin-bottom:1px;">'+
      '<span style="font-family:Rajdhani,sans-serif;color:var(--textb);">'+(m?m.displayName:id)+' <span style="font-family:\'Share Tech Mono\',monospace;font-size:.6rem;color:var(--red);">PANIC LOCK</span></span>'+
      '<button class="btn-acc small" onclick="liftPanic(\''+id+'\')">ODEMKNOUT</button></div>';
  }).join('');
}

// ── LOG ──────────────────────────────────────
var LOG_LABELS={ev:'VÝDEJ',wh:'SKLAD',task:'ÚKOL',msg:'ZPRÁVA',member:'ČLEN',board:'NÁSTĚNKA',sys:'SYSTÉM',fin:'FINANCE',panic:'PANIC'};
function renderLog(){
  var log=DB.get('syslog')||[];var el=document.getElementById('aLog');
  if(!log.length){el.innerHTML='<div class="empty-s">// Log je prázdný</div>';return;}
  el.innerHTML=log.map(function(e){
    return '<div class="log-entry">'+
      '<span class="log-time">'+e.time+'</span>'+
      '<span class="log-type '+e.type+'">'+(LOG_LABELS[e.type]||e.type)+'</span>'+
      '<span class="log-actor">'+esc(e.actor||'?')+'</span>'+
      '<span class="log-text">'+esc(e.text)+'</span></div>';
  }).join('');
}
function clearLog(){if(!confirm('Vymazat celý log?'))return;DB.set('syslog',[]);renderLog();toast('Log vymazán','info');}

// ── START ────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  initData();startClock();renderMemberSelect();
});
