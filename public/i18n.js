/* i18n.js: دو زبانه (فارسی/انگلیسی). فعلاً فقط چارچوب اصلی رابط ترجمه شده؛
   برچسب‌های تولیدی داخل core.js (نوع شرط‌ها) و جدول‌های آمار هنوز فقط فارسی‌اند. */
const I18N = {
  bets: ['بلیت‌ها', 'Bets'], risk: ['ریسک', 'Risk'], hist: ['تاریخچه', 'History'], stats: ['آمار', 'Stats'], board: ['رتبه‌بندی', 'Leaderboard'],
  login: ['ورود', 'Log in'], addBet: ['+ بلیت', '+ Bet'], menu: ['منو', 'Menu'],
  profile: ['پروفایل من', 'My Profile'], trash: ['سطل زباله', 'Trash'], exportJson: ['خروجی JSON', 'Export JSON'], importJson: ['ورود JSON', 'Import JSON'],
  backups: ['پشتیبان‌های روزانه', 'Daily Backups'], telegram: ['اعلان و ربات تلگرام', 'Telegram Bot & Alerts'], logout: ['خروج', 'Log out'],
  selectBulk: ['انتخاب گروهی', 'Select'], selectedCount: ['انتخاب', 'selected'], selectAll: ['انتخاب همه', 'Select all'],
  archive: ['بایگانی', 'Archive'], restore: ['بازگردانی', 'Restore'], delete: ['حذف', 'Delete'], done: ['پایان', 'Done'],
  odds: ['ضریب', 'Odds'], stake: ['مبلغ', 'Stake'], win: ['برد', 'Win'], cashout: ['کش‌اوت', 'Cash-out'], probability: ['احتمال', 'Probability'], settledWin: ['برد تسویه‌شده', 'Settled win'],
  edit: ['ویرایش', 'Edit'], details: ['جزئیات بازی‌ها ▾', 'Game Details ▾'], hideDetails: ['بستن جزئیات ▴', 'Hide Details ▴'],
  copyLink: ['کپی لینک', 'Copy Link'], shareBtn: ['اشتراک‌گذاری', 'Share'], unshare: ['لغو اشتراک', 'Unshare'],
  emptyActive: ['هنوز بلیت فعالی ندارید.', 'No active bets yet.'], emptyFiltered: ['بلیتی با این فیلتر نیست.', 'No bets match this filter.'],
  emptyHist: ['بلیتی در بایگانی نیست.', 'No bets in the archive.'], emptyRisk: ['بلیت فعالی نیست.', 'No active bets.'], emptyTrash: ['سطل خالی است.', 'Trash is empty.'],
  username: ['نام کاربری (انگلیسی)', 'Username'], password: ['رمز (حداقل ۸ کاراکتر)', 'Password (min 8 chars)'], inviteCode: ['کد دعوت', 'Invite code'],
  continueBtn: ['ادامه', 'Continue'], noAccount: ['حساب ندارید؟ ثبت‌نام', 'No account? Sign up'], haveAccount: ['حساب دارید؟ ورود', 'Have an account? Log in'], signup: ['ثبت‌نام', 'Sign up'],
  search: ['جستجو: نام بلیت، تیم، برچسب…', 'Search: bet name, team, tag…'],
  sortRisk: ['بیشترین ریسک', 'Highest risk'], sortNew: ['جدیدترین', 'Newest'], sortOld: ['قدیمی‌ترین', 'Oldest'], sortOdds: ['بیشترین ضریب', 'Highest odds'], sortWin: ['بیشترین برد', 'Highest win'],
  allTags: ['همهٔ برچسب‌ها', 'All tags'], allResults: ['همه نتایج', 'All results'], won: ['برنده‌ها', 'Won'], lost: ['بازنده‌ها', 'Lost'],
  allTime: ['همهٔ زمان‌ها', 'All time'], days7: ['7 روز', '7 days'], days30: ['30 روز', '30 days'], days90: ['90 روز', '90 days'],
  activeBetsK: ['بلیت فعال', 'Active bets'], liveGamesK: ['بازی زنده', 'Live games'], inPlayStakeK: ['شرطِ در جریان', 'Stake in play'], potentialWinK: ['برد در صورت موفقیت همه', 'Win if all succeed'],
  save: ['ذخیره', 'Save'], close: ['بستن', 'Close'],
};
let LANG = ls.g('lang') || 'fa';
function t(k) { const e = I18N[k]; return e ? (LANG === 'en' ? e[1] : e[0]) : k; }
function applyDir() {
  document.documentElement.lang = LANG; document.documentElement.dir = LANG === 'en' ? 'ltr' : 'rtl';
  document.body.classList.toggle('en', LANG === 'en');
}
function setLang(l) { if (l === LANG) return; LANG = l; ls.s('lang', l); applyDir(); mountShell(); mountDialogs(); render(); }
