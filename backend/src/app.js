import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import * as S from './services.js';
import { QUALITIES, MOODS, BADGES, AVATARS } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'kamalak-dev-secret-ozgartiring';

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

// Async xatolarni bitta joyda ushlash
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).then((data) => res.json(data ?? { ok: true }), next);

function auth(role) {
  return async (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Iltimos, qaytadan kiring' });
    }
    try {
      const user = await S.getUser(payload.id);
      if (!user) return res.status(401).json({ error: 'Iltimos, qaytadan kiring' });
      if (role && user.role !== role) return res.status(403).json({ error: "Bu bo'lim siz uchun emas" });
      req.user = user;
      next();
    } catch (err) {
      next(err); // baza xatosi — 500
    }
  };
}

// Oddiy himoya: bir IP dan login/ro'yxatga juda ko'p urinishni cheklash
const attempts = new Map();
function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const rec = attempts.get(key) || { n: 0, t: now };
  if (now - rec.t > 60_000) Object.assign(rec, { n: 0, t: now });
  rec.n++;
  attempts.set(key, rec);
  if (rec.n > 30) return res.status(429).json({ error: "Juda ko'p urinish. 1 daqiqadan so'ng qayta urinib ko'ring" });
  next();
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(compression());
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  const api = express.Router();

  api.get('/health', (req, res) => res.json({ ok: true }));
  api.get('/meta', (req, res) =>
    res.json({ qualities: QUALITIES, moods: MOODS, badges: BADGES, avatars: AVATARS, bot_username: process.env.BOT_USERNAME || null })
  );

  // ----- Auth -----
  api.post(
    '/auth/register',
    rateLimit,
    h(async (req) => {
      const user = await S.register(req.body || {});
      return { token: signToken(user), user: await S.publicUser(user) };
    })
  );
  api.post(
    '/auth/login',
    rateLimit,
    h(async (req) => {
      const user = await S.authenticate(req.body?.login, req.body?.password);
      if (!user) throw new S.AppError(401, "Login yoki parol noto'g'ri");
      return { token: signToken(user), user: await S.publicUser(user) };
    })
  );
  api.get('/me', auth(), h(async (req) => ({ user: await S.publicUser(req.user) })));
  api.patch('/me', auth(), h(async (req) => ({ user: await S.publicUser(await S.updateProfile(req.user.id, req.body || {})) })));

  // ----- O'quvchi -----
  const st = express.Router();
  st.use(auth('student'));
  st.get('/dashboard', h((req) => S.studentDashboard(req.user.id)));
  st.post('/mood', h((req) => S.setMood(req.user.id, req.body?.mood, req.body?.note)));
  st.get('/moods', h((req) => S.getMoods(req.user.id, Math.min(90, Number(req.query.days) || 30))));
  st.get('/goals', h((req) => S.listGoals(req.user.id)));
  st.post('/goals', h((req) => S.addGoal(req.user.id, req.body || {})));
  st.patch('/goals/:id', h((req) => S.updateGoal(req.user.id, Number(req.params.id), req.body || {})));
  st.delete('/goals/:id', h((req) => S.deleteGoal(req.user.id, Number(req.params.id))));
  st.get('/assessments', h((req) => S.assessments(req.user.id, 10)));
  st.post('/assessments', h((req) => S.saveAssessment(req.user.id, req.body?.scores)));
  st.get('/tasks', h((req) => S.studentTasks(req.user.id)));
  st.post('/tasks/:id/complete', h((req) => S.completeTask(req.user.id, Number(req.params.id), req.body?.answer)));
  st.get('/badges', h(async (req) => ({ badges: await S.listBadges(req.user.id), stars: await S.totalStars(req.user.id) })));
  st.get('/heroes', h((req) => S.chatHeroes(req.user.id)));
  st.post('/chats', h((req) => S.startChat(req.user.id, req.body?.hero)));
  st.post('/chats/:id/answer', h((req) => S.answerChat(req.user.id, Number(req.params.id), req.body?.answer)));
  st.post('/chats/:id/finish', h((req) => S.finishChat(req.user.id, Number(req.params.id))));
  api.use('/student', st);

  // ----- O'qituvchi -----
  const te = express.Router();
  te.use(auth('teacher'));
  te.get('/class', h((req) => S.classOverview(req.user.id)));
  te.get('/analytics', h((req) => S.classAnalytics(req.user.id)));
  te.get('/students/:id', h((req) => S.studentProfile(req.user.id, Number(req.params.id))));
  te.post('/students/:id/badges', h((req) => S.giveBadge(req.user.id, Number(req.params.id), req.body || {})));
  te.post('/students/:id/notes', h((req) => S.addNote(req.user.id, Number(req.params.id), req.body?.text)));
  te.get('/tasks', h((req) => S.teacherTasks(req.user.id)));
  te.post('/tasks', h((req) => S.createTask(req.user.id, req.body || {})));
  te.delete('/tasks/:id', h((req) => S.deleteTask(req.user.id, Number(req.params.id))));
  te.get('/tasks/:id/submissions', h((req) => S.taskSubmissions(req.user.id, Number(req.params.id))));
  te.post('/submissions/:id/review', h((req) => S.reviewSubmission(req.user.id, Number(req.params.id), req.body || {})));
  te.get('/chats', h((req) => S.classChats(req.user.id, { flagged: req.query.flagged === '1' })));
  api.use('/teacher', te);

  api.use((req, res) => res.status(404).json({ error: 'Topilmadi' }));
  app.use('/api', api);

  // ----- React frontend (build qilingan bo'lsa) -----
  const dist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(dist)) {
    app.use('/assets', express.static(path.join(dist, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(dist, { maxAge: '1h', index: false }));
    app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof S.AppError) return res.status(err.status).json({ error: err.message });
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: "Noto'g'ri so'rov" });
    console.error(err);
    res.status(500).json({ error: 'Serverda xatolik. Birozdan keyin urinib ko\'ring' });
  });

  return app;
}
