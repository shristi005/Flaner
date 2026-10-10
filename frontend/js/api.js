// Backend + database calls
const lsGet = k => { try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } };
const lsSet = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
let DEMO_LOG = 'flaner_demo_log', DEMO_PROF = 'flaner_demo_profile'; // namespaced per local person (dev mode only)

// Headers for backend calls: adds the login token when Supabase is on
async function authHeaders(){
  const h = {'Content-Type':'application/json'};
  if(sb){ const {data:{session}} = await sb.auth.getSession(); if(session) h.Authorization = 'Bearer ' + session.access_token; }
  return h;
}

function applyMission(m){
  S.title = m.title || TASKS[S.task].title; S.duration = m.duration || TASKS[S.task].dur; S.msg = m.message || ''; S.tips = m.tips || [];
  S.groups = m.groups.map(g => ({t:g.title, k:g.kind || 'steps', s:g.steps.map(x => [x, 0])}));
}

async function makeMission(){
  $('#app').innerHTML = `<div class="fade" role="status" aria-live="polite" style="text-align:center;padding-top:90px"><div class="breathe">${ic('leaf',48)}</div><h2 id="lm" style="margin-top:12px">Making a plan...</h2></div>`;
  const MSG = ['Making a plan...', 'Keeping it small...', 'Almost ready...']; let k = 0;
  const iv = setInterval(() => { const e = $('#lm'); if (e) e.textContent = MSG[++k % MSG.length]; }, 1800);
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 45000); // local models can be slow; never wait forever
  let expired = false;
  try{
    const r = await fetch((TG_CONFIG.API_URL||'') + '/api/mission', {
      method:'POST', signal:ctl.signal, headers: await authHeaders(),
      body: JSON.stringify({
        task: TASKS[S.task].n, free: S.free, shop: S.shop, time: TIME_LABEL[S.time] || '', energy: ENERGY_LABEL[S.energy] || '',
        route: S.route, barriers: S.bar, fear: S.fear,
        profile: {name: PROFILE.display_name, comfort: PROFILE.comfort, about: PROFILE.about}
      })
    });
    if(r.status === 401){ expired = true; throw new Error('401'); }
    if(!r.ok) throw new Error(await r.text());
    applyMission(await r.json());
  }catch(e){
    console.warn('AI plan failed, using built-in plan:', e);
    toast('AI unavailable: ' + String(e.message).slice(0, 140));
    buildMission();
  }
  clearTimeout(to); clearInterval(iv);
  if(expired && sb){ toast('Your session expired. Please log in again.'); await sb.auth.signOut(); return; }
  // Safety net: the person's own shopping items always appear, word for word
  if(S.shop.length && !S.groups.some(g => g.k === 'items')) S.groups.splice(Math.max(0, S.groups.length - 1), 0, {t:'Shopping list', k:'items', s:S.shop.map(x => [x, 0])});
  S.edit = false; S.out = false;
  go('mission');
}

// --- saving outings. An outbox on the device means finishing offline never loses anything ---
const OBX = () => 'flaner_outbox_' + (USER ? USER.id : 'x');
async function dbSave(e){
  if(!sb){ lsSet(DEMO_LOG, LOG); return; }
  const q = lsGet(OBX()) || []; q.push(e); lsSet(OBX(), q);
  await flushOutbox();
}
async function flushOutbox(){
  if(!sb || !USER) return;
  const q = lsGet(OBX()) || []; if(!q.length) return;
  const rest = [];
  for(const e of q){
    const {error} = await sb.from('missions').insert({user_id:USER.id, task:e.task, feeling:e.feeling || null, place:e.place || null, fear:e.fear || null, happened:e.happened || null, learned:e.learned || null, saw:e.saw || null, enjoyed:e.enjoyed || null, noticed:e.noticed || null, minutes:e.minutes || 0, moment:!!e.moment, created_at:new Date(e.ts).toISOString()});
    if(error && !error.code) rest.push(e); // no code = network problem: keep and retry. A database rejection is dropped.
    else if(error) console.warn('save rejected', error.message);
  }
  lsSet(OBX(), rest);
  if(rest.length) toast("Saved on this device. It will sync when you're back online.");
}
addEventListener('online', () => flushOutbox());
async function dbLoad(){
  if(!sb){ LOG = lsGet(DEMO_LOG) || []; return; }
  const {data} = await sb.from('missions').select('*').order('created_at', {ascending:false}).limit(200);
  const mapped = (data || []).map(r => ({task:r.task, feeling:r.feeling || '', place:r.place || '', fear:r.fear || '', happened:r.happened || '', learned:r.learned || '', saw:r.saw || '', enjoyed:r.enjoyed || '', noticed:r.noticed || '', minutes:r.minutes || 0, moment:!!r.moment, ts:new Date(r.created_at).getTime()}));
  LOG = (lsGet(OBX()) || []).concat(mapped); // include anything still waiting to sync
}
async function saveProfile(){
  PROFILE = {display_name:$('#pn').value.trim(), comfort:$('#pc').value, about:$('#pa').value.trim()};
  if(!sb){ lsSet(DEMO_PROF, PROFILE); $('#pm').textContent = 'Saved (dev mode, this browser only).'; toast('Profile saved'); return; }
  const {error} = await sb.from('profiles').upsert({id:USER.id, ...PROFILE, updated_at:new Date().toISOString()});
  $('#pm').textContent = error ? error.message : 'Saved.'; if(!error) toast('Profile saved');
}

// AI acknowledgement after an outing: praise, an optional insight, and an original line
function setAi(){ const el = $('#ai'); if (el) el.innerHTML = aiBlock(); }
async function loadEval(d){
  try{
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 30000);
    const r = await fetch((TG_CONFIG.API_URL||'') + '/api/reflection', {
      method:'POST', signal:ctl.signal, headers: await authHeaders(),
      body: JSON.stringify({task:d.task, feeling:d.feeling, route:d.route, expected:d.fear, saw:d.saw, enjoyed:d.enjoyed, noticed:d.noticed, happened:d.happened, remember:d.remember, minutes:d.minutes, profile:{name:PROFILE.display_name}})
    });
    clearTimeout(to);
    if(r.status === 401 && sb){ toast('Your session expired. Please log in again.'); await sb.auth.signOut(); return; }
    if(!r.ok) throw new Error(await r.text());
    S.ev = await r.json();
  }catch(err){
    console.warn('AI acknowledgement failed, using fallback', err);
    toast('AI unavailable: ' + String(err.message).slice(0, 140));
  }
  S.evWait = 0; setAi();
}
