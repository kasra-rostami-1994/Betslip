/* parse.js: خواندن متن بلیت سایت شرط‌بندی + فهرست نوع شرط‌ها */
const {fold}=Core;
const num=s=>parseFloat(String(s).replace(/,/g,''));
function toPick(sel,h){const s=sel.trim(),m=s.match(/^(over|under)\s+([\d.]+)$/i);
 if(m)return m[1][0].toUpperCase()+m[2];if(/^draw$/i.test(s))return'X';
 const p=s.split(/ or /i);if(p.length==2)return/^draw$/i.test(p[0].trim())?'X2':'1X';
 return fold(s).trim()==fold(h).trim()?'1':'2'}
function bbScope(period){if(/1st|first/i.test(period))return'@1H';if(/2nd|second/i.test(period))return'@2H';return''}
function bbOU(sel){const m=sel.match(/^(over|under)\s+([\d.]+)$/i);return m?[m[1][0].toUpperCase(),m[2]]:null}
function bbSide(sel,home,away){const f=fold(sel);if(f.includes(fold(home).split(' ')[0]))return'H';if(f.includes(fold(away).split(' ')[0]))return'A';return null}
function bbEach(sel){const m=sel.match(/^each team (over|under) ([\d.]+)$/i);return m?[m[1][0].toUpperCase(),m[2]]:null}
function bbPick(cat,sel,period,home,away){
 const sc=bbScope(period),ou=bbOU(sel),ea=bbEach(sel),c=cat.toLowerCase();
 if(c.includes('total goal')&&ou)return ou[0]+ou[1]+sc;
 if(c.includes('total card')&&ou)return'K'+ou[0]+ou[1]+sc;
 if(c.includes('total corner')&&ou)return'C'+ou[0]+ou[1]+sc;
 if(c.includes('card')){if(ea)return'EK'+ea[0]+ea[1]+sc;if(ou){const sd=bbSide(sel,home,away);if(sd)return sd+'K'+ou[0]+ou[1]+sc}return null}
 if(c.includes('corner')){if(ea)return'EC'+ea[0]+ea[1]+sc;if(ou){const sd=bbSide(sel,home,away);if(sd)return sd+'C'+ou[0]+ou[1]+sc}return null}
 if(c.includes('goal')&&ou){const sd=bbSide(sel,home,away);return(sd||'')+ou[0]+ou[1]+sc}
 if(/double chance|match result|1x2|match winner|match odds/.test(c))return toPick(sel,home);
 if(/both teams? to score|btts/.test(c))return/^yes$/i.test(sel)?'BY':/^no$/i.test(sel)?'BN':null;
 return null}
function parseBuilder(t){
 const L=t.split('\n').map(s=>s.trim().replace(/^[*•]\s*/,'')).filter(Boolean);
 const MK=/^([^-]+?) - (.+?)\s*\(([^()]+)\)$/,FX=/^(.+?) - (.+)$/;
 let buf=[],legs=[],W=[];
 for(const s of L){
  if(/^active$/i.test(s))continue;
  const mk=s.match(MK);
  if(mk){buf.push({cat:mk[1].trim(),sel:mk[2].trim(),period:mk[3].trim()});continue}
  const fx=s.match(FX);
  if(fx&&buf.length){
   const home=fx[1].trim(),away=fx[2].trim(),picks=[],miss=[];
   buf.forEach(b=>{const p=bbPick(b.cat,b.sel,b.period,home,away);if(p)picks.push(p);else miss.push(b.cat+' - '+b.sel+' ('+b.period+')')});
   if(picks.length)legs.push({home,away,pick:picks.join('&'),odds:null});
   if(miss.length)W.push((CL==='en'?'Unknown market(s) for ':'بازار(های) ناشناخته برای ')+home+' - '+away+': '+miss.join('، '));
   buf=[]}
 }
 if(!legs.length)return null;
 const w=L.findIndex(s=>/^Potential win/i.test(s)),n=w>=0?L.slice(w+1).filter(s=>/^[\d.,]+$/.test(s)).map(num):[];
 const c=L.findIndex(s=>/^Cash out$/i.test(s)),cv=c>=0?num(L[c+1]):NaN;
 if(!n[0])W.push(CL==='en'?'Total odds not found in text; temporarily set to 1.':'ضریب کل در متن پیدا نشد؛ موقتاً ۱ گذاشته شد و باید دستی اصلاح شود.');
 const odds=n[0]||1,stake=n[1]||1,mn=L.find(s=>/^multi\s+\d+/i.test(s));
 return{name:mn||'multi '+legs.length,stake,odds,win:n[2]||+(stake*odds).toFixed(2),cash:isNaN(cv)?null:cv,legs,_w:W.join('\n')}}
function parseBlock(t){
 const L=t.split('\n').map(s=>s.trim().replace(/^[*•]\s*/,'')).filter(s=>s&&!/^\(\s*\d+\s*[:\-]\s*\d+\s*\)$/.test(s)),legs=[];
 L.forEach((s,i)=>{if(i>=3&&/^(1x2|double chance|asian total)$/i.test(L[i-1].replace(/\s*\(\s*\d+\s*[:\-]\s*\d+\s*\)$/,''))&&/^\d+(\.\d+)?(\(\d+:\d+\))?$/.test(L[i-2])&&s.includes(' - ')){
  const k=s.indexOf(' - '),home=s.slice(0,k).trim(),away=s.slice(k+3).trim();
  legs.push({home,away,pick:toPick(L[i-3],home),odds:parseFloat(L[i-2])})}});
 if(!legs.length)return null;
 const w=L.findIndex(s=>/^Potential win/i.test(s)),n=w>=0?L.slice(w+1).filter(s=>/^[\d.,]+$/.test(s)).map(num):[];
 const c=L.findIndex(s=>/^Cash out$/i.test(s)),cv=c>=0?num(L[c+1]):NaN;
 const odds=n[0]||+legs.reduce((p,l)=>p*l.odds,1).toFixed(2),stake=n[1]||1;
 const mn=L.find(s=>/^multi\s+\d+/i.test(s)),ex=mn?+mn.match(/\d+/)[0]:0,pd=legs.reduce((p,l)=>p*l.odds,1),W=[];
 if(ex&&ex!=legs.length)W.push(CL==='en'?`Text stated ${ex} games but ${legs.length} games were detected.`:`در متن ${ex} بازی نوشته شده ولی ${legs.length} بازی تشخیص داده شد.`);
 if(n[0]&&Math.abs(pd-n[0])/n[0]>.04)W.push(CL==='en'?`Total odds (${n[0]}) does not match product of legs (${pd.toFixed(2)}); a leg may be missing.`:`ضریب کل (${n[0]}) با حاصل‌ضرب ضرایب بازی‌ها (${pd.toFixed(2)}) نمی‌خواند؛ شاید بازی‌ای جا افتاده باشد.`);
 return{name:mn||'multi '+legs.length,stake,odds,win:n[2]||+(stake*odds).toFixed(2),cash:isNaN(cv)?null:cv,legs,_w:W.join('\n')}}

const CT=[
  ['1','برد میزبان','Home Win'],
  ['2','برد میهمان','Away Win'],
  ['X','مساوی','Draw'],
  ['1X','میزبان یا مساوی','Home or Draw'],
  ['X2','مساوی یا میهمان','Draw or Away'],
  ['12','بدون مساوی','No Draw (Any Win)'],
  ['O','مجموع گل بالای … (مقدار: 2.5)','Total Goals Over (e.g. 2.5)'],
  ['U','مجموع گل زیر … (مقدار: 3.5)','Total Goals Under (e.g. 3.5)'],
  ['HO','گل میزبان بالای …','Home Goals Over'],
  ['HU','گل میزبان زیر …','Home Goals Under'],
  ['AO','گل میهمان بالای …','Away Goals Over'],
  ['AU','گل میهمان زیر …','Away Goals Under'],
  ['Q1','صعود میزبان (کل بازی، با وقت اضافه و پنالتی)','Home Qualify (inc. ET/pens)'],
  ['Q2','صعود میهمان (کل بازی)','Away Qualify (inc. ET/pens)'],
  ['BY','هر دو تیم گل می‌زنند','Both Teams to Score (Yes)'],
  ['BN','حداقل یک تیم گل نمی‌زند','Not Both Teams to Score (No)'],
  ['T','تعداد دقیق کل گل … (مقدار: 3)','Exact Goals Count (e.g. 3)'],
  ['S','نتیجهٔ دقیق … (مقدار: 2-1)','Exact Scoreline (e.g. 2-1)'],
  ['AH1','هندیکپ میزبان … (مقدار: -1.5)','Home Asian Handicap (e.g. -1.5)'],
  ['AH2','هندیکپ میهمان … (مقدار: +0.5)','Away Asian Handicap (e.g. +0.5)'],
  ['KO','مجموع کارت‌ها بالای … (مقدار: 7.5)','Total Cards Over (e.g. 7.5)'],
  ['KU','مجموع کارت‌ها زیر …','Total Cards Under'],
  ['CO','مجموع کرنر بالای … (مقدار: 4.5)','Total Corners Over (e.g. 4.5)'],
  ['CU','مجموع کرنر زیر …','Total Corners Under'],
  ['EKO','هر دو تیم کارت بالای …','Each Team Cards Over'],
  ['ECO','هر دو تیم کرنر بالای …','Each Team Corners Over']
];
const needV=c=>!['1','2','X','1X','X2','12','BY','BN','Q1','Q2'].includes(c);

function parseManual(t,f){
 const legs=t.split('\n').map(s=>s.split('|').map(x=>x.trim())).filter(a=>a.length==3&&a[0].includes(' - ')).map(a=>{const k=a[0].indexOf(' - ');return{home:a[0].slice(0,k).trim(),away:a[0].slice(k+3).trim(),pick:a[1].toUpperCase(),odds:num(a[2])}}).filter(l=>l.odds>1);
 if(!legs.length)return null;
 const odds=num(f.odds)||+legs.reduce((p,l)=>p*l.odds,1).toFixed(2),stake=num(f.stake)||1;
 return{name:f.name||'multi '+legs.length,stake,odds,win:+(stake*odds).toFixed(2),cash:null,legs}}
