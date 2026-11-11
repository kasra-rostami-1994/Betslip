/* dlg.js: پنجره‌ها (ورود، ثبت/ویرایش بلیت، نتیجهٔ دستی، کش‌اوت، تطبیق بازی، تلگرام، پشتیبان) — دو زبانه */
const tok = () => [...crypto.getRandomValues(new Uint8Array(12))].map((x) => x.toString(16).padStart(2, '0')).join('');
const copy = (u) => (navigator.clipboard ? navigator.clipboard.writeText(u).then(() => toast(T('link_copied')), () => prompt('Link:', u)) : prompt('Link:', u));
const B = (id) => S.bets.find((b) => b.id === id) || S.trash.find((b) => b.id === id);
const visOpts = (v) => Object.entries(getVIS()).map(([k, t]) => `<option value="${k}"${v === k ? ' selected' : ''}>${t}</option>`).join('');
function setVis(b, v) { b.vis = v; if (v === 'private') delete b.share; else if (!b.share) b.share = tok(); }

function mountDialogs() {
  $('#dlg').innerHTML = `
  <dialog id="lg">
    <form id="lf">
      <h3 id="lt">${T('login_title')}</h3>
      <input id="un" placeholder="${T('username_ph')}" autocomplete="username" required>
      <input id="pw" type="password" placeholder="${T('pass_ph')}" autocomplete="current-password" required>
      <input id="iv" placeholder="${T('invite_ph')}" hidden>
      <div class="sm" style="color:var(--r)" id="le"></div>
      <button class="btn p">${CL === 'en' ? 'Continue' : 'ادامه'}</button>
      <button type="button" class="lnk" id="sw">${T('no_account')}</button>
    </form>
  </dialog>

  <dialog id="ad">
    <form onsubmit="return false">
      <h3 id="adt">${T('add_bet_title')}</h3>
      <div class="seg2" id="admode">
        <button type="button" data-m="p" class="on">${T('paste_mode')}</button>
        <button type="button" data-m="f">${T('form_mode')}</button>
        <button type="button" data-m="m">${T('line_mode')}</button>
      </div>
      <input id="nm" placeholder="${T('bet_name_ph')}">
      <div class="row">
        <input id="tgs" placeholder="${T('tags_ph')}">
        <select id="vs">${visOpts('private')}</select>
      </div>
      <input id="nt" placeholder="${T('note_ph')}">
      <div id="mf" class="row" hidden>
        <input id="sk" inputmode="decimal" placeholder="${T('stake_ph')}">
        <input id="od" inputmode="decimal" placeholder="${T('odds_ph')}">
        <input id="ch" inputmode="decimal" placeholder="${T('cashout_ph')}">
      </div>
      <div id="ff" hidden>
        <div class="row">
          <input id="fh" placeholder="${T('host_ph')}">
          <input id="fa" placeholder="${T('guest_ph')}">
          <input id="fo" inputmode="decimal" placeholder="${T('leg_odds_ph')}">
        </div>
        <div class="row">
          <select id="fc"></select>
          <input id="fv" placeholder="${T('manual_val')}">
          <button type="button" class="btn" id="fadd">${T('add_pick')}</button>
        </div>
        <div class="mut sm" id="fcur"></div>
        <button type="button" class="btn" id="fleg">${T('add_game')}</button>
        <div class="sm" id="flist"></div>
      </div>
      <textarea id="tx" rows="11"></textarea>
      <div class="sm mut" id="hint"></div>
      <div class="row">
        <button type="button" class="btn p" id="ok">${T('submit_bet')}</button>
        <button type="button" class="btn" id="cl">${T('close_btn')}</button>
      </div>
    </form>
  </dialog>

  <dialog id="ov">
    <form onsubmit="return false">
      <h3 id="ovt"></h3>
      <div id="ovplain">
        <div class="row">
          <input id="oh" inputmode="numeric" placeholder="${T('host_goals')}">
          <input id="oa" inputmode="numeric" placeholder="${T('guest_goals')}">
          <input id="om" inputmode="numeric" placeholder="${T('minute_opt')}">
        </div>
        <select id="os">
          <option value="live">${T('in_progress')}</option>
          <option value="fin">${T('finished')}</option>
        </select>
        <select id="ow" hidden>
          <option value="0">${T('final_winner')}</option>
          <option value="1">${T('host_qualified')}</option>
          <option value="2">${T('guest_qualified')}</option>
        </select>
      </div>
      <div id="ovsv" hidden></div>
      <div class="sm mut" id="ovsvh" hidden>${T('sv_hint')}</div>
      <div class="sm" style="color:var(--o)" id="ovh"></div>
      <div class="row">
        <button type="button" class="btn p" id="ovs">${T('save_result')}</button>
        <button type="button" class="btn" id="ovc">${T('clear_manual')}</button>
        <button type="button" class="btn" id="ovr">${T('clear_saved')}</button>
        <button type="button" class="lnk" id="ovx">${T('close_btn')}</button>
      </div>
    </form>
  </dialog>

  <dialog id="co">
    <form onsubmit="return false">
      <h3 id="cot"></h3>
      <input id="cov" inputmode="decimal" placeholder="${T('cashout_ph')}">
      <div id="cor" class="sm" style="line-height:2"></div>
      <button type="button" class="btn" id="cox">${T('close_btn')}</button>
    </form>
  </dialog>

  <dialog id="mp">
    <form onsubmit="return false">
      <h3 id="mt"></h3>
      <div class="sm mut">${T('map_hint')}</div>
      <input id="mq" placeholder="${T('search_teams')}">
      <div id="ml"></div>
      <button type="button" class="btn" id="mc">${T('close_btn')}</button>
    </form>
  </dialog>

  <dialog id="sg">
    <form onsubmit="return false">
      <h3>${T('tg_notify')}</h3>
      <div class="sm mut">${T('tg_hint')}</div>
      <input id="tt" type="password" placeholder="${T('tg_token')}">
      <input id="tc" placeholder="${T('tg_chat')}">
      <label class="sm"><input type="checkbox" id="ton"> ${T('enable_notif')}</label>
      <label class="sm"><input type="checkbox" id="tst"> ${T('kickoff_notif')}</label>
      <label class="sm"><input type="checkbox" id="tgl"> ${T('goal_notif')}</label>
      <label class="sm"><input type="checkbox" id="ten"> ${T('ft_notif')}</label>
      <select id="tsm">
        <option value="0">${T('sum_off')}</option>
        <option value="15">${T('sum_15')}</option>
        <option value="30">${T('sum_30')}</option>
        <option value="60">${T('sum_60')}</option>
      </select>
      <div class="sm mut" id="tlr"></div>
      <div class="sm" style="color:var(--o)" id="tmsg"></div>
      <div class="row">
        <button type="button" class="btn p" id="tsv">${T('tg_save')}</button>
        <button type="button" class="btn" id="tts">${T('tg_test')}</button>
        <button type="button" class="btn" id="trn">${T('tg_run')}</button>
        <button type="button" class="btn" id="thk">${T('tg_activate')}</button>
        <button type="button" class="lnk" id="tcl">${T('close_btn')}</button>
      </div>
    </form>
  </dialog>

  <dialog id="bk">
    <form onsubmit="return false">
      <h3>${T('backup_title')}</h3>
      <div class="sm mut">${T('backup_hint')}</div>
      <select id="bkd"></select>
      <div class="sm" id="bkm"></div>
      <div class="row">
        <button type="button" class="btn p" id="bkg">${T('restore_merge')}</button>
        <button type="button" class="lnk" id="bkx">${T('close_btn')}</button>
      </div>
    </form>
  </dialog>

  <input type="file" id="fi" accept="application/json,.json" hidden>
  <div class="bulk" id="bulk" hidden></div>`;

  $('#fc').innerHTML = '';
  CT.forEach((c) => $('#fc').add(new Option(CL === 'en' ? (c[2] || c[1]) : c[1], c[0])));
  bindDialogs();
}

/* ---- ورود ---- */
let SU = 0;
function showLogin() { const d = $('#lg'); if (!d.open) d.showModal(); }

/* ---- ویرایشگر بلیت ---- */
const ED = { edit: null, DL: [], CUR: [], EL: null, m: 'p' };
const tg = () => $('#tgs').value.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
function mkc(c, v) {
  v = v.trim(); if (!needV(c)) return c; if (!v) return null;
  if (c === 'S') return /^\d+-\d+$/.test(v) ? 'S' + v : null;
  if (!/^[+-]?[\d.]+$/.test(v)) return null;
  return c.startsWith('AH') ? c + (/^[+-]/.test(v) ? v : '+' + v) : c + v;
}
const fl = () => ({ home: $('#fh').value.trim() || (CL === 'en' ? 'Home' : 'میزبان'), away: $('#fa').value.trim() || (CL === 'en' ? 'Away' : 'میهمان') });
function flist() {
  $('#fcur').textContent = ED.CUR.length ? T('cur_picks') + ED.CUR.map((p) => (CL === 'en' ? pt1En(p, fl()) : Core.pt1(p, fl()))).join(' + ') : '';
  $('#flist').innerHTML = ED.DL.map((l, i) => `${i + 1}. ${esc(l.home)} – ${esc(l.away)}: ${esc(localPickTxt(l.pick, l))} (${l.odds}) <a href="#" data-e="${i}">${T('edit')}</a> · <a href="#" data-r="${i}">${T('delete')}</a>`).join('<br>');
}
function edMode(m) {
  ED.m = m;
  $$('#admode button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
  $('#mf').hidden = m === 'p'; $('#ff').hidden = m !== 'f'; $('#tx').hidden = m === 'f'; $('#admode').hidden = !!ED.edit;
  $('#nm').placeholder = m === 'p' ? (CL === 'en' ? 'Bet name (optional; empty = site name)' : 'نام بلیت (اختیاری؛ خالی = نام سایت شرط‌بندی)') : T('bet_name_ph');
  $('#hint').textContent = ED.edit
    ? (CL === 'en' ? 'Edit or delete games, or add new ones. Leave total odds empty to calculate from legs.' : 'بازی را «ویرایش» یا «حذف» کنید یا بازی تازه اضافه کنید. برای محاسبهٔ خودکار ضریب از روی بازی‌ها، فیلد ضریب کل را خالی بگذارید.')
    : m === 'f'
    ? (CL === 'en' ? 'For each game: enter team names, odds, and one or more picks, then click "Add Game to Bet".' : 'برای هر بازی: نام تیم‌ها، ضریب و یک یا چند شرط (ترکیبی) را بزنید، سپس «افزودن این بازی».')
    : m === 'm'
    ? (CL === 'en' ? 'Each line: Home - Away | Pick | Odds (e.g. O2.5, 1, X, BY, 1&O2.5 ...)' : 'هر خط: Home - Away | پیش‌بینی | ضریب (کدها: 1، X، 2، 1X، X2، O2.5، U3.5، BY، T3، S2-1، Q1، 1&O2.5 …)')
    : (CL === 'en' ? 'Paste bet slip text copied directly from the sportsbook; multiple consecutive bets supported.' : 'متن بلیت را همان‌طور که از سایت کپی کرده‌اید بچسبانید؛ چند بلیت پشت‌سرهم هم قبول است.');
}
function edReset() {
  ED.DL = []; ED.CUR = []; ED.EL = null;
  ['nm', 'sk', 'od', 'ch', 'tx', 'fh', 'fa', 'fo', 'fv', 'tgs', 'nt'].forEach((k) => ($('#' + k).value = ''));
  $('#vs').value = (S.prof && S.prof.dvis) || 'private';
  $('#adt').textContent = ED.edit ? T('edit_bet_title') : T('add_bet_title');
  $('#ok').textContent = ED.edit ? T('save_changes') : T('submit_bet');
  flist();
}
function openEditor(b) {
  ED.edit = b || null; edReset(); edMode(b ? 'f' : 'p');
  if (b) {
    ED.DL = b.legs.slice(); $('#nm').value = b.name; $('#sk').value = b.stake; $('#od').value = b.odds;
    $('#ch').value = b.cash == null ? '' : b.cash; $('#tgs').value = (b.tags || []).join(', ');
    $('#nt').value = b.note || ''; $('#vs').value = b.vis || 'private'; edMode('f'); flist();
  }
  $('#fc').onchange = () => ($('#fv').hidden = !needV($('#fc').value));
  $('#fc').onchange();
  $('#ad').showModal();
}
function mkBet(legs) {
  const odds = num($('#od').value) || +legs.reduce((p, l) => p * l.odds, 1).toFixed(2), stake = num($('#sk').value) || 1;
  return { name: $('#nm').value.trim() || 'multi ' + legs.length, stake, odds, win: +(stake * odds).toFixed(2), cash: $('#ch').value ? num($('#ch').value) : null, legs };
}
function edSave() {
  const H = (t) => { $('#hint').textContent = t; };
  if (ED.edit) {
    if (!ED.DL.length) return H(T('need_one_game'));
    const o = mkBet(ED.DL), b = ED.edit;
    Object.assign(b, { name: o.name, stake: o.stake, odds: o.odds, win: o.win, cash: o.cash, tags: tg(), note: $('#nt').value.trim(), legs: ED.DL });
    setVis(b, $('#vs').value);
    $('#ad').close(); save(); render(); liveFetch().then(render); return;
  }
  let Rs;
  if (ED.m === 'f') {
    if (!ED.DL.length) return H(T('need_game'));
    Rs = [mkBet(ED.DL)];
  } else if (ED.m === 'm') {
    Rs = [parseManual($('#tx').value, { name: $('#nm').value.trim(), stake: $('#sk').value, odds: $('#od').value })];
    if (Rs[0]) Rs[0].cash = $('#ch').value ? num($('#ch').value) : null;
  } else {
    const BB = /\(\s*(90\s*mins?|1st\s*half|first\s*half|2nd\s*half|second\s*half)\s*\)/i;
    Rs = $('#tx').value.split(/^\s*Active\s*$/mi).map((chunk) => (BB.test(chunk) ? parseBuilder(chunk) : parseBlock(chunk)));
  }
  const ok = Rs.filter(Boolean);
  if (!ok.length) return H(T('no_bets_parsed'));
  const wn = ok.map((b) => b._w).filter(Boolean);
  if (wn.length && !confirm('⚠ ' + wn.join('\n') + '\n\n' + (CL === 'en' ? 'Submit anyway?' : 'با همین حالت ثبت شود؟'))) return;
  const nm = $('#nm').value.trim(), now = Date.now();
  ok.forEach((b, i) => {
    delete b._w;
    if (nm && ED.m === 'p') b.name = ok.length > 1 ? nm + ' ' + (i + 1) : nm;
    Object.assign(b, { id: rid(), created: now + i, tags: tg(), note: $('#nt').value.trim() });
    setVis(b, $('#vs').value);
    S.bets.push(b);
  });
  $('#ad').close(); save(); render(); liveFetch().then(render); toast(ok.length + T('bet_added'));
}

/* ---- نتیجهٔ دستی، کش‌اوت، تطبیق بازی ---- */
let OV = null;
function openOv(b, i) {
  const l = b.legs[i]; OV = { l, b };
  $('#ovt').textContent = l.home + ' – ' + l.away; $('#ovh').textContent = '';
  const subs = l.pick.split('&'), manual = subs.filter((p) => Core.isManualOnly(p));
  OV.subs = manual;
  if (manual.length) {
    $('#ovplain').hidden = true; $('#ovsv').hidden = false; $('#ovsvh').hidden = false;
    $('#ovsv').innerHTML = manual.map((p, idx) => {
      const each = Core.isEach(p), mv = (l.sv || {})[p] || {};
      return `<div class="row" style="align-items:center">
        <span class="sm" style="flex:2">${esc(localPickTxt(p, l))}</span>
        <input data-sv="${idx}" data-f="h" inputmode="numeric" placeholder="${each ? T('host_ph') : T('manual_val')}" value="${mv.h ?? ''}">
        ${each ? `<input data-sv="${idx}" data-f="a" inputmode="numeric" placeholder="${T('guest_ph')}" value="${mv.a ?? ''}">` : ''}
        <label class="sm"><input type="checkbox" data-sv="${idx}" data-f="f"${mv.f ? ' checked' : ''}> ${T('final_chk')}</label>
      </div>`;
    }).join('');
  } else {
    $('#ovplain').hidden = false; $('#ovsv').hidden = true; $('#ovsvh').hidden = true; $('#ovsv').innerHTML = '';
    const o = l.ov || l.fin;
    $('#oh').value = o ? o.h : ''; $('#oa').value = o ? o.a : ''; $('#om').value = (l.ov && l.ov.m) || '';
    $('#os').value = (l.ov && l.ov.f) || (!l.ov && l.fin) ? 'fin' : 'live';
    $('#ow').hidden = !l.pick.includes('Q');
    $('#ow').value = (o && o.w) || 0;
  }
  $('#ov').showModal();
}

let CO = null;
function openCo(b) { CO = b; $('#cot').textContent = T('co_intro') + b.name; $('#cov').value = b.cash == null ? '' : b.cash; coCalc(); $('#co').showModal(); }
function coCalc() {
  const s = R.st.get(CO.id), pr = s.lost ? 0 : s.pr, win = CO.win * s.fa, o = num($('#cov').value), E = pr * win;
  if (CL === 'en') {
    $('#cor').innerHTML = `${T('est_win_prob')} <b>${(pr * 100).toFixed(1)}%</b> <span class="mut">${T('optimistic_note')}</span><br>
      ${T('hold_win')} <b>${nf(win)}</b> · ${T('hold_ev')} <b>${nf(E)}</b>` +
      (o > 0 ? `<br>${T('site_offer')} <b>${o}</b> · ${T('needed_prob')} <b>${win ? (o / win * 100).toFixed(1) : '—'}%</b><br>
      <b style="color:var(--${o >= E ? 'g' : 'o'})">${o >= E ? T('co_better') : T('hold_better')} (${T('diff')} ${nf(o - E)})</b><br>
      <span class="mut">${T('fin_guide')}</span>` : `<br><span class="mut">${T('enter_co')}</span>`);
  } else {
    $('#cor').innerHTML = `احتمال تقریبی برد: <b>${(pr * 100).toFixed(1)}%</b> (خوش‌بینانه؛ حاشیهٔ سایت لحاظ نشده)<br>برد در صورت نگه‌داشتن: <b>${nf(win)}</b> · ارزش مورد انتظار نگه‌داشتن: <b>${nf(E)}</b>` + (o > 0 ? `<br>پیشنهاد سایت: <b>${o}</b> · احتمال لازم برای ارزش نگه‌داشتن: <b>${win ? (o / win * 100).toFixed(1) : '—'}%</b><br><b style="color:var(--${o >= E ? 'g' : 'o'})">${o >= E ? 'کش‌اوت از ارزش مورد انتظارِ نگه‌داشتن بیشتر است' : 'نگه‌داشتن ارزش مورد انتظار بیشتری دارد'} (اختلاف ${nf(o - E)})</b><br><span class="mut">راهنمای تقریبی است، نه توصیهٔ مالی.</span>` : '<br><span class="mut">مبلغ پیشنهادی سایت را وارد کنید.</span>');
  }
}

let MP = null;
function openMap(l) { MP = { l, R: [] }; $('#mt').textContent = l.home + ' – ' + l.away; $('#mq').value = ''; mlist(); $('#mp').showModal(); }
function mlist() {
  const k = Core.fold($('#mq').value).trim() || Core.fold(MP.l.home).split(' ')[0];
  MP.R = S.LV.filter((e) => Core.fold(e.home + ' ' + e.away).includes(k)).slice(0, 30);
  $('#ml').innerHTML = MP.R.length ? MP.R.map((e, i) => {
    const comp = (e.cy ? lcy(e.cy) : '') + (e.cy && e.lg ? ' · ' : '') + (e.lg || '');
    return `<button type="button" class="btn" style="width:100%;margin:3px 0;text-align:start" data-i="${i}">
      ${esc(e.home)} – ${esc(e.away)}
      <span class="mut sm">${comp ? esc(comp) + ' · ' : ''}${Core.SN[e.s] || e.s} ${e.t ? fD(e.t) : ''}</span>
    </button>`;
  }).join('') : `<div class="mut sm">${T('no_match')}</div>`;
}

/* ---- ورود/خروجی JSON و پشتیبان ---- */
function importRecords(recs) {
  const have = new Set(allRecs().map((r) => r.id)), add = recs.filter((r) => r && r.id && Array.isArray(r.legs) && !have.has(r.id));
  if (!add.length) return toast(T('no_new_bets'));
  if (!confirm(T('confirm_bk_add').replace('%T', recs.length).replace('بلیت جدید', add.length + ' ' + (CL === 'en' ? 'new bets' : 'بلیت جدید')))) return;
  add.forEach((r) => (r.del ? S.trash : S.bets).push(r)); save(); render(); liveFetch().then(render); toast(add.length + T('added_count'));
}
function exportJson() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ version: 2, exported: Date.now(), bets: S.bets, trash: S.trash }, null, 1)], { type: 'application/json' }));
  a.download = 'betslip-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
}
async function openBackup() {
  const sel = $('#bkd'); sel.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    sel.add(new Option(d + (i ? '' : ' ' + T('today_label')), d));
  }
  $('#bkm').textContent = ''; $('#bk').showModal();
}
async function openTg() {
  try {
    const j = await api('/api/settings'); S.tg = j;
    $('#tc').value = j.chat || ''; $('#ton').checked = !!j.on; $('#tt').value = '';
    $('#tt').placeholder = j.hasToken ? T('tg_saved_token') : T('tg_token');
    $('#tst').checked = j.st !== false; $('#tgl').checked = j.gl !== false; $('#ten').checked = j.en !== false;
    $('#tsm').value = String(j.sum == null ? 15 : j.sum); $('#tmsg').textContent = '';
    const r = j.lastRes;
    $('#tlr').textContent = r
      ? `${CL === 'en' ? 'Last cron run: ' : 'آخرین اجرای زمان‌بند: '}${Math.round((Date.now() - r.at) / 6e4)} ${T('cron_last')}` + (r.err ? ' · ' + T('cron_err') + r.err : ` · ${T('cron_games')}${r.games} · ${T('cron_sent')}${r.sent}`)
      : T('no_cron');
    $('#sg').showModal();
  } catch (x) { toast((CL === 'en' ? 'Error: ' : 'خطا: ') + x.message); }
}

function bindDialogs() {
  $('#sw').onclick = () => {
    SU = !SU;
    $('#lt').textContent = SU ? T('signup_title') : T('login_title');
    $('#iv').hidden = !SU;
    $('#sw').textContent = SU ? T('have_account') : T('no_account');
  };
  $('#lf').onsubmit = async (e) => {
    e.preventDefault(); $('#le').textContent = '';
    try {
      const j = await api('/api/auth', { method: 'POST', body: { action: SU ? 'signup' : 'login', user: $('#un').value, pass: $('#pw').value, invite: $('#iv').value } });
      S.tok = j.token; S.me = j.user; ls.s('tok', j.token); ls.s('me', j.user);
      $('#pw').value = ''; $('#lg').close(); await boot();
    } catch (x) { $('#le').textContent = x.message; }
  };
  $$('#admode button').forEach((b) => (b.onclick = () => edMode(b.dataset.m)));
  $('#fadd').onclick = () => {
    const p = mkc($('#fc').value, $('#fv').value);
    if (!p) { $('#hint').textContent = T('invalid_pick'); return; }
    ED.CUR.push(p); $('#fv').value = ''; flist();
  };
  $('#fleg').onclick = () => {
    const o = num($('#fo').value), f = fl();
    if (!$('#fh').value.trim() || !$('#fa').value.trim() || !(o > 1) || !ED.CUR.length) {
      $('#hint').textContent = T('need_all_fields'); return;
    }
    const nl = { home: f.home, away: f.away, pick: ED.CUR.join('&'), odds: o };
    if (ED.EL && ED.EL.home === f.home && ED.EL.away === f.away) {
      ['ov', 'fin', 'map', 'lg', 'cy'].forEach((k) => { if (ED.EL[k]) nl[k] = ED.EL[k]; });
    }
    ED.EL = null; ED.DL.push(nl); ED.CUR = [];
    ['fh', 'fa', 'fo', 'fv'].forEach((k) => ($('#' + k).value = ''));
    flist();
  };
  $('#flist').addEventListener('click', (e) => {
    const a = e.target.closest('[data-r],[data-e]'); if (!a) return;
    e.preventDefault();
    if (a.dataset.r != null) ED.DL.splice(+a.dataset.r, 1);
    else {
      const l = ED.DL.splice(+a.dataset.e, 1)[0]; ED.EL = l;
      $('#fh').value = l.home; $('#fa').value = l.away; $('#fo').value = l.odds; ED.CUR = l.pick.split('&');
    }
    flist();
  });
  $('#ok').onclick = edSave; $('#cl').onclick = () => $('#ad').close();
  $('#ad').addEventListener('close', () => { ED.edit = null; });
  $('#ovs').onclick = () => {
    const l = OV.l;
    if (OV.subs && OV.subs.length) {
      l.sv = l.sv || {};
      for (const idx in OV.subs) {
        const p = OV.subs[idx], he = document.querySelector(`[data-sv="${idx}"][data-f="h"]`), ae = document.querySelector(`[data-sv="${idx}"][data-f="a"]`), fe = document.querySelector(`[data-sv="${idx}"][data-f="f"]`);
        const h = parseInt(he.value); if (!(h >= 0)) continue;
        l.sv[p] = { h, a: ae ? parseInt(ae.value) || 0 : 0, f: fe.checked ? 1 : 0, m: (l.sv[p] && l.sv[p].m) || 45 };
      }
      $('#ov').close(); save(); render(); return;
    }
    const h = parseInt($('#oh').value), a = parseInt($('#oa').value);
    if (!(h >= 0 && a >= 0)) { $('#ovh').textContent = T('enter_goals'); return; }
    const w = +$('#ow').value || 0;
    if ($('#os').value === 'fin') {
      l.ov = { h, a, f: 1, w };
      l.fin = { h, a, w, t: null, lg: l.lg || '', cy: l.cy || '' };
    } else {
      l.ov = { h, a, f: 0, m: parseInt($('#om').value) || 0 };
      delete l.fin;
    }
    $('#ov').close(); save(); render();
  };
  $('#ovc').onclick = () => { if (OV.subs && OV.subs.length) delete OV.l.sv; else delete OV.l.ov; $('#ov').close(); save(); render(); };
  $('#ovr').onclick = () => { if (OV.subs && OV.subs.length) delete OV.l.sv; else { delete OV.l.ov; delete OV.l.fin; } $('#ov').close(); save(); render(); };
  $('#ovx').onclick = () => $('#ov').close();
  $('#cov').oninput = coCalc; $('#cox').onclick = () => $('#co').close();
  $('#mq').oninput = mlist; $('#mc').onclick = () => $('#mp').close();
  $('#ml').onclick = (e) => {
    const b = e.target.closest('[data-i]'); if (!b) return;
    const E = MP.R[b.dataset.i];
    S.bets.forEach((x) => x.legs.forEach((l) => {
      if (l.home === MP.l.home && l.away === MP.l.away) {
        l.map = { h: E.home, a: E.away };
        if (E.lg) l.lg = E.lg;
        if (E.cy) l.cy = E.cy;
      }
    }));
    save(); $('#mp').close(); render();
  };
  $('#fi').onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const recs = Array.isArray(j) ? j : (j.bets || []).concat((j.trash || []).map((t) => t));
      if (!recs.length || recs.some((b) => !b || !Array.isArray(b.legs))) throw 0;
      importRecords(recs);
    } catch (x) { toast(T('invalid_json')); }
  };
  $('#bkx').onclick = () => $('#bk').close();
  $('#bkg').onclick = async () => {
    $('#bkm').textContent = T('fetching');
    try {
      const j = await api('/api/data?backup=' + $('#bkd').value);
      if (!j.records.length) { $('#bkm').textContent = T('no_backup'); return; }
      $('#bk').close(); importRecords(j.records);
    } catch (x) { $('#bkm').textContent = x.message; }
  };
  const sbody = (test) => ({ token: $('#tt').value, chat: $('#tc').value, on: $('#ton').checked, st: $('#tst').checked, gl: $('#tgl').checked, en: $('#ten').checked, sum: +$('#tsm').value, test });
  const tsend = async (test) => {
    try {
      const j = await api('/api/settings', { method: 'PUT', body: sbody(test) });
      S.tg = Object.assign(S.tg || {}, { on: $('#ton').checked, hasToken: true });
      $('#tmsg').textContent = test ? j.msg : (CL === 'en' ? 'Saved.' : 'ذخیره شد.');
    } catch (x) { $('#tmsg').textContent = x.message; }
  };
  $('#tsv').onclick = () => tsend(false);
  $('#tts').onclick = () => tsend(true);
  $('#tcl').onclick = () => $('#sg').close();
  $('#trn').onclick = async () => {
    $('#tmsg').textContent = CL === 'en' ? 'Running test…' : 'در حال اجرا…';
    try {
      await api('/api/settings', { method: 'PUT', body: sbody(false) });
      const j = await api('/api/notify?me=1');
      $('#tmsg').textContent = CL === 'en'
        ? `Events: ${j.events} · Active bet games: ${j.games} (Live: ${j.live}, Missing: ${j.missing}) · Sent: ${j.sent}`
        : `رویداد منابع: ${j.events} · بازی‌های بلیت‌های فعال: ${j.games} (زنده ${j.live}، پیدا‌نشده ${j.missing}) · پیام ارسال‌شده: ${j.sent}`;
    } catch (x) { $('#tmsg').textContent = x.message; }
  };
  $('#thk').onclick = async () => {
    $('#tmsg').textContent = CL === 'en' ? 'Activating…' : 'در حال فعال‌سازی…';
    try {
      const j = await api('/api/settings', { method: 'PUT', body: Object.assign(sbody(false), { hook: true, base: location.origin + BASE }) });
      $('#tmsg').textContent = j.msg;
    } catch (x) { $('#tmsg').textContent = x.message; }
  };
}
