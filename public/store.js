/* store.js: شبکه، همگام‌سازی تک‌به‌تکِ بلیت‌ها، دریافت نتایج زنده، دو زبانه و ترجمه */
const VER = '2.2.0';
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ls = { g: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, s: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

// ---------- ترجمه و زبان ----------
let CL = ls.g('lang') || 'fa';
document.documentElement.lang = CL;
document.documentElement.dir = CL === 'en' ? 'ltr' : 'rtl';

const CY_FA = {
  Turkey:'ترکیه', Germany:'آلمان', England:'انگلیس', Spain:'اسپانیا', Italy:'ایتالیا',
  France:'فرانسه', Netherlands:'هلند', Portugal:'پرتغال', Belgium:'بلژیک', Scotland:'اسکاتلند',
  Austria:'اتریش', Denmark:'دانمارک', Greece:'یونان', Norway:'نروژ', Poland:'لهستان',
  Romania:'رومانی', Serbia:'صربستان', Sweden:'سوئد', Switzerland:'سوئیس', 'Czech Republic':'جمهوری چک',
  Iran:'ایران', Europe:'اروپا', World:'جهان', 'South America':'آمریکای جنوبی', Africa:'آفریقا',
  Asia:'آسیا', Brazil:'برزیل', Argentina:'آرژانتین', Morocco:'مراکش', Egypt:'مصر',
  Japan:'ژاپن', 'South Korea':'کره جنوبی', 'Saudi Arabia':'عربستان', Qatar:'قطر',
  'United States':'آمریکا', Mexico:'مکزیک', Croatia:'کرواسی', Ukraine:'اوکراین', Russia:'روسیه',
  Australia:'استرالیا', China:'چین'
};
const lcy = (cy) => (!cy ? '' : CL === 'fa' ? (CY_FA[cy] || cy) : cy);

const FA = {
  bets:'بلیت‌ها', risk:'ریسک', hist:'تاریخچه', stats:'آمار', board:'رتبه‌بندی',
  me_tab:'پروفایل من', trash_tab:'سطل زباله', add_bet:'+ بلیت', login_btn:'ورود',
  my_profile:'پروفایل من', all_stats:'آمار', trash_menu:'سطل زباله',
  export_json:'خروجی JSON', import_json:'ورود JSON', daily_backup:'پشتیبان‌های روزانه',
  tg_notify:'اعلان و ربات تلگرام', logout:'خروج',
  cls_wr:'پای اشتباهِ زنده', cls_near:'نزدیک به پیش‌بینی',
  cls_ok:'زنده و مطابق', cls_wait:'در انتظار شروع',
  cls_won:'برنده', cls_lost:'باخت قطعی',
  games:'بازی', correct:'درست', on_track:'مطابق', close_pick:'نزدیک',
  wrong:'اشتباه', prob:'احتمال ~',
  stake:'مبلغ', win:'برد', cash:'کش‌اوت',
  won_chip:'برنده', lost_chip:'بازنده', no_result:'بدون نتیجه',
  created:'ساخت', matches:'بازی‌ها', archived:'بایگانی',
  settlement:'تسویه', auto_arch:'خودکار',
  edit:'ویرایش', cashout_btn:'کش‌اوت',
  vis_private:'خصوصی', vis_link:'فقط با لینک', vis_public:'عمومی (در پروفایل)',
  copy_link:'کپی لینک', archive:'بایگانی', restore_active:'بازگردانی به فعال', delete:'حذف',
  tl_critical:'بحرانی', tl_close:'نزدیک', tl_wait:'در انتظار',
  tl_ok:'مطابق پیش‌بینی', tl_done:'تمام‌شده و درست',
  critical_games:'بازیِ بحرانی', close_games:'نزدیک', started:'بازیِ شروع‌شده', not_started:'شروع‌نشده',
  bets_at_risk:'بلیت در معرض خطر', potential_win:'برد احتمالی',
  trash_title:'سطل زباله', empty_trash:'خالی کردن سطل',
  trash_days_removed:'روز پیش حذف شد', days_to_remove:'روز تا حذف نهایی',
  trash_restore:'بازگردانی', trash_perm:'حذف دائمی',
  trash_30days:'بلیت‌های حذف‌شده ۳۰ روز نگه داشته می‌شوند.', trash_empty:'سطل خالی است.',
  leaderboard:'رتبه‌بندی', pub_only:'فقط پروفایل‌های عمومی',
  board_col_hint:'ستون‌ها: بلیت‌های برده از کل · ROI · امتیاز',
  score:'امتیاز', rank:'رتبه', done_bets:'بلیت تمام‌شده',
  win_pct:'درصد برد', roi:'ROI', joined:'عضو از',
  pub_bets:'بلیت‌های عمومی', no_pub_bets:'بلیت عمومی‌ای ندارد.',
  no_active:'هنوز بلیت فعالی ندارید.', add_first:'+ افزودن بلیت',
  no_filter:'بلیتی با این فیلتر نیست.', no_hist:'بلیتی در بایگانی نیست.',
  no_data:'داده‌ای نیست', loading:'در حال دریافت…',
  profile_not_found:'این پروفایل پیدا نشد یا عمومی نیست.',
  share_invalid:'این لینک معتبر نیست یا اشتراک‌گذاری آن لغو شده است.',
  shared_bet_by:'بلیت اشتراک‌گذاری‌شده از',
  selected:'انتخاب', select_all:'انتخاب همه',
  archive_sel:'بایگانی', restore_sel:'بازگردانی', delete_sel:'حذف', end_sel:'پایان',
  search_ph:'جستجو: نام بلیت، تیم، برچسب…',
  all_results:'همه نتایج', winners:'برنده‌ها', losers:'بازنده‌ها',
  sort_risk:'بیشترین ریسک', sort_new:'جدیدترین', sort_old:'قدیمی‌ترین',
  sort_odds:'بیشترین ضریب', sort_win:'بیشترین برد',
  all_tags:'همهٔ برچسب‌ها', group_sel:'انتخاب گروهی', end_group:'پایان انتخاب',
  filter_label:'فیلتر:', clear_filter:'حذف فیلتر',
  source_manual:'منبع: دستی', source_saved:'منبع: ذخیره‌شده',
  conflict_txt:'⚠ اختلاف:', select_game:'انتخاب دستی بازی', set_final:'ثبت نتیجهٔ نهایی',
  not_in_sources:'در منابع نیست',
  end_ft:'پایان', end_90:'پایان ۹۰ دقیقه (وقت اضافه بود)', over_time:'۹۰ دقیقه تمام؛ وقت اضافه',
  postponed:'تعویق یا لغو', live_manual:'زنده (دستی)', end_manual:'پایان (دستی)',
  stats_title:'آمار و تحلیل', time_unit:'واحد زمان: خودکار', daily:'روزانه', weekly:'هفتگی', monthly:'ماهانه (شمسی)',
  all_time:'همهٔ زمان‌ها', last_7:'۷ روز اخیر', last_30:'۳۰ روز اخیر', last_90:'۹۰ روز اخیر', last_180:'۱۸۰ روز اخیر', last_year:'یک سال اخیر',
  no_stats:'در این بازه بلیت تمام‌شده‌ای نیست؛ آمار بعد از بایگانی بلیت‌ها ساخته می‌شود.',
  done_bets2:'بلیت تمام‌شده',
  win_rate:'درصد برد', pnl:'سود/زیان (USDT)', roi_total:'ROI روی مجموع شرط',
  total_stake:'مجموع شرط', avg_odds:'میانگین ضریب', avg_stake:'میانگین مبلغ هر بلیت',
  avg_legs:'میانگین تعداد بازی', best_bet:'بهترین بلیت', worst_bet:'بدترین بلیت',
  current_streak:'روند فعلی', win_streak:'بیشترین برد / باخت پیاپی', max_dd:'بیشترین افت از قله',
  win_streak_txt:' برد', loss_streak_txt:' باخت',
  pnl_chart:'سود و زیان تجمعی',
  pnl_period:'سود و زیان هر ', win_rate_period:'درصد برد هر ',
  per_day:'روز', per_week:'هفته', per_month:'ماه',
  min2_bets:'برای نمودار حداقل دو بلیت تمام‌شده لازم است.',
  no_range_data:'داده‌ای در این بازه نیست.',
  leg_quality:'کیفیت پیش‌بینی (بازی‌به‌بازی)',
  legs_done:'بازیِ تمام‌شده', legs_hit_pct:'درصد درستی بازی‌ها',
  expected_pct:'درصدِ مورد انتظار از ضرایب', edge:'برتری نسبت به ضرایب',
  edge_hint:'اگر درصد درستی از درصد مورد انتظار بیشتر باشد، پیش‌بینی‌هایتان از ضرایب سایت بهتر بوده است.',
  mkt_accuracy:'درستی هر نوع بازار', odds_accuracy:'درستی بر اساس ضریب',
  league_accuracy:'درستی هر لیگ و کشور (نزولی بر اساس درصد برد)', size_pnl:'سود و زیان بر اساس اندازهٔ بلیت',
  weekday_pnl:'سود و زیان بر اساس روز هفته', tag_pnl:'سود و زیان بر اساس برچسب',
  expected_line:'خط عمودی = درصدی که ضرایب نشان می‌دادند',
  active_bets_stats:'بلیت‌های فعال (در جریان)',
  active_count:'بلیت فعال', active_stake:'مجموع شرطِ در جریان',
  potential_win_all:'برد در صورت موفقیت همه', expected_profit:'سود مورد انتظار (تقریبی)',
  expected_note:'سود مورد انتظار از روی ضرایب باقی‌ماندهٔ هر بلیت حساب می‌شود و حاشیهٔ سایت را در نظر نمی‌گیرد.',
  unknown:'نامشخص',
  active_bets:'بلیت فعال', live_games:'بازی زنده',
  stake_live:'شرطِ در جریان', win_if_all:'برد در صورت موفقیت همه',
  display_privacy:'نمایه و حریم خصوصی', display_name:'نام نمایشی',
  default_vis:'حالت پیش‌فرض بلیت‌های جدید',
  about_me:'دربارهٔ من (حداکثر ۱۶۰ حرف)',
  public_profile:'پروفایل من عمومی باشد (نام، امتیاز و آمار کلی در رتبه‌بندی دیده شود؛ مبلغ‌ها هرگز نشان داده نمی‌شوند)',
  save:'ذخیره', copy_profile:'کپی لینک پروفایل',
  pub_bets_count:'بلیت عمومی', link_bets_count:'بلیت لینکی',
  tools:'ابزارها', all_stats_btn:'آمار کامل', trash_btn:'سطل',
  export_btn:'خروجی JSON', import_btn:'ورود JSON', backup_btn:'پشتیبان‌های روزانه', tg_btn:'اعلان تلگرام',
  change_pass:'تغییر رمز', current_pass:'رمز فعلی', new_pass:'رمز جدید (حداقل ۸ کاراکتر)', change_btn:'تغییر',
  score_formula:'نحوهٔ محاسبهٔ امتیاز',
  score_desc:'هر بلیتِ برده: ۱۰ × ln(ضریب) امتیاز (مثلاً ضریب ۲ ≈ +۷ و ضریب ۲۰ ≈ +۳۰)؛ هر بلیتِ باخته: ‑۵.',
  confirm_archive:'هنوز تمام نشده؛ بایگانی شود؟',
  confirm_delete:'بلیت به سطل زباله برود؟ (۳۰ روز قابل بازگردانی است)',
  confirm_del_perm:'برای همیشه حذف شود؟', confirm_empty_trash:'سطل خالی شود؟',
  link_copied:'لینک کپی شد',
  auto_archived_msg:' بلیت به‌دلیل باخت قطعی خودکار به بایگانی رفت.',
  bet_added:' بلیت ثبت شد', prof_saved:'پروفایل ذخیره شد',
  link_built:'لینک ساخته شد؛ با «کپی لینک» برمی‌دارید',
  pass_changed:'رمز تغییر کرد', bets_fetched_err:'خطا در دریافت بلیت‌ها: ',
  vis_pub_tag:'عمومی', vis_link_tag:'لینک',
  saved:'ذخیره شد', pending_save:'در حال ذخیره…', save_err:'ذخیره نشد؛ تلاش مجدد',
  login_title:'ورود', signup_title:'ثبت‌نام',
  username_ph:'نام کاربری (انگلیسی)', pass_ph:'رمز (حداقل ۸ کاراکتر)', invite_ph:'کد دعوت',
  no_account:'حساب ندارید؟ ثبت‌نام', have_account:'حساب دارید؟ ورود',
  add_bet_title:'افزودن بلیت', edit_bet_title:'ویرایش بلیت',
  paste_mode:'چسباندن متن', form_mode:'فرم بازی‌به‌بازی', line_mode:'خطی',
  bet_name_ph:'نام بلیت (اختیاری)', tags_ph:'برچسب‌ها (با کاما: ریسکی، امن)',
  note_ph:'یادداشت (اختیاری)',
  stake_ph:'مبلغ (USDT)', odds_ph:'ضریب کل (خالی = حاصل‌ضرب)', cashout_ph:'کش‌اوت',
  host_ph:'تیم میزبان', guest_ph:'تیم میهمان', leg_odds_ph:'ضریب',
  add_pick:'+ شرط', add_game:'افزودن این بازی به بلیت',
  submit_bet:'ثبت بلیت', save_changes:'ذخیره تغییرات', close_btn:'بستن',
  invalid_pick:'مقدار شرط نامعتبر است.',
  need_game:'حداقل یک بازی به بلیت اضافه کنید.',
  need_one_game:'حداقل یک بازی باید در بلیت بماند.',
  need_all_fields:'نام هر دو تیم، ضریب (بزرگ‌تر از ۱) و حداقل یک شرط لازم است.',
  no_bets_parsed:'هیچ بازی‌ای تشخیص داده نشد؛ قالب را بررسی کنید.',
  host_goals:'گل میزبان', guest_goals:'گل میهمان', minute_opt:'دقیقه (اختیاری)',
  in_progress:'در حال انجام', finished:'پایان‌یافته (نتیجهٔ ۹۰ دقیقه)',
  final_winner:'برندهٔ نهایی (برای شرط صعود)',
  host_qualified:'میزبان صعود کرد', guest_qualified:'میهمان صعود کرد',
  sv_hint:'برای هر بازار، مقدار فعلی/نهایی را وارد کنید و اگر آن بازار تمام شده «نهایی» را بزنید.',
  manual_val:'مقدار', final_chk:'نهایی',
  save_result:'ذخیره', clear_manual:'حذف نتیجهٔ دستی', clear_saved:'بازنشانی نتیجهٔ ذخیره‌شده',
  enter_goals:'گل هر دو تیم را وارد کنید.',
  co_intro:'ماشین‌حساب کش‌اوت · ',
  est_win_prob:'احتمال تقریبی برد:',
  optimistic_note:'(خوش‌بینانه؛ حاشیهٔ سایت لحاظ نشده)',
  hold_win:'برد در صورت نگه‌داشتن:', hold_ev:'ارزش مورد انتظار نگه‌داشتن:',
  site_offer:'پیشنهاد سایت:', needed_prob:'احتمال لازم برای ارزش نگه‌داشتن:',
  co_better:'کش‌اوت از ارزش مورد انتظارِ نگه‌داشتن بیشتر است',
  hold_better:'نگه‌داشتن ارزش مورد انتظار بیشتری دارد',
  diff:'اختلاف', enter_co:'مبلغ پیشنهادی سایت را وارد کنید.',
  fin_guide:'راهنمای تقریبی است، نه توصیهٔ مالی.',
  map_hint:'بازی را از نتایج منابع انتخاب کنید تا برای همهٔ بلیت‌ها یادش بماند.',
  search_teams:'جستجوی اسم تیم در منابع',
  no_match:'موردی در منابع پیدا نشد؛ کلمهٔ دیگری بنویسید.',
  tg_hint:'توکن را از BotFather و Chat ID را از getUpdates بگیرید. زمان‌بند (cron) باید /api/notify را هر ۱ تا ۵ دقیقه صدا بزند.',
  tg_token:'توکن ربات', tg_chat:'Chat ID',
  enable_notif:'اعلان‌های خودکار فعال باشد',
  kickoff_notif:'شروع بازی', goal_notif:'گل (با نام گل‌زن و دقیقه)', ft_notif:'پایان بازی',
  sum_off:'خلاصهٔ دوره‌ای: خاموش',
  sum_15:'خلاصهٔ وضعیت هر ۱۵ دقیقه', sum_30:'هر ۳۰ دقیقه', sum_60:'هر ساعت',
  tg_save:'ذخیره', tg_test:'پیام آزمایشی', tg_run:'اجرای آزمایشی اعلان‌ها', tg_activate:'فعال‌سازی دستورات ربات',
  tg_saved_token:'توکن ذخیره شده؛ برای تغییر، توکن جدید را وارد کنید',
  no_cron:'زمان‌بند هنوز هیچ‌بار اجرا نشده؛ بدون آن اعلان خودکار ارسال نمی‌شود.',
  cron_last:'دقیقه پیش', cron_err:'خطا: ', cron_games:'بازی‌ها: ', cron_sent:'پیام‌ها: ',
  backup_title:'پشتیبان‌های روزانه',
  backup_hint:'سرور هر روز یک نسخهٔ پشتیبان می‌گیرد (۱۴ روز). بلیت‌های موجود در پشتیبان که الان ندارید، اضافه می‌شوند.',
  today_label:'(امروز)', restore_merge:'بازیابی (ادغام)', no_backup:'برای این روز پشتیبانی نیست.',
  fetching:'در حال دریافت…', no_new_bets:'بلیت جدیدی برای افزودن نبود', invalid_json:'فایل JSON معتبر نیست.',
  confirm_bk_add:'بلیت جدید از %T بلیتِ فایل افزوده شود؟ (تکراری‌ها نادیده گرفته می‌شوند)',
  added_count:' بلیت افزوده شد', share_by_prefix:'بلیت اشتراک‌گذاری‌شده از ',
  cur_picks:'شرط‌ها (همه باید برقرار باشند): '
};

const EN = {
  bets:'Bets', risk:'Risk', hist:'History', stats:'Stats', board:'Leaderboard',
  me_tab:'My Profile', trash_tab:'Trash', add_bet:'+ Bet', login_btn:'Login',
  my_profile:'My Profile', all_stats:'Stats', trash_menu:'Trash',
  export_json:'Export JSON', import_json:'Import JSON', daily_backup:'Daily Backups',
  tg_notify:'Telegram Alerts', logout:'Logout',
  cls_wr:'Wrong Leg Live', cls_near:'Close to Pick',
  cls_ok:'Live & On Track', cls_wait:'Not Started Yet',
  cls_won:'Won', cls_lost:'Lost',
  games:'games', correct:'correct', on_track:'on track', close_pick:'close',
  wrong:'wrong', prob:'prob ~',
  stake:'Stake', win:'Win', cash:'Cash-out',
  won_chip:'Won', lost_chip:'Lost', no_result:'No result',
  created:'Added', matches:'Matches', archived:'Archived',
  settlement:'Settled', auto_arch:'auto',
  edit:'Edit', cashout_btn:'Cash-out',
  vis_private:'Private', vis_link:'Link Only', vis_public:'Public (on profile)',
  copy_link:'Copy Link', archive:'Archive', restore_active:'Restore to Active', delete:'Delete',
  tl_critical:'Critical', tl_close:'Close', tl_wait:'Waiting',
  tl_ok:'On Track', tl_done:'Done & Correct',
  critical_games:'Critical games', close_games:'Close', started:'Started', not_started:'Not started',
  bets_at_risk:'bets at risk', potential_win:'Potential win',
  trash_title:'Trash', empty_trash:'Empty Trash',
  trash_days_removed:'days ago', days_to_remove:'days until deletion',
  trash_restore:'Restore', trash_perm:'Delete Forever',
  trash_30days:'Deleted bets are kept for 30 days.', trash_empty:'Trash is empty.',
  leaderboard:'Leaderboard', pub_only:'Public profiles only',
  board_col_hint:'Columns: Bets won/total · ROI · Score',
  score:'Score', rank:'Rank', done_bets:'Bets settled',
  win_pct:'Win rate', roi:'ROI', joined:'Member since',
  pub_bets:'Public Bets', no_pub_bets:'No public bets.',
  no_active:'No active bets yet.', add_first:'+ Add Bet',
  no_filter:'No bets match this filter.', no_hist:'No archived bets.',
  no_data:'No data', loading:'Loading…',
  profile_not_found:'Profile not found or not public.',
  share_invalid:'This link is invalid or sharing has been disabled.',
  shared_bet_by:'Shared bet from',
  selected:'selected', select_all:'Select All',
  archive_sel:'Archive', restore_sel:'Restore', delete_sel:'Delete', end_sel:'Done',
  search_ph:'Search: name, team, tag…',
  all_results:'All results', winners:'Winners', losers:'Losers',
  sort_risk:'Highest Risk', sort_new:'Newest', sort_old:'Oldest',
  sort_odds:'Best Odds', sort_win:'Best Win',
  all_tags:'All tags', group_sel:'Multi-select', end_group:'Done',
  filter_label:'Filter:', clear_filter:'Clear filter',
  source_manual:'Source: manual', source_saved:'Source: saved',
  conflict_txt:'⚠ Conflict:', select_game:'Map Game', set_final:'Set Final Result',
  not_in_sources:'Not in sources',
  end_ft:'FT', end_90:'FT (AET)', over_time:'90 min; Extra Time',
  postponed:'Postponed/Cancelled', live_manual:'Live (manual)', end_manual:'FT (manual)',
  stats_title:'Stats & Analysis', time_unit:'Time unit: auto', daily:'Daily', weekly:'Weekly', monthly:'Monthly',
  all_time:'All time', last_7:'Last 7 days', last_30:'Last 30 days', last_90:'Last 90 days', last_180:'Last 180 days', last_year:'Last year',
  no_stats:'No settled bets in this range; stats are built after archiving.',
  done_bets2:'Settled bets',
  win_rate:'Win rate', pnl:'P&L (USDT)', roi_total:'ROI on total staked',
  total_stake:'Total staked', avg_odds:'Avg odds', avg_stake:'Avg stake',
  avg_legs:'Avg legs', best_bet:'Best bet', worst_bet:'Worst bet',
  current_streak:'Current streak', win_streak:'Best win / loss streak', max_dd:'Max drawdown',
  win_streak_txt:' wins', loss_streak_txt:' losses',
  pnl_chart:'Cumulative P&L',
  pnl_period:'P&L per ', win_rate_period:'Win rate per ',
  per_day:'day', per_week:'week', per_month:'month',
  min2_bets:'Need at least 2 settled bets for chart.',
  no_range_data:'No data in this range.',
  leg_quality:'Leg Accuracy',
  legs_done:'Settled legs', legs_hit_pct:'Leg hit rate',
  expected_pct:'Expected rate from odds', edge:'Edge vs odds',
  edge_hint:"If your hit rate beats the expected rate, your picks have beaten the bookmaker's implied probability.",
  mkt_accuracy:'Accuracy by market type', odds_accuracy:'Accuracy by odds range',
  league_accuracy:'Accuracy by league & country (descending win rate)', size_pnl:'P&L by bet size',
  weekday_pnl:'P&L by day of week', tag_pnl:'P&L by tag',
  expected_line:'Vertical line = rate implied by odds',
  active_bets_stats:'Active Bets',
  active_count:'Active bets', active_stake:'In-play stake',
  potential_win_all:'Win if all hit', expected_profit:'Expected profit (approx.)',
  expected_note:"Expected profit is calculated from remaining odds and does not account for the bookmaker's margin.",
  unknown:'Unknown',
  active_bets:'Active bets', live_games:'Live games',
  stake_live:'In-play stake', win_if_all:'Win if all hit',
  display_privacy:'Display & Privacy', display_name:'Display name',
  default_vis:'Default for new bets',
  about_me:'About me (max 160 chars)',
  public_profile:'Make my profile public (name, score and overall stats visible in leaderboard; stakes never shown)',
  save:'Save', copy_profile:'Copy profile link',
  pub_bets_count:'public bets', link_bets_count:'link-only bets',
  tools:'Tools', all_stats_btn:'Full Stats', trash_btn:'Trash',
  export_btn:'Export JSON', import_btn:'Import JSON', backup_btn:'Daily Backups', tg_btn:'Telegram Alerts',
  change_pass:'Change Password', current_pass:'Current password', new_pass:'New password (min 8 chars)', change_btn:'Change',
  score_formula:'Score Formula',
  score_desc:'Each won bet: 10 × ln(odds) points (e.g. odds 2 ≈ +7, odds 20 ≈ +30); each lost bet: −5.',
  confirm_archive:'Not settled yet; archive anyway?',
  confirm_delete:'Move to trash? (recoverable for 30 days)',
  confirm_del_perm:'Delete forever?', confirm_empty_trash:'Empty the trash?',
  link_copied:'Link copied',
  auto_archived_msg:' bet(s) auto-archived due to confirmed loss.',
  bet_added:' bet(s) added', prof_saved:'Profile saved',
  link_built:'Link created; use "Copy Link" to share it',
  pass_changed:'Password changed', bets_fetched_err:'Error loading bets: ',
  vis_pub_tag:'public', vis_link_tag:'link',
  saved:'Saved', pending_save:'Saving…', save_err:'Save failed; retrying',
  login_title:'Login', signup_title:'Sign Up',
  username_ph:'Username (letters/numbers)', pass_ph:'Password (min 8 chars)', invite_ph:'Invite code',
  no_account:'No account? Sign Up', have_account:'Have an account? Log In',
  add_bet_title:'Add Bet', edit_bet_title:'Edit Bet',
  paste_mode:'Paste Text', form_mode:'Game by Game', line_mode:'Manual Lines',
  bet_name_ph:'Bet name (optional)', tags_ph:'Tags (comma-separated: risky, safe)',
  note_ph:'Note (optional)',
  stake_ph:'Stake (USDT)', odds_ph:'Total odds (empty = product)', cashout_ph:'Cash-out value',
  host_ph:'Home team', guest_ph:'Away team', leg_odds_ph:'Odds',
  add_pick:'+ Pick', add_game:'Add Game to Bet',
  submit_bet:'Submit Bet', save_changes:'Save Changes', close_btn:'Close',
  invalid_pick:'Invalid pick value.',
  need_game:'Add at least one game.',
  need_one_game:'At least one game must remain.',
  need_all_fields:'Both team names, odds (> 1) and at least one pick are required.',
  no_bets_parsed:'No games detected; check the format.',
  host_goals:'Home goals', guest_goals:'Away goals', minute_opt:'Minute (optional)',
  in_progress:'In progress', finished:'Finished (90-min result)',
  final_winner:'Final winner (for qualification bets)',
  host_qualified:'Home qualified', guest_qualified:'Away qualified',
  sv_hint:"For each market, enter the current/final value and check \"Final\" when done.",
  manual_val:'Value', final_chk:'Final',
  save_result:'Save', clear_manual:'Clear Manual Result', clear_saved:'Reset Saved Result',
  enter_goals:'Enter goals for both teams.',
  co_intro:'Cash-out Calculator · ',
  est_win_prob:'Est. win probability:',
  optimistic_note:'(optimistic; bookmaker margin not included)',
  hold_win:'Win if held:', hold_ev:'Expected hold value:',
  site_offer:'Site offer:', needed_prob:'Probability needed to hold:',
  co_better:'Cash-out exceeds expected hold value',
  hold_better:'Holding has higher expected value',
  diff:'difference', enter_co:'Enter the cash-out offer from the site.',
  fin_guide:'Approximate guide, not financial advice.',
  map_hint:'Select a game from live sources to map it. This mapping is remembered for all bets.',
  search_teams:'Search team name in sources',
  no_match:"Not found in sources; try a different word.",
  tg_hint:'Get the bot token from BotFather and Chat ID from getUpdates. A cron job must call /api/notify every 1-5 min.',
  tg_token:'Bot token', tg_chat:'Chat ID',
  enable_notif:'Enable automatic notifications',
  kickoff_notif:'Kick-off', goal_notif:'Goal (with scorer & minute)', ft_notif:'Full time',
  sum_off:'Periodic digest: Off',
  sum_15:'Status digest every 15 min', sum_30:'Every 30 min', sum_60:'Every hour',
  tg_save:'Save', tg_test:'Test Message', tg_run:'Test Notifications', tg_activate:'Activate Bot Commands',
  tg_saved_token:'Token saved; enter a new token to change it',
  no_cron:"Cron has never run; without it, automatic notifications won't fire.",
  cron_last:'minutes ago', cron_err:'Error: ', cron_games:'Games: ', cron_sent:'Messages: ',
  backup_title:'Daily Backups',
  backup_hint:"The server takes one backup per day (kept 14 days). Bets in the backup you don't have will be added.",
  today_label:'(today)', restore_merge:'Restore (merge)', no_backup:'No backup for this date.',
  fetching:'Loading…', no_new_bets:'No new bets to add', invalid_json:'Invalid JSON file.',
  confirm_bk_add:'Add %T bet(s) from file? (duplicates ignored)',
  added_count:' bet(s) added', share_by_prefix:'Shared bet from ',
  cur_picks:'Picks (all must hold): '
};

const T = (k) => (CL === 'en' ? EN[k] : FA[k]) || k;

function setLang(l) {
  CL = l;
  ls.s('lang', l);
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'en' ? 'ltr' : 'rtl';
  if (window.mountDialogs) mountDialogs();
  if (window.render) render();
}

function pt1En(p0, l) {
  const sc = Core.isManualOnly(p0) && p0.includes('@') ? (p0.endsWith('1H') ? ' (1st Half)' : ' (2nd Half)') : '';
  const p = p0.replace(/@(1H|2H)$/, '');
  const H = l.home, A = l.away;
  const F = { 1: H + ' Win', 2: A + ' Win', X: 'Draw', '1X': H + ' or Draw', X2: 'Draw or ' + A, '12': 'No Draw (Any Win)', BY: 'Both Teams to Score', BN: 'Not Both Teams to Score', Q1: H + ' to Qualify', Q2: A + ' to Qualify' };
  if (F[p]) return F[p] + sc;
  let m;
  if (m = p.match(/^([HA]?)([OU])([\d.]+)$/)) return (m[1] === 'H' ? H + ' Goals ' : m[1] === 'A' ? A + ' Goals ' : 'Total Goals ') + (m[2] === 'O' ? 'Over ' : 'Under ') + m[3] + sc;
  if (m = p.match(/^([HA]?)([KC])([OU])([\d.]+)$/)) return (m[2] === 'K' ? (m[1] === 'H' ? H + ' Cards ' : m[1] === 'A' ? A + ' Cards ' : 'Total Cards ') : (m[1] === 'H' ? H + ' Corners ' : m[1] === 'A' ? A + ' Corners ' : 'Total Corners ')) + (m[3] === 'O' ? 'Over ' : 'Under ') + m[4] + sc;
  if (m = p.match(/^E([KC])([OU])([\d.]+)$/)) return 'Each Team ' + (m[1] === 'K' ? 'Cards ' : 'Corners ') + (m[2] === 'O' ? 'Over ' : 'Under ') + m[3] + sc;
  if (m = p.match(/^T(\d+)$/)) return 'Exact ' + m[1] + ' Goals';
  if (m = p.match(/^S(\d+)-(\d+)$/)) return 'Exact Score ' + m[1] + '-' + m[2];
  if (m = p.match(/^AH([12])(.+)$/)) return 'Asian Handicap ' + (m[1] === '1' ? H : A) + ' (' + m[2] + ')';
  return p + sc;
}

const localPickTxt = (p, l) => p.split('&').map((q) => (CL === 'en' ? pt1En(q, l) : Core.pt1(q, l))).join(' + ');

const OCL_EN = { HW: 'Half Win', P: 'Push/Refund', HL: 'Half Loss' };
const localLbl = (p, x) => {
  if (!x || p.includes('&') || p[0] === 'Q' || Core.isManualOnly(p) || !(x.st === 'post' || x.over)) return '';
  const o = Core.chk(p, x.h, x.a)[3];
  if (!o) return '';
  return CL === 'en' ? (OCL_EN[o] ? ' · ' + OCL_EN[o] : '') : (Core.OCL[o] ? ' · ' + Core.OCL[o] : '');
};

const S = { tok: ls.g('tok') || '', me: ls.g('me') || '', bets: [], trash: [], LV: [], SRC: [], at: null, sync: 'idle', prof: null, tg: null };
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
function toast(m, ms) { const t = $('#toast'); if (!t) return; t.innerHTML = '<div>' + esc(m) + '</div>'; clearTimeout(toast.t); toast.t = setTimeout(() => (t.innerHTML = ''), ms || 3500); }
async function api(p, o) {
  o = o || {};
  const r = await fetch(BASE + p, { method: o.method || 'GET', keepalive: !!o.keepalive, headers: Object.assign({ 'content-type': 'application/json' }, S.tok ? { authorization: 'Bearer ' + S.tok } : {}), body: o.body === undefined ? undefined : typeof o.body == 'string' ? o.body : JSON.stringify(o.body) });
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (r.status == 401 && S.tok) { const e = new Error(j.error || (CL === 'en' ? 'Session expired; please login again' : 'نشست منقضی شد؛ دوباره وارد شوید')); e.u = 1; throw e; }
  if (!r.ok) throw new Error(j.error || 'HTTP ' + r.status);
  return j;
}
/* ---- ذخیره: فقط تغییرات (up/rm) فرستاده می‌شود ---- */
let SNAP = {}, busy = 0, again = 0, tmr, fails = 0;
const allRecs = () => S.bets.concat(S.trash);
function setSync(st, msg) {
  S.sync = st; S.syncMsg = msg || '';
  const el = $('#sync'); if (!el) return;
  el.dataset.s = st; el.title = msg || '';
  el.textContent = { ok: T('saved'), pending: T('pending_save'), err: T('save_err'), idle: '' }[st] || '';
}
function save() { clearTimeout(tmr); setSync('pending'); tmr = setTimeout(flush, 500); }
async function flush(ka) {
  if (busy) { again = 1; return; }
  const up = [], snap = {}, rm = [];
  for (const r of allRecs()) { const js = JSON.stringify(r); snap[r.id] = js; if (SNAP[r.id] !== js) up.push(r); }
  for (const id in SNAP) if (!(id in snap)) rm.push(id);
  if (!up.length && !rm.length) { setSync(S.sync == 'err' ? 'err' : 'ok'); return; }
  busy = 1;
  try {
    const now = Date.now(); up.forEach((r) => { r.upd = now; snap[r.id] = JSON.stringify(r); });
    await api('/api/data', { method: 'PUT', body: { up, rm }, keepalive: !!ka });
    Object.assign(SNAP, snap); rm.forEach((id) => delete SNAP[id]); fails = 0; setSync('ok');
  } catch (e) {
    fails++; setSync('err', e.message);
    if (e.u) { if (window.showLogin) showLogin(); } else { clearTimeout(tmr); tmr = setTimeout(flush, Math.min(60000, 3000 * fails)); }
  } finally { busy = 0; if (again) { again = 0; flush(); } }
}
const purge = () => { const lim = Date.now() - 30 * 864e5; S.trash = S.trash.filter((r) => r.del > lim); };
async function loadAll() {
  const j = await api('/api/data'); S.bets = []; S.trash = []; SNAP = {};
  for (const r of j.records) { SNAP[r.id] = JSON.stringify(r); (r.del ? S.trash : S.bets).push(r); }
  purge(); setSync('ok');
}
async function pull() { // ادغام تغییرات دستگاه‌های دیگر
  if (busy || S.sync == 'pending' || !S.tok) return;
  const j = await api('/api/data'), srv = new Map(j.records.map((r) => [r.id, r])), loc = new Map(allRecs().map((r) => [r.id, r]));
  let ch = 0; const drop = (id) => { S.bets = S.bets.filter((r) => r.id != id); S.trash = S.trash.filter((r) => r.id != id); };
  for (const [id, r] of srv) {
    const l = loc.get(id), js = JSON.stringify(r);
    if (!l) { if (!(id in SNAP)) { SNAP[id] = js; (r.del ? S.trash : S.bets).push(r); ch = 1; } }
    else if (SNAP[id] === JSON.stringify(l) && SNAP[id] !== js) { drop(id); (r.del ? S.trash : S.bets).push(r); SNAP[id] = js; ch = 1; }
  }
  for (const [id, l] of loc) if (!srv.has(id) && id in SNAP && SNAP[id] === JSON.stringify(l)) { drop(id); delete SNAP[id]; ch = 1; }
  if (ch && window.render) render();
}
/* ---- نتایج زنده ---- */
let needMore = 0;
const needLive = () => S.bets.some((b) => !b.arch && b.legs.some((l) => !l.fin && !l.ov)) || (window.U && U.pubBets && U.pubBets.length);
const legsToWatch = () => S.bets.filter((b) => !b.arch).flatMap((b) => b.legs).filter((l) => !l.fin && !l.ov).concat((window.U && U.pubBets ? U.pubBets : []).flatMap((b) => b.legs));
const unmatched = () => legsToWatch().some((l) => !S.LV.some((e) => Core.mt(l, e)));
async function liveFetch() {
  if (!needLive()) return;
  try {
    const j = await (await fetch(BASE + '/api/live' + (needMore ? '?apif=1' : ''))).json();
    S.LV = j.events || []; S.SRC = j.sources || []; S.at = new Date(); S.liveErr = 0;
    const nm = unmatched(); if (nm && !needMore) { needMore = 1; return liveFetch(); } needMore = nm ? 1 : 0;
  } catch (e) { S.liveErr = 1; }
}
