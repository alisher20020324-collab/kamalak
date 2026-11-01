// Eski SQLite bazasidagi (data/kamalak.db) ma'lumotlarni MongoDB ga bir marta ko'chiradi: npm run migrate
// id lar o'zgarmaydi, parollar va Telegram ulanishlari saqlanadi.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { connect, close, C } from './db.js';

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'kamalak.db');
if (!fs.existsSync(file)) {
  console.log("SQLite bazasi topilmadi — ko'chiradigan narsa yo'q.");
  process.exit(0);
}

await connect();
if (await C.users.countDocuments()) {
  console.log("MongoDB da allaqachon foydalanuvchilar bor — ko'chirish to'xtatildi (ma'lumotlar ikki marta yozilmasin).");
  await close();
  process.exit(1);
}

const sqlite = new DatabaseSync(file, { readOnly: true });
const has = (t) => !!sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(t);
const rows = (t) => (has(t) ? sqlite.prepare(`SELECT * FROM ${t} ORDER BY id`).all().map((r) => ({ ...r })) : []);

const plan = {
  classes: rows('classes'),
  users: rows('users').map(({ telegram_chat_id, ...u }) => ({ ...u, login_lower: u.login.toLowerCase(), ...(telegram_chat_id && { telegram_chat_id }) })),
  moods: rows('moods'),
  goals: rows('goals'),
  assessments: rows('assessments').map((a) => ({ ...a, scores: JSON.parse(a.scores) })),
  tasks: rows('tasks'),
  submissions: rows('submissions'),
  badges: rows('badges'),
  notes: rows('notes'),
  chats: rows('chats').map((c) => ({
    ...c,
    finished: !!c.finished,
    flagged: !!c.flagged,
    answers: sqlite
      .prepare('SELECT question, answer, flagged, created_at FROM chat_answers WHERE chat_id = ? ORDER BY id')
      .all(c.id)
      .map((a) => ({ ...a, flagged: !!a.flagged })),
  })),
};

for (const [name, docs] of Object.entries(plan)) {
  if (docs.length) await C[name].insertMany(docs);
  // Yangi yozuvlar eski id lardan keyin davom etishi uchun hisoblagich
  const max = docs.reduce((m, d) => Math.max(m, d.id), 0);
  await C.counters.updateOne({ _id: name }, { $max: { seq: max } }, { upsert: true });
  console.log(`  ${name}: ${docs.length}`);
}

console.log("✅ Ko'chirildi. Eski fayl data/kamalak.db zaxira sifatida qoldirildi.");
await close();
