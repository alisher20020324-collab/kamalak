import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.MONGODB_DB = `kamalak_test_bot_${process.pid}`;
process.env.GEMINI_API_KEY = process.env.GROQ_API_KEY = '';
const S = await import('../src/services.js');
const { connect, close } = await import('../src/db.js');
const { createBot } = await import('../src/bot.js');
const { Telegram } = await import('telegraf');

// Telegram API o'rniga soxta funksiya: bot yuborgan hamma narsani yozib boradi
const sent = [];
let bot;
let updateId = 1;
let db;
before(async () => {
  db = await connect();
  bot = createBot('123:TEST', { siteUrl: 'http://test' });
  bot.botInfo = { id: 1, is_bot: true, first_name: 'Kamalak', username: 'kamalak_test_bot' };
  // Telegraf har bir update uchun yangi Telegram obyektini yaratadi, shuning uchun prototipni almashtiramiz
  Telegram.prototype.callApi = async (method, payload) => {
    sent.push({ method, ...payload });
    return method === 'sendMessage' ? { message_id: 100 + sent.length, chat: { id: payload.chat_id }, date: 0, text: payload.text } : true;
  };
});
after(async () => {
  bot.detachEvents();
  await db.dropDatabase();
  await close();
});

// Bildirishnomalar fonda (bazadan o'qib) yuboriladi — biroz kutamiz
const settle = () => new Promise((r) => setTimeout(r, 100));

const chat = { id: 777, type: 'private', first_name: 'Ali' };
const from = { id: 777, is_bot: false, first_name: 'Ali' };
const say = (text) =>
  bot.handleUpdate({
    update_id: updateId++,
    message: {
      message_id: updateId,
      date: 0,
      chat,
      from,
      text,
      ...(text.startsWith('/') && { entities: [{ type: 'bot_command', offset: 0, length: text.split(' ')[0].length }] }),
    },
  });
const press = (data) =>
  bot.handleUpdate({
    update_id: updateId++,
    callback_query: { id: String(updateId), from, chat_instance: '1', data, message: { message_id: 5, date: 0, chat, text: 'x' } },
  });
const lastText = () => [...sent].reverse().find((m) => m.text)?.text || '';

let teacher, student, taskId;
before(async () => {
  await connect();
  teacher = await S.register({ role: 'teacher', full_name: 'Ustoz Test', login: 'botustoz', password: 'secret1', class_name: '2-A' });
  const code = (await S.publicUser(teacher)).class.code;
  student = await S.register({ role: 'student', full_name: 'Ali Valiyev', login: 'botali', password: '123456', class_code: code });
  taskId = (await S.createTask(teacher.id, { title: "Kitob o'qing", stars: 2 })).id;
});

test("/start login so'raydi", async () => {
  await say('/start');
  assert.match(lastText(), /loginingizni/);
});

test("noto'g'ri parol rad etiladi va ro'yxatdan o'tish havolasi beriladi", async () => {
  await say('botali');
  assert.match(lastText(), /parolingizni/);
  await say('xato-parol');
  assert.match(lastText(), /noto'g'ri/);
  assert.match(lastText(), /http:\/\/test\/register/);
  assert.ok(sent.some((m) => m.method === 'deleteMessage'), "parol xabari o'chirilishi kerak");
});

test("to'g'ri login/parol bilan kiradi va menyu chiqadi", async () => {
  await say('botali');
  await say('123456');
  assert.match(lastText(), /Xush kelibsiz, <b>Ali Valiyev<\/b>/);
  assert.equal((await S.getUserByChat(777)).id, student.id);
});

test("qayta /start bosganda login so'ramaydi (avval kirgan)", async () => {
  await say('/start');
  assert.match(lastText(), /Xush kelibsiz/);
});

test('kayfiyat tugmasi bazaga yozadi', async () => {
  await say('😊 Kayfiyatim');
  assert.match(lastText(), /kayfiyatingiz qanday/);
  await press('mood:5');
  assert.equal((await S.todayMood(student.id)).mood, 5);
  assert.match(lastText(), /Juda zo'r/);
});

test('vazifani bot orqali bajarish yulduz beradi', async () => {
  await say('📋 Vazifalarim');
  assert.ok(sent.some((m) => m.text?.includes("Kitob o'qing") && JSON.stringify(m.reply_markup).includes(`done:${taskId}`)));
  await press(`done:${taskId}`);
  assert.equal(await S.totalStars(student.id), 2);
});

test("o'qituvchi nishon bersa o'quvchiga Telegramda xabar boradi", async () => {
  await S.giveBadge(teacher.id, student.id, { badge: 'yulduz', message: 'Barakalla' });
  await settle();
  assert.ok(sent.some((m) => m.chat_id === '777' && m.text.includes('Yulduzcha')));
});

test("o'qituvchi botda sinfini ko'radi", async () => {
  const tchat = { id: 888, type: 'private', first_name: 'U' };
  const tfrom = { id: 888, is_bot: false, first_name: 'U' };
  const tsay = (text) => bot.handleUpdate({ update_id: updateId++, message: { message_id: updateId, date: 0, chat: tchat, from: tfrom, text } });
  await tsay('salom');
  await tsay('botustoz');
  await tsay('secret1');
  await tsay('👩‍🏫 Sinfim');
  assert.match(lastText(), /Ali Valiyev — 😄/);
});

test("qahramon bilan suhbat: javoblar va xavotirli javob o'qituvchiga boradi", async () => {
  await say('💬 Qahramon bilan suhbat');
  assert.match(lastText(), /Qaysi qahramon/);
  await press('hero:shrek');
  assert.match(lastText(), /1\/8/);
  await say('Hech kim meni xafa qilmadi');
  assert.match(lastText(), /2\/8/);
  await say('Sinfdoshlarim meni masxara qilishadi');
  await settle();
  assert.ok(sent.some((m) => m.chat_id === '888' && m.text?.includes('Diqqat')), "o'qituvchiga ogohlantirish borishi kerak");
  await press('cskip');
  assert.match(lastText(), /4\/8/);
  await press('cstop');
  await settle();
  assert.ok(sent.some((m) => m.chat_id === '888' && m.text?.includes('Shrek bilan suhbatlashdi')));
  await say('🎯 Maqsadlarim');
  assert.match(lastText(), /maqsad/i, 'suhbat tugagach oddiy matn javob sifatida olinmaydi');
});

test("tashlab ketilgan suhbat ham o'qituvchiga boradi", async () => {
  const c = await S.startChat(student.id, 'olaf');
  await S.answerChat(student.id, c.id, 'Qor yog\'di');
  assert.equal(await S.closeIdleChats(15), 0, 'hali vaqt o\'tmagan');
  assert.equal(await S.closeIdleChats(-1), 1);
  await settle();
  assert.ok(sent.some((m) => m.chat_id === '888' && m.text?.includes('Olaf bilan suhbatlashdi') && m.text.includes("Qor yog'di")));
  assert.equal(await S.closeIdleChats(-1), 0, 'ikkinchi marta yuborilmaydi');
});

test('yutuqlar va chiqish', async () => {
  await say('🏆 Yutuqlarim');
  assert.match(lastText(), /Yulduzlar: <b>2<\/b>/);
  await say('🚪 Chiqish');
  assert.equal(await S.getUserByChat(777), null);
  await say('salom');
  assert.match(lastText(), /loginingizni/);
});
