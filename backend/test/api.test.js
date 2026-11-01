import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Har bir test ishga tushganda alohida vaqtinchalik baza, oxirida o'chiriladi
process.env.MONGODB_DB = `kamalak_test_api_${process.pid}`;
// AI o'chiq — testlar internetga chiqmaydi, tayyor savollar ishlatiladi
process.env.GEMINI_API_KEY = process.env.GROQ_API_KEY = '';
process.env.TTS_PYTHON = 'off';
const { createApp } = await import('../src/app.js');
const { connect, close } = await import('../src/db.js');

let server, base, db;
before(async () => {
  db = await connect();
  await new Promise((r) => { server = createApp().listen(0, () => { base = `http://127.0.0.1:${server.address().port}/api`; r(); }); });
});
after(async () => {
  server.close();
  await db.dropDatabase();
  await close();
});

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

const ctx = {};

test("o'qituvchi ro'yxatdan o'tadi va sinf kodi oladi", async () => {
  const r = await call('POST', '/auth/register', { role: 'teacher', full_name: 'Test Ustoz', login: 'tustoz', password: 'secret1', class_name: '1-A' });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.role, 'teacher');
  assert.match(r.data.user.class.code, /^[A-Z0-9]{6}$/);
  ctx.teacher = r.data.token;
  ctx.code = r.data.user.class.code;
});

test("o'quvchi noto'g'ri sinf kodi bilan o'tolmaydi, to'g'risi bilan o'tadi", async () => {
  const bad = await call('POST', '/auth/register', { role: 'student', full_name: 'Ali Valiyev', login: 'ali1', password: '123456', class_code: 'XXXXXX' });
  assert.equal(bad.status, 400);
  const ok = await call('POST', '/auth/register', { role: 'student', full_name: 'Ali Valiyev', login: 'ali1', password: '123456', class_code: ctx.code.toLowerCase() });
  assert.equal(ok.status, 200);
  ctx.student = ok.data.token;
  ctx.studentId = ok.data.user.id;
});

test('band login va qisqa parol rad etiladi', async () => {
  assert.equal((await call('POST', '/auth/register', { role: 'student', full_name: 'Boshqa', login: 'ALI1', password: '123456', class_code: ctx.code })).status, 409);
  assert.equal((await call('POST', '/auth/register', { role: 'student', full_name: 'Boshqa', login: 'ali2', password: '123', class_code: ctx.code })).status, 400);
});

test("login: to'g'ri va noto'g'ri parol", async () => {
  assert.equal((await call('POST', '/auth/login', { login: 'ali1', password: 'xato' })).status, 401);
  const r = await call('POST', '/auth/login', { login: 'ali1', password: '123456' });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.full_name, 'Ali Valiyev');
});

test("rollar bir-birining bo'limiga kira olmaydi, tokensiz kirib bo'lmaydi", async () => {
  assert.equal((await call('GET', '/teacher/class', null, ctx.student)).status, 403);
  assert.equal((await call('GET', '/student/dashboard', null, ctx.teacher)).status, 403);
  assert.equal((await call('GET', '/student/dashboard')).status, 401);
});

test("o'quvchi: kayfiyat, maqsad, o'zini baholash", async () => {
  const m = await call('POST', '/student/mood', { mood: 2, note: 'Charchadim' }, ctx.student);
  assert.equal(m.data.mood, 2);
  const g = await call('POST', '/student/goals', { title: "Kitob o'qiyman", quality: 'qiziquvchanlik' }, ctx.student);
  assert.equal((await call('PATCH', `/student/goals/${g.data.id}`, { progress: 60 }, ctx.student)).data.progress, 60);
  const scores = { mustaqillik: 4, masuliyat: 5, hamkorlik: 3, ijodkorlik: 4, qiziquvchanlik: 5 };
  assert.equal((await call('POST', '/student/assessments', { scores }, ctx.student)).status, 200);
  assert.equal((await call('POST', '/student/assessments', { scores: { mustaqillik: 4 } }, ctx.student)).status, 400);
  const d = (await call('GET', '/student/dashboard', null, ctx.student)).data;
  assert.equal(d.today_mood.mood, 2);
  assert.equal(d.streak, 1);
  assert.equal(d.goals.length, 1);
  assert.deepEqual(d.assessment.scores, scores);
});

test("topshiriq: o'qituvchi beradi, o'quvchi bajaradi, o'qituvchi baholaydi", async () => {
  const t = await call('POST', '/teacher/tasks', { title: 'Rasm chizing', quality: 'ijodkorlik', stars: 3 }, ctx.teacher);
  assert.equal(t.status, 200);
  const list = (await call('GET', '/student/tasks', null, ctx.student)).data;
  assert.equal(list.length, 1);
  assert.equal(list[0].done, false);
  await call('POST', `/student/tasks/${t.data.id}/complete`, { answer: 'Chizdim' }, ctx.student);
  assert.equal((await call('GET', '/student/badges', null, ctx.student)).data.stars, 3);
  const subs = (await call('GET', `/teacher/tasks/${t.data.id}/submissions`, null, ctx.teacher)).data;
  assert.equal(subs.submissions.length, 1);
  await call('POST', `/teacher/submissions/${subs.submissions[0].id}/review`, { feedback: "Zo'r!", stars: 5 }, ctx.teacher);
  assert.equal((await call('GET', '/student/badges', null, ctx.student)).data.stars, 5);
});

test("o'qituvchi: sinf, profil, nishon, qayd, tahlil", async () => {
  const cls = (await call('GET', '/teacher/class', null, ctx.teacher)).data;
  assert.equal(cls.students.length, 1);
  assert.equal(cls.students[0].today_mood, 2);
  assert.equal((await call('POST', `/teacher/students/${ctx.studentId}/badges`, { badge: 'ijodkor', message: 'Barakalla' }, ctx.teacher)).status, 200);
  assert.equal((await call('POST', `/teacher/students/${ctx.studentId}/notes`, { text: 'Kuzatish kerak' }, ctx.teacher)).status, 200);
  const p = (await call('GET', `/teacher/students/${ctx.studentId}`, null, ctx.teacher)).data;
  assert.equal(p.badges[0].title, 'Ijodkor');
  assert.equal(p.notes.length, 1);
  const a = (await call('GET', '/teacher/analytics', null, ctx.teacher)).data;
  assert.equal(a.checked_today, 1);
  assert.equal(a.attention.length, 1);
  assert.equal(a.completion, 100);
  assert.equal(a.qualities.masuliyat, 5);
});

test("boshqa sinf o'qituvchisi begona o'quvchini ko'ra olmaydi", async () => {
  const r = await call('POST', '/auth/register', { role: 'teacher', full_name: 'Boshqa Ustoz', login: 'ustoz2', password: 'secret1', class_name: '3-B' });
  assert.equal((await call('GET', `/teacher/students/${ctx.studentId}`, null, r.data.token)).status, 404);
});

test("qahramon bilan suhbat: savollar, xavotirli javob, o'qituvchiga ko'rinadi", async () => {
  const list = (await call('GET', '/student/heroes', null, ctx.student)).data;
  assert.ok(list.heroes.length >= 5);
  assert.equal((await call('POST', '/student/chats', { hero: 'yoq' }, ctx.student)).status, 400);

  const c = (await call('POST', '/student/chats', { hero: 'po' }, ctx.student)).data;
  assert.match(c.question, /xafa qildi/, 'kayfiyat past (2) — birinchi savol shunga mos');
  const total = c.total;
  let r = (await call('POST', `/student/chats/${c.id}/answer`, { answer: "Do'stim meni urdi" }, ctx.student)).data;
  assert.match(r.reply, /yolg'iz emassan/);
  r = (await call('POST', `/student/chats/${c.id}/answer`, { answer: '' }, ctx.student)).data;
  assert.match(r.reply, /o'tkazib/);
  for (let i = 2; i < total; i++) r = (await call('POST', `/student/chats/${c.id}/answer`, { answer: 'Yaxshi' }, ctx.student)).data;
  assert.equal(r.done, true);
  assert.ok(r.bye);
  assert.equal((await call('POST', `/student/chats/${c.id}/answer`, { answer: 'yana' }, ctx.student)).status, 400);

  const chats = (await call('GET', '/teacher/chats', null, ctx.teacher)).data;
  assert.equal(chats.length, 1);
  assert.equal(chats[0].flagged, true);
  assert.equal(chats[0].answers.length, total);
  assert.equal((await call('GET', '/teacher/chats?flagged=1', null, ctx.teacher)).data.length, 1);
  const p = (await call('GET', `/teacher/students/${ctx.studentId}`, null, ctx.teacher)).data;
  assert.equal(p.chats[0].hero.name, 'Po');

  const other = await call('POST', '/auth/login', { login: 'ustoz2', password: 'secret1' });
  assert.equal((await call('GET', '/teacher/chats', null, other.data.token)).data.length, 0);
});

test("ovoz: qahramon ovozi, bolaning ovozli javobi, o'qituvchi eshitadi", async () => {
  const auth = (t) => ({ Authorization: `Bearer ${t}` });
  // Testlarda TTS o'chiq — ovoz yo'q (204), sahifa matn bilan ishlayveradi
  const tts = await fetch(`${base}/student/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth(ctx.student) }, body: JSON.stringify({ hero: 'po', text: 'Salom' }) });
  assert.equal(tts.status, 204);

  const c = (await call('POST', '/student/chats', { hero: 'olaf' }, ctx.student)).data;
  const send = (body, type) => fetch(`${base}/student/chats/${c.id}/voice`, { method: 'POST', headers: { 'Content-Type': type, ...auth(ctx.student) }, body });
  assert.equal((await send('', 'audio/ogg')).status, 400, "bo'sh ovoz");
  const r = await send(Buffer.alloc(5000, 1), 'audio/webm;codecs=opus');
  assert.equal(r.status, 422, 'Groq kaliti yo\'q — tushunilmadi');
  assert.match((await r.json()).error, /tushunolmadim/);

  // Saqlangan ovozni faqat o'z o'qituvchisi eshitadi
  const { C } = await import('../src/db.js');
  await C.voices.insertOne({ id: 9001, student_id: ctx.studentId, chat_id: c.id, mime: 'audio/ogg', data: Buffer.from('OggS-test'), created_at: '' });
  const v = await fetch(`${base}/teacher/voices/9001`, { headers: auth(ctx.teacher) });
  assert.equal(v.status, 200);
  assert.equal(v.headers.get('content-type'), 'audio/ogg');
  assert.equal(Buffer.from(await v.arrayBuffer()).toString(), 'OggS-test');
  const other = (await call('POST', '/auth/login', { login: 'ustoz2', password: 'secret1' })).data.token;
  assert.equal((await fetch(`${base}/teacher/voices/9001`, { headers: auth(other) })).status, 404, "begona o'qituvchi");
  assert.equal((await fetch(`${base}/teacher/voices/1`, { headers: auth(ctx.teacher) })).status, 404);
});
