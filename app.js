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

var currentMemberId=null; 
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

// ── ADMIN TABS (DŮLEŽITÉ - CHYBĚLO) ──────────
function aTab(tab, btn) {
    // Schovat všechny sekce v adminu
    document.querySelectorAll('.at').forEach(function(t) { t.classList.add('hidden'); });
    // Aktivovat správnou sekci (předpokládá ID jako 'as-members', 'as-clothing' atd.)
    var el = document.getElementById('as-' + tab);
    if (el) el.classList.remove('hidden');

    // Aktivovat tlačítko
    document.querySelectorAll('#adminScreen .nb').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    // Spustit render vybrané sekce
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

// ── CLOCK ────────────────────────────────────
function startClock(){
  function tick(){var s=new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});setText('mClock',s);}
  tick();setInterval(tick,1000);
}

// ── SCREENS ──────────────────────────────────
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
  var pBtn = document.getElementById('panicBtn');
  if(pBtn) pBtn.classList.add('hidden');
}

function goBackToMember(){
  var m=getMember();
  if(m){
    showScreen('memberScreen');
    mTab('board',document.querySelector('#memberScreen .nb'));
  } else {
    goBack();
  }
}

// ── LOGIN MODALS ─────────────────────────────
function openLoginModal(id){
  var m=getMember(id);if(!m)return;
  pendingLoginId=id;
  document.getElementById('loginModalTitle').textContent='// '+m.displayName.toUpperCase();
  document.getElementById('memberPassInput').value='';
  document.getElementById('memberPassErr').textContent='';
  document.getElementById('loginModal').classList.remove('hidden');
  setTimeout(function(){document.getElementById('memberPassInput').focus();},100);
}
function closeLoginModal(){document.getElementById('loginModal').classList.add('hidden');pendingLoginId=null;}
function doMemberLogin(){
  var pass=document.getElementById('memberPassInput').value;
  var m=getMember(pendingLoginId);
  if(!m){closeLoginModal();return;}
  if(pass!==m.password){document.getElementById('memberPassErr').textContent='// NESPRÁVNÉ HESLO';return;}
  closeLoginModal();
  currentMemberId=m.id;
  addLog('sys','Člen "'+m.displayName+'" se přihlásil.');
  var pBtn = document.getElementById('panicBtn');
  if(pBtn) pBtn.classList.remove('hidden');
  var adminBtn=document.getElementById('adminNavBtn');
  if(adminBtn){adminBtn.classList.toggle('hidden',!m.adminAccess);}
  showScreen('memberScreen');
  mTab('board',document.querySelector('#memberScreen .nb'));
}

function openAdminModal(){
  document.getElementById('adminPassInput').value='';
  document.getElementById('adminPassErr').textContent='';
  document.getElementById('adminModal').classList.remove('hidden');
  setTimeout(function(){document.getElementById('adminPassInput').focus();},100);
}
function closeAdminModal(){document.getElementById('adminModal').classList.add('hidden');}
function doAdminLogin(){
  var pass=document.getElementById('adminPassInput').value;
  if(pass==='nexusadmin2025'){
    closeAdminModal();currentMemberId=null;
    addLog('sys','Superadmin přihlášení.');
    showScreen('adminScreen');
    aTab('members',document.querySelector('#adminScreen .nb'));
  } else {
    document.getElementById('adminPassErr').textContent='// NESPRÁVNÉ HESLO';
  }
}

function goToAdmin(){
  var m=getMember();
  if(!m||!m.adminAccess)return;
  addLog('sys','Člen "'+m.displayName+'" vstoupil do Administrace.');
  showScreen('adminScreen');
  aTab('members',document.querySelector('#adminScreen .nb'));
}

// ── MEMBER TABS ──────────────────────────────
function mTab(tab,btn){
  document.querySelectorAll('.mt').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('#memberScreen .nb').forEach(function(b){b.classList.remove('active');});
  var el=document.getElementById('mt-'+tab);if(el)el.classList.add('active');
  if(btn)btn.classList.add('active');
  var m=getMember();
  if(m){setText('sbName',m.displayName);setText('sbPos',m.position);}
  if(tab==='board')     renderBoard();
  if(tab==='warehouse') renderMemberWarehouse();
  if(tab==='clothing')  renderClothing();
}

// ── CLOTHING ─────────────────────────────────
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
  if(!sets.length){
    el.innerHTML='<div class="empty-s" style="margin:2rem">// Vedení zatím nepřidalo žádné sety oblečení</div>';
    return;
  }
  var cols=sets.map(function(s){
    var imgH = s.img 
      ? '<div class="cs-img-wrap"><img src="images/' + esc(s.img) + '" class="cs-img" onerror="this.style.display=\'none\'"></div>' 
      : '<div class="cs-img-wrap cs-img-ph">👕</div>';
    var rows=CLOTH_CATS.map(function(c){
      var m=s[c.key+'_m']!==undefined?s[c.key+'_m']:0;
      var d=s[c.key+'_d']!==undefined?s[c.key+'_d']:0;
      return '<tr><td class="cs-cat">'+esc(c.label)+'</td>'+
        '<td class="cs-label">Model</td><td class="cs-val">'+m+'</td>'+
        '<td class="cs-label">Design</td><td class="cs-val">'+d+'</td></tr>';
    }).join('');
    return '<div class="cloth-set-col">'+
      '<div class="cs-title">'+esc(s.name)+'</div>'+
      imgH+
      (s.desc?'<div class="cs-desc">'+esc(s.desc)+'</div>':'')+
      '<table class="cs-table">'+rows+'</table>'+
    '</div>';
  }).join('');
  el.innerHTML='<div class="cloth-sets-grid">'+cols+'</div>';
}

// ── CLOTHING ADMIN ───────────────────────────
function previewClothImg(val){
  var el=document.getElementById('cl-img-preview');if(!el)return;
  if(!val||!val.trim()){el.innerHTML='—';return;}
  el.innerHTML = '<img src="images/' + esc(val) + '" style="max-width:100%;max-height:110px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(196,154,20,.3));" onerror="this.parentElement.innerHTML=\'<span style=\\\'color:var(--red);font-family:Share Tech Mono,monospace;font-size:.65rem\\\'>nenalezeno</span>\'"/>';
}

function renderAdminClothing(){
  var sets = DB.get('clothing') || [];
  var el = document.getElementById('aClothCols');
  if(!el) return;
  if(!sets.length){
    el.innerHTML = '<div class="empty-s">// Žádné sety oblečení — přidejte první set</div>';
    return;
  }
  var cols = sets.map(function(s){
    var imgH = s.img
      ? '<div class="cs-img-wrap"><img src="images/'+esc(s.img)+'" class="cs-img" onerror="this.style.display=\'none\'"/></div>'
      : '<div class="cs-img-wrap cs-img-ph">👕</div>';
    var rows = CLOTH_CATS.map(function(c){
      var m = s[c.key+'_m'] !== undefined ? s[c.key+'_m'] : 0;
      var d = s[c.key+'_d'] !== undefined ? s[c.key+'_d'] : 0;
      return '<tr><td class="cs-cat">'+esc(c.label)+'</td><td class="cs-label">Model</td><td class="cs-val">'+m+'</td><td class="cs-label">Design</td><td class="cs-val">'+d+'</td></tr>';
    }).join('');
    return '<div class="cloth-set-col"><div class="cs-title">'+esc(s.name)+'</div>'+imgH+(s.desc ? '<div class="cs-desc">'+esc(s.desc)+'</div>' : '')+'<table class="cs-table">'+rows+'</table><button class="cloth-del-btn" style="margin-top:.5rem;width:100%;" onclick="delCloth(\''+s.id+'\')">✕ SMAZAT SET</button></div>';
  }).join('');
  el.innerHTML = '<div class="cloth-sets-grid">'+cols+'</div>';
}

function delCloth(id){
  if(!confirm('Smazat set oblečení?'))return;
  DB.set('clothing',(DB.get('clothing')||[]).filter(function(i){return i.id!==id;}));
  renderAdminClothing();
  renderClothing();
  addLog('wh','Admin smazal outfit set.');
  toast('Set smazán','info');
}

// ── OSTATNÍ FUNKCE PRO ADMINA (DOPLNĚNÍ) ──────
function renderLog(){
  var log=DB.get('syslog')||[];var el=document.getElementById('aLog');
  if(!el) return;
  if(!log.length){el.innerHTML='<div class="empty-s">// Log je prázdný</div>';return;}
  el.innerHTML=log.map(function(e){
    return '<div class="log-entry"><span class="log-time">'+e.time+'</span> <span class="log-type '+e.type+'">'+e.type.toUpperCase()+'</span> <span class="log-actor">'+esc(e.actor)+'</span> <span class="log-text">'+esc(e.text)+'</span></div>';
  }).join('');
}

function renderMemberSelect(){
  var members=DB.get('members')||[];
  var el=document.getElementById('memberButtons');
  if(!el) return;
  var visible=members.filter(function(m){return !m.panic;});
  el.innerHTML=visible.map(function(m){
    return '<button class="member-btn" onclick="openLoginModal(\''+m.id+'\')"><div class="mb-hex">'+esc(m.displayName.charAt(0))+'</div><div><span class="mb-name">'+esc(m.displayName)+'</span></div></button>';
  }).join('');
}

// ── START ────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  initData();startClock();renderMemberSelect();
});