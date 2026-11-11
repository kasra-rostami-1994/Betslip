/* stats.js: تحلیل آماری منطبق بر هویت بصری اسکرین‌شات‌ها (۷ کپسول KPI بالا، سورت نزولی درصدها و لیگ/کشور) */
const nf = (n, d) => (+n).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });
const sgn = (n) => (n > 0 ? '+' : '') + nf(n);
const clrP = (n) => (n > 0 ? 'var(--g)' : n < 0 ? 'var(--r)' : 'var(--mut)');
const fD = (t) => (t ? new Date(t).toLocaleDateString(CL === 'en' ? 'en-US' : 'fa-IR-u-nu-latn') : '');
const fDM = (t) => (t ? new Intl.DateTimeFormat(CL === 'en' ? 'en-US' : 'fa-IR-u-nu-latn', { month: 'numeric', day: 'numeric' }).format(new Date(t)) : '');
const jm = (t) => { const p = {}; new Intl.DateTimeFormat('fa-IR-u-nu-latn-ca-persian', { year: 'numeric', month: 'numeric' }).formatToParts(new Date(t)).forEach((x) => (p[x.type] = x.value)); return p; };
const JM = (t) => { const p = jm(t); return p.year + '/' + String(p.month).padStart(2, '0'); };
const MN = (t) => (CL === 'en' ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(t)) : new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' }).format(new Date(t)));
const wday = (t) => (new Date(t).getDay() + (CL === 'en' ? 0 : 1)) % 7;
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
  const ret = W.reduce((s, h) => s + h.b.stake * h.b.odds, 0);
  let cur = 0, ty = 0, bw = 0, bl = 0, run = 0, peak = 0, dd = 0;
  D.forEach((h) => {
    const k = h.w ? 'w' : 'l';
    if (k === ty) cur++; else { ty = k; cur = 1; }
    if (k === 'w') bw = Math.max(bw, cur); else bl = Math.max(bl, cur);
    run += h.p; peak = Math.max(peak, run); dd = Math.max(dd, peak - run);
  });
  return {
    n, won: W.length, lost: n - W.length, rate: n ? W.length / n : 0, staked: st, ret, profit: pr,
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

// مرتب‌سازی نزولی بر اساس درصد برد
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

/* ---- نمودارها (SVG مدرن هماهنگ با تم تیره) ---- */
function lineChart(pts) {
  if (pts.length < 2) return `<div class="mut sm" style="text-align:center;padding:24px 0">${T('min2_bets')}</div>`;
  const W = 640, H = 180, P = 14, xs = pts.map((p) => p.t), x0 = Math.min(...xs), x1 = Math.max(...xs) || 1;
  const vs = pts.map((p) => p.v).concat(0), lo = Math.min(...vs), hi = Math.max(...vs), r = hi - lo || 1;
  const X = (t) => P + ((t - x0) / (x1 - x0 || 1)) * (W - 2 * P);
  const Y = (v) => H - 24 - ((v - lo) / r) * (H - 46);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1)).join(' ');
  const z = Y(0), last = pts[pts.length - 1].v, c = last >= 0 ? 'var(--g)' : 'var(--r)';
  const gradId = 'chartGrad_' + Math.random().toString(36).slice(2, 6);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    <defs>
      <linearGradient id="${gradId}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${c}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <line x1="0" x2="${W}" y1="${z}" y2="${z}" stroke="var(--line)" stroke-dasharray="3 4"/>
    <path d="${d} L${X(x1).toFixed(1)} ${z} L${X(x0).toFixed(1)} ${z}Z" fill="url(#${gradId})"/>
    <path d="${d}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.filter((_, i) => pts.length < 35 || i % Math.ceil(pts.length / 35) === 0 || i === pts.length - 1).map((p) => `<circle cx="${X(p.t).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.5" fill="var(--card)" stroke="${c}" stroke-width="2"><title>${esc(p.l)}: ${sgn(p.v)} USDT</title></circle>`).join('')}
    <text x="${P}" y="${H - 6}">${fD(x0)}</text>
    <text x="${W - P}" y="${H - 6}" text-anchor="end">${fD(x1)}</text>
    <text x="${P}" y="14" font-weight="700">${nf(hi)}</text>
    <text x="${P}" y="${H - 28}">${nf(lo)}</text>
  </svg>`;
}

function barChart(B, fmt, color) {
  if (!B.length) return `<div class="mut sm" style="text-align:center;padding:24px 0">${T('no_range_data')}</div>`;
  const W = Math.max(320, B.length * 48), H = 160, z = 80, mx = Math.max(1e-9, ...B.map((b) => Math.abs(b.v))), step = Math.ceil(B.length / 14);
  return `<div style="overflow-x:auto"><svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:${W}px" role="img">
    <line x1="0" x2="${W}" y1="${z}" y2="${z}" stroke="var(--line)"/>
    ${B.map((b, i) => {
      const h = Math.abs(b.v) / mx * 58, x = i * 48 + 8, y = b.v >= 0 ? z - h : z, c = color ? color(b.v) : (b.v >= 0 ? 'var(--g)' : 'var(--r)');
      return `<rect x="${x}" y="${y}" width="32" height="${Math.max(h, 2)}" rx="4" fill="${c}"><title>${esc(b.l)}: ${fmt(b.v)}${b.n ? ' · ' + b.n + ' ' + T('games') : ''}</title></rect>
      <text x="${x + 16}" y="${b.v >= 0 ? y - 4 : y + h + 12}" text-anchor="middle" font-size="10.5">${fmt(b.v)}</text>
      ${i % step === 0 ? `<text x="${x + 16}" y="${H - 6}" text-anchor="middle" font-size="10">${esc(b.l)}</text>` : ''}`;
    }).join('')}
  </svg></div>`;
}

function hrows(title, rows, o) {
  o = o || {};
  const body = rows.length ? rows.map(([k, v]) => {
    const rate = v.n ? v.w / v.n : 0;
    const c = o.profit ? clrP(v.p) : (rate >= (v.n ? v.e / v.n : 0) && o.exp ? 'var(--g)' : (o.exp ? 'var(--o)' : 'var(--tx)'));
    const val = o.profit ? Math.min(100, Math.abs(v.p) / (o.max || 1) * 100) : rate * 100;
    return `<div class="tr">
      <span title="${esc(k)}">${esc(k)}</span>
      <div class="bx"><i style="width:${val}%;background:${c}"></i>${o.exp ? `<u style="inset-inline-start:${Math.min(99, (v.e / v.n) * 100)}%"></u>` : ''}</div>
      <span>${o.profit ? sgn(v.p) + ' · ' : ''}${Math.round(rate * 100)}% · ${v.w}/${v.n}</span>
    </div>`;
  }).join('') : `<div class="mut sm" style="text-align:center;padding:12px 0">${T('no_data')}</div>`;
  return `<div class="chart-card"><h3>${title}</h3>${body}${o.exp ? `<div class="mut sm" style="margin-top:8px">${T('expected_line')}</div>` : ''}</div>`;
}

/* ---- نمای کامل آمار منطبق بر اسکرین‌شات ۳ و ۴ ---- */
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
  const mx = Math.max(1, ...Object.values(D.reduce((m, h) => { m[h.b.id] = h; return m; }, {})).map((h) => Math.abs(h.p)));

  const tagG = group(D.flatMap((h) => (h.b.tags || []).map((t) => ({ t, h }))), (x) => x.t, (x) => ({ w: x.h.w ? 1 : 0, p: x.h.p }), true);
  const wds = wdNames();
  const wdG = group(D, (h) => wds[wday(h.t)], (h) => ({ w: h.w ? 1 : 0, p: h.p }), true).sort((a, b) => wds.indexOf(a[0]) - wds.indexOf(b[0]));
  const pmax = (rows) => Math.max(1, ...rows.map(([, v]) => Math.abs(v.p)));

  const lgKey = (z) => {
    const lg = z.l.lg || (z.l.fin && z.l.fin.lg) || '';
    const cy = z.l.cy || (z.l.fin && z.l.fin.cy) || '';
    const cyT = cy ? lcy(cy) : '';
    if (cyT && lg) return cyT + ' · ' + lg;
    return cyT || lg || T('unknown');
  };

  const sel = (k, opts, v) => `<select data-a="st" data-k="${k}">${opts.map(([a, b]) => `<option value="${a}"${a === v ? ' selected' : ''}>${b}</option>`).join('')}</select>`;
  const timeUnitTxt = gran === 'day' ? T('per_day') : gran === 'week' ? T('per_week') : T('per_month');

  // ۷ کپسول آماری دقیقاً مطابق اسکرین‌شات ۳ و ۴
  const kpisHtml = `<div class="kpis kpis-7">
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Settled Bets' : 'بلیت تمام‌شده'}</div>
      <div class="kv-num" style="color:var(--tx)">${K.n}</div>
    </div>
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Won' : 'برنده'}</div>
      <div class="kv-num" style="color:var(--g)">${K.won}</div>
    </div>
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Lost' : 'بازنده'}</div>
      <div class="kv-num" style="color:var(--r)">${K.lost}</div>
    </div>
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Win Rate' : 'درصد برد'}</div>
      <div class="kv-num" style="color:var(--tx)">${Math.round(K.rate * 100)}%</div>
    </div>
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Total Stake' : 'مجموع شرط'}</div>
      <div class="kv-num" style="color:var(--tx)">${nf(K.staked)}</div>
    </div>
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Returns' : 'بازگشت'}</div>
      <div class="kv-num" style="color:var(--tx)">${nf(K.ret)}</div>
    </div>
    <div class="k-card">
      <div class="kt">${CL === 'en' ? 'Profit / Loss' : 'سود/زیان'}</div>
      <div class="kv-num" style="color:${clrP(K.profit)}">${sgn(K.profit)}</div>
    </div>
  </div>`;

  const toolbarHtml = `<div class="tool">
    ${sel('range', [['7', T('last_7')], ['30', T('last_30')], ['90', T('last_90')], ['180', T('last_180')], ['365', T('last_year')], ['all', T('all_time')]], rg)}
    ${sel('gran', [['auto', T('time_unit')], ['day', T('daily')], ['week', T('weekly')], ['month', T('monthly')]], U.gran)}
    <span class="sp"></span>
    <div class="mut sm">${K.n ? `ROI: ${(K.roi * 100).toFixed(1)}% · ${CL === 'en' ? 'Avg Odds: ' : 'میانگین ضریب: '}${nf(K.avgOdds)}` : T('no_stats')}</div>
  </div>`;

  return kpisHtml + toolbarHtml +
    `<div class="chart-card"><h3>${T('pnl_chart')}</h3>${lineChart(cum)}</div>
    <div class="two">
      <div class="chart-card"><h3>${T('pnl_period')}${timeUnitTxt}</h3>${barChart(BK, (v) => nf(v, 1))}</div>
      <div class="chart-card"><h3>${T('win_rate_period')}${timeUnitTxt}</h3>${barChart(BK.map((b) => ({ l: b.l, n: b.n, v: b.n ? Math.round(b.w / b.n * 100) : 0 })), (v) => v + '%', () => 'var(--b)')}</div>
    </div>
    <div class="two">
      ${hrows(T('league_accuracy'), group(LG, (z) => lgKey(z), (z) => ({ w: z.hit ? 1 : 0, e: 1 / z.l.odds })).slice(0, 16), { exp: 1 })}
      ${hrows(T('mkt_accuracy'), group(LG, (z) => mkt(z.l.pick), (z) => ({ w: z.hit ? 1 : 0, e: 1 / z.l.odds })), { exp: 1 })}
      ${hrows(T('odds_accuracy'), group(LG.filter((z) => z.l.odds), (z) => band(z.l.odds), (z) => ({ w: z.hit ? 1 : 0, e: 1 / z.l.odds })), { exp: 1 })}
      ${hrows(T('size_pnl'), group(D, (h) => sizeB(h.b.legs.length), (h) => ({ w: h.w ? 1 : 0, p: h.p }), true), { profit: 1, max: Math.max(1, Math.abs(K.profit), mx) })}
    </div>`;
}
