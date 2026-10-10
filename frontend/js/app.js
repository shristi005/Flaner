// State, screens, navigation
const $ = s => document.querySelector(s);
const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ic = (n, s = 22) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
let S, LOG = [], P = 'week';
const blank = () => ({ entry: '', task: null, free: '', shop: [], time: '', energy: '', route: '', bar: [], fear: '', title: '', duration: '', msg: '', groups: [], tips: [], out: false, t0: 0, min: 0, feeling: '', saw: '', enjoyed: '', noticed: '', happened: '', remember: '', place: '', draft: null, committed: false, moment: false, ev: null, evWait: 0, edit: false });
function reset() { S = blank(); }
reset();

// --- Keep the user's place: a reload, lock screen or going offline never loses a plan ---
let SKEY = 'flaner_session';
function persist() { try { if (S.groups && S.groups.length && !S.committed) localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) { } }
function clearSession() { try { localStorage.removeItem(SKEY); } catch (e) { } }
function saved() { try { const s = JSON.parse(localStorage.getItem(SKEY)); return s && s.groups && s.groups.length && s.task && !s.committed ? s : null; } catch (e) { return null; } }
function resume() { const s = saved(); if (s) { S = s; go(s.v && V[s.v] && !['home', 'dashboard', 'bye'].includes(s.v) ? s.v : (s.out ? 'go' : 'mission')); } }
function abandon() { clearSession(); reset(); go('dashboard'); } // finish or give up: back to the dashboard
function startPlanning() { clearSession(); reset(); go('home'); } // the planning start page
const left = g => g.filter(x => x.k !== 'notice').flatMap(x => x.s).filter(y => !y[1]).length;
function resumeCard() {
  const s = saved(); if (!s) return '';
  return `<h3 class="sec">Continue my plan</h3><div class="card resume"><div><b>${esc(s.title || TASKS[s.task].n)}</b><div class="sm soft">${left(s.groups)} left</div></div><button class="btn sand" onclick="resume()">Continue</button></div><button class="link" onclick="clearSession();go('home',1)">Start fresh</button>`;
}

const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches);
const buzz = p => { try { if (navigator.vibrate && !reduced()) navigator.vibrate(p); } catch (e) { } };
let TT = null;
function toast(msg, label, fn) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.innerHTML = '<span></span>' + (label ? '<button></button>' : '');
  t.firstChild.textContent = msg;
  if (label) { const b = t.querySelector('button'); b.textContent = label; b.onclick = () => { t.classList.remove('show'); fn(); }; }
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(TT); TT = setTimeout(() => t.classList.remove('show'), 4200);
}
function aiBlock() {
  const e = S.ev;
  if (!e) return S.evWait
    ? '<div class="card" role="status" aria-live="polite"><p class="soft" style="margin:0">Writing a few words for you...</p></div>'
    : `<div class="qt"><span class="qm">“</span><span>${esc(QUOTE.t)}<small>— ${esc(QUOTE.by)}</small></span></div>`;
  return (e.praise ? `<p>${esc(e.praise)}</p>` : '')
    + (e.insight ? `<div class="card"><b>What you noticed</b><p class="sm" style="margin:6px 0 0">${esc(e.insight)}</p></div>` : '')
    + (e.quote ? `<div class="qt"><span class="qm">“</span><span>${esc(e.quote)}</span></div>` : '');
}

const wm = c => `<span class="wm ${c || ''}">${BRAND.name} ${ic('leaf', 16)}</span>`;
const hdr = back => `<div class="hd"><button class="ib" aria-label="Back" onclick="go('${back}')">${ic('left', 20)}</button><span></span><span class="sp"></span></div>`;
const hs = t => { const [a, b] = String(t).split('|'); return [a, b || '']; };
const clk = e => (Object.values(TASKS).find(t => t.past === e.task) || TASKS.other).ic;
const label = () => S.task === 'other' ? (S.title && S.title !== 'Your outing' ? S.title : TASKS.other.past) : TASKS[S.task].past;

// Built-in plan, used only when the AI model is unavailable
function buildMission() {
  const k = S.task, t = TASKS[k], p = PLAN[k];
  S.title = t.title; S.duration = S.time ? TIME_LABEL[S.time].toLowerCase() : t.dur; S.msg = '';
  const g = [{ t: 'Before leaving', k: 'steps', s: p.before }, { t: 'Getting there', k: 'steps', s: p.go || ['Leave home', 'Walk to your destination'] }, { t: p.midT, k: 'steps', s: p.mid }];
  if (k === 'groceries' && S.shop.length) g.push({ t: 'Shopping list', k: 'items', s: S.shop.slice() });
  else if (p.items) g.push({ t: p.itemsT, k: 'items', s: p.items });
  if (p.notice) g.push({ t: 'Notice along the way', k: 'notice', s: NOTICE });
  g.push({ t: 'Coming home', k: 'steps', s: ['Walk home', 'Take one slow breath. You did it.'] });
  S.groups = g.map(x => ({ t: x.t, k: x.k, s: x.s.map(y => [y, 0]) }));
  S.tips = S.bar.flatMap(b => TWEAK[b] || []);
  if (['meet', 'cafe'].includes(k)) S.tips.push('Prefer less interaction? Pick a quiet time, or a place with self-service.');
  if (S.energy === 'low') S.tips.unshift('Low energy? Keep it short. You can head home after the first part.');
  S.tips = S.tips.slice(0, 3);
}
function tiny() {
  S.task = S.task || 'walk'; S.title = 'The smallest step'; S.duration = 'a few minutes'; S.msg = 'That counts. Truly.'; S.out = false;
  S.tips = ["Tomorrow's first step can be even smaller."];
  S.groups = [{ t: 'Smallest step today', k: 'steps', s: [['Put your shoes on', 0], ['Open the door', 0], ['Stand outside for one minute', 0]] }];
}

// --- checklist editing and ticking ---
const row = (g, si, x, k) => { const [a, b] = hs(x[0]); return `<div class="rw ${k === 'items' ? 'sq' : ''}"><label class="row ${x[1] ? 'done' : ''}"><input type="checkbox" ${x[1] ? 'checked' : ''} onchange="tick(${g},${si},this)"><span><b>${esc(a)}</b>${b ? `<small>${esc(b)}</small>` : ''}</span></label>${S.edit ? `<button class="x" aria-label="Remove ${esc(a)}" onclick="rmStep(${g},${si})">${ic('x', 16)}</button>` : ''}</div>`; };
function tick(g, s, el) {
  S.groups[g].s[s][1] = el.checked ? 1 : 0;
  el.closest('.row').classList.toggle('done', el.checked);
  if (el.checked) buzz(8);
  const c = $('#cnt'); if (c) c.textContent = left(S.groups) + ' left';
  persist();
}
function rmStep(g, s) { S.groups[g].s.splice(s, 1); go('mission', 1); }
function addStep(g) { const i = $('#as' + g); if (!i || !i.value.trim()) return; S.groups[g].s.push([i.value.trim().slice(0, 80), 0]); go('mission', 1); const n = $('#as' + g); if (n) n.focus(); }
function grp(x, i) {
  if (!x.s.length && !S.edit) return '';
  return `<div class="card grp"><h3 class="gh"><span class="gn">${String(i + 1).padStart(2, '0')}</span> ${esc(x.t)}${x.k === 'notice' ? ' <small class="soft">(optional)</small>' : ''}</h3>${x.s.map((y, si) => row(i, si, y, x.k)).join('')}${S.edit ? `<div class="add"><input type="text" id="as${i}" aria-label="Add to ${esc(x.t)}" placeholder="Add something" onkeydown="if(event.key==='Enter')addStep(${i})"><button class="btn" onclick="addStep(${i})">Add</button></div>` : ''}</div>`;
}
function printPlan() {
  let p = $('#print'); if (!p) { p = document.createElement('div'); p.id = 'print'; document.body.appendChild(p); }
  p.innerHTML = `<h1>${esc(S.title)}</h1><p>Around ${esc(S.duration)}. Adjust to your needs.</p>` + S.groups.map(g => `<h2>${esc(g.t)}${g.k === 'notice' ? ' (optional)' : ''}</h2><ul>${g.s.map(y => `<li>${esc(hs(y[0])[0])}</li>`).join('')}</ul>`).join('') + (S.tips.length ? `<h2>A little reminder</h2><p>${esc(S.tips[0])}</p>` : '') + '<p>Flâner. Small steps. Bigger days.</p>';
  window.print();
}

// --- choosing and details ---
function startEntry(k) { clearSession(); reset(); S.entry = k; S.route = k === 'nudge' ? 'support' : ''; go('outing'); }
function pickTask(k) { S.task = k; go('details'); }
function useIdea(i) { clearSession(); reset(); S.entry = 'explore'; S.task = IDEAS[i].task; S.free = IDEAS[i].t; go('details'); }
function setOpt(key, val) { S[key] = S[key] === val ? '' : val; go('details', 1); const t = document.querySelector('[data-k="' + key + '-' + val + '"]'); if (t) t.focus(); }
function addShop() { const i = $('#newShop'); if (!i || !i.value.trim() || S.shop.length >= 25) return; S.shop.push(i.value.trim().slice(0, 50)); go('details', 1); const n = $('#newShop'); if (n) n.focus(); }
function rmShop(i) { S.shop.splice(i, 1); go('details', 1); }
function needFree() { if (S.task === 'other' && !S.free.trim()) { toast("Tell me what you'd like to do first"); const f = $('#fx'); if (f) f.focus(); return true; } return false; }
function planNow() { if (!needFree()) makeMission(); }
function goSupport() { if (!needFree()) go('support'); }
function togBar(b) { const i = S.bar.indexOf(b); i < 0 ? S.bar.push(b) : S.bar.splice(i, 1); go('support', 1); const t = document.querySelector('[data-k="' + b + '"]'); if (t) t.focus(); }
function startOuting() { S.out = true; if (!S.t0) S.t0 = Date.now(); buzz(30); go('go'); }
function finishOuting() { S.min = S.t0 ? Math.max(1, Math.round((Date.now() - S.t0) / 60000)) : 0; go('reflect'); }
function setFeel(f) { S.feeling = S.feeling === f ? '' : f; go('reflect', 1); const t = document.querySelector('[data-k="f-' + FEELINGS.indexOf(f) + '"]'); if (t) t.focus(); }
function finish() {
  S.draft = { task: label(), feeling: S.feeling, saw: S.saw.trim(), enjoyed: S.enjoyed.trim(), noticed: S.noticed.trim(), fear: S.fear, happened: S.happened, remember: S.remember, place: S.place.trim(), minutes: S.min || 0, route: S.route };
  S.ev = null; S.evWait = /^https?:/.test(location.protocol) ? 1 : 0;
  go('reward'); loadEval(S.draft);
}
// Reflection text is only kept if the person chooses "Save this moment"
function commit(moment) {
  if (S.committed || !S.draft) return;
  S.committed = true; const d = S.draft;
  const e = { task: d.task, feeling: d.feeling, place: d.place, minutes: d.minutes, moment: !!moment, fear: moment ? d.fear : '', happened: moment ? d.happened : '', learned: moment ? d.remember : '', saw: moment ? d.saw : '', enjoyed: moment ? d.enjoyed : '', noticed: moment ? d.noticed : '', ts: Date.now() };
  LOG.unshift(e); clearSession();
  if (window.dbSave) dbSave(e);
}
function saveMoment() { commit(true); S.moment = true; toast('Saved to My moments'); go('reward', 1); }
addEventListener('pagehide', () => { if (S.v === 'reward') commit(false); });

const NAV_VIEWS = ['dashboard', 'home', 'progress', 'profile'];
const NAV = [['dashboard', 'Home', 'home'], ['home', 'Plan', 'compass'], ['progress', 'Moments', 'book'], ['profile', 'Profile', 'user']];
const navBar = v => `<nav class="tabnav" aria-label="Main">${NAV.map(([k, l, i]) => `<button class="${v === k ? 'on' : ''}" ${v === k ? 'aria-current="page"' : ''} onclick="go('${k}')">${ic(i, 22)}<span>${l}</span></button>`).join('')}</nav>`;
const TITLES = { dashboard: 'Home', home: 'Plan an outing', outing: 'Choose your outing', details: 'Details', support: "What's making it hard", mission: 'Your plan', go: 'The world is waiting', cant: "That's okay", reflect: 'Welcome back', reward: 'A real-world moment', bye: 'Done for today', progress: 'My moments', profile: 'Profile', auth: 'Welcome', setup: 'Setup', forgot: 'Reset password', recover: 'New password', who: 'Who is walking' };
const PUBLIC_VIEWS = ['auth', 'setup', 'forgot', 'recover'];

const V = {
  dashboard: () => {
    const now = Date.now(), W = LOG.filter(e => now - (e.ts || now) < 7 * 864e5), mins = W.reduce((a, e) => a + (e.minutes || 0), 0);
    const places = new Set(W.map(e => (e.place || '').trim().toLowerCase()).filter(Boolean)).size;
    const h = new Date().getHours(), hi = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const nm = (typeof PROFILE !== 'undefined' && PROFILE.display_name) ? ', ' + esc(PROFILE.display_name) : '';
    const R = LOG.slice(0, 5);
    return `<div class="hd">${wm()}<span class="sp"></span></div>
<h1>${hi}${nm}.</h1><p class="soft">Here's how your days beyond the screen are going.</p>
${resumeCard()}
<button class="btn" style="margin-top:6px" onclick="startPlanning()">${ic('compass', 18)} Plan an outing</button>
<h3 class="sec">This week</h3>
<div class="stats"><div class="card"><b>${W.length}</b><span>Outings</span></div><div class="card"><b>${mins}</b><span>Minutes outside</span></div><div class="card"><b>${places}</b><span>Places visited</span></div><div class="card"><b>${W.filter(e => e.moment).length}</b><span>Moments saved</span></div></div>
<div class="top2" style="margin-top:20px"><h3 class="sec" style="margin:0">Recent activity</h3>${LOG.length ? `<button class="link" style="margin:0" onclick="go('progress')">See all</button>` : ''}</div>
${R.length ? R.map(e => `<div class="card actrow"><i>${ic(clk(e), 22)}</i><div><b>${esc(e.task)}</b><div class="sm soft">${new Date(e.ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}${e.place ? ' · ' + esc(e.place) : ''}${e.minutes ? ' · ' + e.minutes + ' min' : ''}</div>${e.feeling ? `<div class="sm soft">${esc(e.feeling)}</div>` : ''}</div></div>`).join('')
        : '<div class="card"><p style="margin:0" class="soft">Nothing here yet. When you finish an outing, it will appear here.</p></div>'}`;
  },
  home: () => {
    const i = Math.floor(Date.now() / 864e5) % IDEAS.length;
    return `<div class="hero"><div class="hd">${wm('lt')}<span class="sp"></span></div>
<h1 class="hl">A little more life<br>beyond your door.</h1>
<div class="entries">${ENTRIES.map(e => `<button class="entry" onclick="startEntry('${e.k}')"><i>${ic(e.ic, 22)}</i><span><b>${e.t}</b>${e.d}</span>${ic('right', 16)}</button>`).join('')}</div></div>
${resumeCard()}
<h3 class="sec">Today's little idea</h3>
<div class="card idea"><p style="margin:0">${esc(IDEAS[i].t)}</p><button class="pill" onclick="useIdea(${i})">Make a plan ${ic('right', 14)}</button></div>`;
  },

  outing: () => `${hdr('home')}<h2>${{ go: 'Where are you headed?', explore: 'What sounds good?', nudge: 'What would you like to do?' }[S.entry] || 'Choose your outing'}</h2>
<p class="soft sm">Pick one. We'll make it easy.</p>
<div class="g3">${Object.entries(TASKS).filter(([k, t]) => S.entry === 'nudge' || t.e.includes(S.entry)).map(([k, t]) => `<button class="tile" onclick="pickTask('${k}')">${ic(t.ic, 24)}${t.n}</button>`).join('')}</div>`,

  details: () => {
    const t = TASKS[S.task], other = S.task === 'other', sup = S.route === 'support';
    const chips = (key, list) => `<div class="chips">${list.map(([v, l]) => `<button class="chip ${S[key] === v ? 'on' : ''}" data-k="${key}-${v}" aria-pressed="${S[key] === v}" onclick="setOpt('${key}','${v}')">${l}</button>`).join('')}</div>`;
    return `${hdr('outing')}<h2>${other ? 'What would you like to do?' : esc(t.n)}</h2>
<p class="soft sm">A few details help me fit the plan to you. Everything is optional${other ? ' except the first box' : ''}.</p>
<label class="q" for="fx">${other ? 'In your own words' : 'Anything the plan should know?'}</label>
<textarea id="fx" placeholder="${esc(t.ph)}" oninput="S.free=this.value">${esc(S.free)}</textarea>
${S.task === 'groceries' ? `<label class="q" for="newShop">What do you need to buy?</label>
<div class="il">${S.shop.map((x, i) => `<div class="ir"><span>${esc(x)}</span><button class="x" aria-label="Remove ${esc(x)}" onclick="rmShop(${i})">${ic('x', 16)}</button></div>`).join('')}</div>
<div class="add"><input type="text" id="newShop" placeholder="e.g. Milk" onkeydown="if(event.key==='Enter')addShop()"><button class="btn" onclick="addShop()">Add</button></div>` : ''}
<label class="q">How much time do you have?</label>${chips('time', TIMES)}
<label class="q">How's your energy?</label>${chips('energy', ENERGY)}
<div class="dock">${sup ? `<button class="btn" onclick="goSupport()">Next: what's making it hard ${ic('right', 18)}</button>`
        : `<p class="sm soft" style="text-align:center;margin:0 0 8px">Would you like a straightforward plan, or a little help getting started?</p>
<button class="btn" onclick="planNow()">Just help me plan</button><button class="btn alt" style="margin-top:8px" onclick="S.route='support';goSupport()">I'm finding it hard to go</button>`}</div>`;
  },

  support: () => `${hdr('details')}<h2>What's making it hard today?</h2>
<p class="soft sm">Pick anything that feels true, or skip this. You can choose more than one.</p>
<div class="g3">${BARS.map(b => `<button class="tile ${S.bar.includes(b[0]) ? 'on' : ''}" data-k="${b[0]}" aria-pressed="${S.bar.includes(b[0])}" onclick="togBar('${b[0]}')">${ic(b[1], 24)}${b[2]}</button>`).join('')}</div>
${S.bar.includes('safe') ? `<div class="card"><b>That's a real concern.</b><p class="sm" style="margin:6px 0 0">Feeling unsafe isn't something to push through. I'll plan a safer option, and staying in today is fine too.</p></div>` : ''}
<label class="q" for="fr">What do you think might happen? <span class="soft">(optional)</span></label>
<div class="chips">${[...new Set(S.bar.flatMap(b => FEARS[b] || []))].slice(0, 3).map(f => `<button class="chip" onclick="$('#fr').value=this.textContent;S.fear=this.textContent">${esc(f)}</button>`).join('')}</div>
<textarea id="fr" placeholder="Your guess is fine. Writing it down shrinks it." oninput="S.fear=this.value">${esc(S.fear)}</textarea>
<div class="dock"><button class="btn" onclick="planNow()">Build my plan ${ic('right', 18)}</button><button class="link" style="margin-bottom:0" onclick="S.bar=[];S.fear='';planNow()">Skip and just plan</button></div>`,

  mission: () => {
    const t = TASKS[S.task], n = left(S.groups);
    return `${hdr(S.out ? 'go' : (S.route === 'support' ? 'support' : 'details'))}
<div class="top2"><h2 style="margin:0">${S.out ? 'Your checklist' : 'Your plan'}</h2><button class="pill" aria-pressed="${S.edit}" onclick="S.edit=!S.edit;go('mission',1)">${ic('pencil', 14)} ${S.edit ? 'Done editing' : 'Edit'}</button></div>
<div class="card mc"><div class="thumb">${ic(t.ic, 44)}</div><div><h3>${esc(S.title || t.n)}</h3><div class="meta"><span>${ic('clock', 15)} Around ${esc(S.duration)}. Adjust to your needs.</span><span>${ic('check', 15)} <em id="cnt" style="font-style:normal">${n} left</em></span></div><span class="badge2">${typeof PROFILE !== 'undefined' && PROFILE.comfort === 'gentle' ? 'Very small steps' : 'Beginner-friendly'}</span></div></div>
${S.msg ? `<div class="qt"><span class="qm">“</span><span>${esc(S.msg)}</span></div>` : ''}
${S.groups.map(grp).join('')}
<div class="tip">${ic('bulb', 22)}<span><b>A little reminder</b>${esc(S.tips[0] || "You don't need to look perfect or feel completely ready. Comfortable enough is enough.")}${S.tips.slice(1).map(x => `<br>${esc(x)}`).join('')}</span></div>
<button class="link" onclick="printPlan()">Print or save checklist</button>
${S.out ? '' : `<button class="link" onclick="go('cant')">I can't do this today</button>`}
<div class="dock">${S.out ? `<button class="btn" onclick="finishOuting()">I'm back</button>` : `<button class="btn" onclick="startOuting()">${ic('leaf', 18)} I'm ready</button><p class="soft sm" style="text-align:center;margin:8px 0 0">You can stop at any point. Progress still counts.</p>`}</div>`;
  },

  go: () => `<div class="lock fade"><div class="awaycard"><div class="bigleaf">${ic('leaf', 56)}</div><h1>The world is waiting.</h1>
<p>Your plan is ready. You don't need to keep checking your phone.</p><hr><b class="pa">Put your phone away. Take your time.</b><p class="sm" style="margin:6px 0 0">Come back whenever you're ready.</p></div>
<div class="lockbtns"><button class="btn lightbtn" onclick="finishOuting()">I'm back</button><button class="link light" onclick="go('mission')">Open my checklist</button><button class="link light" onclick="printPlan()">Print or save checklist</button><button class="link light" onclick="go('cant')">I need to stop. That's okay.</button></div></div>`,

  cant: () => `${hdr('home')}<h2>That's okay. You haven't failed.</h2>
<p>Staying home today is allowed. If part of you still wants to try, let's make it ridiculously small.</p>
<button class="btn" onclick="tiny();go('mission')">Give me the smallest step</button>
<button class="btn alt" onclick="abandon()">Rest today</button>
<p class="soft sm" style="margin-top:14px">Tomorrow's first step can be even smaller.</p>`,

  reflect: () => {
    const sup = S.route === 'support', ta = (id, key, ph) => `<textarea id="${id}" placeholder="${ph || ''}" oninput="S.${key}=this.value">${esc(S[key])}</textarea>`;
    const hint = S.groups.filter(g => g.k === 'notice').flatMap(g => g.s).map(y => hs(y[0])[0])[0];
    const sm = (id, key, ph) => `<textarea class="sm-ta" id="${id}" placeholder="${esc(ph)}" oninput="S.${key}=this.value">${esc(S[key])}</textarea>`;
    const lookBack = `<h3 class="sec">Look back</h3><p class="soft sm">Try to remember it before you read anything else. Small details count, and recalling them trains your eye.</p>
<label class="q" for="sw">One thing you saw</label>${sm('sw', 'saw', 'e.g. a green door')}
<label class="q" for="en">One thing you enjoyed</label>${sm('en', 'enjoyed', 'e.g. the morning light')}
<label class="q" for="nt">One thing you noticed that you hadn't before</label>${sm('nt', 'noticed', hint ? 'Maybe: ' + hint.toLowerCase() : 'e.g. a sound, a colour, a small detail')}`;
    return `${hdr('go')}<h2>How was your outing?</h2><p class="soft sm">Only answer what you feel like answering. There are no wrong answers.</p>
${FEELINGS.map((f, i) => `<button class="tile opt ${S.feeling === f ? 'on' : ''}" data-k="f-${i}" aria-pressed="${S.feeling === f}" onclick="setFeel('${f}')">${f}</button>`).join('')}
${lookBack}
${sup ? `<label class="q" for="rx">What did you expect might happen?</label>${ta('rx', 'fear')}
<label class="q" for="rh">What actually happened?</label>${ta('rh', 'happened')}
<label class="q" for="rm">What would you like to remember next time?</label>${ta('rm', 'remember')}`
        : `<label class="q" for="rm">What's one thing you'd like to remember about today? <span class="soft">(optional)</span></label>${ta('rm', 'remember')}`}
<label class="q" for="pl">Where did you go? <span class="soft">(optional)</span></label><input type="text" id="pl" value="${esc(S.place)}" oninput="S.place=this.value">
<div class="dock"><button class="btn" onclick="finish()">Done</button></div>`;
  },

  reward: () => {
    const d = S.draft || {}, ack = (S.entry === 'explore' ? 'You stepped outside and spent time noticing the world around you.' : 'You stepped outside and took care of something you needed.') + " It doesn't have to be a big adventure to count.";
    return `<div class="fade"><div class="bloomwrap"><svg class="bloom" aria-hidden="true"><use href="#bloom"/></svg></div>
<h1 style="text-align:center">You made room for a real-world moment.</h1>
<p class="soft" style="text-align:center">${ack}</p>
${d.minutes ? `<p style="text-align:center"><b>${d.minutes} minute${d.minutes === 1 ? '' : 's'}</b> outside.</p>` : ''}
${(d.saw || d.enjoyed || d.noticed) ? `<div class="card"><b>Your look back</b><p class="sm" style="margin:6px 0 0">${d.saw ? '<b>Saw:</b> ' + esc(d.saw) + '<br>' : ''}${d.enjoyed ? '<b>Enjoyed:</b> ' + esc(d.enjoyed) + '<br>' : ''}${d.noticed ? '<b>Noticed:</b> ' + esc(d.noticed) : ''}</p></div>` : ''}
<div id="ai">${aiBlock()}</div>
<button class="btn" ${S.committed ? 'disabled' : ''} onclick="saveMoment()">${S.moment ? 'Saved to My moments' : 'Save this moment'}</button>
<button class="btn alt" onclick="commit(false);startPlanning()">Plan another outing</button>
<button class="link" onclick="commit(false);go('bye')">Done for today</button></div>`;
  },

  bye: () => `<div class="fade" style="text-align:center;padding-top:90px">${ic('leaf', 56)}<h1 style="margin-top:14px">That's enough for today.</h1><p class="soft">The best thing you can do now is put the phone down.</p><button class="btn" style="margin-top:26px" onclick="go('dashboard')">Back to my dashboard</button><button class="link" onclick="startPlanning()">Plan something else</button></div>`,

  progress: () => {
    const d = { week: 7, month: 30, all: 1e5 }[P], now = Date.now();
    const L = LOG.filter(e => (now - (e.ts || now)) < d * 864e5), mins = L.reduce((a, e) => a + (e.minutes || 0), 0);
    const places = new Set(L.map(e => (e.place || '').trim().toLowerCase()).filter(Boolean)).size, everyday = L.filter(e => EVERYDAY.includes(e.task)).length;
    return `<h2>My moments</h2><p class="soft sm">A private record of getting out and living. Just for you.</p>
<div class="tabs">${[['week', 'This week'], ['month', 'This month'], ['all', 'All time']].map(([k, l]) => `<button class="${P === k ? 'on' : ''}" aria-pressed="${P === k}" onclick="P='${k}';go('progress',1)">${l}</button>`).join('')}</div>
<div class="stats"><div class="card"><b>${L.length}</b><span>Outings</span></div><div class="card"><b>${mins}</b><span>Minutes outside</span></div><div class="card"><b>${places}</b><span>Places visited</span></div><div class="card"><b>${everyday}</b><span>Everyday tasks done</span></div><div class="card"><b>${L.filter(e => e.moment).length}</b><span>Moments saved</span></div><div class="card"><b>${L.filter(e => e.noticed).length}</b><span>Things noticed</span></div></div>
<h3 class="sec" style="margin-top:20px">Your moments</h3>
${L.length ? L.map(e => `<div class="card"><div class="sm soft">${new Date(e.ts).toLocaleDateString([], { month: 'short', day: 'numeric' })}${e.place ? ' · ' + esc(e.place) : ''}${e.moment ? ' · saved' : ''}</div><b>${esc(e.task)}</b>${e.feeling ? `<div class="sm soft">${esc(e.feeling)}</div>` : ''}${e.saw || e.enjoyed || e.noticed ? `<p class="sm" style="margin:8px 0 0">${e.saw ? '<b>Saw:</b> ' + esc(e.saw) + '<br>' : ''}${e.enjoyed ? '<b>Enjoyed:</b> ' + esc(e.enjoyed) + '<br>' : ''}${e.noticed ? '<b>Noticed:</b> ' + esc(e.noticed) : ''}</p>` : ''}${e.fear || e.happened || e.learned ? `<p class="sm" style="margin:8px 0 0">${e.fear ? '<b>Expected:</b> ' + esc(e.fear) + '<br>' : ''}${e.happened ? '<b>What happened:</b> ' + esc(e.happened) + '<br>' : ''}${e.learned ? '<b>Remember:</b> ' + esc(e.learned) : ''}</p>` : ''}</div>`).join('')
        : '<div class="card"><p style="margin:0" class="soft">Your first outing will appear here. It can be as small as a walk to the shop.</p></div>'}
<button class="btn" onclick="startPlanning()">Plan an outing</button>`;
  }
};

function go(v, keep) {
  if (typeof sb !== 'undefined' && sb && !USER && !PUBLIC_VIEWS.includes(v)) v = 'auth'; // never show app screens to a logged-out visitor
  const y = window.scrollY; S.v = v;
  const a = $('#app'), vt = !keep && document.startViewTransition && !reduced();
  const render = () => {
    a.innerHTML = V[v]() + (NAV_VIEWS.includes(v) ? navBar(v) : '');
    a.classList.toggle('hasnav', NAV_VIEWS.includes(v));
    document.title = (TITLES[v] || '') + ' · ' + BRAND.name;
    if (keep) window.scrollTo(0, y);
    else {
      window.scrollTo(0, 0);
      const h = a.querySelector('h1,h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      if (!vt) { a.classList.remove('enter'); void a.offsetWidth; a.classList.add('enter'); }
    }
  };
  if (vt) { const t = document.startViewTransition(render); t.ready.catch(() => { }); t.finished.catch(() => { }); t.updateCallbackDone.catch(() => { }); } else render();
  if (v === 'reward') buzz([20, 60, 20]);
  if (v === 'bye') clearSession(); else if (!NAV_VIEWS.includes(v)) persist();
}
