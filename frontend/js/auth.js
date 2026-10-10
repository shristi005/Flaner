// Auth, profile screen, app boot
const sb = (window.TG_CONFIG && TG_CONFIG.SUPABASE_URL && !/YOUR/i.test(String(TG_CONFIG.SUPABASE_URL)) && window.supabase)
  ? supabase.createClient(TG_CONFIG.SUPABASE_URL, TG_CONFIG.SUPABASE_ANON_KEY) : null;
let USER = null, PROFILE = { display_name: '', comfort: 'steady', about: '' }, authMode = 'in';
let LID = null;
const LU = () => lsGet('flaner_local_users') || [];
function enterLocal(id) {
  const u = LU().find(x => x.id === id);
  if (!u) { go('who'); return Promise.resolve(); }
  LID = id; lsSet('flaner_local_active', id);
  DEMO_LOG = 'flaner_log_' + id; DEMO_PROF = 'flaner_prof_' + id; SKEY = 'flaner_session_' + id;
  USER = { email: u.name };
  PROFILE = lsGet(DEMO_PROF) || { display_name: u.name, comfort: 'steady', about: '' };
  return dbLoad().then(() => { reset(); go('dashboard'); });
}
function addLocal() {
  const n = $('#wn').value.trim();
  if (!n) { toast('Enter a name first'); return; }
  const id = 'u' + Date.now().toString(36), us = LU();
  if (!us.length) { const old = lsGet('flaner_demo_log'); if (old) lsSet('flaner_log_' + id, old); } // keep earlier demo data
  us.push({ id, name: n.slice(0, 30) }); lsSet('flaner_local_users', us);
  enterLocal(id);
}
function switchLocal() { lsSet('flaner_local_active', null); LID = null; LOG = []; reset(); go('who'); }
function deleteLocal() {
  if (!confirm('Delete everything saved for ' + USER.email + ' on this device? This cannot be undone.')) return;
  try { [DEMO_LOG, DEMO_PROF, SKEY].forEach(k => localStorage.removeItem(k)); } catch (e) { }
  lsSet('flaner_local_users', LU().filter(x => x.id !== LID));
  switchLocal();
}
const COMFORT = { gentle: 'Very small', steady: 'Small', bold: 'A bit bigger' };

Object.assign(V, {
  who: () => `<div class="splash"><svg class="lg" role="img" aria-label="${BRAND.name} logo"><use href="#logo"/></svg><h1>${BRAND.name}</h1><div class="tag">${BRAND.tag}</div></div>
    <h2 style="text-align:center">Who's walking today?</h2>
    ${LU().map(u => `<button class="tile" style="flex-direction:row;justify-content:flex-start;gap:12px;width:100%;margin-bottom:8px;min-height:56px;font-size:16px" onclick="enterLocal('${esc(u.id)}')">${ic('user', 20)}${esc(u.name)}</button>`).join('')}
    <label class="q" for="wn">${LU().length ? 'Add someone' : 'Your name'}</label><input type="text" id="wn" placeholder="First name" autocomplete="off" onkeydown="if(event.key==='Enter')addLocal()">
    <button class="btn" onclick="addLocal()">Continue ${ic('right', 18)}</button>
    <p class="sm soft" style="margin-top:14px">Each person's progress is kept separately on this device. This keeps things tidy, but it isn't a password: anyone using this browser could look at saved data.</p>`,
  setup: () => `<div class="splash"><svg class="lg"><use href="#logo"/></svg><h1>${BRAND.name}</h1><p>Almost there. Add your Supabase URL and anon key to <b>backend/.env</b> (or <b>frontend/js/config.js</b>), then reload.</p><p class="soft sm">See README.md for the 5 setup steps.</p></div>`,
  auth: () => `<div class="splash"><svg class="lg" role="img" aria-label="${BRAND.name} logo"><use href="#logo"/></svg>
    <h1>${BRAND.name}</h1><div class="tag">${BRAND.tag}</div><p class="soft">${BRAND.sub}</p><p class="def">${BRAND.def}</p></div>
    <label class="q" for="em" style="margin-top:0">Email</label><input type="email" id="em" autocomplete="email" inputmode="email">
    <label class="q" for="pw">Password</label><input type="password" id="pw" autocomplete="${authMode === 'in' ? 'current-password' : 'new-password'}" onkeydown="if(event.key==='Enter')doAuth()">${authMode === 'up' ? '<p class="sm soft" style="margin:6px 0 0">At least 8 characters.</p>' : ''}
    <p class="err sm" id="am" role="alert"></p>
    <button class="btn" style="margin-top:0" onclick="doAuth()">${authMode === 'in' ? 'Log in' : 'Create account'}</button>
    <button class="link" onclick="authMode=authMode==='in'?'up':'in';go('auth')">${authMode === 'in' ? 'New here? Create an account' : 'Have an account? Log in'}</button>${authMode === 'in' ? '<button class="link" onclick="go(\'forgot\')">Forgot your password?</button>' : ''}`,
  forgot: () => `${hdr('auth')}<h2>Reset your password</h2><p class="soft">Enter your email and we'll send a link to choose a new one.</p>
    <label class="q" for="fe">Email</label><input type="email" id="fe" autocomplete="email" inputmode="email" onkeydown="if(event.key==='Enter')sendReset()">
    <p class="err sm" id="fm" role="alert"></p>
    <button class="btn" style="margin-top:0" onclick="sendReset()">Send reset link</button>`,
  recover: () => `<div class="splash"><svg class="lg"><use href="#logo"/></svg></div><h2 style="text-align:center">Choose a new password</h2>
    <label class="q" for="np">New password</label><input type="password" id="np" autocomplete="new-password" onkeydown="if(event.key==='Enter')setNewPassword()">
    <p class="sm soft" style="margin:6px 0 0">At least 8 characters.</p><p class="err sm" id="nm" role="alert"></p>
    <button class="btn" style="margin-top:0" onclick="setNewPassword()">Save new password</button>`,
  profile: () => `<h2>Your profile</h2><p class="soft sm">${esc(USER.email)}</p>
    <label class="q" for="pn">What should I call you?</label><input type="text" id="pn" value="${esc(PROFILE.display_name || '')}">
    <label class="q" for="pc">How big should my steps be?</label>
    <select id="pc">${Object.entries(COMFORT).map(([k, v]) => `<option value="${k}" ${PROFILE.comfort === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <label class="q" for="pa">Anything that helps me help you?</label>
    <textarea id="pa" placeholder="e.g. I live near a park. Evenings are easier.">${esc(PROFILE.about || '')}</textarea>
    <p class="sm soft" style="margin-top:14px">${LOG.length} outing${LOG.length === 1 ? '' : 's'} so far</p>
    <button class="btn" style="margin-top:0" onclick="saveProfile()">Save profile</button><p class="sm soft" id="pm"></p>
    ${sb ? '<button class="btn alt" onclick="sb.auth.signOut()">Log out</button><button class="link" style="color:#B3402A" onclick="deleteAccount()">Delete my account and data</button>' : '<button class="btn alt" onclick="switchLocal()">Switch person</button><button class="link" style="color:#B3402A" onclick="deleteLocal()">Delete my data on this device</button><p class="sm soft" style="text-align:center">Local mode: your data stays on this device.</p>'}`
});

async function doAuth() {
  const email = $('#em').value.trim(), password = $('#pw').value;
  $('#am').textContent = '';
  if (!email || !password) { $('#am').textContent = 'Enter your email and password.'; return; }
  if (authMode === 'up' && password.length < 8) { $('#am').textContent = 'Use at least 8 characters.'; return; }
  const btn = document.querySelector('.btn'), old = btn.textContent; btn.disabled = true; btn.textContent = 'Please wait...';
  const { data, error } = authMode === 'in'
    ? await sb.auth.signInWithPassword({ email, password })
    : await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin, data: { display_name: email.split('@')[0] } } });
  if (error) { $('#am').textContent = error.message; btn.disabled = false; btn.textContent = old; return; }
  if (data.session) { USER = data.user; await enter(); }
  else { $('#am').textContent = 'Check your email to confirm your account, then log in.'; btn.disabled = false; btn.textContent = old; }
}
async function sendReset() {
  const email = $('#fe').value.trim();
  if (!email) { $('#fm').textContent = 'Enter your email.'; return; }
  await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
  toast('If that email has an account, a reset link is on its way.'); go('auth');
}
async function setNewPassword() {
  const password = $('#np').value;
  if (password.length < 8) { $('#nm').textContent = 'Use at least 8 characters.'; return; }
  const { error } = await sb.auth.updateUser({ password });
  if (error) { $('#nm').textContent = error.message; return; }
  try { history.replaceState(null, '', location.pathname); } catch (e) { }
  const { data } = await sb.auth.getSession(); USER = data.session.user;
  toast('Password updated'); await enter();
}
async function deleteAccount() {
  if (!confirm('Delete your account and everything saved in it? This cannot be undone.')) return;
  try {
    const r = await fetch((TG_CONFIG.API_URL || '') + '/api/account', { method: 'DELETE', headers: await authHeaders() });
    if (r.status === 501) { // server has no admin key: remove the data this user is allowed to delete
      await sb.from('missions').delete().eq('user_id', USER.id);
      await sb.from('profiles').delete().eq('id', USER.id);
      toast('Your saved data was deleted.');
    } else if (!r.ok) throw new Error(await r.text());
    else toast('Your account was deleted.');
    await sb.auth.signOut();
  } catch (e) { console.warn(e); toast("Couldn't delete right now. Try again."); }
}
async function enter() {
  SKEY = 'flaner_session_' + USER.id; // one saved mission per account
  const { data } = await sb.from('profiles').select('*').eq('id', USER.id).maybeSingle();
  if (data) PROFILE = data;
  await flushOutbox();
  await dbLoad();
  reset(); go('dashboard');
}
(async () => {
  if (!sb) {
    if (window.TG_CONFIG && TG_CONFIG.LOCAL_MODE) { // dev only: no login, data stays in this browser
      const act = lsGet('flaner_local_active');
      if (act && LU().some(u => u.id === act)) await enterLocal(act); else go('who');
      return;
    }
    go('setup'); return; // login is required, so no Supabase keys means no app
  }
  sb.auth.onAuthStateChange(ev => {
    if (ev === 'PASSWORD_RECOVERY') { go('recover'); return; }
    if (ev === 'SIGNED_OUT') { clearSession(); SKEY = 'flaner_session'; USER = null; LOG = []; PROFILE = { display_name: '', comfort: 'steady', about: '' }; reset(); go('auth'); }
  });
  const rec = /type=recovery/.test(location.hash);
  const { data } = await sb.auth.getSession();
  if (rec && data.session) { USER = data.session.user; go('recover'); return; }
  if (data.session) { USER = data.session.user; await enter(); } else go('auth');
})();
