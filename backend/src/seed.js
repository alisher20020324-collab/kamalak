// Namoyish uchun demo ma'lumotlar: npm run seed
import 'dotenv/config';
import { connect, close, C, nextId, now } from './db.js';
import * as S from './services.js';
import { today } from './constants.js';

await connect();

if (await C.users.findOne({ login_lower: 'ustoz' })) {
  console.log("Demo ma'lumotlar allaqachon bor.");
  await close();
  process.exit(0);
}

const teacher = await S.register({
  role: 'teacher',
  full_name: 'Dilnoza Karimova',
  login: 'ustoz',
  password: 'ustoz123',
  class_name: '2-"A"',
  avatar: '🦉',
});
const { code } = await C.classes.findOne({ id: teacher.class_id });

const kids = [
  ['Ali Valiyev', 'ali', '🦁'],
  ['Malika Yusupova', 'malika', '🦄'],
  ['Jasur Rahimov', 'jasur', '🐯'],
  ['Zarina Aliyeva', 'zarina', '🐰'],
  ['Bobur Tursunov', 'bobur', '🐼'],
  ['Nilufar Qodirova', 'nilufar', '🐱'],
];
const students = [];
for (const [full_name, login, avatar] of kids) {
  students.push(await S.register({ role: 'student', full_name, login, password: '123456', class_code: code, avatar }));
}

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

for (const [i, s] of students.entries()) {
  // 14 kunlik kayfiyat tarixi (Jasur oxirgi kunlarda xafa — o'qituvchi e'tiborini tortish uchun)
  for (let d = 13; d >= 1; d--) {
    if (Math.random() < 0.15) continue;
    const mood = s.login === 'jasur' && d <= 3 ? rnd(1, 2) : rnd(3, 5);
    await C.moods.insertOne({ id: await nextId('moods'), student_id: s.id, mood, note: '', day: today(-d), created_at: now() });
  }
  for (const day of [today(-14), today(-1)]) {
    const scores = {};
    for (const k of ['mustaqillik', 'masuliyat', 'hamkorlik', 'ijodkorlik', 'qiziquvchanlik']) scores[k] = rnd(2, 5);
    await C.assessments.insertOne({ id: await nextId('assessments'), student_id: s.id, scores, day, created_at: now() });
  }
  if (i % 2 === 0) await S.addGoal(s.id, { title: "Har kuni 10 bet kitob o'qiyman", quality: 'qiziquvchanlik' });
  await S.addGoal(s.id, { title: "Xonamni o'zim yig'ishtiraman", quality: 'mustaqillik' });
  await S.addGoal(s.id, { title: 'Sinfdoshimga matematikadan yordam beraman', quality: 'hamkorlik' });
}
for (const g of await C.goals.find().toArray()) await S.updateGoal(g.student_id, g.id, { progress: rnd(1, 10) * 10 });

const tasks = [];
for (const t of [
  { title: 'Oilam haqida rasm chizing', description: "Oilangiz a'zolarini chizing va har biri haqida bitta jumla yozing.", quality: 'ijodkorlik', stars: 2 },
  { title: 'Bugun kimgadir yordam bering', description: 'Kimga va qanday yordam berganingizni yozing.', quality: 'hamkorlik', stars: 3 },
  { title: "Ertalabki tartibni o'zingiz bajaring", description: "O'rningizni yig'ing, yuvining, sumkangizni o'zingiz tayyorlang.", quality: 'mustaqillik', stars: 1 },
  { title: '"Nega osmon ko\'k?" savoliga javob toping', description: "Kattalardan so'rang yoki kitobdan qidiring.", quality: 'qiziquvchanlik', stars: 2 },
]) {
  tasks.push(await S.createTask(teacher.id, t));
}

const badgeKeys = ['yulduz', 'dost', 'ijodkor', 'mehnatkash', 'kitobxon', 'yordamchi'];
for (const [i, s] of students.entries()) {
  for (const t of tasks.slice(0, rnd(1, 3))) await S.completeTask(s.id, t.id, 'Bajardim!');
  await S.giveBadge(teacher.id, s.id, { badge: badgeKeys[i], message: 'Barakalla, shunday davom eting!' });
}
await S.addNote(teacher.id, students[2].id, "Oxirgi kunlarda tanaffusda yolg'iz o'tiryapti. Ota-onasi bilan suhbatlashish kerak.");

console.log(`✅ Demo ma'lumotlar yaratildi.
   O'qituvchi:  login: ustoz   parol: ustoz123
   O'quvchilar: ali, malika, jasur, zarina, bobur, nilufar   parol: 123456
   Sinf kodi:   ${code}`);
await close();
