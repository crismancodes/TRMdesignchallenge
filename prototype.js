/* Agent work prototype. Edit ITEMS and everything recomputes. */
const inProto=()=>true;

/* ---------- data spec: edit this and everything recomputes ---------- */
const ITEMS=[
 {id:'ENG-387',title:'Add retry with backoff to webhook delivery',agent:'Codex',from:'me',origin:'Delegated by you',ago:'6m',tests:true,sensitive:'the webhook delivery worker',majorDep:false,kind:'feature',
  criteria:[
   {q:'Failed deliveries retry up to 5 times',s:'gap',e:'Retry count is configurable. No test reaches the 5th attempt.'},
   {q:'Backoff is exponential with jitter',s:'ok',e:'backoff.spec.ts checks the delay curve'},
   {q:'Dead-letter after the final failure',s:'gap',e:'No dead-letter path found in the diff'},
   {q:'Existing deliveries are unaffected',s:'ok',e:'Delivery tests unchanged and passing'}],
  assume:['Chose a 1 second base delay, doubling, capped at 5 minutes','Treated 4xx responses as non-retryable, except 429'],
  files:[{n:'workers/webhook-delivery.ts',a:71,d:9},{n:'workers/backoff.ts',a:22,d:0,diff:['+ export function nextDelay(attempt: number): number {','+   const base = Math.min(1000 * 2 ** attempt, 300_000);','+   return base / 2 + Math.random() * (base / 2);','+ }']},{n:'workers/webhook-delivery.spec.ts',a:14,d:2}],
  checks:'CI 4 of 4 passing'},
 {id:'ENG-409',title:'Bump date-fns from 3.6 to 4.1',agent:'Linear Agent',from:'loop',origin:'Loop: Dependency updates',ago:'22m',tests:true,sensitive:null,majorDep:true,kind:'deps',
  criteria:[
   {q:'Build and tests pass',s:'ok',e:'CI 4 of 4 passing'},
   {q:'No deprecated API usage remains',s:'ok',e:'Codemod replaced 9 call sites'},
   {q:'Bundle size does not grow',s:'gap',e:'Not measured in this run'}],
  assume:['Skipped the new timezone package because no call site needs it'],
  files:[{n:'package.json',a:1,d:1},{n:'pnpm-lock.yaml',a:287,d:280},{n:'src/ (9 call sites)',a:20,d:17}],
  checks:'CI 4 of 4 passing'},
 {id:'ENG-412',title:'Fix timezone off-by-one in the weekly digest email',agent:'Linear Agent',from:'me',origin:'Delegated by you',ago:'14m',tests:true,sensitive:null,majorDep:false,kind:'bugfix',
  criteria:[
   {q:'Digest groups issues by the recipient’s local day',s:'ok',e:'New test covers UTC-8 and UTC+13'},
   {q:'Send time is unchanged',s:'ok',e:'Scheduler untouched, 0 lines changed'},
   {q:'Works when the user has no timezone set',s:'gap',e:'No test for a missing timezone. Code falls back to UTC.'}],
  assume:['Used the saved timezone, not the browser’s, because digests render on the server','Left the Week starts on setting alone'],
  files:[{n:'src/digest/group-by-day.ts',a:11,d:3,diff:['- const day = new Date(issue.completedAt).toISOString().slice(0, 10);','+ const tz = user.timezone ?? \'UTC\';','+ const day = formatInTimeZone(issue.completedAt, tz, \'yyyy-MM-dd\');']},{n:'src/digest/digest.spec.ts',a:11,d:1}],
  checks:'CI 4 of 4 passing'},
 {id:'ENG-416',title:'Migrate user.preferences JSON column to typed fields',agent:'Linear Agent',from:'me',origin:'Delegated by you',ago:'31m',tests:true,sensitive:'the users table',majorDep:false,kind:'migration',
  q:{text:'Should I backfill existing rows in this pull request, or ship the schema change first and backfill in a follow-up?',ctx:'The backfill touches every user row. I have drafted the schema and the migration, and I have not opened a pull request yet.',opts:['Backfill in this pull request','Follow-up pull request (safer)','Let me decide later']},
  criteria:[],assume:[],files:[],checks:'No pull request yet'},
 {id:'ENG-398',title:'Update API rate-limit docs for /v2/search',agent:'Linear Agent',from:'loop',origin:'Loop: Docs freshness',ago:'41m',tests:true,sensitive:null,majorDep:false,kind:'docs',
  criteria:[
   {q:'Documents the 60 requests per minute limit',s:'ok',e:'docs/api/search.md line 34'},
   {q:'Mentions the Retry-After header',s:'ok',e:'docs/api/search.md line 41'},
   {q:'Code samples still run',s:'ok',e:'Snippets linted and executed'}],
  assume:[],files:[{n:'docs/api/search.md',a:21,d:5}],checks:'CI 3 of 3 passing'},
 {id:'ENG-405',title:'Rename workspace to team in empty-state copy',agent:'Cursor',from:'me',origin:'Delegated by you',ago:'52m',tests:true,sensitive:null,majorDep:false,kind:'copy',
  criteria:[
   {q:'All empty states say team',s:'ok',e:'14 strings found, 12 changed'},
   {q:'Settings and billing keep workspace',s:'ok',e:'2 left on purpose'},
   {q:'Snapshot tests updated',s:'ok',e:'6 snapshots regenerated'}],
  assume:['Kept workspace in legal copy'],files:[{n:'src/empty-states/ (6 files)',a:12,d:12}],checks:'CI 4 of 4 passing'},
 {id:'ENG-401',title:'Remove unused feature flag new_sidebar_v1',agent:'Cursor',from:'loop',origin:'Loop: Flag cleanup',ago:'1h',tests:true,sensitive:null,majorDep:false,kind:'cleanup',
  criteria:[
   {q:'No references to the flag remain',s:'ok',e:'Search finds 0 matches after the change'},
   {q:'Flag has been at 100% in production',s:'ok',e:'Fully rolled out for 38 days'},
   {q:'No runtime behavior change',s:'ok',e:'Only the dead branch removed, snapshots unchanged'}],
  assume:[],files:[{n:'src/ (4 files)',a:0,d:58}],checks:'CI 4 of 4 passing'}
];
const TOTAL=ITEMS.length;

/* ---------- derived values ---------- */
const adds=i=>i.files.reduce((n,f)=>n+f.a,0), dels=i=>i.files.reduce((n,f)=>n+f.d,0);
const gaps=i=>i.criteria.filter(c=>c.s==='gap').length;
function risk(i){
  if(i.q) return {score:0,level:'ask',reasons:[{t:'The agent needs a decision before it can open a pull request',n:true}]};
  let s=0,r=[];
  if(!i.tests){s+=3;r.push({t:'CI is failing',n:true})}else r.push({t:'All CI checks pass',g:true});
  if(i.sensitive){s+=2;r.push({t:'Touches '+i.sensitive,n:true})}else r.push({t:'No sensitive paths touched',g:true});
  if(i.majorDep){s+=1;r.push({t:'Includes a major version bump',n:true})}
  const g=gaps(i);
  if(g){s+=1;r.push({t:g+(g>1?' acceptance criteria have':' acceptance criterion has')+' no evidence',n:true})}else r.push({t:'Every acceptance criterion has evidence',g:true});
  return {score:s,level:s>=3?'high':s>=1?'med':'low',reasons:r};
}
const LABEL={low:'Low risk',med:'Medium',high:'High',ask:'Question'};
const groupOf=i=>i.q?'ask':(risk(i).score===0?'safe':'look');
const GROUPS=[{k:'ask',l:'Agent asked a question'},{k:'look',l:'Needs a look'},{k:'safe',l:'Safe to approve'}];

/* ---------- rules ---------- */
const RULES=[
 {k:'tests',l:'CI checks pass',d:'Every check on the pull request is green',f:i=>i.tests},
 {k:'docs',l:'Docs or copy changes only',d:'No code paths touched',f:i=>i.kind==='docs'||i.kind==='copy'},
 {k:'small',l:'Under 30 lines changed',d:'Added plus removed',f:i=>adds(i)+dels(i)<30},
 {k:'deps',l:'No major dependency bumps',d:'Minor and patch updates are fine',f:i=>!i.majorDep},
 {k:'sens',l:'No sensitive paths',d:'Billing, auth, workers and database tables',f:i=>!i.sensitive},
 {k:'evid',l:'Every criterion has evidence',d:'No gaps flagged on the issue’s acceptance criteria',f:i=>gaps(i)===0}
];
const matches=()=>ITEMS.filter(i=>i.st==='pending'&&!i.q&&RULES.every(r=>!S.rules[r.k]||r.f(i)));

/* ---------- state ---------- */
let S;
const defF=()=>({source:null,agent:null,risk:null});
const defD=()=>({group:'risk',props:{id:true,agent:true,lines:true,age:true,risk:true}});
const isDefD=()=>JSON.stringify(S.d)===JSON.stringify(defD());
function fresh(){
  ITEMS.forEach(i=>{i.st='pending';i.ov={}});
  S={sel:null,checked:new Set(),f:defF(),d:defD(),menu:null,sub:null,compose:false,text:'',rulesOpen:false,open:{},toast:null,undo:null,tt:null,
     rules:{tests:true,docs:true,small:false,deps:false,sens:false,evid:false}};
  S.sel=(ordered()[0]||{}).id||null;
}
const get=id=>ITEMS.find(i=>i.id===id);
const pend=()=>ITEMS.filter(i=>i.st==='pending');
const pass=(i,skip)=>(skip==='source'||!S.f.source||i.from===S.f.source)&&(skip==='agent'||!S.f.agent||i.agent===S.f.agent)&&(skip==='risk'||!S.f.risk||risk(i).level===S.f.risk);
function visible(){return pend().filter(i=>pass(i))}
/* filter menu: each field lists its options with live counts */
const FILTERS=[
 {k:'source',l:'Source',ic:'loops',opts:()=>[['me','Delegated by me'],['loop','From Loops']],of:i=>i.from},
 {k:'agent',l:'Agent',ic:'agent',opts:()=>[...new Set(ITEMS.map(i=>i.agent))].map(a=>[a,a]),of:i=>i.agent},
 {k:'risk',l:'Risk',ic:'risk',opts:()=>[['ask','Question'],['high','High'],['med','Medium'],['low','Low risk']],of:i=>risk(i).level}];
const PROPS=[['id','ID'],['agent','Agent'],['lines','Lines changed'],['age','Age'],['risk','Risk']];
const fLabel=k=>{const F=FILTERS.find(x=>x.k===k),o=F.opts().find(o=>o[0]===S.f[k]);return o?o[1]:S.f[k]};
const activeF=()=>FILTERS.filter(F=>S.f[F.k]);
function keepSel(){const o=ordered();if(!o.find(i=>i.id===S.sel))S.sel=o[0]?o[0].id:null}
function groups(){const g={ask:[],look:[],safe:[]};visible().forEach(i=>g[groupOf(i)].push(i));g.look.sort((a,b)=>risk(b).score-risk(a).score);return g}
function ordered(){const g=groups();return [...g.ask,...g.look,...g.safe]}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- render ---------- */
function pendingCount(){return ITEMS.filter(i=>i.st==='pending').length}
function renderList(){
  const g=groups(), all=ordered();
  const P=S.d.props, nF=activeF().length;
  let h=`<div class="lh"><div class="r"><b>Reviews</b><span class="hb">
    <button class="ibtn" type="button" data-act="rules" data-tip="Review rules" aria-label="Review rules"><svg class="ico"><use href="#i-bolt"/></svg></button>
    <button class="ibtn${S.menu==='filter'||nF?' on':''}" type="button" data-act="menu" data-v="filter" data-menu="filter" data-tip="Add Filter" data-k="F" aria-label="Add filter" aria-expanded="${S.menu==='filter'}"><svg class="ico"><use href="#i-filter"/></svg></button>
    <button class="ibtn${S.menu==='display'?' on':''}" type="button" data-act="menu" data-v="display" data-menu="display" data-tip="Show display options" data-k="⇧ V" aria-label="Show display options" aria-expanded="${S.menu==='display'}"><svg class="ico"><use href="#i-display"/></svg></button></span></div>
  <div class="seg"><span class="tb" title="Existing Linear tab, outside this prototype">Created</span><span class="tb" title="Existing Linear tab, outside this prototype">To review</span><span class="tb on">Agent work<span class="cnt">${all.length}</span></span><span class="tb new">New</span></div>
  ${nF?`<div class="fchips">${activeF().map(F=>`<span class="fchip"><svg class="ico"><use href="#i-${F.ic}"/></svg>${F.l} <i>is</i> ${esc(fLabel(F.k))}<button type="button" data-act="unfilter" data-v="${F.k}" aria-label="Remove ${F.l} filter"><svg class="ico"><use href="#i-x"/></svg></button></span>`).join('')}${nF>1?'<button class="fclear" type="button" data-act="unfilter" data-v="all">Clear</button>':''}</div>`:''}</div>`;
  if(!all.length) h+=nF?`<div class="empty"><p>No results match these filters.</p><button class="btn sm" type="button" data-act="unfilter" data-v="all">Clear filters</button></div>`:`<div class="empty"><p>Nothing waiting in this view.</p></div>`;
  const flat=S.d.group==='none';
  (flat?[{k:'all',l:''}]:GROUPS).forEach(({k,l})=>{
    const rows=flat?all:g[k];
    if(!rows.length) return;
    const allChecked=k==='safe'&&g[k].every(i=>S.checked.has(i.id));
    if(!flat) h+=`<div class="gh"><span>${l}<span class="n">${g[k].length}</span></span>${k==='safe'?`<label><input type="checkbox" data-selall ${allChecked?'checked':''}>Select all</label>`:''}</div>`;
    else h+='<div style="height:6px"></div>';
    rows.forEach(i=>{
      const rk=risk(i), safe=groupOf(i)==='safe';
      h+=`<div class="rowwrap ${S.sel===i.id?'sel':''}">${safe?`<input type="checkbox" data-check="${i.id}" aria-label="Select ${esc(i.id)}" ${S.checked.has(i.id)?'checked':''}>`:''}
      <button class="row" type="button" data-act="select" data-id="${i.id}" aria-current="${S.sel===i.id}">
        <svg class="ico ri ${i.q?'ag':'pr'}"><use href="#i-${i.q?'agent':'pr'}"/></svg><span class="t">${esc(i.title)}</span>
        <span class="m">${P.id?`<span class="id">${i.id}</span>`:''}${P.agent?`<span class="who"><span class="av${i.agent==='Linear Agent'?' la':''}">${i.agent[0]}</span>${i.agent}</span>`:''}${P.lines&&!i.q?`<span><span class="da">+${adds(i)}</span> <span class="dd">−${dels(i)}</span></span>`:''}${P.age?`<span>${i.ago}</span>`:''}${P.risk?`<span class="pill ${rk.level}">${LABEL[rk.level]}</span>`:''}</span>
      </button></div>`;
    });
  });
  return h;
}
function renderDetail(){
  const i=get(S.sel);
  if(!i||i.st!=='pending'){
    const done=pendingCount()===0;
    return done?`<div class="empty"><h3>Queue clear</h3><p>${TOTAL} agent results handled. Each one with its evidence in view.</p><button class="btn pri" data-reset type="button">Replay the demo</button></div>`
      :`<div class="empty"><h3>Select a result</h3><p>Pick one from the list to see its evidence.</p></div>`;
  }
  const rk=risk(i), ovN=Object.keys(i.ov).filter(k=>i.ov[k]).length;
  let h=`<div class="dbody"><div class="dh"><span class="crumb"><svg class="ico"><use href="#i-${i.q?'agent':'pr'}"/></svg>Reviews<span>›</span><span class="id">${i.id}</span></span><h3>${esc(i.title)}</h3>
    <div class="m"><span class="who"><span class="av${i.agent==='Linear Agent'?' la':''}">${i.agent[0]}</span>${i.agent}</span> · ${esc(i.origin)} · ${i.ago} ago</div></div>`;
  h+=`<div class="rk"><div class="l"><span class="pill ${rk.level}">${LABEL[rk.level]}</span><span style="font-size:14px">${i.q?'Waiting on you.':rk.level==='low'?'Safe to approve. Everything the issue asked for has proof.':rk.level==='high'?'Read this one. Two things need your eyes.':'Check the flagged item, then approve.'}</span></div>
    <details><summary>Why this rating</summary><ul>${rk.reasons.map(r=>`<li><span class="ic ${r.g?'g':'n'}">${r.g?'✓':'!'}</span>${esc(r.t)}</li>`).join('')}</ul></details></div>`;
  if(i.q){
    h+=`<div class="qcard"><p>${esc(i.q.text)}</p><span style="font-size:13.5px;color:var(--muted)">${esc(i.q.ctx)}</span><div class="opts">${i.q.opts.map((o,k)=>`<button class="btn ${k===1?'pri':''}" type="button" data-act="answer" data-id="${i.id}" data-v="${k}">${esc(o)}</button>`).join('')}</div></div></div>`;
    return h;
  }
  h+=`<div><div class="sh"><span>Intent and outcome</span><span>${i.criteria.length} criteria from the issue</span></div><ul class="crit">${i.criteria.map(c=>`<li class="${c.s==='gap'?'gap':''}"><span class="ic ${c.s==='ok'?'g':'n'}">${c.s==='ok'?'✓':'!'}</span><div><div class="q">${esc(c.q)}</div><div class="e">${esc(c.e)}</div></div></li>`).join('')}</ul></div>`;
  h+=`<div><div class="sh"><span>What the agent assumed</span></div>${i.assume.length?`<ul class="assume">${i.assume.map((a,k)=>`<li class="${i.ov[k]?'ov':''}"><span>${esc(a)}</span><span class="bt"><button type="button" data-act="keep" data-id="${i.id}" data-k="${k}" aria-pressed="${!i.ov[k]}">Keep</button><button type="button" data-act="over" data-id="${i.id}" data-k="${k}" aria-pressed="${!!i.ov[k]}">Override</button></span></li>`).join('')}</ul>`:`<p style="font-size:14px;color:var(--muted)">None. The agent followed existing patterns.</p>`}</div>`;
  h+=`<div><div class="sh"><span>Changes</span><span><span class="da">+${adds(i)}</span> <span class="dd">−${dels(i)}</span></span></div><ul class="files">${i.files.map((f,k)=>{const key=i.id+':'+k;return `<li><div class="fr"><span>${esc(f.n)} <span class="da">+${f.a}</span> <span class="dd">−${f.d}</span></span>${f.diff?`<button type="button" data-act="diff" data-key="${key}">${S.open[key]?'Hide':'Preview'}</button>`:''}</div>${f.diff&&S.open[key]?`<div class="diff">${f.diff.map(l=>`<div class="${l[0]==='+'?'a':'d'}">${esc(l)}</div>`).join('')}</div>`:''}</li>`}).join('')}</ul></div>`;
  h+=`<div class="chk"><span><b>${esc(i.checks)}</b></span><span>No preview deployment</span></div></div>`;
  h+=`<div class="bar-d">${S.compose?`<textarea id="cmt" placeholder="Tell ${esc(i.agent)} what to change">${esc(S.text)}</textarea>
    <div class="steer"><button type="button" data-act="steer" data-t="Add a test for the missing case.">Add a test for the gap</button><button type="button" data-act="steer" data-t="Split this into smaller pull requests.">Split it up</button><button type="button" data-act="steer" data-t="Explain the assumption before changing it.">Ask why</button></div>`:''}
    <div class="r">${S.compose?`<button class="btn pri" type="button" data-act="send" data-id="${i.id}">Send to ${esc(i.agent)}</button><button class="btn" type="button" data-act="cancel">Cancel</button>`
      :`<button class="btn pri" type="button" data-act="${ovN?'sendov':'approve'}" data-id="${i.id}">${ovN?`Send ${ovN} override${ovN>1?'s':''}`:'Approve and merge'} <kbd>${ovN?'R':'A'}</kbd></button>
        <button class="btn" type="button" data-act="compose">Request changes <kbd>R</kbd></button><span class="sp"></span><button class="btn" type="button" data-act="takeover" data-id="${i.id}">Take over <kbd>E</kbd></button>`}</div></div>`;
  return h;
}
function renderRules(){
  const m=matches(), risky=m.filter(i=>risk(i).score>0);
  return `<div class="modal" data-act="rulesbg"><div class="mbox" role="dialog" aria-label="Review rules">
    <div><h3>Review rules</h3><p style="margin-top:4px">Approve automatically when a result meets every rule you turn on. You always see what a rule would do before it does it.</p></div>
    ${RULES.map(r=>`<label class="rule"><input type="checkbox" data-rule="${r.k}" ${S.rules[r.k]?'checked':''}><span>${r.l}<small>${r.d}</small></span></label>`).join('')}
    <div class="prev"><b>Would approve ${m.length} of ${pendingCount()} waiting</b>${m.length?`<div class="ids">${m.map(i=>`<span>${i.id}</span>`).join('')}</div>`:''}
      ${risky.length?`<span class="warnl">${risky.map(i=>i.id).join(', ')} ${risky.length>1?'have':'has'} an acceptance criterion with no evidence. Add the evidence rule to keep ${risky.length>1?'them':'it'} in your queue.</span>`:''}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" type="button" data-act="rulesclose">Close</button><button class="btn pri" type="button" data-act="rulessave" ${m.length?'':'disabled'}>Save and approve ${m.length}</button></div></div></div>`;
}
function renderAll(){
  const app=document.getElementById('app');
  const ls=app.querySelector('.ls'), dt=app.querySelector('.dt'); const sl=ls?ls.scrollTop:0, sd=dt&&dt.dataset.sel===S.sel?dt.scrollTop:0;
  app.innerHTML=`<aside class="sb"><div class="sbn" aria-hidden="true"><div class="ws"><span class="wsa">AE</span>Acme Eng<span class="sp"></span><span class="ib"><svg class="ico"><use href="#i-search"/></svg></span><span class="ib c"><svg class="ico"><use href="#i-compose"/></svg></span></div><div class="nv"><svg class="ico"><use href="#i-inbox"/></svg><span>Inbox</span><em>3</em></div><div class="nv"><svg class="ico"><use href="#i-my"/></svg><span>My issues</span></div><div class="nv on"><svg class="ico"><use href="#i-pr"/></svg><span>Reviews</span><em>${pendingCount()}</em></div><div class="nv"><svg class="ico"><use href="#i-agent"/></svg><span>Agent</span></div><div class="sbh">Workspace</div><div class="nv"><svg class="ico"><use href="#i-projects"/></svg><span>Projects</span></div><div class="nv"><svg class="ico"><use href="#i-views"/></svg><span>Views</span></div><div class="nv"><svg class="ico"><use href="#i-loops"/></svg><span>Loops</span></div><div class="nv"><svg class="ico"><use href="#i-more"/></svg><span>More</span></div><div class="sbh">Your teams</div><div class="nv team"><span class="tm" style="flex:none">E</span><span>Engineering</span></div><div class="nv sub"><svg class="ico"><use href="#i-triage"/></svg><span>Triage</span><em>2</em></div><div class="nv sub"><svg class="ico"><use href="#i-issues"/></svg><span>Issues</span></div><div class="nv sub"><svg class="ico"><use href="#i-projects"/></svg><span>Projects</span></div><div class="nv sub"><svg class="ico"><use href="#i-views"/></svg><span>Views</span></div></div><div class="sbf"><div class="keys"><span><kbd>J</kbd><kbd>K</kbd> move</span><span><kbd>A</kbd> approve</span><span><kbd>R</kbd> request changes</span><span><kbd>X</kbd> select</span><span><kbd>E</kbd> take over</span><span><kbd>F</kbd> filter</span></div><div class="acts"><a class="btn sm" href="index.html#prototype">← Case study</a><button class="btn sm" data-reset type="button">Reset demo</button></div></div></aside>
    <section class="ls" aria-label="Review queue">${renderList()}</section>
    <section class="dt" data-sel="${S.sel}" aria-label="Evidence">${renderDetail()}</section>
    ${S.menu?renderMenu():''}
    ${S.rulesOpen?renderRules():''}
    ${S.checked.size?`<div class="toast" role="status"><span>${S.checked.size} selected</span><button type="button" data-act="batch">Approve ${S.checked.size}</button></div>`:S.toast?`<div class="toast" role="status"><span>${esc(S.toast)}</span>${S.undo?'<button type="button" data-act="undo">Undo</button>':''}</div>`:''}`;
  const l2=app.querySelector('.ls'), d2=app.querySelector('.dt'); if(l2)l2.scrollTop=sl; if(d2)d2.scrollTop=sd;
  placeMenu();
}
function renderMenu(){
  let h='<div class="veil" data-act="menuclose"></div>';
  if(S.menu==='filter'){
    h+=`<div class="pop fm" role="menu" aria-label="Add filter"><div class="ph"><span>Add Filter…</span><kbd>F</kbd></div><div class="pl">${FILTERS.map(F=>`<button type="button" role="menuitem" class="mi${S.sub===F.k?' on':''}" data-act="sub" data-v="${F.k}" aria-haspopup="true" aria-expanded="${S.sub===F.k}"><svg class="ico"><use href="#i-${F.ic}"/></svg><span>${F.l}</span>${S.f[F.k]?'<em class="dot"></em>':''}<svg class="ico car"><use href="#i-caret"/></svg></button>`).join('')}</div>
      <div class="pf"><button type="button" class="rst" data-act="resetf" ${activeF().length?'':'disabled'}><svg class="ico"><use href="#i-reset"/></svg>Reset filters</button></div>`;
    const F=FILTERS.find(x=>x.k===S.sub);
    if(F){const base=pend().filter(i=>pass(i,F.k));
      h+=`<div class="pop sub" role="menu" aria-label="${F.l}">${F.opts().map(([v,l])=>{const n=base.filter(i=>F.of(i)===v).length;return `<button type="button" role="menuitemradio" aria-checked="${S.f[F.k]===v}" class="mi" data-act="setf" data-k="${F.k}" data-v="${esc(v)}"><span class="ck">${S.f[F.k]===v?'<svg class="ico"><use href="#i-check"/></svg>':''}</span><span>${esc(l)}</span><em>${n}</em></button>`}).join('')}</div>`}
    h+='</div>';
  } else {
    h+=`<div class="pop dm" role="dialog" aria-label="Display options"><div class="dr"><label for="dgrp">Grouping</label><select id="dgrp" data-disp="group"><option value="risk"${S.d.group==='risk'?' selected':''}>Risk</option><option value="none"${S.d.group==='none'?' selected':''}>No grouping</option></select></div>
      <div class="dr"><span>Ordering</span><span class="fixed">Risk, then age</span></div>
      <div class="dsep"></div><div class="dlab">Display properties</div><div class="props">${PROPS.map(([k,l])=>`<button type="button" class="prop" data-act="prop" data-v="${k}" aria-pressed="${S.d.props[k]}">${l}</button>`).join('')}</div>
      <div class="dsep"></div><div class="dfoot"><button type="button" class="rst" data-act="resetd" ${isDefD()?'disabled':''}><svg class="ico"><use href="#i-reset"/></svg>Reset to default</button></div></div>`;
  }
  return h;
}
function placeMenu(){
  if(!S.menu) return;
  const app=document.getElementById('app'), b=app.querySelector(`[data-menu="${S.menu}"]`), p=app.querySelector('.pop.fm,.pop.dm'); if(!b||!p) return;
  const ar=app.getBoundingClientRect(), br=b.getBoundingClientRect();
  p.style.top=(br.bottom-ar.top+6)+'px';
  p.style.left=Math.max(8,Math.min(br.left-ar.left, ar.width-p.offsetWidth-8))+'px';
  const s=p.querySelector('.pop.sub'); if(s){const mi=p.querySelector('.mi.on'), pr=p.getBoundingClientRect();
    const fits=pr.right+4+s.offsetWidth<=ar.right-8;
    s.style.left=(fits?p.offsetWidth+4:-s.offsetWidth-4)+'px'; s.style.top=((mi?mi.offsetTop:0)-6)+'px';}
}
function openMenu(m){S.menu=S.menu===m?null:m;S.sub=m==='filter'?'source':null;renderAll()}
function toast(msg,undo){S.toast=msg;if(!undo)S.undo=null;clearTimeout(S.tt);S.tt=setTimeout(()=>{S.toast=null;S.undo=null;renderAll()},7000)}
function apply(ids,st,msg){
  const before=ordered().map(i=>i.id), idx=Math.max(0,before.indexOf(S.sel));
  S.undo={ids:[...ids],prev:ids.map(id=>get(id).st),sel:S.sel};
  ids.forEach(id=>{get(id).st=st;S.checked.delete(id)});
  S.compose=false;S.text='';
  const o=ordered(); S.sel=o.length?o[Math.min(idx,o.length-1)].id:null;
  toast(msg,true); renderAll();
}
function move(d){const o=ordered();if(!o.length)return;const k=o.findIndex(i=>i.id===S.sel);S.sel=o[Math.max(0,Math.min(o.length-1,(k<0?0:k+d)))].id;S.compose=false;renderAll();const r=document.querySelector('.rowwrap.sel');if(r)r.scrollIntoView({block:'nearest'})}

/* ---------- events ---------- */
const appEl=document.getElementById('app');
appEl.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  const a=t.dataset.act, id=t.dataset.id;
  if(a==='rulesbg'){if(e.target!==t)return;S.rulesOpen=false;return renderAll()}
  if(a==='select'){S.sel=id;S.compose=false;S.text='';renderAll()}
  else if(a==='menu'){openMenu(t.dataset.v)}
  else if(a==='menuclose'){S.menu=null;S.sub=null;renderAll()}
  else if(a==='sub'){S.sub=t.dataset.v;renderAll()}
  else if(a==='setf'){const k=t.dataset.k,v=t.dataset.v;S.f[k]=S.f[k]===v?null:v;S.menu=null;S.sub=null;S.checked.clear();keepSel();renderAll()}
  else if(a==='unfilter'){const v=t.dataset.v;if(v==='all')S.f=defF();else S.f[v]=null;keepSel();renderAll()}
  else if(a==='resetf'){S.f=defF();S.sub=null;keepSel();renderAll()}
  else if(a==='resetd'){S.d=defD();renderAll()}
  else if(a==='prop'){const v=t.dataset.v;S.d.props[v]=!S.d.props[v];renderAll()}
  else if(a==='approve'){const i=get(id);apply([id],'approved','Approved '+id+'. Merging now.')}
  else if(a==='compose'){S.compose=true;renderAll();const c=document.getElementById('cmt');if(c)c.focus()}
  else if(a==='cancel'){S.compose=false;S.text='';renderAll()}
  else if(a==='steer'){S.text=(S.text?S.text+' ':'')+t.dataset.t;renderAll();const c=document.getElementById('cmt');if(c)c.focus()}
  else if(a==='send'){const i=get(id);apply([id],'changes','Sent to '+i.agent+'. '+id+' comes back when it finishes.')}
  else if(a==='sendov'){const i=get(id);apply([id],'changes','Sent your overrides to '+i.agent+'. '+id+' comes back when it finishes.')}
  else if(a==='takeover'){const i=get(id);apply([id],'takeover','Opened '+id+' in your editor with the full session context.')}
  else if(a==='answer'){const i=get(id);apply([id],'answered','Answered. '+i.agent+' is continuing '+id+'.')}
  else if(a==='keep'){get(id).ov[t.dataset.k]=false;renderAll()}
  else if(a==='over'){get(id).ov[t.dataset.k]=true;renderAll()}
  else if(a==='diff'){S.open[t.dataset.key]=!S.open[t.dataset.key];renderAll()}
  else if(a==='undo'&&S.undo){const u=S.undo;u.ids.forEach((x,k)=>{get(x).st=u.prev[k]});S.sel=u.sel;S.toast=null;S.undo=null;renderAll()}
  else if(a==='batch'){const ids=[...S.checked];apply(ids,'approved','Approved '+ids.length+' results. Merging now.')}
  else if(a==='rules'){S.menu=null;S.rulesOpen=true;renderAll()}
  else if(a==='rulesclose'){S.rulesOpen=false;renderAll()}
  else if(a==='rulessave'){const ids=matches().map(i=>i.id);S.rulesOpen=false;apply(ids,'auto','Rules saved. '+ids.length+' result'+(ids.length>1?'s':'')+' approved automatically.')}
});
appEl.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.check){t.checked?S.checked.add(t.dataset.check):S.checked.delete(t.dataset.check);renderAll()}
  else if(t.hasAttribute('data-selall')){groups().safe.forEach(i=>t.checked?S.checked.add(i.id):S.checked.delete(i.id));renderAll()}
  else if(t.dataset.rule){S.rules[t.dataset.rule]=t.checked;renderAll()}
  else if(t.dataset.disp==='group'){S.d.group=t.value;renderAll()}
});
appEl.addEventListener('input',e=>{if(e.target.id==='cmt')S.text=e.target.value});
document.addEventListener('click',e=>{if(e.target.closest('[data-reset]')){fresh();renderAll()}});
document.addEventListener('keydown',e=>{
  if(!inProto()||e.metaKey||e.ctrlKey||e.altKey) return;
  const tg=e.target; if(tg&&(tg.tagName==='TEXTAREA'||tg.tagName==='INPUT'&&tg.type==='text')){if(e.key==='Escape'){S.compose=false;renderAll()}return}
  if(S.rulesOpen){if(e.key==='Escape'){S.rulesOpen=false;renderAll()}return}
  if(S.menu){if(e.key==='Escape'){S.menu=null;S.sub=null;renderAll()}return}
  if(e.key==='f'&&!e.shiftKey){e.preventDefault();return openMenu('filter')}
  if(e.key==='V'&&e.shiftKey){e.preventDefault();return openMenu('display')}
  const k=e.key.toLowerCase(), i=get(S.sel);
  if(k==='j'||k==='arrowdown'){e.preventDefault();move(1)}
  else if(k==='k'||k==='arrowup'){e.preventDefault();move(-1)}
  else if(!i||i.st!=='pending') return;
  else if(k==='a'&&!i.q){const n=Object.values(i.ov).some(Boolean);if(!n)apply([i.id],'approved','Approved '+i.id+'. Merging now.')}
  else if(k==='r'&&!i.q){e.preventDefault();S.compose=true;renderAll();const c=document.getElementById('cmt');if(c)c.focus()}
  else if(k==='e'&&!i.q){apply([i.id],'takeover','Opened '+i.id+' in your editor with the full session context.')}
  else if(k==='x'&&groupOf(i)==='safe'){S.checked.has(i.id)?S.checked.delete(i.id):S.checked.add(i.id);renderAll()}
  else if(k==='escape'){S.compose=false;renderAll()}
});
fresh(); renderAll();
