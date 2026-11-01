import { EventEmitter } from 'node:events';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { C, P, now, nextId } from './db.js';
import { QUALITIES, MOODS, BADGES, AVATARS, today } from './constants.js';
import { HEROES, SKIP_REPLY, ALERT_REPLY, isAlarming, questionText, heroCard, heroList } from './heroes.js';
import { aiQuestion, aiEnabled } from './ai.js';

// Sayt va bot o'rtasidagi hodisalar (bot bildirishnoma yuborish uchun tinglaydi)
export const events = new EventEmitter();

export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const LOGIN_RE = /^[a-zA-Z0-9_.]{3,32}$/;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function makeClassCode() {
  let code;
  do {
    code = Array.from(crypto.randomBytes(6), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  } while (await C.classes.findOne({ code }));
  return code;
}

const isDup = (err) => err?.code === 11000;
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const round1 = (x) => Math.round(x * 10) / 10;

export async function publicUser(u) {
  if (!u) return null;
  const cls = u.class_id ? await C.classes.findOne({ id: u.class_id }, { projection: { _id: 0, id: 1, name: 1, code: 1 } }) : null;
  return {
    id: u.id,
    role: u.role,
    full_name: u.full_name,
    login: u.login,
    avatar: u.avatar,
    telegram_linked: !!u.telegram_chat_id,
    class: cls,
  };
}

export const getUser = (id) => C.users.findOne({ id }, P);
export const getUserByChat = (chatId) => C.users.findOne({ telegram_chat_id: String(chatId) }, P);
const classStudents = (classId) => C.users.find({ class_id: classId, role: 'student' }, P).sort({ full_name: 1 }).toArray();
export const classTeacher = (classId) => C.users.findOne({ class_id: classId, role: 'teacher' }, P);

// ---------- Ro'yxatdan o'tish va kirish ----------

export async function register({ role, full_name, login, password, class_code, class_name, avatar }) {
  full_name = String(full_name || '').trim();
  login = String(login || '').trim();
  password = String(password || '');
  if (!['student', 'teacher'].includes(role)) throw new AppError(400, 'Rolni tanlang');
  if (full_name.length < 3) throw new AppError(400, "Ism-familiyani to'liq kiriting");
  if (!LOGIN_RE.test(login)) throw new AppError(400, "Login 3-32 ta harf, raqam, _ yoki . dan iborat bo'lsin");
  if (password.length < 6) throw new AppError(400, "Parol kamida 6 ta belgidan iborat bo'lsin");
  const taken = () => new AppError(409, 'Bu login band, boshqasini tanlang');
  if (await C.users.findOne({ login_lower: login.toLowerCase() })) throw taken();
  if (!AVATARS.includes(avatar)) avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

  let classId;
  if (role === 'student') {
    const code = String(class_code || '').trim().toUpperCase();
    const cls = await C.classes.findOne({ code });
    if (!cls) throw new AppError(400, "Sinf kodi noto'g'ri. Kodni o'qituvchingizdan so'rang");
    classId = cls.id;
  } else {
    const name = String(class_name || '').trim();
    if (!name) throw new AppError(400, 'Sinf nomini kiriting (masalan: 2-"A")');
  }

  const hash = await bcrypt.hash(password, 10);
  const userId = await nextId('users');
  if (role === 'teacher') {
    classId = await nextId('classes');
    await C.classes.insertOne({ id: classId, name: String(class_name).trim(), code: await makeClassCode(), teacher_id: userId, created_at: now() });
  }
  try {
    await C.users.insertOne({
      id: userId, role, full_name, login, login_lower: login.toLowerCase(), password_hash: hash,
      class_id: classId, avatar, created_at: now(),
    });
  } catch (err) {
    // Bir vaqtda ikki kishi bir xil login olmoqchi bo'lsa — yaratilgan sinfni qaytarib o'chiramiz
    if (role === 'teacher') await C.classes.deleteOne({ id: classId });
    throw isDup(err) ? taken() : err;
  }
  return getUser(userId);
}

export async function authenticate(login, password) {
  const user = await C.users.findOne({ login_lower: String(login || '').trim().toLowerCase() }, P);
  if (!user) return null;
  const ok = await bcrypt.compare(String(password || ''), user.password_hash);
  return ok ? user : null;
}

export async function updateProfile(userId, { avatar, full_name }) {
  const u = await getUser(userId);
  const nextAvatar = AVATARS.includes(avatar) ? avatar : u.avatar;
  const nextName = full_name && String(full_name).trim().length >= 3 ? String(full_name).trim() : u.full_name;
  await C.users.updateOne({ id: userId }, { $set: { avatar: nextAvatar, full_name: nextName } });
  return getUser(userId);
}

export async function linkTelegram(userId, chatId) {
  await unlinkTelegram(chatId);
  await C.users.updateOne({ id: userId }, { $set: { telegram_chat_id: String(chatId) } });
}

export async function unlinkTelegram(chatId) {
  await C.users.updateMany({ telegram_chat_id: String(chatId) }, { $unset: { telegram_chat_id: '' } });
}

// ---------- Kayfiyat ----------

export async function setMood(studentId, mood, note = '') {
  mood = Number(mood);
  if (!MOODS[mood]) throw new AppError(400, 'Kayfiyatni tanlang');
  const day = today();
  note = String(note || '').slice(0, 300);
  await C.moods.updateOne(
    { student_id: studentId, day },
    { $set: { mood, note, created_at: now() }, $setOnInsert: { id: await nextId('moods') } },
    { upsert: true }
  );
  if (mood <= 2) events.emit('lowMood', { studentId, mood, note });
  return { day, mood, note, ...MOODS[mood] };
}

export const getMoods = (studentId, days = 30) =>
  C.moods.find({ student_id: studentId, day: { $gte: today(-(days - 1)) } }, { projection: { _id: 0, day: 1, mood: 1, note: 1 } }).sort({ day: 1 }).toArray();

export const todayMood = (studentId) =>
  C.moods.findOne({ student_id: studentId, day: today() }, { projection: { _id: 0, day: 1, mood: 1, note: 1 } });

// Ketma-ket necha kun kayfiyat belgilangani
export async function moodStreak(studentId) {
  const days = new Set((await C.moods.find({ student_id: studentId, day: { $gte: today(-60) } }).toArray()).map((r) => r.day));
  let streak = 0;
  let offset = days.has(today()) ? 0 : -1;
  while (days.has(today(offset))) {
    streak++;
    offset--;
  }
  return streak;
}

// ---------- Maqsadlar ----------

export async function listGoals(studentId) {
  const goals = await C.goals.find({ student_id: studentId }, { projection: { _id: 0, student_id: 0 } }).sort({ id: -1 }).toArray();
  return goals.sort((a, b) => (a.progress === 100) - (b.progress === 100)); // bajarilganlar oxirida
}

export async function addGoal(studentId, { title, quality }) {
  title = String(title || '').trim();
  if (title.length < 2) throw new AppError(400, 'Maqsadni yozing');
  if (!QUALITIES[quality]) quality = 'mustaqillik';
  const goal = { id: await nextId('goals'), student_id: studentId, title: title.slice(0, 120), quality, progress: 0, created_at: now() };
  await C.goals.insertOne({ ...goal });
  return goal;
}

export async function updateGoal(studentId, goalId, { progress }) {
  const p = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
  const goal = await C.goals.findOneAndUpdate({ id: goalId, student_id: studentId }, { $set: { progress: p } }, { ...P, returnDocument: 'after' });
  if (!goal) throw new AppError(404, 'Maqsad topilmadi');
  return goal;
}

export async function deleteGoal(studentId, goalId) {
  await C.goals.deleteOne({ id: goalId, student_id: studentId });
}

// ---------- O'zini baholash ----------

export async function saveAssessment(studentId, scores) {
  const clean = {};
  for (const key of Object.keys(QUALITIES)) {
    const v = Number(scores?.[key]);
    if (!(v >= 1 && v <= 5)) throw new AppError(400, 'Hamma sifatlarni baholang');
    clean[key] = Math.round(v);
  }
  const day = today();
  await C.assessments.deleteMany({ student_id: studentId, day });
  await C.assessments.insertOne({ id: await nextId('assessments'), student_id: studentId, scores: clean, day, created_at: now() });
  return { day, scores: clean };
}

export const assessments = (studentId, limit = 10) =>
  C.assessments.find({ student_id: studentId }, { projection: { _id: 0, day: 1, scores: 1 } }).sort({ day: -1, id: -1 }).limit(limit).toArray();

// ---------- Topshiriqlar ----------

export async function studentTasks(studentId) {
  const u = await getUser(studentId);
  const tasks = await C.tasks.find({ class_id: u.class_id }, P).sort({ id: -1 }).toArray();
  const subs = new Map(
    (await C.submissions.find({ student_id: studentId, task_id: { $in: tasks.map((t) => t.id) } }).toArray()).map((s) => [s.task_id, s])
  );
  return tasks
    .map((t) => {
      const s = subs.get(t.id);
      return {
        id: t.id, title: t.title, description: t.description, quality: t.quality, stars: t.stars, due_date: t.due_date, created_at: t.created_at,
        submission_id: s?.id ?? null, answer: s?.answer ?? null, feedback: s?.feedback ?? null,
        stars_awarded: s?.stars_awarded ?? null, reviewed: s?.reviewed ?? null, done: !!s,
      };
    })
    .sort((a, b) => a.done - b.done); // bajarilmaganlar tepada (sort barqaror — id tartibi saqlanadi)
}

export async function completeTask(studentId, taskId, answer = '') {
  const u = await getUser(studentId);
  const task = await C.tasks.findOne({ id: taskId, class_id: u.class_id }, P);
  if (!task) throw new AppError(404, 'Topshiriq topilmadi');
  await C.submissions.updateOne(
    { task_id: taskId, student_id: studentId },
    {
      $set: { answer: String(answer || '').slice(0, 1000) },
      $setOnInsert: { id: await nextId('submissions'), stars_awarded: task.stars, feedback: null, reviewed: 0, created_at: now() },
    },
    { upsert: true }
  );
  events.emit('taskCompleted', { studentId, task });
  return task;
}

export async function createTask(teacherId, { title, description, quality, stars, due_date }) {
  const t = await getUser(teacherId);
  title = String(title || '').trim();
  if (title.length < 3) throw new AppError(400, 'Topshiriq nomini yozing');
  if (!QUALITIES[quality]) quality = 'mustaqillik';
  stars = Math.max(1, Math.min(5, Number(stars) || 1));
  const task = {
    id: await nextId('tasks'), class_id: t.class_id, teacher_id: teacherId, title: title.slice(0, 150),
    description: String(description || '').slice(0, 1000), quality, stars, due_date: due_date || null, created_at: now(),
  };
  await C.tasks.insertOne({ ...task });
  events.emit('taskCreated', { task });
  return task;
}

export async function deleteTask(teacherId, taskId) {
  const res = await C.tasks.deleteOne({ id: taskId, teacher_id: teacherId });
  if (res.deletedCount) await C.submissions.deleteMany({ task_id: taskId });
}

export async function teacherTasks(teacherId) {
  const t = await getUser(teacherId);
  const total = await C.users.countDocuments({ class_id: t.class_id, role: 'student' });
  const tasks = await C.tasks.find({ class_id: t.class_id }, P).sort({ id: -1 }).toArray();
  const stats = new Map(
    (
      await C.submissions
        .aggregate([
          { $match: { task_id: { $in: tasks.map((x) => x.id) } } },
          { $group: { _id: '$task_id', done: { $sum: 1 }, to_review: { $sum: { $cond: [{ $eq: ['$reviewed', 0] }, 1, 0] } } } },
        ])
        .toArray()
    ).map((r) => [r._id, r])
  );
  return tasks.map((x) => ({ ...x, done_count: stats.get(x.id)?.done || 0, to_review: stats.get(x.id)?.to_review || 0, student_count: total }));
}

export async function taskSubmissions(teacherId, taskId) {
  const t = await getUser(teacherId);
  const task = await C.tasks.findOne({ id: taskId, class_id: t.class_id }, P);
  if (!task) throw new AppError(404, 'Topshiriq topilmadi');
  const subs = await C.submissions.find({ task_id: taskId }, P).sort({ reviewed: 1, id: -1 }).toArray();
  const users = new Map((await C.users.find({ id: { $in: subs.map((s) => s.student_id) } }).toArray()).map((u) => [u.id, u]));
  return {
    task,
    submissions: subs.map((s) => ({ ...s, full_name: users.get(s.student_id)?.full_name, avatar: users.get(s.student_id)?.avatar })),
  };
}

export async function reviewSubmission(teacherId, submissionId, { feedback, stars }) {
  const t = await getUser(teacherId);
  const sub = await C.submissions.findOne({ id: submissionId }, P);
  const task = sub && (await C.tasks.findOne({ id: sub.task_id }, P));
  if (!task || task.class_id !== t.class_id) throw new AppError(404, 'Javob topilmadi');
  const st = Math.max(0, Math.min(5, Number(stars ?? sub.stars_awarded)));
  const updated = await C.submissions.findOneAndUpdate(
    { id: submissionId },
    { $set: { feedback: String(feedback || '').slice(0, 500), stars_awarded: st, reviewed: 1 } },
    { ...P, returnDocument: 'after' }
  );
  events.emit('feedback', { studentId: sub.student_id, title: task.title, feedback, stars: st });
  return updated;
}

// ---------- Nishonlar va yulduzlar ----------

export async function listBadges(studentId) {
  const badges = await C.badges.find({ student_id: studentId }, P).sort({ id: -1 }).toArray();
  const teachers = new Map((await C.users.find({ id: { $in: badges.map((b) => b.teacher_id) } }).toArray()).map((u) => [u.id, u.full_name]));
  return badges.map((b) => ({
    id: b.id, badge: b.badge, message: b.message, created_at: b.created_at, teacher_name: teachers.get(b.teacher_id) ?? null, ...BADGES[b.badge],
  }));
}

// Bir nechta o'quvchining yulduzlari: Map(student_id -> yulduz)
async function starsOf(studentIds) {
  const rows = await C.submissions
    .aggregate([{ $match: { student_id: { $in: studentIds } } }, { $group: { _id: '$student_id', n: { $sum: '$stars_awarded' } } }])
    .toArray();
  return new Map(rows.map((r) => [r._id, r.n]));
}

export const totalStars = async (studentId) => (await starsOf([studentId])).get(studentId) || 0;

export async function giveBadge(teacherId, studentId, { badge, message }) {
  await assertMyStudent(teacherId, studentId);
  if (!BADGES[badge]) throw new AppError(400, 'Nishonni tanlang');
  await C.badges.insertOne({
    id: await nextId('badges'), student_id: studentId, teacher_id: teacherId, badge, message: String(message || '').slice(0, 300), created_at: now(),
  });
  events.emit('badgeGiven', { studentId, badge: BADGES[badge], message });
}

// ---------- Qahramon bilan suhbat ----------

export const chatHeroes = async (studentId) => ({ heroes: heroList(), today_mood: await todayMood(studentId) });

export async function startChat(studentId, heroId) {
  const hero = HEROES[heroId];
  if (!hero) throw new AppError(400, 'Qahramonni tanlang');
  const mood = (await todayMood(studentId))?.mood ?? 3;
  const id = await nextId('chats');
  const question = questionText(heroId, 0, mood);
  await C.chats.insertOne({ id, student_id: studentId, hero: heroId, mood, step: 0, question, finished: false, flagged: false, day: today(), answers: [], created_at: now() });
  return {
    id,
    hero: heroCard(heroId),
    hello: mood <= 2 ? hero.hello.low : hero.hello.ok,
    question,
    step: 0,
    total: hero.questions.length,
  };
}

// Bola javobini saqlaydi; qahramonning munosabati va keyingi savolni qaytaradi
export async function answerChat(studentId, chatId, answer) {
  const chat = await C.chats.findOne({ id: chatId, student_id: studentId });
  if (!chat) throw new AppError(404, 'Suhbat topilmadi');
  if (chat.finished) throw new AppError(400, 'Bu suhbat tugagan');
  const hero = HEROES[chat.hero];
  answer = String(answer || '').trim().slice(0, 500);
  const alarming = isAlarming(answer);
  // Eski suhbatlarda joriy savol saqlanmagan — tayyor ro'yxatdan olinadi
  const question = chat.question || questionText(chat.hero, chat.step, chat.mood);
  const step = chat.step + 1;
  const done = step >= hero.questions.length;

  // Keyingi savolni AI bolaning javoblariga qarab tuzadi; xavotirli javobdan keyin yoki AI ishlamasa — tayyor savol
  let next = null;
  let ai = null;
  if (!done) {
    const topic = questionText(chat.hero, step, chat.mood);
    if (!alarming) ai = await aiQuestion({
      hero, mood: chat.mood, topic, step, total: hero.questions.length,
      history: [...chat.answers, { question, answer }],
    });
    next = ai || topic;
  }

  // step sharti — bir javob ikki marta yuborilsa, ikkinchisi yozilmaydi
  const res = await C.chats.updateOne(
    { id: chatId, step: chat.step, finished: false },
    {
      $push: { answers: { question, answer, flagged: alarming, created_at: now() } },
      $set: { step, question: next, finished: done, ...(alarming && { flagged: true }) },
    }
  );
  if (!res.modifiedCount) throw new AppError(409, 'Javob allaqachon yuborilgan');
  if (alarming) events.emit('chatAlert', { studentId, hero: hero.name, question, answer });
  if (done) events.emit('chatFinished', { studentId, chatId });

  // Tayyor munosabat ("Voy, zo'r-ku!") bola javobiga mos kelmasligi mumkin: AI savoli o'zi javobga munosabat bildiradi,
  // oxirgi javobdan keyin esa xayrlashuv keladi — shu hollarda munosabat yuborilmaydi
  const canned = !ai && !(done && aiEnabled());
  const reply = alarming ? ALERT_REPLY : !answer ? SKIP_REPLY : canned ? hero.reactions[chat.step % hero.reactions.length] : null;
  return {
    reply,
    question: next,
    bye: done ? hero.bye : null,
    step,
    total: hero.questions.length,
    done,
  };
}

export async function finishChat(studentId, chatId) {
  const chat = await C.chats.findOneAndUpdate({ id: chatId, student_id: studentId }, { $set: { finished: true } });
  if (!chat) throw new AppError(404, 'Suhbat topilmadi');
  // Bitta ham javob berilmagan bo'lsa, o'qituvchini bezovta qilmaymiz
  if (!chat.finished && chat.step > 0) events.emit('chatFinished', { studentId, chatId });
  return { bye: HEROES[chat.hero].bye };
}

const chatView = (c, user) => ({
  id: c.id, student_id: c.student_id, hero: heroCard(c.hero), mood: c.mood, finished: c.finished, flagged: c.flagged,
  day: c.day, created_at: c.created_at, answers: c.answers.map(({ question, answer, flagged }) => ({ question, answer, flagged })),
  ...(user && { full_name: user.full_name, avatar: user.avatar }),
});

export const getChat = async (chatId) => chatView(await C.chats.findOne({ id: chatId }));

// O'qituvchi: sinfdagi suhbatlar (javob berilmagan bo'sh suhbatlar ko'rsatilmaydi)
export async function classChats(teacherId, { flagged } = {}) {
  const t = await getUser(teacherId);
  const students = new Map((await classStudents(t.class_id)).map((s) => [s.id, s]));
  const chats = await C.chats
    .find({ student_id: { $in: [...students.keys()] }, step: { $gt: 0 }, ...(flagged && { flagged: true }) })
    .sort({ id: -1 })
    .limit(60)
    .toArray();
  return chats.map((c) => chatView(c, students.get(c.student_id)));
}

const studentChats = async (studentId, limit = 5) =>
  (await C.chats.find({ student_id: studentId, step: { $gt: 0 } }).sort({ id: -1 }).limit(limit).toArray()).map((c) => chatView(c));

// ---------- O'qituvchi: sinf va o'quvchi ----------

export async function assertMyStudent(teacherId, studentId) {
  const t = await getUser(teacherId);
  const s = await getUser(studentId);
  if (!s || s.role !== 'student' || s.class_id !== t.class_id) throw new AppError(404, "O'quvchi topilmadi");
  return s;
}

export async function classOverview(teacherId) {
  const t = await getUser(teacherId);
  const cls = await C.classes.findOne({ id: t.class_id }, P);
  const students = await classStudents(t.class_id);
  const ids = students.map((s) => s.id);
  const [weekMoods, stars, badgeRows] = await Promise.all([
    C.moods.find({ student_id: { $in: ids }, day: { $gte: today(-6) } }).toArray(),
    starsOf(ids),
    C.badges.aggregate([{ $match: { student_id: { $in: ids } } }, { $group: { _id: '$student_id', n: { $sum: 1 } } }]).toArray(),
  ]);
  const badges = new Map(badgeRows.map((r) => [r._id, r.n]));
  return {
    class: cls,
    students: students.map((s) => {
      const mine = weekMoods.filter((m) => m.student_id === s.id);
      return {
        id: s.id, full_name: s.full_name, avatar: s.avatar, login: s.login, telegram_linked: !!s.telegram_chat_id,
        today_mood: mine.find((m) => m.day === today())?.mood ?? null,
        stars: stars.get(s.id) || 0,
        badges: badges.get(s.id) || 0,
        week_mood: mine.length ? round1(sum(mine.map((m) => m.mood)) / mine.length) : null,
      };
    }),
  };
}

export async function studentProfile(teacherId, studentId) {
  const s = await assertMyStudent(teacherId, studentId);
  const [student, moods, streak, stars, goals, assess, tasks, badges, chats, notes] = await Promise.all([
    publicUser(s),
    getMoods(studentId, 30),
    moodStreak(studentId),
    totalStars(studentId),
    listGoals(studentId),
    assessments(studentId, 5),
    studentTasks(studentId),
    listBadges(studentId),
    studentChats(studentId),
    C.notes.find({ student_id: studentId, teacher_id: teacherId }, { projection: { _id: 0, id: 1, text: 1, created_at: 1 } }).sort({ id: -1 }).toArray(),
  ]);
  return { student, moods, streak, stars, goals, assessments: assess, tasks, badges, chats, notes };
}

export async function addNote(teacherId, studentId, text) {
  await assertMyStudent(teacherId, studentId);
  text = String(text || '').trim();
  if (!text) throw new AppError(400, 'Qayd matnini yozing');
  await C.notes.insertOne({ id: await nextId('notes'), student_id: studentId, teacher_id: teacherId, text: text.slice(0, 1000), created_at: now() });
}

export async function classAnalytics(teacherId) {
  const t = await getUser(teacherId);
  const students = await classStudents(t.class_id);
  const ids = students.map((s) => s.id);
  const byId = new Map(students.map((s) => [s.id, s]));
  const moods = await C.moods.find({ student_id: { $in: ids }, day: { $gte: today(-6) } }).toArray();

  // Oxirgi 7 kun: har kunda nechta o'quvchi qaysi kayfiyatda
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const day = today(-i);
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const m of moods) if (m.day === day) counts[m.mood]++;
    week.push({ day, counts });
  }

  // Har bir o'quvchining eng oxirgi o'zini baholashi bo'yicha sinf o'rtachasi
  const latest = await C.assessments
    .aggregate([{ $match: { student_id: { $in: ids } } }, { $sort: { id: -1 } }, { $group: { _id: '$student_id', scores: { $first: '$scores' } } }])
    .toArray();
  const qualities = {};
  for (const key of Object.keys(QUALITIES)) {
    const vals = latest.map((r) => r.scores[key]).filter(Boolean);
    qualities[key] = vals.length ? +(sum(vals) / vals.length).toFixed(1) : 0;
  }

  // E'tibor talab qiladigan o'quvchilar: oxirgi 3 kunda kayfiyat o'rtachasi past
  const recent = new Map();
  for (const m of moods) if (m.day >= today(-2)) recent.set(m.student_id, [...(recent.get(m.student_id) || []), m.mood]);
  const attention = [...recent]
    .map(([id, list]) => ({ id, full_name: byId.get(id).full_name, avatar: byId.get(id).avatar, avg_mood: round1(sum(list) / list.length), days: list.length }))
    .filter((s) => s.avg_mood <= 2.5)
    .sort((a, b) => a.avg_mood - b.avg_mood);

  const tasks = await C.tasks.find({ class_id: t.class_id }).toArray();
  const submissions = await C.submissions.countDocuments({ task_id: { $in: tasks.map((x) => x.id) } });

  return {
    student_count: students.length,
    checked_today: moods.filter((m) => m.day === today()).length,
    week,
    qualities,
    attention,
    completion: tasks.length && students.length ? Math.round((submissions / (tasks.length * students.length)) * 100) : 0,
  };
}

export async function studentDashboard(studentId) {
  const [tasks, today_mood, streak, stars, moods, goals, badges, assess] = await Promise.all([
    studentTasks(studentId),
    todayMood(studentId),
    moodStreak(studentId),
    totalStars(studentId),
    getMoods(studentId, 7),
    listGoals(studentId),
    listBadges(studentId),
    assessments(studentId, 1),
  ]);
  return {
    today_mood,
    streak,
    stars,
    moods,
    goals: goals.slice(0, 4),
    pending_tasks: tasks.filter((t) => !t.done).slice(0, 4),
    done_count: tasks.filter((t) => t.done).length,
    badges: badges.slice(0, 6),
    assessment: assess[0] || null,
  };
}
