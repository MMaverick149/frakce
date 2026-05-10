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
}

// ── ADMIN TABS ─────────────────────────────
function aTab(tab, btn) {
    document.querySelectorAll('.at').forEach(function(t) { t.classList.add('hidden'); });
    var el = document.getElementById('as-' + tab);
    if (el) el.classList.remove('hidden');

    document.querySelectorAll('#adminScreen .nb').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    // Spouštění renderů pro jednotlivé sekce
    if (tab === 'members') renderAdminMembers();
    if (tab === 'warehouse') renderAdminWarehouse();
    if (tab === 'clothing') renderAdminClothing();
    if (tab === 'log') renderLog();
}

// ── INIT ─────────────────────────────────────
function initData(){
  if(!DB.get('members'))DB.set('members',generateMembers());
  if(!DB.get('warehouse'))DB.set('warehouse',defaultWarehouse());
  if(!DB.get('clothing'))DB.set('clothing',[]);
  if(!DB.get('syslog'))DB.set('syslog',[]);
}

function generateMembers(){
  var names=['Boss Member','Admin Member'];
  return names.map(function(name,i){
    return {id:'clen'+(i+1),displayName:name,position:'Boss',password:'1234',adminAccess:true,note:'',panic:false};
  });
}

function defaultWarehouse(){
  return [{id:uid(),name:'Příklad Itemu',cat:'ammo',qty:10,min:5,note:'',img:''}];
}

// ── SCREENS & LOGIN ──────────────────────────
function showScreen(id){
  ['selectScreen','memberScreen','adminScreen'].forEach(function(s){
    var e=document.getElementById(s);
    if(e) { e.classList.remove('active'); e.classList.add('hidden'); }
  });
  var t=document.getElementById(id);
  if(t) { t.classList.remove('hidden'); t.classList.add('active'); }
}

function startClock(){
  function tick(){var s=new Date().toLocaleString('cs-CZ',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});setText('mClock',s);}
  tick();setInterval(tick,1000);
}

function openLoginModal(id){
  var m=getMember(id);if(!m)return;
  pendingLoginId=id;
  document.getElementById('loginModalTitle').textContent='// '+m.displayName.toUpperCase();
  document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal(){document.getElementById('loginModal').classList.add('hidden');}

function doMemberLogin(){
  var pass=document.getElementById('memberPassInput').value;
  var m=getMember(pendingLoginId);
  if(!m) return;
  if(pass===m.password){
    currentMemberId=m.id;
    closeLoginModal();
    showScreen('memberScreen');
    mTab('board', document.querySelector('#memberScreen .nb'));
  } else {
    document.getElementById('memberPassErr').textContent='// CHYBNÉ HESLO';
  }
}

function goToAdmin(){
  showScreen('adminScreen');
  aTab('members', document.querySelector('#adminScreen .nb'));
}

function goBack(){
  currentMemberId=null;
  showScreen('selectScreen');
}

// ── MEMBER TABS ──────────────────────────────
function mTab(tab,btn){
  document.querySelectorAll('.mt').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('#memberScreen .nb').forEach(function(b){b.classList.remove('active');});
  var el=document.getElementById('mt-'+tab);if(el)el.classList.add('active');
  if(btn)btn.classList.add('active');
  
  if(tab==='clothing') renderClothing();
}

// ── CLOTHING ─────────────────────────────────
var CLOTH_CATS=[
  {key:'masks',label:'Masky'},{key:'chains',label:'Řetízky'},{key:'jackets',label:'Trika'},
  {key:'under',label:'Vesty'},{key:'pants',label:'Kalhoty'},{key:'shoes',label:'Boty'}
];

function renderClothing(){
  var sets=DB.get('clothing')||[];
  var el=document.getElementById('clothSets');
  if(!el)return;
  if(!sets.length){el.innerHTML='<div class="empty-s">// Žádné sety</div>';return;}
  
  el.innerHTML=sets.map(function(s){
    var imgH = s.img ? '<div class="cs-img-wrap"><img src="images/'+esc(s.img)+'" class="cs-img" onerror="this.style.display=\'none\'"></div>' : '<div class="cs-img-wrap cs-img-ph">👕</div>';
    return '<div class="cloth-set-col"><div class="cs-title">'+esc(s.name)+'</div>'+imgH+'</div>';
  }).join('');
}

// ── ADMIN CLOTHING ───────────────────────────
function previewClothImg(val){
  var el=document.getElementById('cl-img-preview'); if(!el)return;
  if(!val) { el.innerHTML='—'; return; }
  el.innerHTML = '<img src="images/'+esc(val)+'" style="max-height:110px" onerror="this.parentElement.innerHTML=\'<span style=\\\'color:var(--red)\\\'>nenalezeno</span>\'"/>';
}

function renderAdminClothing(){
  var sets=DB.get('clothing')||[];
  var el=document.getElementById('aClothCols');
  if(!el)return;
  el.innerHTML=sets.map(function(s){
    return '<div class="cloth-set-col"><div>'+esc(s.name)+'</div><button class="cloth-del-btn" onclick="delCloth(\''+s.id+'\')">✕ SMAZAT</button></div>';
  }).join('');
}

function delCloth(id){
  if(!confirm('Smazat?')) return;
  var sets=DB.get('clothing')||[];
  DB.set('clothing', sets.filter(function(s){return s.id!==id;}));
  renderAdminClothing();
}

// ── LOG & SELECT ─────────────────────────────
var LOG_LABELS={sys:'SYSTÉM',wh:'SKLAD',fin:'FINANCE'};
function renderLog(){
  var log=DB.get('syslog')||[]; var el=document.getElementById('aLog');
  if(!el)return;
  el.innerHTML=log.map(function(e){
    return '<div class="log-entry">['+e.time+'] '+esc(e.text)+'</div>';
  }).join('');
}

function renderMemberSelect(){
  var members=DB.get('members')||[];
  var el=document.getElementById('memberButtons');
  if(!el)return;
  el.innerHTML=members.map(function(m){
    return '<button class="member-btn" onclick="openLoginModal(\''+m.id+'\')">'+esc(m.displayName)+'</button>';
  }).join('');
}

// ── START ────────────────────────────────────
document.addEventListener('DOMContentLoaded',function(){
  initData(); startClock(); renderMemberSelect();
});