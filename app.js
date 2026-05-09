var DB={
  get:function(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set:function(k,v){localStorage.setItem(k,JSON.stringify(v));}
};

var POSITIONS=['Boss','Right hand','Counselor',"Devil's Advocate",'Chief of Arms','Advisor','Intelligence Chief','Keeper of secrets','Member'];
var VEDENI_POS=['Boss','Right hand','Counselor',"Devil's Advocate"];
var CAT={weapons:'ZBRANĚ',ammo:'MUNICE',equipment:'VYBAVENÍ',other:'OSTATNÍ'};
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
    {id:uid(),name:'Žlutá Tráva',cat:'other',qty:0,min:0,note:'Speciální item',img:'zlutatrava.png'}
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
    var e=document.getElementById(s);e.classList.remove('active');e.classList.add('hidden');
  });
  var t=document.getElementById(id);t.classList.remove('hidden');t.classList.add('active');
}

function goBack(){
  currentMemberId=null;pendingLoginId=null;
  renderMemberSelect();showScreen('selectScreen');
  document.getElementById('panicBtn').classList.add('hidden');
}

function goBackToMember(){
  // From admin back to member screen (if logged in as member with admin access)
  var m=getMember();
  if(m){
    showScreen('memberScreen');
    mTab('board',document.querySelector('#memberScreen .nb'));
  } else {
    goBack();
  }
}

// ── PANIC ────────────────────────────────────
function triggerPanic(){
  var m=getMember();if(!m)return;
  if(!confirm('Aktivovat PANIC? Váš přístup bude zablokován. Přístup bude muset povolit pouze Vedení !'))return;
  var members=DB.get('members')||[];
  var mem=members.find(function(x){return x.id===currentMemberId;});
  if(mem){mem.panic=true;DB.set('members',members);}
  var pList=DB.get('panicList')||[];
  if(pList.indexOf(currentMemberId)===-1)pList.push(currentMemberId);
  DB.set('panicList',pList);
  addLog('panic','Člen "'+m.displayName+'" aktivoval PANIC.');
  currentMemberId=null;
  document.getElementById('panicBtn').classList.add('hidden');
  document.getElementById('panicOverlay').classList.remove('hidden');
}

// ── SELECT SCREEN ────────────────────────────
function renderMemberSelect(){
  var members=DB.get('members')||[];
  var el=document.getElementById('memberButtons');
  var visible=members.filter(function(m){return !m.panic;});
  if(!visible.length){el.innerHTML='<div class="no-members">// Žádní členové</div>';return;}
  el.innerHTML=visible.map(function(m){
    var vedeni=isVedeni(m.position);
    return '<button class="member-btn" onclick="openLoginModal(\''+m.id+'\')">'+
      '<div class="mb-hex">'+esc(m.displayName.charAt(0).toUpperCase())+'</div>'+
      '<div><span class="mb-name">'+esc(m.displayName)+'</span>'+
      '<span class="mb-pos '+(vedeni?'vedeni':'other')+'">'+esc(m.position)+'</span></div></button>';
  }).join('');
}

function filterMembers(q){
  var members=DB.get('members')||[];
  var el=document.getElementById('memberButtons');
  var filtered=members.filter(function(m){return !m.panic&&m.displayName.toLowerCase().indexOf(q.toLowerCase())!==-1;});
  if(!filtered.length){el.innerHTML='<div class="no-members">// Nenalezeno</div>';return;}
  el.innerHTML=filtered.map(function(m){
    var vedeni=isVedeni(m.position);
    return '<button class="member-btn" onclick="openLoginModal(\''+m.id+'\')">'+
      '<div class="mb-hex">'+esc(m.displayName.charAt(0).toUpperCase())+'</div>'+
      '<div><span class="mb-name">'+esc(m.displayName)+'</span>'+
      '<span class="mb-pos '+(vedeni?'vedeni':'other')+'">'+esc(m.position)+'</span></div></button>';
  }).join('');
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
  document.getElementById('panicBtn').classList.remove('hidden');
  // Show/hide admin tab based on fresh DB read
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

// ════════════════════════════════
//  MEMBER TABS
// ════════════════════════════════
function mTab(tab,btn){
  document.querySelectorAll('.mt').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('#memberScreen .nb').forEach(function(b){b.classList.remove('active');});
  var el=document.getElementById('mt-'+tab);if(el)el.classList.add('active');
  if(btn)btn.classList.add('active');
  var m=getMember();
  if(m){setText('sbName',m.displayName);setText('sbPos',m.position);}
  if(tab==='board')     renderBoard();
  if(tab==='tasks')     renderMemberTasks();
  if(tab==='messages')  renderMemberMessages();
  if(tab==='warehouse') renderMemberWarehouse();
  if(tab==='clothing')  renderClothing();
  if(tab==='finance')   renderMyFinance();
  if(tab==='excuse')    renderMyExcuses();
  if(tab==='report')    renderSentReports();
  if(tab==='radio')     renderRadio();
  if(tab==='contacts')  renderContacts();
  updateBadges();
}

function updateBadges(){
  var m=getMember();if(!m)return;
  var tasks=DB.get('tasks')||{};
  var myTasks=(tasks[m.id]||[]).filter(function(t){return !t.done;});
  var tb=document.getElementById('taskBadge');
  if(tb){if(myTasks.length){tb.textContent=myTasks.length;tb.classList.add('visible');}else tb.classList.remove('visible');}
  var msgs=DB.get('messages')||{};
  var myMsgs=msgs[m.id]||[];
  var mb=document.getElementById('msgBadge');
  if(mb){if(myMsgs.length){mb.textContent=myMsgs.length;mb.classList.add('visible');}else mb.classList.remove('visible');}
  var fs=DB.get('finsettings')||{weeklyFee:0};
  if(fs.weeklyFee>0){
    var wk=getWeekKey();
    var payments=((DB.get('finance')||{}).payments||[]);
    var paid=payments.some(function(p){return p.memberId===m.id&&p.weekKey===wk;});
    var fb=document.getElementById('financeBadge');
    if(fb){if(!paid){fb.textContent='!';fb.classList.add('visible');}else fb.classList.remove('visible');}
  }
}

// ── BOARD ────────────────────────────────────
function renderBoard(){
  var posts=DB.get('board')||[];
  var confirmed=DB.get('boardConfirmed')||{};
  var m=getMember();
  var el=document.getElementById('boardPosts');
  if(!posts.length){el.innerHTML='<div class="empty-s">// Nástěnka je prázdná</div>';return;}
  el.innerHTML=posts.slice().reverse().map(function(p){
    var myConf=confirmed[p.id]&&confirmed[p.id].indexOf(m.id)!==-1;
    var confCount=(confirmed[p.id]||[]).length;
    var needsConfirm=(p.type==='confirm');
    return '<div class="board-post '+p.type+'">'+
      '<div class="bp-header"><div class="bp-title">'+esc(p.title)+'</div>'+
      '<span class="bp-type '+p.type+'">'+{info:'INFO',warning:'VAROVÁNÍ',urgent:'URGENTNÍ',confirm:'POTVRDIT'}[p.type]+'</span></div>'+
      '<div class="bp-body">'+esc(p.body)+'</div>'+
      '<div class="bp-footer"><span class="bp-date">'+p.date+' — '+esc(p.author)+'</span>'+
      '<div class="bp-reactions">'+
        (needsConfirm?'<span class="bp-confirm-count">✓ '+confCount+'</span>'+
          '<button class="bp-confirm-btn'+(myConf?' done':'')+'" onclick="confirmPost(\''+p.id+'\')"'+(myConf?' disabled':'')+'>'+
          (myConf?'✓ Přečteno':'✓ Potvrdit přečtení')+'</button>':'')+
      '</div></div></div>';
  }).join('');
}

function confirmPost(postId){
  var m=getMember();if(!m)return;
  var confirmed=DB.get('boardConfirmed')||{};
  if(!confirmed[postId])confirmed[postId]=[];
  if(confirmed[postId].indexOf(m.id)===-1){
    confirmed[postId].push(m.id);
    DB.set('boardConfirmed',confirmed);
    addLog('board','Člen "'+m.displayName+'" potvrdil přečtení příspěvku.');
    renderBoard();toast('Přečtení potvrzeno ✓','success');
  }
}

// ── TASKS ────────────────────────────────────
function switchTaskTab(which,btn){
  document.querySelectorAll('.ttab').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');
  document.getElementById('mTaskActive').classList.toggle('hidden',which!=='active');
  document.getElementById('mTaskArchive').classList.toggle('hidden',which!=='archive');
}
function renderMemberTasks(){
  var m=getMember();
  var tasks=DB.get('tasks')||{};
  var all=tasks[m.id]||[];
  var active=all.filter(function(t){return !t.done;});
  var archived=all.filter(function(t){return t.done;});
  var elA=document.getElementById('mTaskActive');
  var elAr=document.getElementById('mTaskArchive');
  elA.innerHTML=active.length?active.map(function(t,i){
    return '<div class="task-card '+t.priority+'">'+
      '<div class="task-top"><span class="task-name">'+esc(t.title)+'</span><span class="pchip '+t.priority+'">'+PRIO[t.priority]+'</span></div>'+
      '<div class="task-desc">'+esc(t.desc)+'</div>'+
      '<div class="task-meta"><span class="task-date">'+t.date+'</span>'+
      '<div class="task-resolve"><select id="tres-'+i+'"><option value="splneno">Splněno</option><option value="casti">Částečně</option><option value="nesplneno">Nesplněno</option></select>'+
      '<button class="btn-done" onclick="completeTask('+i+')">ARCHIVOVAT</button></div></div></div>';
  }).join(''):'<div class="empty-s">// Žádné aktivní úkoly</div>';
  elAr.innerHTML=archived.length?archived.map(function(t){
    return '<div class="task-card archived">'+
      '<div class="task-top"><span class="task-name">'+esc(t.title)+'</span><span class="pchip '+t.priority+'">'+PRIO[t.priority]+'</span></div>'+
      '<div class="task-desc">'+esc(t.desc)+'</div>'+
      '<div class="task-meta"><span class="task-date">Zadáno: '+t.date+(t.resolvedDate?' | Vyřešeno: '+t.resolvedDate:'')+'</span>'+
      (t.resolution?'<span class="arch-result '+t.resolution+'">'+{splneno:'✓ SPLNĚNO',casti:'~ ČÁSTEČNĚ',nesplneno:'✗ NESPLNĚNO'}[t.resolution]+'</span>':'')+
      '</div></div>';
  }).join(''):'<div class="empty-s">// Archiv je prázdný</div>';
}
function completeTask(idx){
  var m=getMember();var tasks=DB.get('tasks')||{};var all=tasks[m.id]||[];
  var active=all.filter(function(t){return !t.done;});var t=active[idx];if(!t)return;
  var sel=document.getElementById('tres-'+idx);var res=sel?sel.value:'splneno';
  var ri=all.indexOf(t);all[ri].done=true;all[ri].resolution=res;all[ri].resolvedDate=nowStr();
  DB.set('tasks',tasks);
  addLog('task','Člen "'+m.displayName+'" archivoval úkol "'+t.title+'" — '+res+'.');
  toast('Úkol archivován','success');renderMemberTasks();updateBadges();
}

// ── MESSAGES ─────────────────────────────────
function renderMemberMessages(){
  var m=getMember();var msgs=DB.get('messages')||{};var myMsgs=msgs[m.id]||[];
  var el=document.getElementById('mMsgList');
  if(!myMsgs.length){el.innerHTML='<div class="empty-s">// Žádné zprávy</div>';return;}
  el.innerHTML=myMsgs.slice().reverse().map(function(msg){
    return '<div class="msg-card"><div class="msg-subject">'+esc(msg.subject)+'</div><div class="msg-body">'+esc(msg.body)+'</div><div class="msg-from">// OD: VEDENÍ — '+msg.date+'</div></div>';
  }).join('');
}

// ── WAREHOUSE ────────────────────────────────
var mWhCat='all';
function mWhFilter(cat,btn){
  mWhCat=cat;document.querySelectorAll('#mt-warehouse .wf').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderMemberWarehouse();
}
function renderMemberWarehouse(){
  var items=DB.get('warehouse')||[];
  var filtered=mWhCat==='all'?items:items.filter(function(i){return i.cat===mWhCat;});
  var el=document.getElementById('mWhGrid');
  if(!filtered.length){el.innerHTML='<div class="empty-s" style="grid-column:1/-1">// Žádné položky</div>';return;}
  el.innerHTML=filtered.map(function(item){
    var qc=item.qty===0?'empty':(item.min>0&&item.qty<=item.min?'low':'');
    var imgH=item.img?'<div class="wh-img"><img src="images/'+esc(item.img)+'" onerror="this.parentElement.innerHTML=\'<span class=wh-icon>?</span>\'"/></div>':'<div class="wh-img"><span class="wh-icon">?</span></div>';
    return '<div class="wh-item">'+imgH+
      '<div class="wh-cat">'+(CAT[item.cat]||item.cat)+'</div>'+
      '<div class="wh-name">'+esc(item.name)+'</div>'+
      (item.note?'<div class="wh-note-text">'+esc(item.note)+'</div>':'')+
      '<div class="wh-qty-row"><span class="wh-qty '+qc+'">'+item.qty+'</span><span class="wh-unit"> KS</span></div>'+
      (item.qty===0?'<div class="wh-alert critical">NENÍ VE SKLADU</div>':'')+
      (item.min>0&&item.qty>0&&item.qty<=item.min?'<div class="wh-alert">NÍZKÁ ZÁSOBA</div>':'')+
      '<div class="wh-pickup"><input class="wh-ev-input" type="text" placeholder="Vaše jméno..." id="pn-'+item.id+'"/>'+
      '<div class="wh-pickup-row"><input class="wh-ev-input small" type="number" value="1" min="1" max="'+item.qty+'" id="pa-'+item.id+'"/>'+
      '<button class="btn-pickup'+(item.qty===0?' btn-pickup-disabled':'')+'" onclick="pickupItem(\''+item.id+'\')"'+(item.qty===0?' disabled':'')+'>⬇ VYZVEDL</button>'+
      '</div></div></div>';
  }).join('');
}
function pickupItem(itemId){
  var m=getMember();
  var nameEl=document.getElementById('pn-'+itemId);var amtEl=document.getElementById('pa-'+itemId);
  var jmeno=nameEl?nameEl.value.trim():'';var amt=parseInt(amtEl?amtEl.value:1)||1;
  if(!jmeno){nameEl.style.borderColor='var(--red)';nameEl.placeholder='Zadejte jméno!';setTimeout(function(){nameEl.style.borderColor='';nameEl.placeholder='Vaše jméno...';},2000);return;}
  var items=DB.get('warehouse')||[];var item=items.find(function(i){return i.id===itemId;});
  if(!item)return;
  if(amt>item.qty){amtEl.style.borderColor='var(--red)';setTimeout(function(){amtEl.style.borderColor='';},2000);toast('Nedostatek zásoby!','error');return;}
  var before=item.qty;item.qty=Math.max(0,item.qty-amt);DB.set('warehouse',items);
  addLog('ev','VÝDEJ: "'+jmeno+'" vyzvedl '+amt+'x "'+item.name+'" — zásoba: '+before+' → '+item.qty+' ks. Člen: '+m.displayName+'.');
  nameEl.value='';amtEl.value='1';toast(amt+'x '+item.name+' vydáno ✓','success');renderMemberWarehouse();
}

// ── CLOTHING ─────────────────────────────────
var mClothCatFilter='all';
function filterCloth(cat,btn){
  mClothCatFilter=cat;
  document.querySelectorAll('#mt-clothing .wf').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');renderClothing();
}
function renderClothing(){
  var items=DB.get('clothing')||[];
  var filtered=mClothCatFilter==='all'?items:items.filter(function(i){return i.cat===mClothCatFilter;});
  var el=document.getElementById('clothColumns');
  if(!filtered.length){el.innerHTML='<div class="empty-s">// Žádné položky oblečení</div>';return;}
  el.innerHTML=filtered.map(function(item){
    var imgH=item.img?'<img src="images/'+esc(item.img)+'" class="cl-col-img" onerror="this.style.display=\'none\'">':'<div class="cl-col-img-ph">👕</div>';
    var rows=(item.rows||[]).map(function(r){
      return '<tr><td class="cl-row-cat">'+esc(r.cat||'')+'</td><td class="cl-row-val">'+esc(r.val||'')+'</td></tr>';
    }).join('');
    return '<div class="cl-col">'+
      '<div class="cl-col-title">'+esc(item.name)+'</div>'+
      '<div class="cl-col-img-wrap">'+imgH+'</div>'+
      '<div class="cl-col-desc">'+esc(item.desc||'')+'</div>'+
      '<table class="cl-col-table">'+
        '<tr><td class="cl-row-cat cl-row-head">'+esc(item.catLabel||CLOTH_CAT[item.cat]||item.cat)+'</td><td class="cl-row-val cl-row-head">'+esc(item.code||'KÓD')+'</td></tr>'+
        rows+
      '</table></div>';
  }).join('');
}

// ── FINANCE ──────────────────────────────────
function renderMyFinance(){
  var m=getMember();
  var fin=DB.get('finance')||{payments:[],expenses:[]};
  var fs=DB.get('finsettings')||{weeklyFee:5000};
  var wk=getWeekKey();
  var paid=fin.payments.some(function(p){return p.memberId===m.id&&p.weekKey===wk;});
  var myPayments=fin.payments.filter(function(p){return p.memberId===m.id;});
  var el=document.getElementById('myFinance');
  var expHtml=fin.expenses.length?fin.expenses.map(function(e){
    return '<div class="fa-exp-item"><span class="fa-exp-name">'+esc(e.name)+(e.note?' — <em>'+esc(e.note)+'</em>':'')+'</span><span class="fa-exp-amt">$'+e.amount+' '+(e.type==='weekly'?'/ týden':'jednorázově')+'</span></div>';
  }).join(''):'<div class="empty-s">// Vedení zatím nepřidalo žádné položky</div>';
  el.innerHTML=
    '<div class="fin-status-bar">'+
      '<div class="fin-status-title">MŮJ STAV TOHOTO TÝDNE ('+wk+')</div>'+
      '<div class="fin-owe '+(paid?'ok':'due')+'">'+(paid?'✓ ZAPLACENO':'✗ NEZAPLACENO')+'</div>'+
      '<div class="fin-owe-sub">'+(paid?'Příspěvek tohoto týdne byl evidován vedením.':'Příspěvek '+fs.weeklyFee+' $ ještě nebyl evidován — kontaktujte vedení.')+'</div>'+
    '</div>'+
    '<div class="sh">// VÝDAJE FRAKCE (vidí všichni)</div>'+
    '<div style="margin:.5rem 1.2rem 1rem;">'+expHtml+'</div>'+
    '<div class="sh">// MOJE PLATBY</div>'+
    '<div class="fin-history" style="margin:.5rem 1.2rem 1rem;">'+
      (myPayments.length?myPayments.slice().reverse().map(function(p){
        return '<div class="fin-entry"><div class="fin-entry-info"><span class="fin-entry-date">'+p.date+'</span>'+esc(p.note||'Týdenní příspěvek')+'</div><div class="fin-entry-amt">$'+p.amount+'</div></div>';
      }).join(''):'<div class="empty-s">// Žádné evidované platby</div>')+
    '</div>';
}

// ── EXCUSES ──────────────────────────────────
function submitExcuse(){
  var m=getMember();
  var date=document.getElementById('excDate').value;
  var event=document.getElementById('excEvent').value.trim();
  var reason=document.getElementById('excReason').value.trim();
  var note=document.getElementById('excNote').value.trim();
  var st=document.getElementById('excStatus');
  if(!date||!event||!reason){st.textContent='// VYPLŇTE POVINNÁ POLE';return;}
  var excuses=DB.get('excuses')||[];
  excuses.push({id:uid(),memberId:m.id,memberName:m.displayName,date:date,event:event,reason:reason,note:note,status:'pending',submitted:nowStr()});
  DB.set('excuses',excuses);
  addLog('sys','Člen "'+m.displayName+'" odeslal omluvenku na '+date+'.');
  st.textContent='// ODESLÁNO';setTimeout(function(){st.textContent='';},3000);
  ['excDate','excEvent','excReason','excNote'].forEach(function(id){document.getElementById(id).value='';});
  toast('Omluvenka odeslána','success');renderMyExcuses();
}
function renderMyExcuses(){
  var m=getMember();var excuses=DB.get('excuses')||[];
  var mine=excuses.filter(function(e){return e.memberId===m.id;});
  var el=document.getElementById('myExcuses');
  if(!mine.length){el.innerHTML='<div class="empty-s">// Žádné omluvenky</div>';return;}
  el.innerHTML=mine.slice().reverse().map(function(e){
    return '<div class="excuse-card excuse-'+e.status+'">'+
      '<div class="excuse-head"><span class="excuse-member">'+esc(e.event)+'</span>'+
      '<span class="excuse-chip '+e.status+'">'+(e.status==='pending'?'ČEKÁ':e.status==='accepted'?'PŘIJATO':'ZAMÍTNUTO')+'</span></div>'+
      '<div class="excuse-detail">Datum: <strong>'+esc(e.date)+'</strong> — '+esc(e.reason)+'</div>'+
      (e.note?'<div class="excuse-detail" style="color:var(--muted)">'+esc(e.note)+'</div>':'')+
      '<div class="excuse-date-info">Odesláno: '+e.submitted+'</div></div>';
  }).join('');
}

// ── REPORT ───────────────────────────────────
function submitReport(){
  var m=getMember();var text=document.getElementById('reportText').value.trim();var st=document.getElementById('reportStatus');
  if(!text){st.textContent='// PRÁZDNÁ ZPRÁVA';return;}
  var reports=DB.get('reports')||[];
  reports.push({memberId:m.id,memberName:m.displayName,body:text,date:nowStr()});
  DB.set('reports',reports);
  addLog('sys','Člen "'+m.displayName+'" odeslal hlášení.');
  document.getElementById('reportText').value='';
  st.textContent='// ODESLÁNO';setTimeout(function(){st.textContent='';},3000);
  toast('Hlášení odesláno','success');renderSentReports();
}
function renderSentReports(){
  var m=getMember();var reports=DB.get('reports')||[];
  var mine=reports.filter(function(r){return r.memberId===m.id;});
  var el=document.getElementById('mSentReports');
  if(!mine.length){el.innerHTML='<div class="empty-s">// Žádné odeslané zprávy</div>';return;}
  el.innerHTML=mine.slice().reverse().map(function(r){
    return '<div class="sent-entry"><span class="sent-date">'+r.date+'</span>'+esc(r.body)+'</div>';
  }).join('');
}

// ── RADIO ────────────────────────────────────
function renderRadio(){
  var radios=DB.get('radios')||{primary:'',secondary:'',action:'',vedeni:''};
  var el=document.getElementById('radioDisplay');
  el.innerHTML=
    '<div class="radio-grid">'+
      radioCard('PRIMÁRNÍ','primary',radios.primary,'#4a9','Hlavní komunikační kanál')+
      radioCard('SEKUNDÁRNÍ','secondary',radios.secondary,'#99a','Záložní kanál')+
      radioCard('AKCE','action',radios.action,'#d4a017','Operační kanál')+
      radioCard('VEDENÍ','vedeni',radios.vedeni,'#c0392b','Interní kanál vedení (VSTUP POUZE NA POVOLENÍ VEDENÍ!)')+
    '</div>';
}
function radioCard(label,key,freq,color,desc){
  return '<div class="radio-card" style="border-left-color:'+color+'">'+
    '<div class="radio-label">'+label+'</div>'+
    '<div class="radio-freq" style="color:'+color+'">'+(freq||'— nezadáno —')+'</div>'+
    '<div class="radio-desc">'+desc+'</div>'+
    '</div>';
}

// ── CONTACTS ─────────────────────────────────
function renderContacts(){
  var m=getMember();
  var allContacts=DB.get('contacts')||{};
  var myContacts=allContacts[m.id]||[];
  var el=document.getElementById('contactsList');
  el.innerHTML=myContacts.length?myContacts.map(function(c,i){
    return '<div class="contact-card">'+
      '<div class="contact-info">'+
        '<span class="contact-nick">'+esc(c.nick)+'</span>'+
        '<span class="contact-name">'+esc(c.firstName)+' '+esc(c.lastName)+'</span>'+
        '<span class="contact-phone">📞 '+esc(c.phone)+'</span>'+
      '</div>'+
      '<button class="btn-micro del" onclick="deleteContact('+i+')">✕</button>'+
    '</div>';
  }).join(''):'<div class="empty-s">// Žádné kontakty</div>';
}
function addContact(){
  var m=getMember();
  var nick=document.getElementById('cNick').value.trim();
  var firstName=document.getElementById('cFirst').value.trim();
  var lastName=document.getElementById('cLast').value.trim();
  var phone=document.getElementById('cPhone').value.trim();
  var st=document.getElementById('contactStatus');
  if(!nick||!phone){st.textContent='// ZADEJTE ALESPOŇ PŘEZDÍVKU A TELEFON';return;}
  var allContacts=DB.get('contacts')||{};
  if(!allContacts[m.id])allContacts[m.id]=[];
  allContacts[m.id].push({nick:nick,firstName:firstName,lastName:lastName,phone:phone});
  DB.set('contacts',allContacts);
  ['cNick','cFirst','cLast','cPhone'].forEach(function(id){document.getElementById(id).value='';});
  st.textContent='// KONTAKT PŘIDÁN';setTimeout(function(){st.textContent='';},2000);
  renderContacts();
}
function deleteContact(idx){
  var m=getMember();var allContacts=DB.get('contacts')||{};
  if(!allContacts[m.id])return;
  allContacts[m.id].splice(idx,1);DB.set('contacts',allContacts);renderContacts();
}

// ════════════════════════════════
//  ADMIN TABS
// ════════════════════════════════
function aTab(tab,btn){
  document.querySelectorAll('.at').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('#adminScreen .nb').forEach(function(b){b.classList.remove('active');});
  var el=document.getElementById('at-'+tab);if(el)el.classList.add('active');
  if(btn)btn.classList.add('active');
  if(tab==='members')  renderAdminMembers();
  if(tab==='board')    renderAdminBoard();
  if(tab==='tasks')    fillMemberSelects();
  if(tab==='messages') fillMemberSelects();
  if(tab==='warehouse')renderAdminWarehouse();
  if(tab==='clothing') renderAdminClothing();
  if(tab==='finance')  renderAdminFinance();
  if(tab==='excuses')  renderAdminExcuses();
  if(tab==='reports')  renderAdminReports();
  if(tab==='radio')    renderAdminRadio();
  if(tab==='settings') renderSettings();
  if(tab==='log')      renderLog();
}

// ── MEMBERS ──────────────────────────────────
function toggleNewMember(){document.getElementById('newMemberPanel').classList.toggle('hidden');}
function createMember(){
  var id=document.getElementById('nm-id').value.trim();
  var name=document.getElementById('nm-name').value.trim();
  var pass=document.getElementById('nm-pass').value.trim();
  var pos=document.getElementById('nm-pos').value;
  var admin=document.getElementById('nm-admin').checked;
  var note=document.getElementById('nm-note').value.trim();
  var st=document.getElementById('createStatus');
  if(!id||!name||!pass){st.textContent='// VYPLŇTE POVINNÁ POLE';return;}
  var members=DB.get('members')||[];
  if(members.find(function(m){return m.id===id;})){st.textContent='// ID JIŽ EXISTUJE';return;}
  members.push({id:id,displayName:name,position:pos,password:pass,adminAccess:admin,note:note,panic:false});
  DB.set('members',members);
  addLog('member','Admin přidal člena "'+name+'" ('+pos+', admin: '+(admin?'ano':'ne')+').');
  st.textContent='// "'+name+'" REGISTROVÁN';setTimeout(function(){st.textContent='';},3000);
  ['nm-id','nm-name','nm-note'].forEach(function(i){document.getElementById(i).value='';});
  document.getElementById('nm-pass').value='';document.getElementById('nm-admin').checked=false;
  renderAdminMembers();renderMemberSelect();toast('Člen registrován','success');
}
function renderAdminMembers(){
  var members=DB.get('members')||[];
  var el=document.getElementById('memberGrid');
  if(!members.length){el.innerHTML='<div class="empty-s">// Žádní členové</div>';return;}
  el.innerHTML=members.map(function(m){
    return '<div class="member-card">'+
      '<div class="mc-head"><div><div class="mc-name">'+esc(m.displayName)+'</div><div class="mc-id">ID: '+m.id+' | HESLO: '+esc(m.password)+'</div></div>'+
      '<span class="mc-pos '+(isVedeni(m.position)?'vedeni':'other')+'">'+esc(m.position)+'</span></div>'+
      (m.note?'<div class="mc-note">'+esc(m.note)+'</div>':'')+
      '<div class="mc-actions">'+
        '<button class="btn-micro" onclick="editMemberPos(\''+m.id+'\')">POZICE</button>'+
        '<button class="btn-micro" onclick="editMemberPass(\''+m.id+'\')">HESLO</button>'+
        '<button class="btn-micro" onclick="editMemberNote(\''+m.id+'\')">POZNÁMKA</button>'+
        '<button class="btn-micro '+(m.adminAccess?'active-admin':'')+'" onclick="toggleMemberAdmin(\''+m.id+'\')">'+(m.adminAccess?'✓ ADMIN':'ADMIN')+'</button>'+
        '<button class="mc-panic'+(m.panic?' active-panic':'')+'" onclick="'+(m.panic?'liftPanic':'setPanic')+'(\''+m.id+'\')">'+(m.panic?'🔓 ODEMKNOUT':'🔒 PANIC')+'</button>'+
        '<button class="btn-danger" onclick="deleteMember(\''+m.id+'\')">SMAZAT</button>'+
      '</div></div>';
  }).join('');
}
function editMemberPos(id){
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  var r=prompt('Pozice ('+POSITIONS.join(', ')+'):',m.position);
  if(r!==null&&POSITIONS.indexOf(r)!==-1){m.position=r;DB.set('members',members);addLog('member','Admin změnil pozici "'+m.displayName+'" na "'+r+'".');renderAdminMembers();renderMemberSelect();}
  else if(r!==null)alert('Neplatná pozice: '+POSITIONS.join(', '));
}
function editMemberPass(id){
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  var r=prompt('Nové heslo:',m.password);
  if(r!==null&&r.trim()){m.password=r.trim();DB.set('members',members);addLog('member','Admin změnil heslo člena "'+m.displayName+'".');renderAdminMembers();toast('Heslo změněno','success');}
}
function editMemberNote(id){
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  var r=prompt('Poznámka:',m.note||'');
  if(r!==null){m.note=r;DB.set('members',members);renderAdminMembers();}
}
function toggleMemberAdmin(id){
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  m.adminAccess=!m.adminAccess;DB.set('members',members);
  addLog('member','Admin '+(m.adminAccess?'povolil':'odebral')+' admin přístup členu "'+m.displayName+'".');
  renderAdminMembers();toast((m.adminAccess?'Admin přístup povolen':'Admin přístup odebrán')+' pro '+m.displayName,'success');
}
function setPanic(id){
  if(!confirm('Aktivovat PANIC pro tohoto člena?'))return;
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  m.panic=true;DB.set('members',members);
  var pList=DB.get('panicList')||[];if(pList.indexOf(id)===-1)pList.push(id);DB.set('panicList',pList);
  addLog('panic','Admin aktivoval PANIC pro "'+m.displayName+'".');
  renderAdminMembers();renderMemberSelect();toast('PANIC aktivován','error');
}
function liftPanic(id){
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  m.panic=false;DB.set('members',members);
  var pList=(DB.get('panicList')||[]).filter(function(x){return x!==id;});DB.set('panicList',pList);
  addLog('panic','Admin zrušil PANIC pro "'+m.displayName+'".');
  renderAdminMembers();renderMemberSelect();toast('PANIC zrušen','success');
}
function deleteMember(id){
  if(!confirm('Smazat člena?'))return;
  var members=DB.get('members')||[];var m=members.find(function(x){return x.id===id;});
  DB.set('members',members.filter(function(x){return x.id!==id;}));
  addLog('member','Admin smazal člena "'+(m?m.displayName:id)+'".');
  renderAdminMembers();renderMemberSelect();toast('Člen smazán','info');
}

// ── BOARD ADMIN ──────────────────────────────
function postBoard(){
  var title=document.getElementById('boardTitle').value.trim();
  var body=document.getElementById('boardBody').value.trim();
  var type=document.getElementById('boardType').value;
  var st=document.getElementById('boardStatus');
  if(!title||!body){st.textContent='// VYPLŇTE POLE';return;}
  var m=getMember();var who=m?m.displayName:'Vedení';
  var posts=DB.get('board')||[];
  posts.push({id:uid(),title:title,body:body,type:type,author:who,date:nowStr()});
  DB.set('board',posts);
  addLog('board',who+' přidal příspěvek: "'+title+'".');
  document.getElementById('boardTitle').value='';document.getElementById('boardBody').value='';
  st.textContent='// ZVEŘEJNĚNO';setTimeout(function(){st.textContent='';},3000);
  toast('Příspěvek zveřejněn','success');renderAdminBoard();
}
function renderAdminBoard(){
  var posts=DB.get('board')||[];var confirmed=DB.get('boardConfirmed')||{};
  var el=document.getElementById('adminBoardList');
  if(!posts.length){el.innerHTML='<div class="empty-s">// Nástěnka je prázdná</div>';return;}
  el.innerHTML=posts.slice().reverse().map(function(p){
    var confCount=(confirmed[p.id]||[]).length;
    return '<div class="board-post '+p.type+'">'+
      '<div class="bp-header"><div class="bp-title">'+esc(p.title)+'</div>'+
      '<div style="display:flex;gap:.5rem;align-items:center;">'+
        (p.type==='confirm'?'<span class="bp-confirm-count">✓ '+confCount+'</span>':'')+
        '<button class="bp-del-btn" onclick="deletePost(\''+p.id+'\')">✕</button></div></div>'+
      '<div class="bp-body">'+esc(p.body)+'</div>'+
      '<div class="bp-date">'+p.date+' — '+esc(p.author)+'</div></div>';
  }).join('');
}
function deletePost(id){
  if(!confirm('Smazat příspěvek?'))return;
  DB.set('board',(DB.get('board')||[]).filter(function(p){return p.id!==id;}));
  renderAdminBoard();addLog('board','Admin smazal příspěvek na nástěnce.');
}

// ── TASKS ADMIN ──────────────────────────────
function fillMemberSelects(){
  var members=DB.get('members')||[];
  var opts='<option value="">-- Vyberte člena --</option>'+members.map(function(m){return '<option value="'+m.id+'">'+esc(m.displayName)+'</option>';}).join('');
  ['taskTarget','msgTarget'].forEach(function(id){var e=document.getElementById(id);if(e)e.innerHTML=opts;});
}
function assignTask(){
  var mid=document.getElementById('taskTarget').value;
  var title=document.getElementById('taskTitle').value.trim();
  var desc=document.getElementById('taskDesc').value.trim();
  var prio=document.getElementById('taskPrio').value;
  var st=document.getElementById('taskStatus');
  if(!mid||!title){st.textContent='// VYPLŇTE POLE';return;}
  var tm=getMember(mid);
  var tasks=DB.get('tasks')||{};if(!tasks[mid])tasks[mid]=[];
  tasks[mid].push({title:title,desc:desc,priority:prio,date:nowStr(),done:false});
  DB.set('tasks',tasks);
  addLog('task','Vedení přidělilo úkol ['+PRIO[prio]+'] "'+title+'" členovi "'+(tm?tm.displayName:mid)+'".');
  st.textContent='// ODESLÁNO';setTimeout(function(){st.textContent='';},3000);
  document.getElementById('taskTitle').value='';document.getElementById('taskDesc').value='';
  toast('Úkol přiřazen','success');
}

// ── MESSAGES ADMIN ───────────────────────────
function sendMsg(){
  var mid=document.getElementById('msgTarget').value;
  var subject=document.getElementById('msgSubject').value.trim();
  var body=document.getElementById('msgBody').value.trim();
  var st=document.getElementById('msgStatus');
  if(!mid||!subject||!body){st.textContent='// VYPLŇTE POLE';return;}
  var tm=getMember(mid);
  var msgs=DB.get('messages')||{};if(!msgs[mid])msgs[mid]=[];
  msgs[mid].push({subject:subject,body:body,date:nowStr()});
  DB.set('messages',msgs);
  addLog('msg','Vedení odeslalo zprávu "'+subject+'" členovi "'+(tm?tm.displayName:mid)+'".');
  st.textContent='// ODESLÁNO';setTimeout(function(){st.textContent='';},3000);
  document.getElementById('msgSubject').value='';document.getElementById('msgBody').value='';
  toast('Zpráva odeslána','success');
}

// ── WAREHOUSE ADMIN ──────────────────────────
var aWhCat='all';
function toggleAddItem(){document.getElementById('addItemPanel').classList.toggle('hidden');}
function previewImg(val){var el=document.getElementById('wi-preview');if(!el)return;el.innerHTML=val?'<img src="images/'+esc(val)+'" onerror="this.parentElement.innerHTML=\'chyba\'"/>':'—';}
function addItem(){
  var name=document.getElementById('wi-name').value.trim();
  var cat=document.getElementById('wi-cat').value;
  var qty=parseInt(document.getElementById('wi-qty').value)||0;
  var min=parseInt(document.getElementById('wi-min').value)||0;
  var img=document.getElementById('wi-img').value.trim();
  var note=document.getElementById('wi-note').value.trim();
  var st=document.getElementById('addItemStatus');
  if(!name){st.textContent='// ZADEJTE NÁZEV';return;}
  var items=DB.get('warehouse')||[];
  items.push({id:uid(),name:name,cat:cat,qty:qty,min:min,img:img,note:note});
  DB.set('warehouse',items);
  addLog('wh','Admin přidal do skladu: "'+name+'" ('+qty+' ks).');
  st.textContent='// PŘIDÁNO';setTimeout(function(){st.textContent='';},3000);
  ['wi-name','wi-img','wi-note'].forEach(function(i){document.getElementById(i).value='';});
  document.getElementById('wi-qty').value='1';document.getElementById('wi-min').value='0';
  if(document.getElementById('wi-preview'))document.getElementById('wi-preview').innerHTML='—';
  toast(name+' přidán','success');renderAdminWarehouse();
}
function aWhFilter(cat,btn){
  aWhCat=cat;document.querySelectorAll('#at-warehouse .wf').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderAdminWarehouse();
}
function renderAdminWarehouse(){
  var items=DB.get('warehouse')||[];
  var filtered=aWhCat==='all'?items:items.filter(function(i){return i.cat===aWhCat;});
  var el=document.getElementById('aWhGrid');
  if(!filtered.length){el.innerHTML='<div class="empty-s" style="grid-column:1/-1">// Prázdný sklad</div>';return;}
  el.innerHTML=filtered.map(function(item){
    var qc=item.qty===0?'empty':(item.min>0&&item.qty<=item.min?'low':'');
    var imgH=item.img?'<div class="wh-img"><img src="images/'+esc(item.img)+'" onerror="this.parentElement.innerHTML=\'<span class=wh-icon>?</span>\'"/></div>':'<div class="wh-img"><span class="wh-icon">?</span></div>';
    return '<div class="wh-item">'+imgH+
      '<div class="wh-cat">'+(CAT[item.cat]||item.cat)+'</div>'+
      '<div class="wh-name">'+esc(item.name)+'</div>'+
      (item.note?'<div class="wh-note-text">'+esc(item.note)+'</div>':'')+
      '<div class="wh-qty-row"><span class="wh-qty '+qc+'">'+item.qty+'</span><span class="wh-unit"> KS</span></div>'+
      (item.min>0&&item.qty<=item.min&&item.qty>0?'<div class="wh-alert">NÍZKÁ ZÁSOBA</div>':'')+
      (item.qty===0?'<div class="wh-alert critical">VYPRODÁNO</div>':'')+
      '<div class="wh-adm-ctrl"><input type="number" class="qty-inp" id="qi-'+item.id+'" value="1" min="1"/>'+
      '<button class="btn-micro" onclick="adjQty(\''+item.id+'\',1)">+</button>'+
      '<button class="btn-micro" onclick="adjQty(\''+item.id+'\',-1)">-</button>'+
      '<button class="btn-micro del" onclick="delItem(\''+item.id+'\')">✕</button></div></div>';
  }).join('');
}
function adjQty(id,dir){
  var inp=document.getElementById('qi-'+id);var amt=parseInt(inp?inp.value:1)||1;
  var items=DB.get('warehouse')||[];var item=items.find(function(i){return i.id===id;});if(!item)return;
  var before=item.qty;item.qty=Math.max(0,item.qty+dir*amt);DB.set('warehouse',items);
  addLog('wh','Admin upravil zásobu "'+item.name+'": '+before+' → '+item.qty+' ks.');
  renderAdminWarehouse();
}
function delItem(id){
  if(!confirm('Smazat item?'))return;
  var items=DB.get('warehouse')||[];var item=items.find(function(i){return i.id===id;});
  DB.set('warehouse',items.filter(function(i){return i.id!==id;}));
  addLog('wh','Admin smazal item "'+(item?item.name:id)+'" ze skladu.');
  renderAdminWarehouse();toast('Item smazán','info');
}

// ── CLOTHING ADMIN ───────────────────────────
var aClothCat='all';
function toggleAddCloth(){document.getElementById('addClothPanel').classList.toggle('hidden');}
function addCloth(){
  var name=document.getElementById('cl-name').value.trim();
  var cat=document.getElementById('cl-cat').value;
  var code=document.getElementById('cl-code').value.trim();
  var img=document.getElementById('cl-img').value.trim();
  var desc=document.getElementById('cl-desc').value.trim();
  var rowsRaw=document.getElementById('cl-rows').value.trim();
  var st=document.getElementById('addClothStatus');
  if(!name){st.textContent='// ZADEJTE NÁZEV';return;}
  // Parse rows: "Kategorie: Hodnota" per line
  var rows=[];
  if(rowsRaw){rowsRaw.split('\n').forEach(function(line){var parts=line.split(':');if(parts.length>=2)rows.push({cat:parts[0].trim(),val:parts.slice(1).join(':').trim()});});}
  var items=DB.get('clothing')||[];
  items.push({id:uid(),name:name,cat:cat,code:code,img:img,desc:desc,rows:rows,catLabel:CLOTH_CAT[cat]||cat});
  DB.set('clothing',items);
  addLog('wh','Admin přidal oblečení: "'+name+'" ('+cat+').');
  st.textContent='// PŘIDÁNO';setTimeout(function(){st.textContent='';},3000);
  ['cl-name','cl-code','cl-img','cl-desc','cl-rows'].forEach(function(i){document.getElementById(i).value='';});
  toast(name+' přidán','success');renderAdminClothing();
}
function switchAClothTab(cat,btn){
  aClothCat=cat;document.querySelectorAll('#at-clothing .ctab').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderAdminClothing();
}
function renderAdminClothing(){
  var items=DB.get('clothing')||[];
  var filtered=aClothCat==='all'?items:items.filter(function(i){return i.cat===aClothCat;});
  var el=document.getElementById('aClothCols');
  if(!filtered.length){el.innerHTML='<div class="empty-s">// Žádné položky</div>';return;}
  
  el.innerHTML=filtered.map(function(item){
    // Foto sekce
    var imgH = item.img ? '<img src="images/'+esc(item.img)+'" class="cl-col-img" onerror="this.style.display=\'none\'">' : '<div class="cl-col-img-ph">FOTO OBLEČENÍ</div>';
    
    // Generování řádků tabulky (v nákresu jsou to ty prázdné nebo vyplněné řádky pod popisem)
    var rows=(item.rows||[]).map(function(r){
      return '<tr><td class="cl-row-cat">'+esc(r.cat||'')+'</td><td class="cl-row-val">'+esc(r.val||'')+'</td></tr>';
    }).join('');

    return '<div class="cl-col">'+
      // 1. NÁZEV (Horní lišta)
      '<div class="cl-col-title">'+esc(item.name || 'Název Oblečení')+'</div>'+
      // 2. FOTO (Velký blok)
      '<div class="cl-col-img-wrap">'+imgH+'</div>'+
      // 3. POPIS (Střední lišta)
      '<div class="cl-col-desc-label">Popis Oblečení</div>'+
      '<div class="cl-col-desc">'+esc(item.desc||'')+'</div>'+
      // 4. TABULKA (Data)
      '<table class="cl-col-table">'+
        '<tr>'+
          '<td class="cl-row-cat cl-row-head">'+esc(item.catLabel||CLOTH_CAT[item.cat]||item.cat)+'</td>'+
          '<td class="cl-row-val cl-row-head">'+esc(item.code||'Kód / Číslo')+'</td>'+
        '</tr>'+
        rows+
      '</table>'+
      '<button class="cloth-del-btn" onclick="delCloth(\''+item.id+'\')">✕ SMAZAT</button>'+
    '</div>';
  }).join('');
}
function delCloth(id){
  if(!confirm('Smazat položku?'))return;
  DB.set('clothing',(DB.get('clothing')||[]).filter(function(i){return i.id!==id;}));
  renderAdminClothing();addLog('wh','Admin smazal oblečení.');toast('Smazáno','info');
}

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
  var s=DB.get('settings')||{webhook:'',webhookName:'Frakce LOG'};
  var fs=DB.get('finsettings')||{weeklyFee:5000,feeDay:0};
  document.getElementById('discordWebhook').value=s.webhook||'';
  document.getElementById('discordName').value=s.webhookName||'Frakce LOG';
  document.getElementById('weeklyFee').value=fs.weeklyFee||5000;
  document.getElementById('feeDay').value=fs.feeDay||0;
  renderPanicList();
}
function saveWebhook(){
  var s=DB.get('settings')||{};
  s.webhook=document.getElementById('discordWebhook').value.trim();
  s.webhookName=document.getElementById('discordName').value.trim()||'Frakce LOG';
  DB.set('settings',s);setText('webhookStatus','// ULOŽENO');setTimeout(function(){setText('webhookStatus','');},2000);toast('Webhook uložen','success');
}
function testWebhook(){
  var s=DB.get('settings')||{};
  if(!s.webhook){toast('Zadejte webhook URL','error');return;}
  fetch(s.webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:s.webhookName||'Frakce LOG',content:'✅ Test z Frakce portálu — '+nowStr()})})
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
