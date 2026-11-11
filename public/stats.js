/* stats.js: تحلیل آماری بر اساس بازهٔ زمانی (روز/هفته/ماه شمسی یا میلادی) با چینش نزولی درصدها و کشور/لیگ */
const nf = (n, d) => (+n).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });
const sgn = (n) => (n > 0 ? '+' : '') + nf(n);
const clrP = (n) => (n > 0 ? 'var(--g)' : n < 0 ? 'var(--r)' : 'var(--mut)');
const fD = (t) => (t ? new Date(t).toLocaleDateString(CL === 'en' ? 'en-US' : 'fa-IR-u-nu-latn') : '');
const fDM = (t) => (t ? new Intl.DateTimeFormat(CL === 'en' ? 'en-US' : 'fa-IR-u-nu-latn', { month: 'numeric', day: 'numeric' }).format(new Date(t)) : '');
const jm = (t) => { const p = {}; new Intl.DateTimeFormat('fa-IR-u-nu-latn-ca-persian', { year: 'numeric', month: 'numeric' }).formatToParts(new Date(t)).forEach((x) => (p[x.type] = x.value)); return p; };
const JM = (t) => { const p = jm(t); return p.year + '/' + String(p.month).padStart(2, '0'); };
const MN = (t) => (CL === 'en' ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(t)) : new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(new Date(t)));
const wday = (t) => (new Date(t).getDay() + (CL === 'en' ? 0 : 1)) % 7; // فارسی: شنبه=۰، انگلیسی: یکشنبه=۰
const WD_FA = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const wdNames = () => (CL === 'en' ? WD_EN : WD_FA);

function bucketOf(t, g) {
  const d = new Date(t);
  if (g === 'day') return { k: d.toISOString().slice(0, 10), l: fDM(t), t: +new Date(d.getFullYear(), d.getMonth(), d.getDate()) };
  if (g === 'week') {
    const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - wday(t));
    return { k: s.toISOString().slice(0, 10), l: fDM(+s), t: +s };
  }
  if (CL === 'en') {
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    return { k, l: MN(t) + ' ' + String(d.getFullYear()).slice(-2), t: +new Date(d.getFullYear(), d.getMonth(), 1) };
  }
  return { k: JM(t), l: MN(t), t: +new Date(d.getFullYear(), d.getMonth(), 1) };
}

function statRows(range) {
  const lim = range === 'all' ? 0 : Date.now() - (+range) * 864e5;
  return Core.settled(S.bets)
    .map((b) => ({ b, t: b.sett || b.arch, p: b.res === 'won' ? b.stake * b.odds - b.stake : -b.stake, w: b.res === 'won' }))
    .filter((h) => h.t >= lim)
    .sort((a, b) => a.t - b.t);
}

function kpis(D) {
  const n = D.length, W = D.filter((h) => h.w), st = D.reduce((s, h) => s + +h.b.stake, 0), pr = D.reduce((s, h) => s + h.p, 0);
  let cur = 0, ty = 0, bw = 0, bl = 0, run = 0, peak = 0, dd = 0;
  D.forEach((h) => {
    const k = h.w ? 'w' : 'l';
    if (k === ty) cur++; else { ty = k; cur = 1; }
    if (k === 'w') bw = Math.max(bw, cur); else bl = Math.max(bl, cur);
    run += h.p; peak = Math.max(peak, run); dd = Math.max(dd, peak - run);
  });
  return {
    n, won: W.length, lost: n - W.length, rate: n ? W.length / n : 0, staked: st, profit: pr,
    roi: st ? pr / st : 0, avgOdds: n ? D.reduce((s, h) => s + +h.b.odds, 0) / n : 0,
    avgStake: n ? st / n : 0, best: n ? Math.max(...D.map((h) => h.p)) : 0,
    worst: n ? Math.min(...D.map((h) => h.p)) : 0, streak: ty === 'w' ? cur : -cur,
    bw, bl, dd, legs: n ? D.reduce((s, h) => s + h.b.legs.length, 0) / n : 0
  };
}

const legHit = (l) => Core.ev(l.pick, l.fin ? Object.assign({}, l.fin, { st: 'post' }) : null, l.sv)[0] === 'g';
function legRows(range) {
  const lim = range === 'all' ? 0 : Date.now() - (+range) * 864e5, out = [];
  S.bets.forEach((b) => b.legs.forEach((l) => { if (l.fin && +new Date(l.fin.t || b.created) >= lim) out.push({ l, b, hit: legHit(l) }); }));
  return out;
}

const mkt = (p) => {
  if (p.includes('&')) return CL === 'en' ? 'Combo' : 'ترکیبی';
  if (/^(1|2|X)$/.test(p)) return CL === 'en' ? '1X2 (Win/Draw)' : 'برد/مساوی';
  if (/^(1X|X2|12)$/.test(p)) return CL === 'en' ? 'Double Chance' : 'شانس دوگانه';
  if (/^[OU]/.test(p)) return CL === 'en' ? 'Total Goals' : 'مجموع گل';
  if (/^[HA][OU]/.test(p)) return CL === 'en' ? 'Team Goals' : 'گل تیمی';
  if (/^B[YN]$/.test(p)) return CL === 'en' ? 'Both Teams Score' : 'هر دو گل';
  if (/^Q/.test(p)) return CL === 'en' ? 'Qualification' : 'صعود';
  if (/^AH/.test(p)) return CL === 'en' ? 'Asian Handicap' : 'هندیکپ';
  if (/^[KC]/.test(p) || /^E[KC]/.test(p)) return CL === 'en' ? 'Cards & Corners' : 'کارت و کرنر';
  return CL === 'en' ? 'Exact Score/Goals' : 'گل/نتیجه دقیق';
};

const band = (o) => (o < 1.2 ? (CL === 'en' ? 'Under 1.20' : 'زیر 1.20') : o < 1.5 ? (CL === 'en' ? '1.20 to 1.49' : '1.20 تا 1.49') : o < 2 ? (CL === 'en' ? '1.50 to 1.99' : '1.50 تا 1.99') : (CL === 'en' ? '2.00 & Above' : '2.00 به بالا'));
const sizeB = (n) => (n <= 3 ? (CL === 'en' ? '1 to 3 games' : '۱ تا ۳ بازی') : n <= 8 ? (CL === 'en' ? '4 to 8 games' : '۴ تا ۸ بازی') : n <= 15 ? (CL === 'en' ? '9 to 15 games' : '۹ تا ۱۵ بازی') : (CL === 'en' ? '16+ games' : '۱۶ بازی به بالا'));

// گروه‌بندی با مرتب‌سازی نزولی بر اساس درصد برد (طبق درخواست کاربر)
function group(items, key, val, sortByProfit) {
  const m = {};
  items.forEach((x) => {
    const k = key(x);
    m[k] = m[k] || { n: 0, w: 0, p: 0, e: 0 };
    m[k].n++;
    const v = val(x);
    m[k].w += v.w;
    m[k].p += v.p || 0;
    m[k].e += v.e || 0;
  });
  return Object.entries(m).sort((a, b) => {
    if (sortByProfit) return (b[1].p || 0) - (a[1].p || 0);
    const ra = a[1].n ? a[1].w / a[1].n : 0;
    const rb = b[1].n ? b[1].w / b[1].n : 0;
    return rb - ra || b[1].n - a[1].n;
  });
}

/* ---- نمودارها (SVG بهبودیافته) ---- */
function lineChart(pts) {
  if (pts.length < 2) return `<div class="mut sm">${T('min2_bets')}</div>`;
  const W = 640, H = 180, P = 12, xs = pts.map((p) => p.t), x0 = Math.min(...xs), x1 = Math.max(...xs) || 1;
  const vs = pts.map((p) => p.v).concat(0), lo = Math.min(...vs), hi = Math.max(...vs), r = hi - lo || 1;
  const X = (t) => P + ((t - x0) / (x1 - x0 || 1)) * (W - 2 * P);
  const Y = (v) => H - 24 - ((v - lo) / r) * (H - 46);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join(' ');
  const z = Y(0), last = pts[pts.length - 1].v, c = last >= 0 ? 'var(--g)' : 'var(--r)';
  const gradId = 'chartGrad_' + Math.random().toString(36).slice(2, 6);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${T('pnl_chart')}">
    <defs>
      <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${c}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <line x1="0" x2="${W}" y1="${z}" y2="${z}" stroke="var(--ln)" stroke-dasharray="3 4"/>
    <path d="${d} L${X(x1).toFixed(1)} ${z} L${X(x0).toFixed(1)} ${z}Z" fill="url(#${gradId})"/>
    <path d="${d}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.filter((_, i) => pts.length < 35 || i % Math.ceil(pts.length / 35) === 0 || i === pts.length - 1).map((p) => `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.5" fill="var(--sf)" stroke="${c}" stroke-width="2"><title>${esc(p.l)}: ${sgn(p.v)} USDT</title></circle>`).join('')}
    <text x="${P}" y="${H - 4}">${fD(x0)}</text>
    <text x="${W - P}" y="${H - 4}" text-anchor="end">${fD(x1)}</text>
    <text x="${P}" y="14" font-weight="600">${nf(hi)}</text>
    <text x="${P}" y="${H - 28}">${nf(lo)}</text>
  </svg>`;
}

function barChart(B, fmt, color) {
  if (!B.length) return `<div class="mut sm">${T('no_range_data')}</div>`;
  const W = Math.max(320, B.length * 48), H = 160, z = 80, mx = Math.max(1e-9, ...B.map((b) => Math.abs(b.v))), step = Math.ceil(B.length / 14);
  return `<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:${W}px" role="img">
    <line x1="0" x2="${W}" y1="${z}" y2="${z}" stroke="var(--ln)"/>
    ${B.map((b, i) => {
      const h = Math.abs(b.v) / mx * 58, x = i * 48 + 8, y = b.v >= 0 ? z - h : z, c = color ? color(b.v) : (b.v >= 0 ? 'var(--g)' : 'var(--r)');
      return `<rect x="${x}" y="${y}" width="32" height="${Math.max(h, 2)}" rx="4" fill="${c}"><title>${esc(b.l)}: ${fmt(b.v)}${b.n ? ' · ' + b.n + ' ' + T('games') : ''}</title></rect>
      <text x="${x + 16}" y="${b.v >= 0 ? y - 4 : y + h + 11}" text-anchor="middle" font-size="10.5">${fmt(b.v)}</text>
      ${i % step === 0 ? `<text x="${x + 16}" y="${H - 6}" text-anchor="middle" font-size="10">${esc(b.l)}</text>` : ''}`;
    }).join('')}
  </svg></div>`;
}

function hrows(title, rows, o) {
  o = o || {};
  const body = rows.length ? rows.map(([k, v]) => {
    const rate = v.n ? v.w / v.n : 0;
    const c = o.profit ? clrP(v.p) : (rate >= (v.n ? v.e / v.n : 0) && o.exp ? 'var(--g)' : (o.exp ? 'var(--o)' : 'var(--ink)'));
    const val = o.profit ? Math.min(100, Math.abs(v.p) / (o.max || 1) * 100) : rate * 100;
    return `<div class="tr">
      <span title="${esc(k)}">${esc(k)}</span>
      <div class="bx"><i style="width:${val}%;background:${c}"></i>${o.exp ? `<u style="inset-inline-start:${Math.min(99, (v.e / v.n) * 100)}%"></u>` : ''}</div>
      <span>${o.profit ? sgn(v.p) + ' · ' : ''}${Math.round(rate * 100)}% · ${v.w}/${v.n}</span>
    </div>`;
  }).join('') : `<div class="mut sm">${T('no_data')}</div>`;
  return `<div class="card"><h3>${title}</h3>${body}${o.exp ? `<div class="mut sm" style="margin-top:6px">${T('expected_line')}</div>` : ''}</div>`;
}

const kp = (v, l, c) => `<div class="kpi"><b${c ? ` style="color:${c}"` : ''}>${v}</b><span>${l}</span></div>`;

function vStats() {
  const rg = U.range, D = statRows(rg), K = kpis(D);
  const gran = U.gran === 'auto' ? (rg === 'all' || +rg > 90 ? 'month' : +rg > 30 ? 'week' : 'day') : U.gran;
  const B = {};
  D.forEach((h) => {
    const q = bucketOf(h.t, gran);
    (B[q.k] = B[q.k] || { l: q.l, t: q.t, v: 0, n: 0, w: 0 });
    B[q.k].v += h.p;
    B[q.k].n++;
    if (h.w) B[q.k].w++;
  });
  const BK = Object.values(B).sort((a, b) => a.t - b.t);
  let run = 0;
  const cum = D.map((h) => ({ t: h.t, v: (run += h.p), l: h.b.name }));
  const LG = legRows(rg), lh = LG.filter((z) => z.hit).length, imp = LG.length ? LG.reduce((s, z) => s + 1 / z.l.odds, 0) / LG.length : 0;
  const act = S.bets.filter((b) => !b.arch), as = act.map((b) => R.st.get(b.id)).filter(Boolean), at = as.filter((s) => !s.lost);
  const ex = at.reduce((s, x) => s + x.pr * x.b.win, 0), stk = at.reduce((s, x) => s + +x.b.stake, 0);
  const mx = Math.max(1, ...Object.values(D.reduce((m, h) => { m[h.b.id] = h; return m; }, {})).map((h) => Math.abs(h.p)));

  const tagG = group(D.flatMap((h) => (h.b.tags || []).map((t) => ({ t, h }))), (x) => x.t, (x) => ({ w: x.h.w ? 1 : 0, p: x.h.p }), true);
  const wds = wdNames();
  const wdG = group(D, (h) => wds[wday(h.t)], (h) => ({ w: h.w ? 1 : 0, p: h.p }), true).sort((a, b) => wds.indexOf(a[0]) - wds.indexOf(b[0]));
  const pmax = (rows) => Math.max(1, ...rows.map(([, v]) => Math.abs(v.p)));

  // کلید لیگ + کشور + تورنمنت
  const lgKey = (z) => {
    const lg = z.l.lg || (z.l.fin && z.l.fin.lg) || '';
    const cy = z.l.cy || (z.l.fin && z.l.fin.cy) || '';
    const cyT = cy ? lcy(cy) : '';
    if (cyT && lg) return cyT + ' · ' + lg;
    return cyT || lg || T('unknown');
  };

  const sel = (k, opts, v) => `<select data-a="st" data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${a === v ? ' selected' : ''}>${b}</option>`).join('')}</select>`;
  const timeUnitTxt = gran === 'day' ? T('per_day') : gran === 'week' ? T('per_week') : T('per_month');

  return `<div class="bar">
    <h2 style="font-size:22px">${T('stats_title')}</h2>
    <span class="sp"></span>
    ${sel('range', [['7', T('last_7')], ['30', T('last_30')], ['90', T('last_90')], ['180', T('last_180')], ['365', T('last_year')], ['all', T('all_time')]], rg)}
    ${sel('gran', [['auto', T('time_unit')], ['day', T('daily')], ['week', T('weekly')], ['month', T('monthly')]], U.gran)}
  </div>
  ${K.n ? '' : `<div class="mut sm">${T('no_stats')}</div>`}
  <div class="grid">
    ${kp(K.n, T('done_bets2'))}
    ${kp(Math.round(K.rate * 100) + '%', `${T('win_rate')} (${K.won}/${K.n})`)}
    ${kp(sgn(K.profit), T('pnl'), clrP(K.profit))}
    ${kp((K.roi * 100).toFixed(1) + '%', T('roi_total'), clrP(K.roi))}
    ${kp(nf(K.staked), T('total_stake'))}
    ${kp(nf(K.avgOdds), T('avg_odds'))}
    ${kp(nf(K.avgStake), T('avg_stake'))}
    ${kp(nf(K.legs, 1), T('avg_legs'))}
    ${kp(sgn(K.best), T('best_bet'), 'var(--g)')}
    ${kp(sgn(K.worst), T('worst_bet'), 'var(--r)')}
    ${kp(K.streak ? (K.streak > 0 ? K.streak + T('win_streak_txt') : -K.streak + T('loss_streak_txt')) : '—', T('current_streak'))}
    ${kp(K.bw + ' / ' + K.bl, T('win_streak'))}
    ${kp(nf(K.dd), T('max_dd'))}
  </div>
  <div class="card"><h3>${T('pnl_chart')}</h3>${lineChart(cum)}</div>
  <div class="two">
    <div class="card"><h3>${T('pnl_period')}${timeUnitTxt}</h3>${barChart(BK, (v) => nf(v, 1))}</div>
    <div class="card"><h3>${T('win_rate_period')}${timeUnitTxt}</h3>${barChart(BK.map((b) => ({ l: b.l, n: b.n, v: b.n ? Math.round(b.w / b.n * 100) : 0 })), (v) => v + '%', () => 'var(--b)')}</div>
  </div>
  <div class="card">
    <h3>${T('leg_quality')}</h3>
    <div class="grid" style="padding:4px 0 0">
      ${kp(LG.length, T('legs_done'))}
      ${kp(LG.length ? Math.round(lh / LG.length * 100) + '%' : '—', T('legs_hit_pct'))}
      ${kp(LG.length ? Math.round(imp * 100) + '%' : '—', T('expected_pct'))}
      ${kp(LG.length ? sgn((lh / LG.length - imp) * 100).replace(/^(.+)$/, '$1%') : '—', T('edge'), clrP(lh / (LG.length || 1) - imp))}
    </div>
    <div class="mut sm">${T('edge_hint')}</div>
  </div>
  <div class="two">
    ${hrows(T('mkt_accuracy'), group(LG, (z) => mkt(z.l.pick), (z) => ({ w: z.hit ? 1 : 0, e: 1 / z.l.odds })), { exp: 1 })}
    ${hrows(T('odds_accuracy'), group(LG.filter((z) => z.l.odds), (z) => band(z.l.odds), (z) => ({ w: z.hit ? 1 : 0, e: 1 / z.l.odds })), { exp: 1 })}
    ${hrows(T('league_accuracy'), group(LG, (z) => lgKey(z), (z) => ({ w: z.hit ? 1 : 0, e: 1 / z.l.odds })).slice(0, 18), { exp: 1 })}
    ${hrows(T('size_pnl'), group(D, (h) => sizeB(h.b.legs.length), (h) => ({ w: h.w ? 1 : 0, p: h.p }), true), { profit: 1, max: Math.max(1, Math.abs(K.profit), mx) })}
    ${hrows(T('weekday_pnl'), wdG, { profit: 1, max: pmax(wdG) })}
    ${hrows(T('tag_pnl'), tagG, { profit: 1, max: pmax(tagG) })}
  </div>
  <div class="card">
    <h3>${T('active_bets_stats')}</h3>
    <div class="grid" style="padding:4px 0 0">
      ${kp(as.length, T('active_count'))}
      ${kp(nf(stk), T('active_stake'))}
      ${kp(nf(at.reduce((s, x) => s + +x.b.win, 0)), T('potential_win_all'))}
      ${kp(sgn(ex - stk), T('expected_profit'), clrP(ex - stk))}
    </div>
    <div class="mut sm">${T('expected_note')}</div>
  </div>`;
}
