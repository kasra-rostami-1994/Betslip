/* ui.js: هویت بصری و قالب اصلی Betslip (هماهنگ کامل با اسکرین‌شات‌ها و استایل اصیل) */
const U = {
  tab: 'bets', sort: ls.g('srt') || 'new', tag: '', q: '', cls: '', fil: null,
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

/* ---- ردیف بازی (با هویت بصری اصلی + درج کشور، لیگ و تورنمنت) ---- */
function legRow(z, b, mode, i) {
  const x = z.x, l = z.l, pub = mode === 'pub', live = x && x.st === 'in';
  const sc = x && x.st !== 'pre'
    ? `<b>${x.h} – ${x.a}</b><small>${stt(x)}</small>`
    : `<b>–</b><small>${x ? (x.pp ? T('postponed') : x.t ? fDM(x.t) + '، ' + tm(x.t) : '') : S.at ? T('not_in_sources') : '…'}</small>`;
  const nm = x && x.src ? x.src[0][0] : '';
  const bd = x && x.man ? `<small>${T('source_manual')}</small>` : x && x.fin ? `<small>${T('source_saved')}</small>` : x && x.src ? (x.cf ? `<small class="w">${T('conflict_txt')} ` + x.src.map((q) => esc(q[0]) + ' ' + q[1]).join(' | ') + '</small>' : `<small class="${nm.includes('+') ? 'v' : ''}">${nm.includes('+') ? '✓ ' : ''}${esc(nm)}</small>`) : '';
  const lk = pub ? '' : !x && S.at && !l.ov && !l.fin ? `<a href="#" data-a="map" data-id="${b.id}" data-l="${i}">${T('select_game')}</a>` : x && x.man && x.st === 'in' ? `<a href="#" data-a="ov" data-id="${b.id}" data-l="${i}">${T('set_final')}</a>` : '';
  const g = x && x.goals && x.goals.length ? `<div class="gl">${x.goals.map((q) => '⚽ ' + esc(q.m) + ' ' + esc(q.n) + (q.f ? ' (' + q.f + ')' : '')).join(' · ')}</div>` : '';

  // کشور و لیگ / تورنمنت
  const cyRaw = (x && x.cy) || l.cy || (l.fin && l.fin.cy) || '';
  const lgRaw = (x && x.lg) || l.lg || (l.fin && l.fin.lg) || '';
  const cyNamed = cyRaw ? lcy(cyRaw) : '';
  const compInfo = (cyNamed && lgRaw) ? `${cyNamed} · ${lgRaw}` : (cyNamed || lgRaw);

  return `<div class="leg c-${z.c} ${live ? 'live' : ''}${U.fil && U.fil.g === Core.gk(l) ? ' hl' : ''}">
    <span class="dot ${live ? 'live' : ''}"></span>
    <div>
      <div class="nm">${esc(l.home)} – ${esc(l.away)}</div>
      <div class="pk">${esc(localPickTxt(l.pick, l))}${l.odds ? ' · ' + (+l.odds).toFixed(2) : ''}${localLbl(l.pick, x)}</div>
      ${compInfo ? `<div class="leg-hint">${esc(compInfo)}</div>` : ''}
      ${g}
    </div>
    <div class="sc"${pub ? '' : ` data-a="ov" data-id="${b.id}" data-l="${i}" tabindex="0" role="button" title="${esc(x && x.ref ? (CL === 'en' ? 'Matched with: ' : 'تطبیق با: ') + x.ref : (CL === 'en' ? 'Manual Result Entry' : 'ورود دستی نتیجه'))}"`}>
      ${sc}${bd}${lk}
    </div>
  </div>`;
}

/* ---- کارت بلیت (با ساختار کارت‌های اصیل اسکرین‌شات) ---- */
function betRow(b, s, mode) {
  const pub = mode === 'pub', hist = mode === 'hist', open = pub || U.open.has(b.id), id = b.id;
  const col = hist ? (b.res === 'won' ? 'g' : b.res === 'lost' ? 'r' : 'n') : CLR[s.cls];

  // برچسب وضعیت کارت (برنده، بازنده، در انتظار، ...)
  const statusChip = hist
    ? (b.res === 'won' ? `<span class="chip" style="--c:var(--g)">${T('won_chip')}</span>` : b.res === 'lost' ? `<span class="chip" style="--c:var(--r)">${CL === 'en' ? 'Lost' : 'از دست رفته'}</span>` : `<span class="chip" style="--c:var(--n)">${T('no_result')}</span>`)
    : s.lost
    ? `<span class="chip" style="--c:var(--r)">${CL === 'en' ? 'Lost' : 'از دست رفته'}</span>`
    : s.won
    ? `<span class="chip" style="--c:var(--g)">${CL === 'en' ? 'Won' : 'برنده شد'}</span>`
    : `<span class="chip" style="--c:var(--${col})">${T('cls_' + s.cls)}</span>`;

  const L = s.L.map((z, i) => ({ ...z, i })).sort((p, q) => (p.x && p.x.st === 'in' ? 0 : 1) - (q.x && q.x.st === 'in' ? 0 : 1) || (p.x && p.x.t ? +p.x.t : 8e15) - (q.x && q.x.t ? +q.x.t : 8e15));
  const ts = L.map((z) => z.x && z.x.t && +z.x.t).filter(Boolean), d1 = ts.length ? Math.min(...ts) : 0, d2 = ts.length ? Math.max(...ts) : 0;
  const ck = U.sel && !pub ? `<input type="checkbox" class="ck" data-a="ck" data-id="${id}"${U.sel.has(id) ? ' checked' : ''}>` : '';

  const pr = s.lost ? 0 : s.pr;
  const winVal = b.win * (s.fa || 1);
  const visMap = getVIS();

  const acts = pub ? '' : `<div class="acts">
    <button class="lnk" data-a="tog" data-id="${id}">${open ? (CL === 'en' ? 'Close Details ▴' : 'بستن جزئیات ▴') : (CL === 'en' ? 'Game Details ▾' : 'جزئیات بازی‌ها ▾')}</button>
    <button class="lnk" data-a="ed" data-id="${id}">${T('edit')}</button>
    ${hist ? '' : `<button class="lnk" data-a="co" data-id="${id}">${T('cashout_btn')}</button>`}
    <select data-a="vis" data-id="${id}" title="${T('default_vis')}">
      ${Object.entries(visMap).map(([k, v]) => `<option value="${k}"${(b.vis || 'private') === k ? ' selected' : ''}>${v}</option>`).join('')}
    </select>
    ${b.share ? `<button class="lnk" data-a="sh" data-id="${id}">${T('copy_link')}</button>` : ''}
    <button class="lnk" data-a="${hist ? 'un' : 'ar'}" data-id="${id}">${hist ? T('restore_active') : T('archive')}</button>
    <button class="lnk d" data-a="del" data-id="${id}">${T('delete')}</button>
  </div>`;

  return `<article class="bet${hist ? ' ' + b.res : s.lost ? ' lost' : s.won ? ' won' : ''}${pub ? ' pub' : ''}">
    <div class="bh">
      <div class="t">
        <h2>
          ${ck}${esc(b.name)}
          ${tagsH(b)}
          ${b.auto && !pub ? `<span class="tag auto">${T('auto_arch')}</span>` : ''}
          ${b.vis && b.vis !== 'private' && !pub ? `<span class="tag">${b.vis === 'public' ? T('vis_pub_tag') : T('vis_link_tag')}</span>` : ''}
        </h2>
        <div>${statusChip}</div>
      </div>
      <div class="sub-badges">
        <span>📅 ${T('created')} ${fD(b.created)}</span>
        ${d1 ? `<span>🌐 ${T('matches')} ${fD(d1)}${fD(d1) !== fD(d2) ? (CL === 'en' ? ' to ' : ' تا ') + fD(d2) : ''}</span>` : ''}
        ${b.arch ? `<span>📅 ${hist ? T('settlement') : T('archived')} ${fD(b.sett || b.arch)}</span>` : ''}
      </div>

      <!-- مقادیر ۴ گانه هویت بصری اصیل -->
      <div class="kv">
        <div><span>${T('sort_odds')}</span><b>${nf(b.odds)}</b></div>
        <div><span>${T('stake')}</span><b>${nf(b.stake)}</b></div>
        <div><span>${hist ? T('pnl') : (CL === 'en' ? 'Potential Win' : 'برد احتمالی')}</span><b style="${hist && b.res ? 'color:' + clrP(pft(b)) : ''}">${hist && b.res ? sgn(pft(b)) : nf(winVal)}</b></div>
        ${b.cash != null && !hist ? `<div><span>${T('cash')}</span><b>${nf(b.cash)}</b></div>` : ''}
        ${!hist ? `<div><span>${CL === 'en' ? 'Estimated Prob' : 'احتمال تقریبی'}</span><b>${pct(pr)}</b></div>` : ''}
      </div>

      ${b.note && !pub ? `<div class="sub" style="margin-top:6px">📝 ${esc(b.note)}</div>` : ''}

      <!-- نوار باریک ۵ رنگ پیشرفت -->
      <div class="bar">
        ${['g', 'b', 'o', 'r', 'n'].map((k) => `<span style="flex:${s.cnt[k]};background:var(--${k})"></span>`).join('')}
      </div>

      <!-- ردیف خلاصه شمارش بازی‌ها -->
      <div class="cnt">
        <span><b style="color:var(--g)">${s.cnt.g}</b> ${T('correct')}</span>
        <span><b style="color:var(--b)">${s.cnt.b}</b> ${T('on_track')}</span>
        <span><b style="color:var(--o)">${s.cnt.o}</b> ${T('close_pick')}</span>
        <span><b style="color:var(--r)">${s.cnt.r}</b> ${T('wrong')}</span>
        <span>${CL === 'en' ? 'of' : 'از'} ${L.length}</span>
      </div>

      ${acts}
    </div>

    ${open ? `<div class="legs">${L.map((z) => legRow(z, b, mode, z.i)).join('')}</div>` : ''}
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
  return `<select data-a="tag"><option value="">${CL === 'en' ? 'All Tags' : 'همۀ برچسب‌ها'}</option>${T_list.map((t) => `<option${t === U.tag ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
};

const filBar = () => (U.fil ? `<div class="fil"><span>${T('filter_label')} <b>${esc(U.fil.n)}</b></span><button class="lnk" data-a="nf">${T('clear_filter')}</button></div>` : '');

/* ---- نمای بلیت‌های فعال (منطبق کامل بر اسکرین‌شات ۱) ---- */
function vBets() {
  const act = S.bets.filter((b) => !b.arch), sts = act.map((b) => R.st.get(b.id)), C_cnt = { wr: 0, near: 0, ok: 0, wait: 0, won: 0, lost: 0 };
  let liveLegs = 0, finLegs = 0, waitLegs = 0, totalLegs = 0;
  sts.forEach((s) => {
    C_cnt[s.cls] = (C_cnt[s.cls] || 0) + 1;
    s.L.forEach((z) => {
      totalLegs++;
      if (z.x && z.x.st === 'in') liveLegs++;
      else if (z.fin || (z.x && z.x.st === 'post')) finLegs++;
      else waitLegs++;
    });
  });

  // ۶ کپسول آماری دقیقاً مانند اسکرین‌شات ۱
  const kpisHtml = `<div class="kpis">
    <div class="k-card${U.cls === 'wr' ? ' on' : ''}" data-a="cls" data-v="wr">
      <div class="kt">${CL === 'en' ? 'Wrong Leg Live' : 'پای اشتباهِ زنده'}</div>
      <div class="kv-num" style="color:var(--r)">${C_cnt.wr}</div>
    </div>
    <div class="k-card${U.cls === 'near' ? ' on' : ''}" data-a="cls" data-v="near">
      <div class="kt">${CL === 'en' ? 'Close to Pick' : 'نزدیک به پیش‌بینی'}</div>
      <div class="kv-num" style="color:var(--o)">${C_cnt.near}</div>
    </div>
    <div class="k-card${U.cls === 'ok' ? ' on' : ''}" data-a="cls" data-v="ok">
      <div class="kt">${CL === 'en' ? 'Live & On Track' : 'زنده و مطابق'}</div>
      <div class="kv-num" style="color:var(--b)">${C_cnt.ok}</div>
    </div>
    <div class="k-card${U.cls === 'wait' ? ' on' : ''}" data-a="cls" data-v="wait">
      <div class="kt">${CL === 'en' ? 'Waiting to Start' : 'در انتظار شروع'}</div>
      <div class="kv-num" style="color:var(--tx)">${C_cnt.wait}</div>
    </div>
    <div class="k-card${U.cls === 'won' ? ' on' : ''}" data-a="cls" data-v="won">
      <div class="kt">${CL === 'en' ? 'Won (Settling)' : 'برنده (آمادهٔ بایگانی)'}</div>
      <div class="kv-num" style="color:var(--g)">${C_cnt.won}</div>
    </div>
    <div class="k-card${U.cls === 'lost' ? ' on' : ''}" data-a="cls" data-v="lost">
      <div class="kt">${CL === 'en' ? 'Lost (Confirmed)' : 'باخت قطعی (تا پایان بازی)'}</div>
      <div class="kv-num" style="color:var(--r)">${C_cnt.lost}</div>
    </div>
  </div>`;

  // تولبار فیلترها طبق اسکرین‌شات ۱
  const toolbarHtml = `<div class="tool">
    <select data-a="sort">
      ${[['new', CL === 'en' ? 'Newest' : 'جدیدترین'], ['risk', CL === 'en' ? 'Highest Risk' : 'بیشترین ریسک'], ['old', CL === 'en' ? 'Oldest' : 'قدیمی‌ترین'], ['odds', CL === 'en' ? 'Best Odds' : 'بیشترین ضریب'], ['win', CL === 'en' ? 'Best Win' : 'بیشترین برد']].map(([k, v]) => `<option value="${k}"${U.sort === k ? ' selected' : ''}>${v}</option>`).join('')}
    </select>
    ${tagOpts()}
    <button class="btn" data-a="sel">${U.sel ? T('end_group') : (CL === 'en' ? 'Multi-select' : 'انتخاب گروهی')}</button>
    <div class="tool-summary">
      ${act.length} ${T('active_bets')} · ${totalLegs} ${T('games')}: ${liveLegs} ${CL === 'en' ? 'live' : 'زنده'}، ${finLegs} ${CL === 'en' ? 'finished' : 'تمام‌شده'}، ${waitLegs} ${CL === 'en' ? 'waiting' : 'شروع‌نشده'}
    </div>
  </div>`;

  const betsList = filt(act).filter((b) => !U.cls || R.st.get(b.id).cls === U.cls).sort(SORTS[U.sort] || SORTS.new);

  return kpisHtml + toolbarHtml + filBar() +
    `<div id="list" class="bet-grid">` +
    (betsList.length ? betsList.map((b) => betRow(b, R.st.get(b.id), 'act')).join('') : `<div class="empty" style="grid-column:1/-1">${act.length ? T('no_filter') : T('no_active') + `<br><br><button class="btn p" data-a="add">${T('add_first')}</button>`}</div>`) +
    `</div>`;
}

/* ---- تاریخچه (منطبق بر اسکرین‌شات ۲) ---- */
function vHist() {
  const lim = U.hrange === 'all' ? 0 : Date.now() - +U.hrange * 864e5;
  const a = filt(S.bets.filter((b) => b.arch)).filter((b) => !U.hres || b.res === U.hres).filter((b) => (b.sett || b.arch) >= lim).sort((p, q) => (q.sett || q.arch) - (p.sett || p.arch));
  const sm = Core.summary(a);

  const kpisHtml = `<div class="kpis">
    <div class="k-card"><div class="kt">${T('done_bets')}</div><div class="kv-num" style="color:var(--tx)">${a.length}</div></div>
    <div class="k-card"><div class="kt">${T('won_chip')}</div><div class="kv-num" style="color:var(--g)">${sm.won}</div></div>
    <div class="k-card"><div class="kt">${T('lost_chip')}</div><div class="kv-num" style="color:var(--r)">${sm.lost}</div></div>
    <div class="k-card"><div class="kt">${T('win_pct')}</div><div class="kv-num">${a.length ? Math.round(sm.won / a.length * 100) : 0}%</div></div>
    <div class="k-card"><div class="kt">${T('total_stake')}</div><div class="kv-num">${nf(sm.staked)}</div></div>
    <div class="k-card"><div class="kt">${T('pnl')}</div><div class="kv-num" style="color:${clrP(sm.profit)}">${sgn(sm.profit)}</div></div>
  </div>`;

  const toolbarHtml = `<div class="tool">
    <select data-a="hres">
      ${[['', T('all_results')], ['won', T('winners')], ['lost', T('losers')]].map(([k, v]) => `<option value="${k}"${U.hres === k ? ' selected' : ''}>${v}</option>`).join('')}
    </select>
    <select data-a="hrange">
      ${[['all', T('all_time')], ['7', T('last_7')], ['30', T('last_30')], ['90', T('last_90')], ['180', T('last_180')]].map(([k, v]) => `<option value="${k}"${U.hrange === k ? ' selected' : ''}>${v}</option>`).join('')}
    </select>
    ${tagOpts()}
    <button class="btn" data-a="sel">${U.sel ? T('end_group') : (CL === 'en' ? 'Multi-select' : 'انتخاب گروهی')}</button>
  </div>`;

  return kpisHtml + toolbarHtml + filBar() +
    `<div id="list" class="bet-grid">` +
    (a.length ? a.map((b) => betRow(b, R.st.get(b.id), 'hist')).join('') : `<div class="empty" style="grid-column:1/-1">${T('no_hist')}</div>`) +
    `</div>`;
}

/* ---- نمای ریسک مشترک (با هویت اصیل و لیگ/کشور) ---- */
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

  const kpisHtml = `<div class="kpis">
    <div class="k-card"><div class="kt">${T('critical_games')}</div><div class="kv-num" style="color:var(--r)">${A.filter((a) => a.t === 5).length}</div></div>
    <div class="k-card"><div class="kt">${T('close_games')}</div><div class="kv-num" style="color:var(--o)">${A.filter((a) => a.t === 4).length}</div></div>
    <div class="k-card"><div class="kt">${T('started')}</div><div class="kv-num" style="color:var(--b)">${A.filter((a) => !a.ns).length}</div></div>
    <div class="k-card"><div class="kt">${T('not_started')}</div><div class="kv-num" style="color:var(--tx)">${A.filter((a) => a.ns).length}</div></div>
  </div>`;

  return kpisHtml + `<div class="bet-grid">` + A.map((a) => {
    const c = tlMap[a.t];
    const cyRaw = (a.x && a.x.cy) || a.g.l.cy || '';
    const lgRaw = (a.x && a.x.lg) || a.g.l.lg || '';
    const cyNamed = cyRaw ? lcy(cyRaw) : '';
    const compInfo = (cyNamed && lgRaw) ? `${cyNamed} · ${lgRaw}` : (cyNamed || lgRaw);

    return `<article class="bet" style="border-color:color-mix(in srgb,var(--${c[1]}) 40%,var(--line))">
      <div class="bh" data-a="fg" data-v="${esc(a.g.k)}" data-n="${esc(a.g.l.home + ' – ' + a.g.l.away)}" style="cursor:pointer">
        <div class="t">
          <h2>
            <span class="ltr">${esc(a.g.l.home)} – ${esc(a.g.l.away)}</span>
            ${a.x ? ` <span style="color:var(--${c[1]})">(${lvTxt(a.x)})</span>` : ''}
          </h2>
          <span class="chip" style="--c:var(--${c[1]})">${c[0]}</span>
        </div>
        ${compInfo ? `<div class="leg-hint">${esc(compInfo)}</div>` : ''}
        <div class="sub" style="margin-top:8px">${a.n} ${T('bets_at_risk')} · ${T('potential_win')} <b>${nf(a.pot)}</b> USDT</div>
      </div>
      <div class="legs">${a.g.rows.map((r) => `<div class="leg c-${r.z.c}" data-a="fb" data-v="${r.b.id}" data-n="${esc(r.b.name)}" style="cursor:pointer">
        <span class="dot"></span>
        <div>
          <div class="nm" style="text-align:start">${esc(r.b.name)} <span class="mut sm">×${nf(r.b.odds)}</span> ${tagsH(r.b)}</div>
          <div class="pk">${esc(localPickTxt(r.z.l.pick, r.z.l))}${r.z.l.odds ? ' · ' + (+r.z.l.odds).toFixed(2) : ''}${r.b.note ? ' · 📝 ' + esc(r.b.note) : ''}</div>
        </div>
        <span></span>
      </div>`).join('')}</div>
    </article>`;
  }).join('') + `</div>`;
}

/* ---- سطل زباله ---- */
function vTrash() {
  const T_recs = S.trash.slice().sort((a, b) => b.del - a.del);
  return `<div class="tool">
    <h2 style="font-size:18px">${T('trash_title')}</h2>
    <span class="sp"></span>
    ${T_recs.length ? `<button class="btn" data-a="emp">${T('empty_trash')}</button>` : ''}
  </div>
  <div class="mut sm" style="margin-bottom:14px">${T('trash_30days')}</div>
  <div class="bet-grid">` +
  (T_recs.length ? T_recs.map((b) => {
    const d = Math.floor((Date.now() - b.del) / 864e5);
    return `<article class="bet">
      <div class="bh">
        <div class="t"><h2>${esc(b.name)}</h2><div class="num">×${nf(b.odds)}</div></div>
        <div class="sub" style="margin-top:6px">${b.legs.length} ${T('games')} · ${d} ${T('trash_days_removed')} · ${30 - d} ${T('days_to_remove')}</div>
        <div class="acts" style="margin-top:14px">
          <button class="lnk" data-a="rs" data-id="${b.id}">${T('trash_restore')}</button>
          <button class="lnk d" data-a="pd" data-id="${b.id}">${T('trash_perm')}</button>
        </div>
      </div>
    </article>`;
  }).join('') : `<div class="empty" style="grid-column:1/-1">${T('trash_empty')}</div>`) + `</div>`;
}

/* ---- رتبه‌بندی ---- */
function vBoard() {
  const rows = U.board;
  return `<div class="tool">
    <h2 style="font-size:18px">${T('leaderboard')}</h2>
    <span class="sp"></span>
    <span class="mut sm">${T('pub_only')}</span>
  </div>` +
  (!rows ? `<div class="empty">${T('loading')}</div>` : !rows.length ? `<div class="empty">${CL === 'en' ? 'No public profiles yet.' : 'هنوز پروفایل عمومی‌ای نیست.'}</div>` : rows.map((r, i) => `
    <div class="lb" data-a="go" data-v="u/${esc(r.u)}">
      <span class="rk">${i + 1}</span>
      <span>${esc(r.name)} <span class="mut sm ltr">@${esc(r.u)}</span></span>
      <span>${r.won}/${r.n}</span>
      <span style="color:${clrP(r.roi)}">${sgn(r.roi * 100)}%</span>
      <b style="font-weight:700;font-size:18px">${r.score}</b>
    </div>`).join('')) + `<div class="mut sm" style="margin-top:14px">${T('board_col_hint')}</div>`;
}

const profHead = (p, sm, rank) => `<div class="ph">
  <div class="av">${esc((p.name || p.u || '?')[0])}</div>
  <div>
    <h2 style="font-size:22px">${esc(p.name)}</h2>
    <div class="mut sm"><span class="ltr">@${esc(p.u)}</span> · ${T('joined')} ${fD(p.joined)}</div>
    ${p.bio ? `<div style="margin-top:4px">${esc(p.bio)}</div>` : ''}
  </div>
</div>
<div class="kpis">
  <div class="k-card"><div class="kt">${T('score')}</div><div class="kv-num">${p.score != null ? p.score : sm.score}</div></div>
  ${rank ? `<div class="k-card"><div class="kt">${T('rank')}</div><div class="kv-num">#${rank}</div></div>` : ''}
  <div class="k-card"><div class="kt">${T('done_bets')}</div><div class="kv-num">${sm.n}</div></div>
  <div class="k-card"><div class="kt">${T('win_pct')}</div><div class="kv-num">${sm.n ? Math.round(sm.won / sm.n * 100) + '%' : '—'}</div></div>
  <div class="k-card"><div class="kt">${T('roi')}</div><div class="kv-num" style="color:${clrP(sm.roi)}">${sm.n ? sgn(sm.roi * 100) + '%' : '—'}</div></div>
</div>`;

function vMe() {
  const p = S.prof || { u: S.me, name: S.me, bio: '', pub: false, dvis: 'private', joined: Date.now() };
  const sm = Core.summary(S.bets), nPub = S.bets.filter((b) => b.vis === 'public' && !b.del).length, nLink = S.bets.filter((b) => b.vis === 'link' && !b.del).length;
  const visMap = getVIS();
  return profHead(p, sm, U.rank) + `
  <div class="card" style="padding:18px 20px;margin-bottom:14px">
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
  <div class="card" style="padding:18px 20px;margin-bottom:14px">
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
  <div class="card" style="padding:18px 20px;margin-bottom:14px">
    <h3>${T('change_pass')}</h3>
    <div class="row">
      <input id="pw-old" type="password" placeholder="${T('current_pass')}" autocomplete="current-password">
      <input id="pw-new" type="password" placeholder="${T('new_pass')}" autocomplete="new-password">
      <button class="btn" data-a="pass">${T('change_btn')}</button>
    </div>
  </div>
  <div class="card" style="padding:18px 20px">
    <h3>${T('score_formula')}</h3>
    <div class="sm mut">${T('score_desc')}</div>
  </div>`;
}

function vUser() {
  const d = U.pu; if (!d) return `<div class="empty">${T('loading')}</div>`; if (d.err) return `<div class="empty">${T('profile_not_found')}</div>`;
  const st = d.profile.stats || {};
  return profHead(d.profile, { n: st.n || 0, won: st.won || 0, roi: st.roi || 0, score: d.profile.score }, 0) +
    `<div class="tool"><h2 style="font-size:18px">${T('pub_bets')}</h2></div>` +
    `<div class="bet-grid">` +
    (d.bets.length ? d.bets.map((b) => betRow(b, Core.betState(b, S.LV), 'pub')).join('') : `<div class="empty" style="grid-column:1/-1">${T('no_pub_bets')}</div>`) +
    `</div>`;
}

function vShare() {
  const d = U.share; if (!d) return `<div class="empty">${T('loading')}</div>`; if (d.err) return `<div class="empty">${T('share_invalid')}</div>`;
  return `<div class="mut sm" style="margin-bottom:8px">${T('shared_bet_by')} <span class="ltr">@${esc(d.by)}</span></div>` +
    `<div class="bet-grid">${betRow(d.bet, Core.betState(d.bet, S.LV), 'pub')}</div>`;
}

/* ---- پوسته، هدر و رندر (منطبق بر اسکرین‌شات‌ها) ---- */
function mountShell() {
  $('#root').innerHTML = `<header>
    <div class="wrap hd">
      <span class="brand" data-a="go" data-v="bets"><i></i>Betslip</span>
      <nav class="tabs" id="tabs">
        <button data-a="go" data-v="bets" class="on">${T('bets')}</button>
        <button data-a="go" data-v="hist">${T('hist')}</button>
        <button data-a="go" data-v="risk">${T('risk')}</button>
        <button data-a="go" data-v="stats">${T('stats')}</button>
        <button data-a="go" data-v="trash">${T('trash_tab')}</button>
      </nav>
      <span class="sp"></span>
      <span id="upd"></span>
      <button class="btn sq" data-a="rf" title="${CL === 'en' ? 'Refresh' : 'به‌روزرسانی'}">↻</button>
      <button class="btn p" data-a="add">${T('add_bet')}</button>
      <button class="btn" data-a="exp">${T('export_json')}</button>
      <button class="btn" data-a="imp">${T('import_json')}</button>
      <button class="btn sq" data-a="tg" title="${T('tg_btn')}">⚙</button>
      <button class="btn" data-a="lang" title="${CL === 'fa' ? 'Switch to English' : 'تغییر به فارسی'}" style="min-width:44px">${CL === 'fa' ? 'EN' : 'FA'}</button>
      <button class="btn" data-a="out">${T('logout')}</button>
      <span id="sync" data-s="idle" style="display:none"></span>
    </div>
  </header>

  <!-- نوار لژند دقیقاً مانند تصویر ۱ و ۳ -->
  <div class="wrap">
    <div class="legend">
      <span style="--c:var(--b)"><i></i>${CL === 'en' ? 'Live & On Track' : 'زنده و مطابق پیش‌بینی'}</span>
      <span style="--c:var(--g)"><i></i>${CL === 'en' ? 'Finished & Correct' : 'تمام‌شده و درست'}</span>
      <span style="--c:var(--r)"><i></i>${CL === 'en' ? 'Wrong' : 'اشتباه'}</span>
      <span style="--c:var(--o)"><i></i>${CL === 'en' ? 'Live & Close' : 'زنده و نزدیک'}</span>
      <span><i></i>${CL === 'en' ? 'Not Started' : 'شروع نشده'}</span>
      <span class="sp"></span>
      <span>${CL === 'en' ? 'Results based on regulation 90-min time' : 'نتایج بر اساس وقت قانونی (۹۰ دقیقه)'}</span>
    </div>
    <div id="err" style="display:none;margin-top:10px;padding:8px 14px;border:1px solid var(--o);color:var(--o);border-radius:10px;font-size:13px"></div>
    <main id="view"></main>
    <footer id="ver">Betslip v${VER} · Update 16</footer>
  </div>

  <div id="menu" class="menu" hidden></div>
  <div id="dlg"></div>
  <div id="toast"></div>`;
}

function updateSourcesText() {
  const el = $('#upd'); if (!el) return;
  const timeStr = S.at ? tm(S.at) : '';
  const srcStr = (S.SRC || []).map((s) => `${s.ok ? '✓' + s.c : 'X'} ${s.n}`).join(' ');
  el.textContent = `${CL === 'en' ? 'Updated' : 'به‌روزرسانی'} ${timeStr}  ${srcStr}`;
}

function renderHead() {
  $$('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.v === U.tab));
  updateSourcesText();
}

function render() {
  compute(); renderHead(); const v = $('#view'); let h = '';
  switch (U.tab) {
    case 'bets': h = vBets(); break;
    case 'risk': h = vRisk(); break;
    case 'hist': h = vHist(); break;
    case 'stats': h = vStats(); break;
    case 'trash': h = vTrash(); break;
    case 'board': h = vBoard(); break;
    case 'me': h = vMe(); break;
    case 'u': h = vUser(); break;
    case 'share': h = vShare(); break;
  }
  v.innerHTML = h; bulk();
  if (R.auto) toast(R.auto + T('auto_archived_msg'), 6000);
}

function renderList() {
  const l = $('#list');
  if (l) {
    if (U.tab === 'hist') {
      const vh = vHist();
      const div = document.createElement('div');
      div.innerHTML = vh;
      const newList = div.querySelector('#list');
      if (newList) l.innerHTML = newList.innerHTML;
    } else {
      const vb = vBets();
      const div = document.createElement('div');
      div.innerHTML = vb;
      const newList = div.querySelector('#list');
      if (newList) l.innerHTML = newList.innerHTML;
    }
  }
  bulk();
}

function bulk() {
  const bar = $('#bulk'); if (!bar) return; bar.hidden = !U.sel || !(U.tab === 'bets' || U.tab === 'hist'); if (bar.hidden) return;
  const n = U.sel.size, h = U.tab === 'hist';
  bar.innerHTML = `<span>${n} ${T('selected')}</span>
    <button class="btn" data-a="bk-all">${T('select_all')}</button>
    <button class="btn p" data-a="${h ? 'bk-un' : 'bk-ar'}"${n ? '' : ' disabled'}>${h ? T('restore_sel') : T('archive_sel')}</button>
    <button class="btn" data-a="bk-del"${n ? '' : ' disabled'}>${T('delete_sel')}</button>
    <button class="btn" data-a="bk-off">${T('end_sel')}</button>`;
}
