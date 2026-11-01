import { Telegraf, Markup } from 'telegraf';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './services.js';
import { C } from './db.js';
import { MOODS, QUALITIES } from './constants.js';
import { heroList } from './heroes.js';

const HERO_IMG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'frontend', 'public', 'heroes');
const CHAT_BTN = '💬 Qahramon bilan suhbat';

const STUDENT_MENU = Markup.keyboard([
  [CHAT_BTN],
  ['😊 Kayfiyatim', '📋 Vazifalarim'],
  ['🎯 Maqsadlarim', '🏆 Yutuqlarim'],
  ['🚪 Chiqish'],
]).resize();

const TEACHER_MENU = Markup.keyboard([
  ['👩‍🏫 Sinfim', '📊 Bugungi holat'],
  ['📋 Topshiriqlar', '🚪 Chiqish'],
]).resize();

// Suhbat paytida menyu tugmasi bosilsa, suhbat to'xtatiladi va tugma odatdagidek ishlaydi
const MENU_LABELS = new Set([...STUDENT_MENU.reply_markup.keyboard, ...TEACHER_MENU.reply_markup.keyboard].flat());
const CHAT_KEYS = Markup.inlineKeyboard([
  Markup.button.callback("⏭ O'tkazib yuborish", 'cskip'),
  Markup.button.callback('🛑 Tugatish', 'cstop'),
]);

const bar = (p) => '🟩'.repeat(Math.round(p / 20)) + '⬜'.repeat(5 - Math.round(p / 20));

/**
 * Telegram botni yaratadi. Bot sayt bilan bitta bazadan foydalanadi:
 * saytda ro'yxatdan o'tgan foydalanuvchi shu login/parol bilan botga kiradi.
 */
export function createBot(token, { siteUrl = 'http://localhost:7000' } = {}) {
  const bot = new Telegraf(token);
  const sessions = new Map(); // chatId -> { step: 'login' | 'password', login }
  const heroChats = new Map(); // Telegram chatId -> qahramon bilan suhbat id si

  const menuFor = (user) => (user.role === 'teacher' ? TEACHER_MENU : STUDENT_MENU);

  async function askLogin(ctx, prefix = '') {
    sessions.set(ctx.chat.id, { step: 'login' });
    await ctx.reply(
      `${prefix}🌈 <b>Kamalak</b> — shaxsiy rivojlanish kundaligi.\n\n` +
        `🔑 Kirish uchun <b>loginingizni</b> yozing:`,
      { parse_mode: 'HTML', ...Markup.removeKeyboard() }
    );
  }

  async function welcome(ctx, user) {
    const role = user.role === 'teacher' ? "o'qituvchi" : "o'quvchi";
    await ctx.reply(`${user.avatar} Xush kelibsiz, <b>${esc(user.full_name)}</b>! (${role})\n\nQuyidagi tugmalardan birini tanlang 👇`, {
      parse_mode: 'HTML',
      ...menuFor(user),
    });
  }

  bot.start(async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    if (user) return welcome(ctx, user);
    return askLogin(ctx, 'Assalomu alaykum! 👋\n');
  });

  bot.command('logout', (ctx) => logout(ctx));
  bot.command('menu', async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    return user ? welcome(ctx, user) : askLogin(ctx);
  });

  async function logout(ctx) {
    await S.unlinkTelegram(ctx.chat.id);
    sessions.delete(ctx.chat.id);
    heroChats.delete(ctx.chat.id);
    await ctx.reply("👋 Siz akkauntdan chiqdingiz. Qayta kirish uchun /start bosing.", Markup.removeKeyboard());
  }

  // ----- Login / parol bosqichi -----
  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text.trim();
    const user = await S.getUserByChat(ctx.chat.id);
    if (user) {
      ctx.state.user = user;
      if (heroChats.has(ctx.chat.id) && user.role === 'student') {
        if (MENU_LABELS.has(text) || text.startsWith('/')) heroChats.delete(ctx.chat.id);
        else return answerHero(ctx, user, text);
      }
      return next();
    }

    const sess = sessions.get(ctx.chat.id);
    if (!sess) return askLogin(ctx);

    if (sess.step === 'login') {
      sessions.set(ctx.chat.id, { step: 'password', login: text });
      return ctx.reply('🔒 Endi <b>parolingizni</b> yozing:', { parse_mode: 'HTML' });
    }

    // Parol yozilgan xabarni xavfsizlik uchun o'chiramiz
    ctx.deleteMessage().catch(() => {});
    const found = await S.authenticate(sess.login, text);
    if (!found) {
      sessions.set(ctx.chat.id, { step: 'login' });
      return ctx.reply(
        "❌ Login yoki parol noto'g'ri.\n\n🔑 Loginingizni qaytadan yozing.\n\n" +
          `Hali ro'yxatdan o'tmaganmisiz? Saytda ro'yxatdan o'ting:\n${siteUrl}/register`
      );
    }
    sessions.delete(ctx.chat.id);
    await S.linkTelegram(found.id, ctx.chat.id);
    await ctx.reply('✅ Muvaffaqiyatli kirdingiz!');
    return welcome(ctx, found);
  });

  // ----- Menyu tugmalari -----
  bot.hears('🚪 Chiqish', (ctx) => logout(ctx));

  bot.hears('😊 Kayfiyatim', studentOnly(async (ctx, user) => {
    const t = await S.todayMood(user.id);
    const head = t ? `Bugun siz ${MOODS[t.mood].emoji} <b>${MOODS[t.mood].title}</b> deb belgilagansiz. O'zgartirasizmi?` : 'Bugun kayfiyatingiz qanday? 🌤';
    await ctx.reply(head, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(
        Object.entries(MOODS).map(([k, m]) => Markup.button.callback(m.emoji, `mood:${k}`)),
      ),
    });
  }));

  bot.hears('📋 Vazifalarim', studentOnly(async (ctx, user) => {
    const tasks = await S.studentTasks(user.id);
    const pending = tasks.filter((t) => !t.done);
    if (!tasks.length) return ctx.reply("📭 Hozircha topshiriq yo'q. Dam oling! 🌴");
    await ctx.reply(`📋 Bajarilgan: ${tasks.length - pending.length} / ${tasks.length}`);
    if (!pending.length) return ctx.reply('🎉 Barakalla! Hamma topshiriqlarni bajardingiz!');
    for (const t of pending.slice(0, 5)) {
      const ql = QUALITIES[t.quality];
      await ctx.reply(
        `<b>${esc(t.title)}</b>\n${t.description ? esc(t.description) + '\n' : ''}${ql.emoji} ${ql.title} · ${'⭐'.repeat(t.stars)}` +
          (t.due_date ? `\n📅 Muddat: ${t.due_date}` : ''),
        { parse_mode: 'HTML', ...Markup.inlineKeyboard([Markup.button.callback('✅ Bajardim', `done:${t.id}`)]) }
      );
    }
  }));

  bot.hears('🎯 Maqsadlarim', studentOnly(async (ctx, user) => {
    const goals = await S.listGoals(user.id);
    if (!goals.length) return ctx.reply(`🎯 Hali maqsad qo'ymagansiz. Saytda birinchi maqsadingizni yozing:\n${siteUrl}/student/goals`);
    const lines = goals.map((g) => `${QUALITIES[g.quality].emoji} ${esc(g.title)}\n${bar(g.progress)} ${g.progress}%`);
    await ctx.reply(`🎯 <b>Mening maqsadlarim</b>\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
  }));

  bot.hears('🏆 Yutuqlarim', studentOnly(async (ctx, user) => {
    const badges = await S.listBadges(user.id);
    const stars = await S.totalStars(user.id);
    const streak = await S.moodStreak(user.id);
    const list = badges.length ? badges.slice(0, 10).map((b) => `${b.emoji} ${b.title}${b.message ? ` — <i>${esc(b.message)}</i>` : ''}`).join('\n') : "Hali nishon yo'q — harakat qiling! 💪";
    await ctx.reply(`🏆 <b>Yutuqlarim</b>\n\n⭐ Yulduzlar: <b>${stars}</b>\n🔥 Ketma-ket kunlar: <b>${streak}</b>\n\n${list}`, { parse_mode: 'HTML' });
  }));

  bot.hears('👩‍🏫 Sinfim', teacherOnly(async (ctx, user) => {
    const { class: cls, students } = await S.classOverview(user.id);
    const lines = students.map((s) => `${s.avatar} ${esc(s.full_name)} — ${s.today_mood ? MOODS[s.today_mood].emoji : '▫️'} · ⭐${s.stars}`);
    await ctx.reply(
      `👩‍🏫 <b>${esc(cls.name)}</b> sinfi (kod: <code>${cls.code}</code>)\nO'quvchilar: ${students.length}\n\n${lines.join('\n') || "Hali o'quvchi qo'shilmagan"}`,
      { parse_mode: 'HTML' }
    );
  }));

  bot.hears('📊 Bugungi holat', teacherOnly(async (ctx, user) => {
    const a = await S.classAnalytics(user.id);
    const todayCounts = a.week[a.week.length - 1].counts;
    const dist = Object.entries(MOODS).map(([k, m]) => `${m.emoji} ${todayCounts[k]}`).join('   ');
    const att = a.attention.length
      ? '\n\n⚠️ <b>E\'tibor bering:</b>\n' + a.attention.map((s) => `${s.avatar} ${esc(s.full_name)} (o'rtacha ${s.avg_mood})`).join('\n')
      : '\n\n✅ Kayfiyati past o\'quvchi yo\'q';
    await ctx.reply(
      `📊 <b>Bugungi holat</b>\n\nKayfiyat belgilagan: ${a.checked_today} / ${a.student_count}\n${dist}\n\nTopshiriqlar bajarilishi: ${a.completion}%${att}`,
      { parse_mode: 'HTML' }
    );
  }));

  bot.hears('📋 Topshiriqlar', teacherOnly(async (ctx, user) => {
    const tasks = (await S.teacherTasks(user.id)).slice(0, 10);
    if (!tasks.length) return ctx.reply(`📭 Hali topshiriq yo'q. Saytda yarating:\n${siteUrl}/teacher/tasks`);
    const lines = tasks.map((t) => `• <b>${esc(t.title)}</b> — ${t.done_count}/${t.student_count} bajardi${t.to_review ? ` (🆕 ${t.to_review} ta tekshirilmagan)` : ''}`);
    await ctx.reply(`📋 <b>Topshiriqlar</b>\n\n${lines.join('\n')}`, { parse_mode: 'HTML' });
  }));

  // ----- Qahramon bilan suhbat -----
  bot.hears(CHAT_BTN, studentOnly(async (ctx, user) => {
    if (await S.todayMood(user.id)) return showHeroes(ctx);
    await ctx.reply('Avval ayt-chi, bugun kayfiyating qanday? 🌤', Markup.inlineKeyboard(
      Object.entries(MOODS).map(([k, m]) => Markup.button.callback(m.emoji, `cmood:${k}`)),
    ));
  }));

  function showHeroes(ctx) {
    const buttons = heroList().map((h) => Markup.button.callback(`${h.emoji} ${h.name}`, `hero:${h.id}`));
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) rows.push(buttons.slice(i, i + 2));
    const list = heroList().map((h) => `${h.emoji} <b>${esc(h.name)}</b> — ${esc(h.trait)}`).join('\n');
    return ctx.reply(`Qaysi qahramon bilan gaplashmoqchisan? 👇\n\n${list}`, { parse_mode: 'HTML', ...Markup.inlineKeyboard(rows) });
  }

  const askQuestion = (ctx, text, step, total) =>
    ctx.reply(`<i>${step + 1}/${total}</i>  ${esc(text)}`, { parse_mode: 'HTML', ...CHAT_KEYS });

  async function answerHero(ctx, user, text) {
    try {
      const r = await S.answerChat(user.id, heroChats.get(ctx.chat.id), text);
      if (r.reply) await ctx.reply(r.reply);
      if (r.done) {
        heroChats.delete(ctx.chat.id);
        return ctx.reply(`${r.bye}\n\n🔒 Javoblaringni faqat ustozing ko'radi.`, menuFor(user));
      }
      return askQuestion(ctx, r.question, r.step, r.total);
    } catch (e) {
      heroChats.delete(ctx.chat.id);
      return ctx.reply(e.message || 'Xatolik', menuFor(user));
    }
  }

  bot.action(/^cmood:(\d)$/, async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    if (!user || user.role !== 'student') return ctx.answerCbQuery('Avval kiring: /start');
    const m = await S.setMood(user.id, Number(ctx.match[1]));
    await ctx.answerCbQuery('Saqlandi!');
    await ctx.editMessageText(`Bugungi kayfiyating: ${m.emoji} <b>${m.title}</b>`, { parse_mode: 'HTML' });
    return showHeroes(ctx);
  });

  bot.action(/^hero:(\w+)$/, async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    if (!user || user.role !== 'student') return ctx.answerCbQuery('Avval kiring: /start');
    const c = await S.startChat(user.id, ctx.match[1]);
    heroChats.set(ctx.chat.id, c.id);
    await ctx.answerCbQuery();
    const img = path.join(HERO_IMG_DIR, `${c.hero.id}.jpg`);
    if (fs.existsSync(img)) await ctx.replyWithPhoto({ source: img }, { caption: c.hello });
    else await ctx.reply(c.hello);
    await ctx.reply("Javobingni yozib yubor ✍️ Bilmasang, «O'tkazib yuborish» tugmasini bos.");
    return askQuestion(ctx, c.question, c.step, c.total);
  });

  bot.action('cskip', async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    await ctx.answerCbQuery();
    if (!user || !heroChats.has(ctx.chat.id)) return;
    await ctx.editMessageReplyMarkup(undefined).catch(() => {});
    return answerHero(ctx, user, '');
  });

  bot.action('cstop', async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    await ctx.answerCbQuery();
    const chatId = heroChats.get(ctx.chat.id);
    if (!user || !chatId) return;
    heroChats.delete(ctx.chat.id);
    await ctx.editMessageReplyMarkup(undefined).catch(() => {});
    const { bye } = await S.finishChat(user.id, chatId);
    return ctx.reply(bye, menuFor(user));
  });

  // Boshqa matnlar
  bot.on('text', (ctx) => welcome(ctx, ctx.state.user));

  // ----- Inline tugmalar -----
  bot.action(/^mood:(\d)$/, async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    if (!user || user.role !== 'student') return ctx.answerCbQuery('Avval kiring: /start');
    const m = await S.setMood(user.id, Number(ctx.match[1]));
    await ctx.answerCbQuery('Saqlandi!');
    const extra = m.mood <= 2 ? "\n\n🤗 Hammasi yaxshi bo'ladi! Ustozingiz bilan gaplashib ko'ring." : '\n\nAjoyib! Kuningiz yanada zo\'r o\'tsin! ☀️';
    await ctx.editMessageText(`Bugungi kayfiyatingiz: ${m.emoji} <b>${m.title}</b>${extra}`, { parse_mode: 'HTML' });
  });

  bot.action(/^done:(\d+)$/, async (ctx) => {
    const user = await S.getUserByChat(ctx.chat.id);
    if (!user || user.role !== 'student') return ctx.answerCbQuery('Avval kiring: /start');
    try {
      const task = await S.completeTask(user.id, Number(ctx.match[1]));
      await ctx.answerCbQuery(`+${task.stars} ⭐`);
      await ctx.editMessageText(`✅ <b>${esc(task.title)}</b> — bajarildi! +${'⭐'.repeat(task.stars)}`, { parse_mode: 'HTML' });
    } catch (e) {
      await ctx.answerCbQuery(e.message || 'Xatolik');
    }
  });

  bot.catch((err, ctx) => console.error('[bot]', ctx?.updateType, err.message));

  function studentOnly(fn) {
    return (ctx) => (ctx.state.user?.role === 'student' ? fn(ctx, ctx.state.user) : welcome(ctx, ctx.state.user));
  }
  function teacherOnly(fn) {
    return (ctx) => (ctx.state.user?.role === 'teacher' ? fn(ctx, ctx.state.user) : welcome(ctx, ctx.state.user));
  }

  // ----- Saytdagi hodisalar bo'yicha bildirishnomalar -----
  const send = (chatId, text) =>
    chatId && bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' }).catch((e) => console.error('[bot notify]', e.message));

  const teacherChat = async (s) => (await S.classTeacher(s.class_id))?.telegram_chat_id;

  const listeners = {
    lowMood: async ({ studentId, mood, note }) => {
      const s = await S.getUser(studentId);
      send(await teacherChat(s), `⚠️ <b>${esc(s.full_name)}</b> bugun ${MOODS[mood].emoji} <b>${MOODS[mood].title}</b> kayfiyatda.${note ? `\n💬 «${esc(note)}»` : ''}\nUnga e'tibor qarating 🤗`);
    },
    taskCreated: async ({ task }) => {
      const rows = await C.users.find({ class_id: task.class_id, role: 'student', telegram_chat_id: { $type: 'string' } }).toArray();
      for (const r of rows) send(r.telegram_chat_id, `📋 <b>Yangi topshiriq!</b>\n${esc(task.title)} · ${'⭐'.repeat(task.stars)}\n\n«📋 Vazifalarim» tugmasini bosing.`);
    },
    badgeGiven: async ({ studentId, badge, message }) => {
      send((await S.getUser(studentId))?.telegram_chat_id, `🎉 Ustozingiz sizga nishon berdi: ${badge.emoji} <b>${badge.title}</b>${message ? `\n💬 «${esc(message)}»` : ''}`);
    },
    chatAlert: async ({ studentId, hero, question, answer }) => {
      const s = await S.getUser(studentId);
      send(await teacherChat(s), `🔴 <b>Diqqat!</b> ${esc(s.full_name)} ${esc(hero)} bilan suhbatda xavotirli javob yozdi:\n\n❓ ${esc(question)}\n💬 «${esc(answer)}»\n\nIloji boricha tezroq u bilan gaplashing 🤗`);
    },
    chatFinished: async ({ studentId, chatId }) => {
      const s = await S.getUser(studentId);
      const c = await S.getChat(chatId);
      // 🤖 — savolni AI bolaning oldingi javoblariga qarab tuzgan
      const lines = c.answers.map((a) => `${a.flagged ? '🔴' : a.ai ? '🤖' : '❓'} ${esc(a.question)}\n💬 ${a.answer ? esc(a.answer.slice(0, 300)) : '<i>javob bermadi</i>'}`);
      const legend = c.answers.some((a) => a.ai) ? '\n<i>🤖 — AI tuzgan savol</i>' : '';
      const to = await teacherChat(s);
      // Telegram bitta xabarga 4096 belgidan ko'pini sig'dirmaydi — bo'lib yuboramiz
      let msg = `💬 <b>${esc(s.full_name)}</b> ${c.hero.emoji} ${esc(c.hero.name)} bilan suhbatlashdi (kayfiyati: ${MOODS[c.mood]?.emoji || '—'})${legend}`;
      for (const l of lines) {
        if (msg.length + l.length + 2 > 4000) {
          await send(to, msg);
          msg = '';
        }
        msg += (msg ? '\n\n' : '') + l;
      }
      await send(to, msg);
    },
    feedback: async ({ studentId, title, feedback, stars }) => {
      send((await S.getUser(studentId))?.telegram_chat_id, `✍️ Ustoz «${esc(title)}» topshirig'ingizni tekshirdi: ${'⭐'.repeat(stars) || '—'}${feedback ? `\n💬 «${esc(feedback)}»` : ''}`);
    },
  };
  // Tinglovchilar async: xato bo'lsa, server to'xtab qolmasligi uchun ushlab qolamiz
  const safe = Object.entries(listeners).map(([ev, fn]) => [
    ev,
    (...args) => Promise.resolve(fn(...args)).catch((e) => console.error(`[bot ${ev}]`, e.message)),
  ]);
  for (const [ev, fn] of safe) S.events.on(ev, fn);
  bot.detachEvents = () => {
    for (const [ev, fn] of safe) S.events.off(ev, fn);
  };

  return bot;
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
