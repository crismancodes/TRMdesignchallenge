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
  assume:[],files:[{n:'src/ (4 files)',a:0,d:58}],checks:'CI 4 of 4 passing'},
 {id:'ENG-436',title:'Archive projects with no activity in 90 days',agent:'Linear Agent',from:'loop',origin:'Loop: Workspace hygiene',ago:'3m',tests:true,sensitive:null,majorDep:false,kind:'cleanup',
  q:{text:'14 projects match. Should I notify their members before archiving them?',ctx:'Archiving hides a project from the sidebar and from views. Members can restore it, but they will not know it was archived unless someone tells them.',opts:['Archive now, no notice','Notify members, archive in 7 days (safer)','Show me the list first']},
  criteria:[],assume:[],files:[],checks:'No pull request yet'},
 {id:'ENG-424',title:'Retry failed invoice syncs to Stripe',agent:'Linear Agent',from:'loop',origin:'Loop: Triage bugs',ago:'9m',tests:false,sensitive:'billing',majorDep:false,kind:'bugfix',
  criteria:[
   {q:'Failed syncs retry on the next hourly run',s:'ok',e:'invoice-sync.spec.ts covers the retry path'},
   {q:'No invoice is sent to Stripe twice',s:'gap',e:'An idempotency key was added, but its integration test is failing'},
   {q:'Sync errors are logged with the invoice ID',s:'ok',e:'Logger call added in sync-invoices.ts'}],
  assume:['Reused the existing hourly job instead of adding a new queue'],
  files:[{n:'billing/sync-invoices.ts',a:48,d:12,diff:['- await stripe.invoices.create(payload);','+ await stripe.invoices.create(payload, {','+   idempotencyKey: `invoice-${invoice.id}-${invoice.version}`,','+ });']},{n:'billing/invoice-sync.spec.ts',a:36,d:0}],
  checks:'CI 3 of 4 passing'},
 {id:'ENG-421',title:'Add rate limiting to the login endpoint',agent:'Codex',from:'me',origin:'Delegated by you',ago:'18m',tests:true,sensitive:'authentication',majorDep:false,kind:'feature',
  criteria:[
   {q:'Blocks an IP and email after 10 failed attempts in 5 minutes',s:'ok',e:'rate-limit.spec.ts checks the 11th attempt'},
   {q:'Returns 429 with a Retry-After header',s:'ok',e:'Response test asserts both'},
   {q:'Single sign-on logins are not rate limited',s:'gap',e:'No test covers the SSO callback route'}],
  assume:['Keyed the limit on IP address and email together','Stored counters in the existing Redis cache'],
  files:[{n:'auth/login.ts',a:19,d:4},{n:'auth/rate-limit.ts',a:41,d:0,diff:['+ const key = `login:${ip}:${email.toLowerCase()}`;','+ const attempts = await redis.incr(key);','+ if (attempts === 1) await redis.expire(key, 300);','+ if (attempts > 10) return tooManyRequests(res, 300);']},{n:'auth/rate-limit.spec.ts',a:52,d:0}],
  checks:'CI 4 of 4 passing'},
 {id:'ENG-418',title:'Paginate the audit log API',agent:'Cursor',from:'me',origin:'Delegated by you',ago:'27m',tests:true,sensitive:null,majorDep:false,kind:'feature',
  criteria:[
   {q:'Returns 50 entries per page by default',s:'ok',e:'audit-log.spec.ts checks the page size'},
   {q:'Uses cursor pagination, not offsets',s:'ok',e:'Cursor built from the entry timestamp and ID'},
   {q:'Existing API clients keep working',s:'gap',e:'No test calls the endpoint without pagination parameters'}],
  assume:['Capped the page size at 200'],
  files:[{n:'api/audit-log.ts',a:38,d:11},{n:'api/audit-log.spec.ts',a:27,d:3}],
  checks:'CI 4 of 4 passing'},
 {id:'ENG-427',title:'Bump eslint from 8.57 to 9.12',agent:'Linear Agent',from:'loop',origin:'Loop: Dependency updates',ago:'45m',tests:true,sensitive:null,majorDep:true,kind:'deps',
  criteria:[
   {q:'Lint passes with no new warnings',s:'ok',e:'CI lint step passing, 0 new warnings'},
   {q:'Config moves to the flat config format',s:'ok',e:'.eslintrc.json replaced by eslint.config.js'},
   {q:'Custom rules still load',s:'ok',e:'All 3 local rules run in CI'}],
  assume:['Dropped two plugins with no ESLint 9 release, because no rule used them'],
  files:[{n:'eslint.config.js',a:34,d:0},{n:'.eslintrc.json',a:0,d:29},{n:'package.json',a:3,d:5},{n:'pnpm-lock.yaml',a:142,d:198}],
  checks:'CI 4 of 4 passing'},
 {id:'ENG-430',title:'Fix a broken link in the onboarding checklist',agent:'Linear Agent',from:'loop',origin:'Loop: Docs freshness',ago:'1h',tests:true,sensitive:null,majorDep:false,kind:'docs',
  criteria:[
   {q:'The Import issues link opens the importer docs',s:'ok',e:'Link checker passes on onboarding.md'},
   {q:'No other broken links in the checklist',s:'ok',e:'All 9 links checked'}],
  assume:[],files:[{n:'docs/onboarding.md',a:1,d:1}],checks:'CI 3 of 3 passing'},
 {id:'ENG-433',title:'Add labels to icon-only buttons in the editor toolbar',agent:'Cursor',from:'me',origin:'Delegated by you',ago:'2h',tests:true,sensitive:null,majorDep:false,kind:'a11y',
  criteria:[
   {q:'Every icon-only button has an accessible name',s:'ok',e:'Accessibility check finds 0 unnamed buttons'},
   {q:'Labels match the existing tooltips',s:'ok',e:'Labels reuse the tooltip strings'},
   {q:'No visual change',s:'ok',e:'Visual snapshots unchanged'}],
  assume:[],files:[{n:'src/editor/toolbar.tsx',a:9,d:9}],checks:'CI 4 of 4 passing'}
];
const TOTAL=ITEMS.length;

/* ---------- Created and To review: ordinary pull requests, as Linear's Reviews shows them today ---------- */
const PRS=[
 {id:'1838',tab:'created',title:'Move notification preferences onto one settings page',author:'You',ago:'1d',status:'ready',reviewers:['Jordan Park'],checks:'4 of 4 passing',branch:'notification-settings',a:240,d:310,
  summary:'Combines the email, desktop and mobile notification settings into one page, with a section per channel. Old settings URLs redirect to the new page.',files:['src/settings/notifications.tsx','src/settings/routes.ts','src/settings/notifications.spec.tsx']},
 {id:'1853',tab:'created',ref:'ENG-387'},
 {id:'1855',tab:'created',ref:'ENG-421'},
 {id:'1857',tab:'created',ref:'ENG-412'},
 {id:'1842',tab:'created',title:'Add saved filters to the Projects view',author:'You',ago:'2h',status:'review',reviewers:['Maya Chen'],checks:'4 of 4 passing',branch:'saved-filters',a:186,d:22,
  summary:'Lets people save a set of filters on the Projects view and pick it from a menu. Saved filters are per user for now.',files:['src/projects/saved-filters.tsx','src/projects/filters-menu.tsx','src/api/saved-filters.ts']},
 {id:'1829',tab:'created',title:'Fix flicker when resizing the issue sidebar',author:'You',ago:'3d',status:'changes',reviewers:['Priya Shah'],checks:'4 of 4 passing',branch:'sidebar-resize',a:31,d:14,
  summary:'Throttles the resize handler and moves the width into a CSS variable, so the sidebar no longer repaints on every pointer move.',note:'Priya Shah: the resize handle still jumps on Safari.',files:['src/issue/sidebar.tsx','src/issue/sidebar.css']},
 {id:'1851',tab:'created',title:'Spike: offline mode for the desktop app',author:'You',ago:'5d',status:'draft',reviewers:[],checks:'2 of 4 passing',branch:'offline-spike',a:612,d:40,
  summary:'Exploratory. Caches the last 500 issues locally and queues edits while offline. Not ready for review.',files:['desktop/offline/cache.ts','desktop/offline/queue.ts','desktop/main.ts']},
 {id:'1847',tab:'review',title:'Add CSV export to Insights',author:'Maya Chen',ago:'40m',status:'requested',checks:'3 of 3 passing',branch:'insights-csv',a:142,d:8,
  summary:'Adds an Export CSV action to every Insights chart. The export uses the chart’s current filters and grouping.',files:['src/insights/export-csv.ts','src/insights/chart-menu.tsx','src/insights/export-csv.spec.ts']},
 {id:'1849',tab:'review',title:'Move the cycles API to cursor pagination',author:'Diego Ruiz',ago:'3h',status:'requested',checks:'4 of 4 passing',branch:'cycles-cursor',a:96,d:51,
  summary:'Replaces offset pagination on /cycles with cursors. Offsets keep working for one release, with a deprecation header.',files:['api/cycles.ts','api/pagination.ts','api/cycles.spec.ts']},
 {id:'1844',tab:'review',title:'Tighten Content-Security-Policy headers on the web app',author:'Priya Shah',ago:'1d',status:'rereview',checks:'4 of 4 passing',branch:'csp-headers',a:44,d:19,
  summary:'Removes unsafe-inline from script-src and moves the two remaining inline scripts into files. Updated after your last review.',files:['server/headers.ts','web/boot.ts','server/headers.spec.ts']},
 {id:'1840',tab:'review',title:'Rewrite the onboarding email copy',author:'Sam Lee',ago:'2d',status:'requested',checks:'2 of 2 passing',branch:'onboarding-emails',a:58,d:61,
  summary:'New copy for the three onboarding emails, shorter and in the product’s voice. No template changes.',files:['emails/onboarding/day-1.mdx','emails/onboarding/day-3.mdx','emails/onboarding/day-7.mdx']}
];
const PR_GROUPS={created:[['ready','Ready to merge'],['review','In review'],['changes','Changes requested'],['draft','Draft']],
                 review:[['requested','Review requested'],['rereview','Re-review requested']]};
const STATUS_LABEL={ready:'Ready to merge',review:'In review',changes:'Changes requested',draft:'Draft',requested:'Review requested',rereview:'Re-review requested'};
/* a pull request an agent opened on an issue you delegated: it borrows its details from ITEMS */
function prView(p){
  if(!p.ref) return {...p,reviewers:p.reviewers||[]};
  const i=get(p.ref);
  return {...p,title:i.title,author:i.agent,agentPR:true,ago:i.ago,status:i.tests?'ready':'review',reviewers:[],checks:i.checks.replace('CI ',''),branch:i.id.toLowerCase(),a:adds(i),d:dels(i),files:i.files.map(f=>f.n)};
}
const prOpen=p=>p.st==='open'&&(!p.ref||get(p.ref).st==='pending');
const prRows=tab=>{const rows=PRS.filter(p=>p.tab===tab&&prOpen(p)).map(prView);return PR_GROUPS[tab].flatMap(([k])=>rows.filter(r=>r.status===k))};
const prGet=id=>{const p=PRS.find(x=>x.id===id);return p?prView(p):null};
const AGENTS=new Set(ITEMS.map(i=>i.agent));
const initials=n=>n==='You'?'Y':n[0];

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
  return {score:s,level:s>=5?'vhigh':s>=3?'high':s>=1?'typ':'low',reasons:r};
}
/* 0 Low, 1-2 Typical, 3-4 High, 5+ Very high: the bands Linear's own Risk score uses */
const LABEL={low:'Low risk',typ:'Typical risk',high:'High risk',vhigh:'Very high risk',ask:'Question'};
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
  PRS.forEach(p=>{p.st='open';if(p.status0)p.status=p.status0;else p.status0=p.status});
  S={sel:null,tab:'agent',prSel:{created:null,review:null},checked:new Set(),f:defF(),d:defD(),menu:null,sub:null,compose:false,text:'',rulesOpen:false,help:false,helpFrom:null,open:{},toast:null,undo:null,tt:null,
     rules:{tests:true,docs:true,small:false,deps:false,sens:false,evid:false}};
  S.sel=(ordered()[0]||{}).id||null;
  ['created','review'].forEach(t=>S.prSel[t]=(prRows(t)[0]||{}).id||null);
}
const get=id=>ITEMS.find(i=>i.id===id);
const pend=()=>ITEMS.filter(i=>i.st==='pending');
const pass=(i,skip)=>(skip==='source'||!S.f.source||i.from===S.f.source)&&(skip==='agent'||!S.f.agent||i.agent===S.f.agent)&&(skip==='risk'||!S.f.risk||risk(i).level===S.f.risk);
function visible(){return pend().filter(i=>pass(i))}
/* filter menu: each field lists its options with live counts */
const FILTERS=[
 {k:'source',l:'Source',ic:'loops',opts:()=>[['me','Delegated by me'],['loop','From Loops']],of:i=>i.from},
 {k:'agent',l:'Agent',ic:'agent',opts:()=>[...new Set(ITEMS.map(i=>i.agent))].map(a=>[a,a]),of:i=>i.agent},
 {k:'risk',l:'Risk',ic:'risk',opts:()=>[['ask','Question'],['vhigh','Very high risk'],['high','High risk'],['typ','Typical risk'],['low','Low risk']],of:i=>risk(i).level}];
const PROPS=[['id','ID'],['agent','Agent'],['lines','Lines changed'],['age','Age'],['risk','Risk']];
const fLabel=k=>{const F=FILTERS.find(x=>x.k===k),o=F.opts().find(o=>o[0]===S.f[k]);return o?o[1]:S.f[k]};
const activeF=()=>FILTERS.filter(F=>S.f[F.k]);
function keepSel(){const o=ordered();if(!o.find(i=>i.id===S.sel))S.sel=o[0]?o[0].id:null}
function groups(){const g={ask:[],look:[],safe:[]};visible().forEach(i=>g[groupOf(i)].push(i));g.look.sort((a,b)=>risk(b).score-risk(a).score);return g}
function ordered(){const g=groups();return [...g.ask,...g.look,...g.safe]}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- render ---------- */
function pendingCount(){return ITEMS.filter(i=>i.st==='pending').length}
function renderHead(){
  const ag=S.tab==='agent', nF=ag?activeF().length:0;
  const off=ag?'':' disabled data-tip="Filters and display options work in Agent work"';
  const tab=(k,l,n)=>`<button type="button" role="tab" class="tb${S.tab===k?' on':''}" data-act="tab" data-v="${k}" aria-selected="${S.tab===k}">${l}<span class="cnt">${n}</span></button>`;
  return `<div class="lh"><div class="r"><b>Reviews</b><span class="hb">
    ${ag?`<button class="ibtn" type="button" data-act="rules" data-tip="Review rules" aria-label="Review rules"><svg class="ico"><use href="#i-bolt"/></svg></button>`:''}
    <button class="ibtn${S.menu==='filter'||nF?' on':''}" type="button" data-act="menu" data-v="filter" data-menu="filter" ${ag?'data-tip="Add Filter" data-k="F"':off} aria-label="Add filter" aria-expanded="${S.menu==='filter'}"><svg class="ico"><use href="#i-filter"/></svg></button>
    <button class="ibtn${S.menu==='display'?' on':''}" type="button" data-act="menu" data-v="display" data-menu="display" ${ag?'data-tip="Show display options" data-k="⇧ V"':off} aria-label="Show display options" aria-expanded="${S.menu==='display'}"><svg class="ico"><use href="#i-display"/></svg></button></span></div>
  <div class="seg" role="tablist" aria-label="Reviews">${tab('created','Created',prRows('created').length)}${tab('review','To review',prRows('review').length)}${tab('agent','Agent work',ordered().length)}<span class="tb new">New</span></div>
  ${nF?`<div class="fchips">${activeF().map(F=>`<span class="fchip"><svg class="ico"><use href="#i-${F.ic}"/></svg>${F.l} <i>is</i> ${esc(fLabel(F.k))}<button type="button" data-act="unfilter" data-v="${F.k}" aria-label="Remove ${F.l} filter"><svg class="ico"><use href="#i-x"/></svg></button></span>`).join('')}${nF>1?'<button class="fclear" type="button" data-act="unfilter" data-v="all">Clear</button>':''}</div>`:''}</div>`;
}
function renderList(){return S.tab==='agent'?renderAgentList():renderPRList()}
function renderAgentList(){
  const g=groups(), all=ordered();
  const P=S.d.props, nF=activeF().length;
  let h=renderHead();
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
function renderPRList(){
  const rows=prRows(S.tab);
  if(!rows.find(r=>r.id===S.prSel[S.tab])) S.prSel[S.tab]=rows[0]?rows[0].id:null;
  const sel=S.prSel[S.tab];
  let h=renderHead();
  if(!rows.length) return h+`<div class="empty"><p>Nothing here. Every pull request in this tab is handled.</p></div>`;
  PR_GROUPS[S.tab].forEach(([k,l])=>{
    const g=rows.filter(r=>r.status===k); if(!g.length) return;
    h+=`<div class="gh"><span>${l}<span class="n">${g.length}</span></span></div>`;
    g.forEach(p=>{
      h+=`<div class="rowwrap ${sel===p.id?'sel':''}"><button class="row" type="button" data-act="prselect" data-id="${p.id}" aria-current="${sel===p.id}">
        <svg class="ico ri ${p.status==='draft'?'dr':'pr'}"><use href="#i-pr"/></svg><span class="t">${esc(p.title)}</span>
        <span class="m"><span class="id">#${p.id}</span><span class="who"><span class="av${p.author==='Linear Agent'?' la':p.agentPR?'':' hu'}">${initials(p.author)}</span>${esc(p.author)}</span>${p.agentPR?'<span class="tagd">Delegated</span>':''}<span><span class="da">+${p.a}</span> <span class="dd">−${p.d}</span></span><span>${p.ago}</span></span>
      </button></div>`;
    });
  });
  return h;
}
function renderPRDetail(){
  const p=prGet(S.prSel[S.tab]);
  if(!p||!prOpen(PRS.find(x=>x.id===p.id))) return `<div class="empty"><h3>Select a pull request</h3><p>Pick one from the list to see it.</p></div>`;
  let h=`<div class="dbody"><div class="dh"><span class="crumb"><svg class="ico"><use href="#i-pr"/></svg>Reviews<span>›</span><span class="id">#${p.id}</span></span><h3>${esc(p.title)}</h3>
    <div class="m"><span class="who"><span class="av${p.author==='Linear Agent'?' la':p.agentPR?'':' hu'}">${initials(p.author)}</span>${esc(p.author)}</span> · <span class="br">main ← ${esc(p.branch)}</span> · ${p.ago} ago</div></div>`;
  if(p.agentPR){
    const i=get(p.ref), rk=risk(i);
    h+=`<div class="qcard"><p>${esc(i.agent)} opened this pull request on an issue you delegated.</p><span style="font-size:13.5px;color:var(--muted)">It sits under ${STATUS_LABEL[p.status]} because its checks ${i.tests?'pass':'are still running'}. Nothing here shows whether it did what the issue asked. Agent work rates it <b style="color:var(--fg)">${LABEL[rk.level]}</b> and shows the evidence.</span><div class="opts"><button class="btn pri" type="button" data-act="toagent" data-id="${i.id}">Review in Agent work</button></div></div>`;
  } else {
    h+=`<div><div class="sh"><span>Summary</span></div><p class="sum">${esc(p.summary)}</p></div>`;
    if(p.note) h+=`<div class="crit"><li class="gap"><span class="ic n">!</span><div><div class="q">Changes requested</div><div class="e">${esc(p.note)}</div></div></li></div>`;
  }
  h+=`<div class="facts2"><div><span>Status</span><b>${STATUS_LABEL[p.status]}</b></div><div><span>Reviewers</span><b>${p.reviewers.length?esc(p.reviewers.join(', ')):(S.tab==='review'?'You':'None yet')}</b></div><div><span>Checks</span><b class="${/^(\d+) of \1/.test(p.checks)?'okc':'badc'}">${esc(p.checks)}</b></div></div>`;
  h+=`<div><div class="sh"><span>Changes</span><span><span class="da">+${p.a}</span> <span class="dd">−${p.d}</span></span></div><ul class="files">${p.files.map(f=>`<li><div class="fr"><span>${esc(f)}</span></div></li>`).join('')}</ul></div></div>`;
  let bar;
  if(p.agentPR) bar=`<button class="btn" type="button" data-act="toagent" data-id="${p.ref}">Review in Agent work</button><span class="sp"></span><button class="btn" type="button" disabled>Squash &amp; merge</button>`;
  else if(S.tab==='review') bar=`<button class="btn pri" type="button" data-act="prdo" data-v="approve" data-id="${p.id}">Approve <kbd>A</kbd></button><button class="btn" type="button" data-act="prdo" data-v="changes" data-id="${p.id}">Request changes</button>`;
  else if(p.status==='ready') bar=`<button class="btn pri" type="button" data-act="prdo" data-v="merge" data-id="${p.id}">Squash &amp; merge <kbd>A</kbd></button>`;
  else if(p.status==='draft') bar=`<button class="btn pri" type="button" data-act="prdo" data-v="ready" data-id="${p.id}">Ready for review</button>`;
  else bar=`<button class="btn" type="button" disabled>Squash &amp; merge</button><span class="wait">${p.status==='changes'?'Changes requested by '+esc(p.reviewers[0]):'Waiting on '+esc(p.reviewers.join(', '))}</span>`;
  return h+`<div class="bar-d"><div class="r">${bar}</div></div>`;
}
function renderDetail(){
  if(S.tab!=='agent') return renderPRDetail();
  const i=get(S.sel);
  if(!i||i.st!=='pending'){
    const done=pendingCount()===0;
    return done?`<div class="empty"><h3>Queue clear</h3><p>${TOTAL} agent results handled. Each one with its evidence in view.</p><button class="btn pri" data-reset type="button">Replay the demo</button></div>`
      :`<div class="empty"><h3>Select a result</h3><p>Pick one from the list to see its evidence.</p></div>`;
  }
  const rk=risk(i), ovN=Object.keys(i.ov).filter(k=>i.ov[k]).length, nFlag=rk.reasons.filter(r=>r.n).length;
  let h=`<div class="dbody"><div class="dh"><span class="crumb"><svg class="ico"><use href="#i-${i.q?'agent':'pr'}"/></svg>Reviews<span>›</span><span class="id">${i.id}</span></span><h3>${esc(i.title)}</h3>
    <div class="m"><span class="who"><span class="av${i.agent==='Linear Agent'?' la':''}">${i.agent[0]}</span>${i.agent}</span> · ${esc(i.origin)} · ${i.ago} ago</div></div>`;
  h+=`<div class="rk"><div class="l"><span class="pill ${rk.level}">${LABEL[rk.level]}</span><span style="font-size:14px">${i.q?'Waiting on you.':rk.level==='low'?'Safe to approve. Everything the issue asked for has proof.':rk.level==='typ'?(nFlag===1?'Check the flagged item, then approve.':`Check the ${nFlag} flagged items, then approve.`):`Read this one. ${nFlag} ${nFlag===1?'thing needs':'things need'} your eyes.`}</span></div>
    <details><summary>Why this rating</summary><ul>${rk.reasons.map(r=>`<li><span class="ic ${r.g?'g':'n'}">${r.g?'✓':'!'}</span>${esc(r.t)}</li>`).join('')}</ul></details></div>`;
  if(i.q){
    h+=`<div class="qcard"><p>${esc(i.q.text)}</p><span style="font-size:13.5px;color:var(--muted)">${esc(i.q.ctx)}</span><div class="opts">${i.q.opts.map((o,k)=>`<button class="btn ${k===1?'pri':''}" type="button" data-act="answer" data-id="${i.id}" data-v="${k}">${esc(o)}</button>`).join('')}</div></div></div>`;
    return h;
  }
  h+=`<div><div class="sh"><span>Intent and outcome</span><span>${i.criteria.length} criteria from the issue</span></div><ul class="crit">${i.criteria.map(c=>`<li class="${c.s==='gap'?'gap':''}"><span class="ic ${c.s==='ok'?'g':'n'}">${c.s==='ok'?'✓':'!'}</span><div><div class="q">${esc(c.q)}</div><div class="e">${esc(c.e)}</div></div></li>`).join('')}</ul></div>`;
  h+=`<div><div class="sh"><span>What the agent assumed</span></div>${i.assume.length?`<ul class="assume">${i.assume.map((a,k)=>`<li class="${i.ov[k]?'ov':''}"><span>${esc(a)}</span><span class="bt"><button type="button" data-act="keep" data-id="${i.id}" data-k="${k}" aria-pressed="${!i.ov[k]}">Keep</button><button type="button" data-act="over" data-id="${i.id}" data-k="${k}" aria-pressed="${!!i.ov[k]}">Override</button></span></li>`).join('')}</ul>`:`<p style="font-size:14px;color:var(--muted)">None. The agent followed existing patterns.</p>`}</div>`;
  h+=`<div><div class="sh"><span>Changes</span><span><span class="da">+${adds(i)}</span> <span class="dd">−${dels(i)}</span></span></div><ul class="files">${i.files.map((f,k)=>{const key=i.id+':'+k;return `<li><div class="fr"><span>${esc(f.n)} <span class="da">+${f.a}</span> <span class="dd">−${f.d}</span></span>${f.diff?`<button type="button" data-act="diff" data-key="${key}">${S.open[key]?'Hide':'Preview'}</button>`:''}</div>${f.diff&&S.open[key]?`<div class="diff">${f.diff.map(l=>`<div class="${l[0]==='+'?'a':'d'}">${esc(l)}</div>`).join('')}</div>`:''}</li>`}).join('')}</ul></div>`;
  h+=`<div class="chk"><span><b class="${i.tests?'':'badc'}">${esc(i.checks)}</b></span><span>No preview deployment</span></div></div>`;
  h+=`<div class="bar-d">${S.compose?`<textarea id="cmt" placeholder="Tell ${esc(i.agent)} what to change">${esc(S.text)}</textarea>
    <div class="steer"><button type="button" data-act="steer" data-t="Add a test for the missing case.">Add a test for the gap</button><button type="button" data-act="steer" data-t="Split this into smaller pull requests.">Split it up</button><button type="button" data-act="steer" data-t="Explain the assumption before changing it.">Ask why</button></div>`:''}
    <div class="r">${S.compose?`<button class="btn pri" type="button" data-act="send" data-id="${i.id}">Send to ${esc(i.agent)}</button><button class="btn" type="button" data-act="cancel">Cancel</button>`
      :`<button class="btn pri" type="button" data-act="${ovN?'sendov':'approve'}" data-id="${i.id}">${ovN?`Send ${ovN} override${ovN>1?'s':''}`:'Approve and merge'} <kbd>A</kbd></button>
        <button class="btn" type="button" data-act="compose">Request changes <kbd>R</kbd></button><span class="sp"></span><button class="btn" type="button" data-act="takeover" data-id="${i.id}">Take over <kbd>E</kbd></button>`}</div></div>`;
  return h;
}
const SHORTCUTS=[[['J','K'],'Move through the queue'],[['A'],'Approve'],[['R'],'Request changes'],[['X'],'Select a safe result for batch approval'],[['E'],'Take over'],[['F'],'Filter'],[['Shift','V'],'Display options'],[['?'],'Show keyboard shortcuts'],[['Esc'],'Close a menu or dialog']];
function renderHelp(){
  return `<div class="modal" data-act="helpbg"><div class="mbox keysdlg" role="dialog" aria-modal="true" aria-labelledby="khd">
    <div class="kh"><h3 id="khd">Keyboard shortcuts</h3><button class="btn sm" type="button" data-act="helpclose">Close</button></div>
    <dl class="kl">${SHORTCUTS.map(([ks,d])=>`<div><dt>${ks.map(k=>`<kbd>${k}</kbd>`).join('')}</dt><dd>${d}</dd></div>`).join('')}</dl>
    <p>Filter and display options work in Agent work.</p></div></div>`;
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
/* focus survives re-renders: match the focused control by its data attributes, else the selected row */
const FOCUS_KEYS=['act','id','key','v','k','check','rule','disp','menu'];
function focusDesc(){
  const a=document.activeElement, app=document.getElementById('app');
  if(!a||a===document.body||!app.contains(a)) return null;
  if(a.id) return '#'+CSS.escape(a.id);
  const parts=FOCUS_KEYS.filter(k=>a.dataset[k]!==undefined).map(k=>`[data-${k}="${CSS.escape(a.dataset[k])}"]`);
  if(a.hasAttribute('data-selall')) parts.push('[data-selall]');
  return parts.length?parts.join(''):'@row';
}
function focusEl(sel){
  const app=document.getElementById('app');
  let el=sel&&sel!=='@row'?app.querySelector(sel):null;
  if(!el) el=app.querySelector('.rowwrap.sel .row');
  if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'nearest'})}
}
function renderAll(){
  const app=document.getElementById('app'), fd=focusDesc(), want=S.focusTo; S.focusTo=null;
  const ls=app.querySelector('.ls'), dt=app.querySelector('.dt'); const sl=ls?ls.scrollTop:0, sd=dt&&dt.dataset.sel===S.sel?dt.scrollTop:0;
  app.innerHTML=`<aside class="sb"><div class="sbn" aria-hidden="true"><div class="tbar"><span class="ib"><svg class="ico"><use href="#i-sidebar"/></svg></span><span class="sp"></span><span class="ib"><svg class="ico"><use href="#i-clock"/></svg></span><span class="ib"><svg class="ico"><use href="#i-chevl"/></svg></span><span class="ib dim"><svg class="ico"><use href="#i-chevr"/></svg></span></div><div class="ws"><span class="wsa">AE</span>Acme Eng<svg class="ico chev"><use href="#i-chevd"/></svg><span class="sp"></span><span class="ib"><svg class="ico"><use href="#i-search"/></svg></span><span class="ib c"><svg class="ico"><use href="#i-compose"/></svg></span></div><div class="nv"><svg class="ico"><use href="#i-inbox"/></svg><span>Inbox</span><em>3</em></div><div class="nv"><svg class="ico"><use href="#i-my"/></svg><span>My issues</span></div><div class="nv on"><svg class="ico"><use href="#i-pr"/></svg><span>Reviews</span><em>${pendingCount()}</em></div><div class="nv"><svg class="ico"><use href="#i-agent"/></svg><span>Agent</span></div><div class="sbh">Workspace</div><div class="nv"><svg class="ico"><use href="#i-projects"/></svg><span>Projects</span></div><div class="nv"><svg class="ico"><use href="#i-views"/></svg><span>Views</span></div><div class="nv"><svg class="ico"><use href="#i-loops"/></svg><span>Loops</span></div><div class="nv"><svg class="ico"><use href="#i-more"/></svg><span>More</span></div><div class="sbh">Your teams</div><div class="nv team"><svg class="ico tmi"><use href="#i-team"/></svg><span>Engineering<i class="car"></i></span></div><div class="nv sub"><svg class="ico"><use href="#i-home"/></svg><span>Home</span></div><div class="nv sub"><svg class="ico"><use href="#i-issues"/></svg><span>Issues</span></div><div class="nv sub"><svg class="ico"><use href="#i-projects"/></svg><span>Projects</span></div><div class="nv sub"><svg class="ico"><use href="#i-views"/></svg><span>Views</span></div><div class="sbh">Try</div><div class="nv"><svg class="ico"><use href="#i-plus"/></svg><span>Invite people</span></div><div class="nv"><svg class="ico"><use href="#i-initiatives"/></svg><span>Initiatives</span></div><div class="nv"><svg class="ico"><use href="#i-cycles"/></svg><span>Cycles</span></div></div><div class="sbf"><div class="keys"><span><kbd>J</kbd><kbd>K</kbd> move</span><span><kbd>A</kbd> approve</span><span><kbd>R</kbd> request changes</span><span><kbd>X</kbd> select</span><span><kbd>E</kbd> take over</span><span><kbd>F</kbd> filter</span><span><kbd>?</kbd> all shortcuts</span></div><div class="acts"><svg class="ico lmark" aria-hidden="true"><use href="#i-linear"/></svg><a class="btn sm" href="index.html#prototype">← Case study</a><button class="btn sm" data-reset type="button">Reset demo</button></div></div></aside>
    <section class="ls" aria-label="Review queue">${renderList()}</section>
    <section class="dt" data-sel="${S.sel}" aria-label="Evidence">${renderDetail()}</section>
    ${S.menu?renderMenu():''}
    ${S.rulesOpen?renderRules():''}
    ${S.help?renderHelp():''}
    ${S.notice?`<div class="toast" role="status"><span>${esc(S.notice)}</span></div>`:S.checked.size?`<div class="toast" role="status"><span>${S.checked.size} selected</span><button type="button" data-act="batch">Approve ${S.checked.size}</button></div>`:S.toast?`<div class="toast" role="status"><span>${esc(S.toast)}</span>${S.undo?'<button type="button" data-act="undo">Undo</button>':''}</div>`:''}`;
  const l2=app.querySelector('.ls'), d2=app.querySelector('.dt'); if(l2)l2.scrollTop=sl; if(d2)d2.scrollTop=sd;
  placeMenu();
  if(want) focusEl(want); else if(fd) focusEl(fd);
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
function openMenu(m){
  if(S.menu===m) return closeMenu();
  S.menu=m;S.sub=m==='filter'?'source':null;S.focusTo=m==='filter'?'.pop.fm .mi':'#dgrp';renderAll();
}
function closeMenu(){const m=S.menu;S.menu=null;S.sub=null;S.focusTo=`[data-menu="${m}"]`;renderAll()}
function openHelp(){S.helpFrom=focusDesc();S.help=true;S.focusTo='[data-act="helpclose"]';renderAll()}
function closeHelp(){S.help=false;S.focusTo=S.helpFrom||'@row';S.helpFrom=null;renderAll()}
function closeRules(){S.rulesOpen=false;S.focusTo='[data-act="rules"]';renderAll()}
/* Tab stays inside an open menu or the rules dialog */
function trapTab(e){
  const box=document.querySelector(S.help?'.keysdlg':S.rulesOpen?'.mbox':'.pop.fm,.pop.dm'); if(!box) return;
  const f=[...box.querySelectorAll('button:not([disabled]),input,select')]; if(!f.length) return;
  const i=f.indexOf(document.activeElement);
  e.preventDefault(); f[(i<0?0:(i+(e.shiftKey?-1:1)+f.length)%f.length)].focus();
}
function notice(msg){S.notice=msg;clearTimeout(S.nt);S.nt=setTimeout(()=>{S.notice=null;renderAll()},4000);renderAll()}
function toast(msg,undo){S.notice=null;clearTimeout(S.nt);S.toast=msg;if(!undo)S.undo=null;clearTimeout(S.tt);S.tt=setTimeout(()=>{S.toast=null;S.undo=null;renderAll()},7000)}
function apply(ids,st,msg){
  const before=ordered().map(i=>i.id), idx=Math.max(0,before.indexOf(S.sel));
  S.undo={ids:[...ids],prev:ids.map(id=>get(id).st),sel:S.sel};
  ids.forEach(id=>{get(id).st=st;S.checked.delete(id)});
  S.compose=false;S.text='';
  const o=ordered(); S.sel=o.length?o[Math.min(idx,o.length-1)].id:null;
  toast(msg,true); renderAll();
}
function prDo(id,v){
  const p=PRS.find(x=>x.id===id), rows=prRows(S.tab).map(r=>r.id), idx=Math.max(0,rows.indexOf(id));
  S.undo={pr:id,st:p.st,status:p.status,tab:S.tab};
  const msg={approve:'Approved #'+id+'. '+p.author+' can merge it now.',changes:'Requested changes on #'+id+'.',merge:'Merged #'+id+' into main.',ready:'#'+id+' is ready for review.'}[v];
  if(v==='ready') p.status='review'; else p.st='done';
  const o=prRows(S.tab); S.prSel[S.tab]=v==='ready'?id:(o.length?o[Math.min(idx,o.length-1)].id:null);
  toast(msg,true); renderAll();
}
function prMove(d){const o=prRows(S.tab);if(!o.length)return;const k=o.findIndex(p=>p.id===S.prSel[S.tab]);S.prSel[S.tab]=o[Math.max(0,Math.min(o.length-1,(k<0?0:k+d)))].id;renderAll();const r=document.querySelector('.rowwrap.sel');if(r)r.scrollIntoView({block:'nearest'})}
function move(d){if(S.tab!=='agent')return prMove(d);const o=ordered();if(!o.length)return;const k=o.findIndex(i=>i.id===S.sel);S.sel=o[Math.max(0,Math.min(o.length-1,(k<0?0:k+d)))].id;S.compose=false;renderAll();const r=document.querySelector('.rowwrap.sel');if(r)r.scrollIntoView({block:'nearest'})}

/* ---------- events ---------- */
const appEl=document.getElementById('app');
appEl.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  if(S.notice){S.notice=null;clearTimeout(S.nt)}
  const a=t.dataset.act, id=t.dataset.id;
  if(a==='rulesbg'){if(e.target!==t)return;return closeRules()}
  if(a==='helpbg'){if(e.target!==t)return;return closeHelp()}
  if(a==='helpclose') return closeHelp();
  if(a==='tab'){S.tab=t.dataset.v;S.menu=null;S.compose=false;S.checked.clear();renderAll()}
  else if(a==='prselect'){S.prSel[S.tab]=id;renderAll()}
  else if(a==='toagent'){S.tab='agent';S.f=defF();S.sel=id;S.compose=false;renderAll()}
  else if(a==='prdo'){prDo(id,t.dataset.v)}
  else if(a==='select'){S.sel=id;S.compose=false;S.text='';renderAll()}
  else if(a==='menu'){if(S.tab==='agent')openMenu(t.dataset.v)}
  else if(a==='menuclose'){closeMenu()}
  else if(a==='sub'){S.sub=t.dataset.v;S.focusTo=`.pop.sub .mi`;renderAll()}
  else if(a==='setf'){const k=t.dataset.k,v=t.dataset.v;S.f[k]=S.f[k]===v?null:v;S.menu=null;S.sub=null;S.checked.clear();keepSel();S.focusTo='[data-menu="filter"]';renderAll()}
  else if(a==='unfilter'){const v=t.dataset.v;if(v==='all')S.f=defF();else S.f[v]=null;keepSel();renderAll()}
  else if(a==='resetf'){S.f=defF();S.sub=null;keepSel();renderAll()}
  else if(a==='resetd'){S.d=defD();renderAll()}
  else if(a==='prop'){const v=t.dataset.v;S.d.props[v]=!S.d.props[v];renderAll()}
  else if(a==='approve'){const i=get(id);apply([id],'approved','Approved '+id+'. Merging now.')}
  else if(a==='compose'){S.compose=true;S.focusTo='#cmt';renderAll()}
  else if(a==='cancel'){S.compose=false;S.text='';S.focusTo='[data-act="compose"]';renderAll()}
  else if(a==='steer'){S.text=(S.text?S.text+' ':'')+t.dataset.t;S.focusTo='#cmt';renderAll()}
  else if(a==='send'){const i=get(id);apply([id],'changes','Sent to '+i.agent+'. '+id+' comes back when it finishes.')}
  else if(a==='sendov'){const i=get(id);apply([id],'changes','Sent your overrides to '+i.agent+'. '+id+' comes back when it finishes.')}
  else if(a==='takeover'){const i=get(id);apply([id],'takeover','Opened '+id+' in your editor with the full session context.')}
  else if(a==='answer'){const i=get(id);apply([id],'answered','Answered. '+i.agent+' is continuing '+id+'.')}
  else if(a==='keep'){get(id).ov[t.dataset.k]=false;renderAll()}
  else if(a==='over'){get(id).ov[t.dataset.k]=true;renderAll()}
  else if(a==='diff'){S.open[t.dataset.key]=!S.open[t.dataset.key];renderAll()}
  else if(a==='undo'&&S.undo&&S.undo.pr){const u=S.undo,p=PRS.find(x=>x.id===u.pr);p.st=u.st;p.status=u.status;S.tab=u.tab;S.prSel[u.tab]=u.pr;S.toast=null;S.undo=null;renderAll()}
  else if(a==='undo'&&S.undo){const u=S.undo;S.tab='agent';u.ids.forEach((x,k)=>{get(x).st=u.prev[k]});S.sel=u.sel;S.toast=null;S.undo=null;renderAll()}
  else if(a==='batch'){const ids=[...S.checked];apply(ids,'approved','Approved '+ids.length+' results. Merging now.')}
  else if(a==='rules'){S.menu=null;S.rulesOpen=true;S.focusTo='.mbox input';renderAll()}
  else if(a==='rulesclose'){closeRules()}
  else if(a==='rulessave'){const ids=matches().map(i=>i.id);S.rulesOpen=false;S.focusTo='[data-act="rules"]';apply(ids,'auto','Rules saved. '+ids.length+' result'+(ids.length>1?'s':'')+' approved automatically.')}
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
  const tg=e.target; if(tg&&(tg.tagName==='TEXTAREA'||tg.tagName==='INPUT'&&tg.type==='text')){if(e.key==='Escape'&&tg.id==='cmt'){S.compose=false;S.focusTo='[data-act="compose"]';renderAll()}return}
  if(S.help){
    if(e.key==='Escape'||e.key==='?'){e.preventDefault();return closeHelp()}
    if(e.key==='Tab') trapTab(e);
    return;
  }
  if(S.rulesOpen||S.menu){
    if(e.key==='Escape'){e.preventDefault();return S.rulesOpen?closeRules():closeMenu()}
    if(e.key==='Tab') trapTab(e);
    return;
  }
  if(e.key==='?'){e.preventDefault();if(S.notice){S.notice=null;clearTimeout(S.nt)}return openHelp()}
  const k=e.key.toLowerCase(), KEYS=['a','r','e','x','f'];
  if(S.notice&&k!=='shift'){S.notice=null;clearTimeout(S.nt)}
  if(k==='escape'){if(S.compose){S.compose=false;S.focusTo='[data-act="compose"]';renderAll()}return}
  /* only act on our shortcuts when focus is not in a control that uses the key itself */
  if(tg&&tg.tagName==='SELECT') return;
  if(S.tab!=='agent'){
    if(k==='j'||k==='arrowdown'){e.preventDefault();return move(1)}
    if(k==='k'||k==='arrowup'){e.preventDefault();return move(-1)}
    if(e.key==='V'&&e.shiftKey||KEYS.includes(k)&&!e.shiftKey) e.preventDefault(); else return;
    const p=prGet(S.prSel[S.tab]);
    if(k==='f'||e.key==='V') return notice('Filters and display options work in Agent work.');
    if(!p) return notice('Nothing is selected in this tab.');
    if(p.agentPR&&(k==='a'||k==='r')) return notice('#'+p.id+' came from a delegated issue. Review it in Agent work, where its evidence is.');
    if(k==='a'){
      if(S.tab==='review') return prDo(p.id,'approve');
      if(p.status==='ready') return prDo(p.id,'merge');
      return notice('#'+p.id+' can’t merge yet: '+(p.status==='draft'?'it is still a draft.':p.status==='changes'?'changes were requested by '+p.reviewers[0]+'.':'it is waiting on '+p.reviewers.join(', ')+'.'));
    }
    if(k==='r'){if(S.tab==='review') return prDo(p.id,'changes');return notice('#'+p.id+' is your own pull request, so there is no one to request changes from.')}
    return notice(k==='x'?'X selects safe results in Agent work.':'E takes over a result in Agent work.');
  }
  if(e.key==='f'&&!e.shiftKey){e.preventDefault();return openMenu('filter')}
  if(e.key==='V'&&e.shiftKey){e.preventDefault();return openMenu('display')}
  const i=get(S.sel);
  if(k==='j'||k==='arrowdown'){e.preventDefault();return move(1)}
  if(k==='k'||k==='arrowup'){e.preventDefault();return move(-1)}
  if(!['a','r','e','x'].includes(k)||e.shiftKey) return;
  e.preventDefault();
  if(!i||i.st!=='pending') return notice(ordered().length?'Select a result first.':'Nothing left in this view.');
  if(i.q) return notice(i.id+' is a question. Pick one of the answers first.');
  if(k==='a'){const ovN=Object.values(i.ov).filter(Boolean).length;
    return ovN?apply([i.id],'changes','Sent your overrides to '+i.agent+'. '+i.id+' comes back when it finishes.'):apply([i.id],'approved','Approved '+i.id+'. Merging now.')}
  if(k==='r'){S.compose=true;S.focusTo='#cmt';return renderAll()}
  if(k==='e') return apply([i.id],'takeover','Opened '+i.id+' in your editor with the full session context.');
  if(k==='x'){if(groupOf(i)!=='safe') return notice('Only results in Safe to approve can be selected. '+i.id+' is '+LABEL[risk(i).level]+'.');
    S.checked.has(i.id)?S.checked.delete(i.id):S.checked.add(i.id);return renderAll()}
});
fresh(); renderAll();
