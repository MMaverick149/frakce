var DB={
  get:function(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},
  set:function(k,v){localStorage.setItem(k,JSON.stringify(v));}
};

var POSITIONS=['Boss','Right hand','Counselor',"Devil's Advocate",'Chief of Arms','Advisor','Intelligence Chief','Keeper of secrets','Member'];
var VEDENI_POS=['Boss','Right hand','Counselor',"Devil's Advocate"];
var CAT={weapons:'ZBRANĚ',ammo:'MUNICE',vehicles:'VOZIDLA',equipment:'VYBAVENÍ',other:'OSTATNÍ'};
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
  if(!DB.get('settings'))DB.set('settings',{webhook:'',webhookName:'NEXUS LOG'});
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
  if(!confirm('Aktivovat PANIC? Váš přístup bude zablokován.'))return;
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
  if(tab==='warehouse'){renderMemberWarehouse();populateDepositSelect();}
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
      (item.qty===0?'<div class="wh-alert critical">NENÍ VE SKLADU, JE POTŘEBA DOPLNIT</div>':'')+
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

// ── WAREHOUSE DEPOSIT (member) ───────────────
function populateDepositSelect(){
  var items=DB.get('warehouse')||[];
  var sel=document.getElementById('depItem');
  if(!sel)return;
  sel.innerHTML=items.map(function(i){return '<option value="'+i.id+'">'+esc(i.name)+'</option>';}).join('');
}

function depositItem(){
  var m=getMember();
  var nameEl=document.getElementById('depName');
  var itemSel=document.getElementById('depItem');
  var amtEl=document.getElementById('depAmt');
  var st=document.getElementById('depStatus');
  var jmeno=nameEl?nameEl.value.trim():'';
  var itemId=itemSel?itemSel.value:'';
  var amt=parseInt(amtEl?amtEl.value:1)||1;
  if(!jmeno){nameEl.style.borderColor='var(--red)';nameEl.placeholder='Zadejte jméno!';setTimeout(function(){nameEl.style.borderColor='';nameEl.placeholder='Jméno...';},2000);return;}
  if(!itemId){st.textContent='// VYBERTE ITEM';return;}
  var items=DB.get('warehouse')||[];
  var item=items.find(function(i){return i.id===itemId;});
  if(!item){st.textContent='// ITEM NENALEZEN';return;}
  var before=item.qty;
  item.qty=item.qty+amt;
  DB.set('warehouse',items);
  addLog('wh','VLOŽENÍ: "'+jmeno+'" vložil '+amt+'x "'+item.name+'" do skladu — zásoba: '+before+' → '+item.qty+' ks. Člen: '+m.displayName+'.');
  nameEl.value='';amtEl.value='1';
  st.textContent='// ✓ VLOŽENO DO SKLADU';
  setTimeout(function(){st.textContent='';},3000);
  toast(amt+'x '+item.name+' vloženo do skladu ✓','success');
  renderMemberWarehouse();
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
    ? '<div class="cs-img-wrap"><img src="images/' + esc(s.img) + '" class="cs-img" onerror="this.parentElement.innerHTML=\'👕\'"></div>' 
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

function filterCloth(cat,btn){
  document.querySelectorAll('#mt-clothing .wf').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  renderClothing();
}

// ── CLOTHING ADMIN ───────────────────────────
function previewClothImg(val){
  var el=document.getElementById('cl-img-preview');if(!el)return;
  if(!val||!val.trim()){el.innerHTML='—';return;}
el.innerHTML = '<img src="images/' + esc(val) + '" style="max-width:100%;max-height:110px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(196,154,20,.3));" onerror="this.parentElement.innerHTML=\'<span style=\\\'color:var(--red);font-family:Share Tech Mono,monospace;font-size:.65rem\\\'>nenalezeno</span>\'" />';}

function toggleAddCloth(){
  document.getElementById('addClothPanel').classList.toggle('hidden');
}

function addCloth() {
    // Bezpečné načtení prvků – pokud prvek neexistuje, použije se prázdný řetězec
    var nameEl = document.getElementById('cl-name');
    var codeEl = document.getElementById('cl-code');
    var imgEl = document.getElementById('cl-img');
    var descEl = document.getElementById('cl-desc');
    var catEl = document.getElementById('cl-cat');
    var rowsEl = document.getElementById('cl-rows');
    var st = document.getElementById('addClothStatus');

    if (!nameEl || !nameEl.value.trim()) {
        if (st) st.textContent = '// ZADEJTE NÁZEV';
        return;
    }

    var name = nameEl.value.trim();
    var cat = catEl ? catEl.value : 'masks';
    var code = codeEl ? codeEl.value.trim() : '';
    var img = imgEl ? imgEl.value.trim() : '';
    var desc = descEl ? descEl.value.trim() : '';
    var rowsRaw = rowsEl ? rowsEl.value.trim() : '';

    var rows = [];
    if (rowsRaw) {
        rowsRaw.split('\n').forEach(function(line) {
            var parts = line.split(':');
            if (parts.length >= 2) {
                rows.push({ cat: parts[0].trim(), val: parts.slice(1).join(':').trim() });
            }
        });
    }

    var items = DB.get('clothing') || [];
    items.push({
        id: uid(),
        name: name,
        cat: cat,
        code: code,
        img: img, // Zde může být "maska.png" i odkaz na Fivemanager "
        desc: desc,
        rows: rows
    });

    DB.set('clothing', items);
    if (st) {
        st.textContent = '// PŘIDÁNO';
        setTimeout(function() { st.textContent = ''; }, 3000);
    }

    // Vyčištění polí
    [nameEl, codeEl, imgEl, descEl, rowsEl].forEach(function(el) { if(el) el.value = ''; });
    
    toast(name + ' přidán', 'success');
    renderAdminClothing();
}

function switchAClothTab(cat,btn){
  document.querySelectorAll('#at-clothing .ctab').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  renderAdminClothing();
}

function renderAdminClothing() {
    var sets = DB.get('clothing') || [];
    var el = document.getElementById('aClothCols');
    if (!el) return;

    if (!sets.length) {
        el.innerHTML = '<div class="empty-s">// Žádné sety oblečení – přidejte první set</div>';
        return;
    }

    var cols = sets.map(function(s) {
        var imgH = s.img 
            ? '<div class="cs-img-wrap"><img src="images/' + esc(s.img) + '" class="cs-img" onerror="this.style.display=\'none\'"></div>' 
            : '<div class="cs-img-wrap cs-img-ph">👕</div>';

        var rows = CLOTH_CATS.map(function(c) {
            var m = s[c.key + '_m'] !== undefined ? s[c.key + '_m'] : 0;
            var d = s[c.key + '_d'] !== undefined ? s[c.key + '_d'] : 0;
            return '<tr><td class="cs-cat">' + esc(c.label) + '</td>' +
                   '<td class="cs-label">Model</td><td class="cs-val">' + m + '</td>' +
                   '<td class="cs-label">Design</td><td class="cs-val">' + d + '</td></tr>';
        }).join('');

        return '<div class="cloth-set-col">' +
            '<div class="cs-title">' + esc(s.name) + '</div>' +
            imgH +
            (s.desc ? '<div class="cs-desc">' + esc(s.desc) + '</div>' : '') +
            '<table class="cs-table">' + rows + '</table>' +
            '<button class="cloth-del-btn" style="margin-top:.5rem;width:100%;" onclick="delCloth(\'' + s.id + '\')">✕ SMAZAT SET</button>' +
        '</div>';
    }).join('');

    el.innerHTML = '<div class="cloth-sets-grid">' + cols + '</div>';
}

function delCloth(id){
  if(!confirm('Smazat set oblečení?'))return;
  DB.set('clothing',(DB.get('clothing')||[]).filter(function(i){return i.id!==id;}));
  renderAdminClothing();
  renderClothing();
  addLog('wh','Admin smazal outfit set.');
  toast('Set smazán','info');
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
