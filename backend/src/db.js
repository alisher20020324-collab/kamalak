import { MongoClient } from 'mongodb';
import { LEGACY_IDS } from './heroes.js';

const URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB || 'kamalak';

export const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });

// Kolleksiyalar: C.users, C.moods ... (connect() dan keyin to'ladi)
const NAMES = ['counters', 'classes', 'users', 'moods', 'goals', 'assessments', 'tasks', 'submissions', 'badges', 'notes', 'chats', 'voices'];
export const C = {};
export let db = null;

// Har bir hujjatda raqamli `id` bor (sayt va bot manzillari shu raqam bilan ishlaydi), Mongo'ning `_id` si tashqariga chiqmaydi
export const P = { projection: { _id: 0 } };

// SQLite'dagi datetime('now') bilan bir xil ko'rinish: "2026-11-01 09:30:00" (UTC)
export const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

// Bir necha joydan bir vaqtda chaqirilsa ham bitta ulanish bo'ladi
let connecting = null;
export function connect() {
  connecting ??= init().catch((e) => {
    connecting = null;
    throw e;
  });
  return connecting;
}

async function init() {
  await client.connect();
  db = client.db(DB_NAME);
  for (const n of NAMES) C[n] = db.collection(n);
  await Promise.all([
    ...NAMES.filter((n) => n !== 'counters').map((n) => C[n].createIndex({ id: 1 }, { unique: true })),
    C.classes.createIndex({ code: 1 }, { unique: true }),
    C.users.createIndex({ login_lower: 1 }, { unique: true }),
    C.users.createIndex({ telegram_chat_id: 1 }, { unique: true, partialFilterExpression: { telegram_chat_id: { $type: 'string' } } }),
    C.users.createIndex({ class_id: 1, role: 1 }),
    C.moods.createIndex({ student_id: 1, day: 1 }, { unique: true }),
    C.goals.createIndex({ student_id: 1 }),
    C.assessments.createIndex({ student_id: 1, day: -1 }),
    C.tasks.createIndex({ class_id: 1 }),
    C.submissions.createIndex({ task_id: 1, student_id: 1 }, { unique: true }),
    C.submissions.createIndex({ student_id: 1 }),
    C.badges.createIndex({ student_id: 1 }),
    C.notes.createIndex({ student_id: 1 }),
    C.chats.createIndex({ student_id: 1, id: -1 }),
  ]);
  // Qahramonlar almashgan: eski suhbatlardagi id larni yangilariga o'tkazamiz
  for (const [from, to] of Object.entries(LEGACY_IDS)) await C.chats.updateMany({ hero: from }, { $set: { hero: to } });
  return db;
}

export async function close() {
  await client.close();
  db = null;
  connecting = null;
}

// Kolleksiya uchun keyingi raqamli id (1, 2, 3 ...)
export async function nextId(name) {
  const r = await C.counters.findOneAndUpdate({ _id: name }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' });
  return r.seq;
}
