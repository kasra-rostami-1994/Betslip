/* ui.js: نماها (بلیت‌ها، ریسک، تاریخچه، سطل، رتبه‌بندی، پروفایل) — چندزبانه و نمایش کشور/لیگ/تورنمنت */
const U = {
  tab: 'bets', sort: ls.g('srt') || 'risk', tag: '', q: '', cls: '', fil: null,
  sel: null, open: new Set(), range: ls.g('rng') || '30', gran: 'auto',
  hres: '', hrange: 'all', pubBets: null, board: null, rank: null, pu: null, share: null
};
try { JSON.parse(ls.g('open') || '[]').forEach((i) => U.open.add(i)); } catch (e) {}

let R = { st: new Map(), now: Date.now() };
const CLR = { wr: 'r', near: 'o', ok: 'b', wait: 'n', won: 'g', lost: 'r' };
const getVIS = () => ({ private: T('vis_private'), link: T('vis_link'), public: T('vis_public') });

const tm = (t) => (t ? new Date(t).toLocaleTimeString(CL === 'en' ? 'en-US' : 'fa-IR-u-nu-latn', { hour: '2-digit', minute: '2-digit', hour12: false }) : '');
const lnk = (t) => location.origin + BASE + '/?s=' + t;
const pft = (b) => (b.res === 'won' ? b.stake * b.odds - b.stake : -b.stake);
const stt = (x) => (x.st === 'post' ? (x.aet ? T('end_90') : T('end_ft')) : x.over ? T('over_time') : esc(x.clk || (CL === 'en' ? 'Live' : 'زنده')));
const tagsH = (b) => (b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');

/* ---- محاسبه، ذخیرهٔ نتیجهٔ نهایی بازی‌ها و بایگانی خودکارِ باخت قطعی ---- */
function compute() {
  const now = Date.now(); R = { st: new Map(), now, auto: 0 }; let ch = 0;
  for (const b of S.bets) {
    const s = Core.betState(b, S.LV, now); R.st.set(b.id, s);
    if (b.arch || !S.tok) continue;
    s.L.forEach((z) => {
      const x = z.x, l = z.l;
      if (x && x.st === 'post' && !x.man && !x.fin && !l.fin && !l.ov && x.t && x.t < now) {
        l.fin = { h: x.h, a: x.a, w: x.w || 0, t: x.t.toISOString(), lg: x.lg || '', cy: x.cy || '' };
        ch = 1;
      }
      if (x && x.lg && !l.lg) { l.lg = x.lg; ch = 1; }
      if (x && x.cy && !l.cy) { l.cy = x.cy; ch = 1; }
    });
    if (s.finLoss && !b.keep) { b.arch = now; b.sett = now; b.res = 'lost'; b.auto = 1; ch = 1; R.auto++; }
  }
  if (ch) save();
}

/* ---- ردیف بازی (شامل لیگ، کشور و تورنمنت) ---- */
function legRow(z, b, mode, i) {
  const x = z.x, l = z.l, pub = mode === 'pub', live = x && x.st === 'in';
  const sc = x && x.st !== 'pre'
    ? `<b>${x.h}–${x.a}</b><small>${stt(x)}</small>`
    : `<b>–</b><small>${x ? (x.pp ? T('postponed') : x.t ? fDM(x.t) + ' · ' + tm(x.t) : '') : S.at ? T('not_in_sources') : '…'}</small>`;
  const nm = x && x.src ? x.src[0][0] : '';
  const bd = x && x.man ? `<small>${T('source_manual')}</small>` : x && x.fin ? `<small>${T('source_saved')}</small>` : x && x.src ? (x.cf ? `<small class="w">${T('conflict_txt')} ` + x.src.map((q) => esc(q[0]) + ' ' + q[1]).join(' | ') + '</small>' : `<small class="${nm.includes('+') ? 'v' : ''}">${nm.includes('+') ? '✓ ' : ''}${esc(nm)}</small>`) : '';
  const lk = pub ? '' : !x && S.at && !l.ov && !l.fin ? `<a href="#" data-a="map" data-id="${b.id}" data-l="${i}">${T('select_game')}</a>` : x && x.man && x.st === 'in' ? `<a href="#" data-a="ov" data-id="${b.id}" data-l="${i}">${T('set_final')}</a>` : '';
  const g = x && x.goals && x.goals.length ? `<div class="gl">${x.goals.map((q) => '⚽ ' + esc(q.m) + ' ' + esc(q.n) + (q.f ? ' (' + q.f + ')' : '')).join(' · ')}</div>` : '';

  // استخراج کشور، لیگ و تورنمنت
  const cyRaw = (x && x.cy) || l.cy || (l.fin && l.fin.cy) || '';
  const lgRaw = (x && x.lg) || l.lg || (l.fin && l.fin.lg) || '';
  const cyNamed = cyRaw ? lcy(cyRaw) : '';
  const compInfo = (cyNamed && lgRaw) ? `${cyNamed} · ${lgRaw}` : (cyNamed || lgRaw);

  return `<div class="leg${U.fil && U.fil.g === Core.gk(l) ? ' hl' : ''}">
    <i class="mk c-${z.c}${live ? ' live' : ''}"></i>
    <div>
      <div class="t">${esc(l.home)} – ${esc(l.away)}</div>
      ${compInfo ? `<div class="leg-hint">${esc(compInfo)}</div>` : ''}
      <div class="s">${esc(localPickTxt(l.pick, l))}${l.odds ? ' · ' + (+l.odds).toFixed(2) : ''}${localLbl(l.pick, x)}</div>
      ${g}
    </div>
    <div class="sc"${pub ? '' : ` data-a="ov" data-id="${b.id}" data-l="${i}" tabindex="0" role="button" title="${esc(x && x.ref ? (CL === 'en' ? 'Matched with: ' : 'تطبیق با: ') + x.ref : (CL === 'en' ? 'Manual Result Entry' : 'ورود دستی نتیجه'))}"`}>
      ${sc}${bd}${lk}
    </div>
  </div>`;
}

function betRow(b, s, mode) {
  const pub = mode === 'pub', hist = mode === 'hist', open = pub || U.open.has(b.id), id = b.id;
  const col = hist ? (b.res === 'won' ? 'g' : b.res === 'lost' ? 'r' : 'n') : CLR[s.cls];
  const chip = hist
    ? (b.res === 'won' ? T('won_chip') : b.res === 'lost' ? T('lost_chip') : T('no_result'))
    : s.cls === 'wr'
    ? s.wr + ' ' + T('cls_wr')
    : T('cls_' + s.cls) + (s.live && s.cls !== 'wr' && s.cls !== 'lost' ? ' · ' + s.live + ' ' + (CL === 'en' ? 'live' : 'زنده') : '');
  const L = s.L.map((z, i) => ({ ...z, i })).sort((p, q) => (p.x && p.x.st === 'in' ? 0 : 1) - (q.x && q.x.st === 'in' ? 0 : 1) || (p.x && p.x.t ? +p.x.t : 8e15) - (q.x && q.x.t ? +q.x.t : 8e15));
  const ts = L.map((z) => z.x && z.x.t && +z.x.t).filter(Boolean), d1 = ts.length ? Math.min(...ts) : 0, d2 = ts.length ? Math.max(...ts) : 0;
  const dates = (pub ? '' : `${T('created')} ${fD(b.created)}`) + (d1 ? `${pub ? '' : ' · '}${T('matches')} ${fD(d1)}${fD(d1) !== fD(d2) ? (CL === 'en' ? ' to ' : ' تا ') + fD(d2) : ''}` : '') + (b.arch && !pub ? ` · ${hist ? T('settlement') : T('archived')} ${fD(b.sett || b.arch)}` : '');
  const pr = s.lost ? 0 : s.pr, ck = U.sel && !pub ? `<input type="checkbox" class="ck" data-a="ck" data-id="${id}"${U.sel.has(id) ? ' checked' : ''} aria-label="${T('selected')}">` : '';
  const money = pub ? '' : hist
    ? `<span>${T('stake')} <b>${nf(b.stake)}</b></span>${b.res ? `<span style="color:${clrP(pft(b))}">${T('pnl')} <b style="color:inherit">${sgn(pft(b))}</b></span>` : ''}`
    : `<span>${T('stake')} <b>${nf(b.stake)}</b></span><span>${T('win')} <b>${nf(b.win * (s.fa || 1))}</b></span>${b.cash != null ? `<span>${T('cash')} <b>${b.cash}</b></span>` : ''}`;
  const visMap = getVIS();
  const acts = pub ? '' : `<div class="acts">
    <button class="lnk" data-a="ed" data-id="${id}">${T('edit')}</button>
    ${hist ? '' : `<button class="lnk" data-a="co" data-id="${id}">${T('cashout_btn')}</button>`}
    <select data-a="vis" data-id="${id}" title="${T('default_vis')}">
      ${Object.entries(visMap).map(([k, v]) => `<option value="${k}"${(b.vis || 'private') === k ? ' selected' : ''}>${v}</option>`).join('')}
    </select>
    ${b.share ? `<button class="lnk" data-a="sh" data-id="${id}">${T('copy_link')}</button>` : ''}
    <span style="flex:1"></span>
    <button class="lnk" data-a="${hist ? 'un' : 'ar'}" data-id="${id}">${hist ? T('restore_active') : T('archive')}</button>
    <button class="lnk d" data-a="del" data-id="${id}">${T('delete')}</button>
  </div>`;

  return `<article class="bet${pub ? ' pub' : ''}" style="--c:var(--${col})">
    <div class="bh" data-a="tog" data-id="${id}">
      <h3>${ck}${esc(b.name)}${pub ? '' : tagsH(b)}${b.auto && !pub ? `<span class="tag" title="${T('auto_arch')}">${T('auto_arch')}</span>` : ''}${b.vis && b.vis !== 'private' && !pub ? `<span class="tag">${b.vis === 'public' ? T('vis_pub_tag') : T('vis_link_tag')}</span>` : ''}</h3>
      <div class="num">×${nf(b.odds)}</div>
      <div class="meta">
        <span class="tag c" style="--c:var(--${col})">${chip}</span>
        <span>${L.length} ${T('games')}</span>
        <span><b style="color:var(--g)">${s.cnt.g}</b> ${T('correct')}</span>
        ${s.cnt.b ? `<span><b style="color:var(--b)">${s.cnt.b}</b> ${T('on_track')}</span>` : ''}
        ${s.cnt.o ? `<span><b style="color:var(--o)">${s.cnt.o}</b> ${T('close_pick')}</span>` : ''}
        ${s.cnt.r ? `<span><b style="color:var(--r)">${s.cnt.r}</b> ${T('wrong')}</span>` : ''}
        ${hist ? '' : `<span>${T('prob')}<b>${pct(pr)}</b></span>`}
      </div>
      <div class="meta" style="justify-content:flex-end">${money}</div>
    </div>
    <div class="meta">${dates}</div>
    <div class="seg">${['g', 'b', 'o', 'r', 'n'].map((k) => `<i style="flex:${s.cnt[k]};--c:var(--${k})"></i>`).join('')}</div>
    ${b.note && !pub ? `<div class="meta" style="margin-top:6px">📝 ${esc(b.note)}</div>` : ''}
    ${open ? `<div class="legs">${L.map((z) => legRow(z, b, mode, z.i)).join('')}</div>${acts}` : ''}
  </article>`;
}

const pct = (p) => (p > 0 && p < 0.01 ? '<1%' : Math.round(p * 100) + '%');

/* ---- فیلتر و مرتب‌سازی ---- */
const matchQ = (b, q) => {
  q = q.trim().toLowerCase();
  return !q || (b.name + ' ' + (b.tags || []).join(' ') + ' ' + (b.note || '') + ' ' + b.legs.map((l) => l.home + ' ' + l.away + ' ' + (l.lg || '') + ' ' + (l.cy || '')).join(' ')).toLowerCase().includes(q);
};
const filt = (a) => a.filter((b) => matchQ(b, U.q)).filter((b) => !U.tag || (b.tags || []).includes(U.tag)).filter((b) => !U.fil || (U.fil.g ? b.legs.some((l) => Core.gk(l) === U.fil.g) : b.id === U.fil.b));
const SORTS = { risk: (a, b) => R.st.get(b.id).risk - R.st.get(a.id).risk || b.win - a.win, new: (a, b) => b.created - a.created, old: (a, b) => a.created - b.created, odds: (a, b) => b.odds - a.odds, win: (a, b) => b.win - a.win };

const tagOpts = () => {
  const T_list = [...new Set(S.bets.flatMap((b) => b.tags || []))].sort();
  if (U.tag && !T_list.includes(U.tag)) U.tag = '';
  return T_list.length ? `<select data-a="tag"><option value="">${T('all_tags')}</option>${T_list.map((t) => `<option${t === U.tag ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>` : '';
};

const toolbar = (hist) => `<div class="bar">
  <input data-a="q" placeholder="${T('search_ph')}" value="${esc(U.q)}" style="flex:1;min-width:160px">
  ${hist ? `
    <select data-a="hres">${[['', T('all_results')], ['won', T('winners')], ['lost', T('losers')]].map(([k, v]) => `<option value="${k}"${U.hres === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
    <select data-a="hrange">${[['all', T('all_time')], ['7', T('last_7')], ['30', T('last_30')], ['90', T('last_90')], ['180', T('last_180')]].map(([k, v]) => `<option value="${k}"${U.hrange === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
  ` : `
    <select data-a="sort">${[['risk', T('sort_risk')], ['new', T('sort_new')], ['old', T('sort_old')], ['odds', T('sort_odds')], ['win', T('sort_win')]].map(([k, v]) => `<option value="${k}"${U.sort === k ? ' selected' : ''}>${v}</option>`).join('')}</select>
  `}
  ${tagOpts()}
  <button class="btn" data-a="sel">${U.sel ? T('end_group') : T('group_sel')}</button>
</div>`;

const filBar = () => (U.fil ? `<div class="fil"><span>${T('filter_label')} <b>${esc(U.fil.n)}</b></span><button class="lnk" data-a="nf">${T('clear_filter')}</button></div>` : '');

/* ---- بلیت‌های فعال ---- */
function vBets() {
  const act = S.bets.filter((b) => !b.arch), sts = act.map((b) => R.st.get(b.id)), C_cnt = {}, G = new Map();
  sts.forEach((s) => { C_cnt[s.cls] = (C_cnt[s.cls] || 0) + 1; s.L.forEach((z) => G.set(Core.gk(z.l), z.x)); });
  const live = [...G.values()].filter((x) => x && x.st === 'in').length, ok = sts.filter((s) => !s.lost);
  return `<div class="strip">
    ${kp(act.length, T('active_bets'))}
    ${kp(live, T('live_games'))}
    ${kp(nf(ok.reduce((s, x) => s + +x.b.stake, 0)), T('stake_live'))}
    ${kp(nf(ok.reduce((s, x) => s + x.b.win * x.fa, 0)), T('win_if_all'))}
  </div>
  <div class="bar">
    ${['wr', 'near', 'ok', 'wait', 'won', 'lost'].filter((k) => C_cnt[k]).map((k) => `<button class="pill${U.cls === k ? ' on' : ''}" data-a="cls" data-v="${k}"><i class="mk c-${CLR[k]}"></i>${T('cls_' + k)} <em>${C_cnt[k]}</em></button>`).join('')}
  </div>
  ${toolbar(0)}
  <div id="list">${listBets()}</div>`;
}

function listBets() {
  const a = filt(S.bets.filter((b) => !b.arch)).filter((b) => !U.cls || R.st.get(b.id).cls === U.cls).sort(SORTS[U.sort] || SORTS.risk);
  return filBar() + (a.length ? a.map((b) => betRow(b, R.st.get(b.id), 'act')).join('') : `<div class="empty">${S.bets.some((b) => !b.arch) ? T('no_filter') : T('no_active') + `<br><br><button class="btn p" data-a="add">${T('add_first')}</button>`}</div>`);
}

/* ---- تاریخچه ---- */
function listHist() {
  const lim = U.hrange === 'all' ? 0 : Date.now() - +U.hrange * 864e5;
  const a = filt(S.bets.filter((b) => b.arch)).filter((b) => !U.hres || b.res === U.hres).filter((b) => (b.sett || b.arch) >= lim).sort((p, q) => (q.sett || q.arch) - (p.sett || p.arch));
  const sm = Core.summary(a);
  return `<div class="strip">
    ${kp(a.length, T('games'))}
    ${kp(sm.won, T('won_chip'), 'var(--g)')}
    ${kp(sm.lost, T('lost_chip'), 'var(--r)')}
    ${kp(sgn(sm.profit), T('pnl'), clrP(sm.profit))}
  </div>` + filBar() + (a.length ? a.map((b) => betRow(b, R.st.get(b.id), 'hist')).join('') : `<div class="empty">${T('no_hist')}</div>`);
}
const vHist = () => toolbar(1) + `<div id="list">${listHist()}</div>`;

/* ---- ریسک مشترک (با ذکر لیگ و کشور) ---- */
const TL_MAP = () => ({ 5: [T('tl_critical'), 'r'], 4: [T('tl_close'), 'o'], 3: [T('tl_wait'), 'n'], 2: [T('tl_ok'), 'b'], 1: [T('tl_done'), 'g'] });
const lvTxt = (x) => (!x ? '' : x.st === 'pre' ? (x.t ? tm(x.t) : '') : x.h + '–' + x.a + ' · ' + (x.st === 'post' ? T('end_ft') : x.over ? '90' : x.min ? x.min + "'" : (CL === 'en' ? 'Live' : 'زنده')));

function vRisk() {
  const G = new Map(), now = Date.now(), tlMap = TL_MAP();
  S.bets.filter((b) => !b.arch).forEach((b) => {
    const s = R.st.get(b.id); if (s.lost) return;
    s.L.forEach((z) => {
      const k = Core.gk(z.l);
      if (!G.has(k)) G.set(k, { l: z.l, x: z.x, k, rows: [] });
      G.get(k).rows.push({ b, z });
    });
  });
  const A = [...G.values()].map((g) => {
    const rs = g.rows, t = rs.some((r) => r.z.c === 'r') ? 5 : rs.some((r) => r.z.c === 'o') ? 4 : rs.some((r) => r.z.c === 'n') ? 3 : rs.some((r) => r.z.c === 'b') ? 2 : 1;
    const op = rs.filter((r) => r.z.c !== 'g'), x = g.x;
    return { g, x, t, ns: !x || x.st === 'pre' ? 1 : 0, n: op.length, pot: op.reduce((s, r) => s + (+r.b.win || 0), 0), el: x && x.st === 'in' ? (x.over ? 90 : x.min || 45) : 0, ko: x && x.t ? x.t - now : 9e15 };
  }).sort((p, q) => p.ns - q.ns || (p.ns ? p.ko - q.ko || q.pot - p.pot : q.t - p.t || q.pot - p.pot || q.el - p.el));

  if (!A.length) return `<div class="empty">${T('no_active')}</div>`;

  return `<div class="strip">
    ${kp(A.filter((a) => a.t === 5).length, T('critical_games'))}
    ${kp(A.filter((a) => a.t === 4).length, T('close_games'))}
    ${kp(A.filter((a) => !a.ns).length, T('started'))}
    ${kp(A.filter((a) => a.ns).length, T('not_started'))}
  </div>` + A.map((a) => {
    const c = tlMap[a.t];
    const cyRaw = (a.x && a.x.cy) || a.g.l.cy || '';
    const lgRaw = (a.x && a.x.lg) || a.g.l.lg || '';
    const cyNamed = cyRaw ? lcy(cyRaw) : '';
    const compInfo = (cyNamed && lgRaw) ? `${cyNamed} · ${lgRaw}` : (cyNamed || lgRaw);

    return `<article class="bet" style="--c:var(--${c[1]})">
      <div class="bh" data-a="fg" data-v="${esc(a.g.k)}" data-n="${esc(a.g.l.home + ' – ' + a.g.l.away)}" title="${CL === 'en' ? 'Show bets with this match' : 'نمایش بلیت‌های شامل این بازی'}">
        <h3>
          <span class="ltr">${esc(a.g.l.home)} – ${esc(a.g.l.away)}</span>
          ${a.x ? ` <span style="color:var(--${c[1]})">(${lvTxt(a.x)})</span>` : ''}
          ${compInfo ? `<span class="leg-hint" style="display:inline-block;margin-inline-start:6px">(${esc(compInfo)})</span>` : ''}
        </h3>
        <span class="tag c" style="--c:var(--${c[1]})">${c[0]}</span>
      </div>
      <div class="meta">${a.n} ${T('bets_at_risk')} · ${T('potential_win')} <b>${nf(a.pot)}</b> USDT</div>
      <div class="legs">${a.g.rows.map((r) => `<div class="leg" data-a="fb" data-v="${r.b.id}" data-n="${esc(r.b.name)}" style="cursor:pointer">
        <i class="mk c-${r.z.c}"></i>
        <div>
          <div class="t" style="text-align:start">${esc(r.b.name)} <span class="mut sm">×${nf(r.b.odds)}</span> ${tagsH(r.b)}</div>
          <div class="s">${esc(localPickTxt(r.z.l.pick, r.z.l))}${r.z.l.odds ? ' · ' + (+r.z.l.odds).toFixed(2) : ''}${r.b.note ? ' · 📝 ' + esc(r.b.note) : ''}</div>
        </div>
        <span></span>
      </div>`).join('')}</div>
    </article>`;
  }).join('');
}

/* ---- سطل زباله ---- */
function vTrash() {
  const T_recs = S.trash.slice().sort((a, b) => b.del - a.del);
  return `<div class="bar">
    <h2 style="font-size:22px">${T('trash_title')}</h2>
    <span class="sp"></span>
    ${T_recs.length ? `<button class="btn" data-a="emp">${T('empty_trash')}</button>` : ''}
  </div>
  <div class="mut sm" style="margin-bottom:10px">${T('trash_30days')}</div>` +
  (T_recs.length ? T_recs.map((b) => {
    const d = Math.floor((Date.now() - b.del) / 864e5);
    return `<article class="bet" style="--c:var(--n)">
      <div class="bh" style="cursor:default">
        <h3>${esc(b.name)}</h3>
        <div class="num">×${nf(b.odds)}</div>
        <div class="meta">${b.legs.length} ${T('games')} · ${d} ${T('trash_days_removed')} · ${30 - d} ${T('days_to_remove')}</div>
      </div>
      <div class="acts">
        <button class="lnk" data-a="rs" data-id="${b.id}">${T('trash_restore')}</button>
        <button class="lnk d" data-a="pd" data-id="${b.id}">${T('trash_perm')}</button>
      </div>
    </article>`;
  }).join('') : `<div class="empty">${T('trash_empty')}</div>`);
}

/* ---- رتبه‌بندی و پروفایل‌ها ---- */
function vBoard() {
  const rows = U.board;
  return `<div class="bar">
    <h2 style="font-size:22px">${T('leaderboard')}</h2>
    <span class="sp"></span>
    <span class="mut sm">${T('pub_only')}</span>
  </div>` +
  (!rows ? `<div class="empty">${T('loading')}</div>` : !rows.length ? `<div class="empty">${CL === 'en' ? 'No public profiles yet.' : 'هنوز پروفایل عمومی‌ای نیست. در «پروفایل من» عمومی‌اش کنید.'}</div>` : rows.map((r, i) => `
    <div class="lb" data-a="go" data-v="u/${esc(r.u)}">
      <span class="rk">${i + 1}</span>
      <span>${esc(r.name)} <span class="mut sm ltr">@${esc(r.u)}</span></span>
      <span>${r.won}/${r.n}</span>
      <span style="color:${clrP(r.roi)}">${sgn(r.roi * 100)}%</span>
      <b style="font-weight:400;font-size:20px">${r.score}</b>
    </div>`).join('')) + `<div class="mut sm" style="margin-top:14px">${T('board_col_hint')}</div>`;
}

const profHead = (p, sm, rank) => `<div class="ph">
  <div class="av">${esc((p.name || p.u || '?')[0])}</div>
  <div>
    <h2 style="font-size:24px">${esc(p.name)}</h2>
    <div class="mut sm"><span class="ltr">@${esc(p.u)}</span> · ${T('joined')} ${fD(p.joined)}</div>
    ${p.bio ? `<div>${esc(p.bio)}</div>` : ''}
  </div>
</div>
<div class="grid">
  ${kp(p.score != null ? p.score : sm.score, T('score'))}
  ${rank ? kp('#' + rank, T('rank')) : ''}
  ${kp(sm.n, T('done_bets'))}
  ${kp(sm.n ? Math.round(sm.won / sm.n * 100) + '%' : '—', T('win_pct'))}
  ${kp(sm.n ? sgn(sm.roi * 100) + '%' : '—', T('roi'), clrP(sm.roi))}
</div>`;

function vMe() {
  const p = S.prof || { u: S.me, name: S.me, bio: '', pub: false, dvis: 'private', joined: Date.now() };
  const sm = Core.summary(S.bets), nPub = S.bets.filter((b) => b.vis === 'public' && !b.del).length, nLink = S.bets.filter((b) => b.vis === 'link' && !b.del).length;
  const visMap = getVIS();
  return profHead(p, sm, U.rank) + `
  <div class="card">
    <h3>${T('display_privacy')}</h3>
    <div class="row">
      <input id="pf-name" placeholder="${T('display_name')}" value="${esc(p.name)}" maxlength="30">
      <select id="pf-vis" title="${T('default_vis')}">
        ${Object.entries(visMap).map(([k, v]) => `<option value="${k}"${(p.dvis || 'private') === k ? ' selected' : ''}>${T('add_bet')}: ${v}</option>`).join('')}
      </select>
    </div>
    <div class="row"><input id="pf-bio" placeholder="${T('about_me')}" value="${esc(p.bio)}" maxlength="160"></div>
    <div class="row"><label class="sm"><input type="checkbox" id="pf-pub"${p.pub ? ' checked' : ''}> ${T('public_profile')}</label></div>
    <div class="row">
      <button class="btn p" data-a="saveprof">${T('save')}</button>
      ${p.pub ? `<button class="btn" data-a="copyprof">${T('copy_profile')}</button>` : ''}
      <span class="mut sm">${nPub} ${T('pub_bets_count')} · ${nLink} ${T('link_bets_count')}</span>
    </div>
  </div>
  <div class="card">
    <h3>${T('tools')}</h3>
    <div class="row">
      <button class="btn" data-a="go" data-v="stats">${T('all_stats_btn')}</button>
      <button class="btn" data-a="go" data-v="trash">${T('trash_btn')} (${S.trash.length})</button>
      <button class="btn" data-a="exp">${T('export_btn')}</button>
      <button class="btn" data-a="imp">${T('import_btn')}</button>
      <button class="btn" data-a="bak">${T('backup_btn')}</button>
      <button class="btn" data-a="tg">${T('tg_btn')}</button>
    </div>
  </div>
  <div class="card">
    <h3>${T('change_pass')}</h3>
    <div class="row">
      <input id="pw-old" type="password" placeholder="${T('current_pass')}" autocomplete="current-password">
      <input id="pw-new" type="password" placeholder="${T('new_pass')}" autocomplete="new-password">
      <button class="btn" data-a="pass">${T('change_btn')}</button>
    </div>
  </div>
  <div class="card">
    <h3>${T('score_formula')}</h3>
    <div class="sm mut">${T('score_desc')}</div>
  </div>`;
}

function vUser() {
  const d = U.pu; if (!d) return `<div class="empty">${T('loading')}</div>`; if (d.err) return `<div class="empty">${T('profile_not_found')}</div>`;
  const st = d.profile.stats || {};
  return profHead(d.profile, { n: st.n || 0, won: st.won || 0, roi: st.roi || 0, score: d.profile.score }, 0) +
    `<div class="sec"><h2>${T('pub_bets')}</h2></div>` +
    (d.bets.length ? d.bets.map((b) => betRow(b, Core.betState(b, S.LV), 'pub')).join('') : `<div class="empty">${T('no_pub_bets')}</div>`);
}

function vShare() {
  const d = U.share; if (!d) return `<div class="empty">${T('loading')}</div>`; if (d.err) return `<div class="empty">${T('share_invalid')}</div>`;
  return `<div class="mut sm" style="margin-bottom:6px">${T('shared_bet_by')} <span class="ltr">@${esc(d.by)}</span></div>` + betRow(d.bet, Core.betState(d.bet, S.LV), 'pub');
}

/* ---- پوسته، مسیریابی و رندر ---- */
const TABS = () => [['bets', T('bets')], ['risk', T('risk')], ['hist', T('hist')], ['stats', T('stats')], ['board', T('board')]];
function mountShell() {
  $('#root').innerHTML = `<header>
    <div class="wrap hd">
      <div class="brand" data-a="go" data-v="bets"><i></i>betslip</div>
      <nav id="nav"></nav>
      <span id="sync" data-s="idle"></span>
      <button class="btn" data-a="lang" title="${CL === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}" style="font-size:12px;padding:3px 10px;min-width:38px">${CL === 'fa' ? 'EN' : 'FA'}</button>
      <div id="acc"></div>
    </div>
  </header>
  <main class="wrap" id="view"></main>
  <footer id="ver"></footer>
  <div id="menu" class="menu" hidden></div>
  <div id="dlg"></div>
  <div id="toast"></div>`;
  $('#ver').textContent = 'Betslip v' + VER + '  ·  Update 16';
}

function renderHead() {
  const guest = !S.tok;
  $('#nav').innerHTML = (guest ? [['board', T('board')]] : TABS()).map(([k, v]) => `<a data-a="go" data-v="${k}" class="${U.tab === k ? 'on' : ''}">${v}</a>`).join('');
  $('#acc').innerHTML = guest ? `<button class="btn p" data-a="login">${T('login_btn')}</button>` : `<div style="display:flex;gap:10px;align-items:center"><button class="btn p" data-a="add">${T('add_bet')}</button><button class="av" data-a="menu" aria-label="Menu">${esc((S.prof && S.prof.name || S.me || '?')[0])}</button></div>`;
}

function render() {
  compute(); renderHead(); const v = $('#view'); let h = '';
  switch (U.tab) {
    case 'bets': h = vBets(); break; case 'risk': h = vRisk(); break; case 'hist': h = vHist(); break; case 'stats': h = vStats(); break;
    case 'trash': h = vTrash(); break; case 'board': h = vBoard(); break; case 'me': h = vMe(); break; case 'u': h = vUser(); break; case 'share': h = vShare(); break;
  }
  v.innerHTML = h; bulk();
  if (R.auto) toast(R.auto + T('auto_archived_msg'), 6000);
}

function renderList() { const l = $('#list'); if (l) l.innerHTML = U.tab === 'hist' ? listHist() : listBets(); bulk(); }
function bulk() {
  const bar = $('#bulk'); if (!bar) return; bar.hidden = !U.sel || !(U.tab === 'bets' || U.tab === 'hist'); if (bar.hidden) return;
  const n = U.sel.size, h = U.tab === 'hist';
  bar.innerHTML = `<span>${n} ${T('selected')}</span>
    <button class="btn" data-a="bk-all">${T('select_all')}</button>
    <button class="btn p" data-a="${h ? 'bk-un' : 'bk-ar'}"${n ? '' : ' disabled'}>${h ? T('restore_sel') : T('archive_sel')}</button>
    <button class="btn" data-a="bk-del"${n ? '' : ' disabled'}>${T('delete_sel')}</button>
    <button class="btn" data-a="bk-off">${T('end_sel')}</button>`;
}
