import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../auth.jsx';
import { Logo, toast } from '../components/ui.jsx';
import { AVATARS } from '../constants.js';

function AuthShell({ title, sub, children }) {
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <Link to="/" className="logo" style={{ justifyContent: 'center' }}><Logo /> Kamalak</Link>
        <h1 className="center" style={{ fontSize: '1.6rem' }}>{title}</h1>
        <p className="center muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.login, form.password);
      toast(`${user.avatar} Xush kelibsiz!`);
      navigate(homeFor(user));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Xush kelibsiz! 👋" sub="Login va parolingizni kiriting">
      <form onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        <label className="field">
          <span>Login</span>
          <input className="input" name="login" autoComplete="username" autoFocus required value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} />
        </label>
        <label className="field">
          <span>Parol</span>
          <input className="input" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        <button className="btn block" disabled={busy}>{busy ? 'Kirilmoqda...' : 'Kirish'}</button>
      </form>
      <p className="center" style={{ marginTop: 18 }}>
        Akkauntingiz yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: 'student', full_name: '', login: '', password: '', class_code: '', class_name: '', avatar: AVATARS[0] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isStudent = form.role === 'student';

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register(form);
      toast(user.role === 'teacher' ? `🎉 Sinf yaratildi! Kod: ${user.class.code}` : '🎉 Xush kelibsiz!');
      navigate(homeFor(user));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Ro'yxatdan o'tish ✨" sub="Siz kimsiz?">
      <form onSubmit={submit}>
        <div className="role-pick">
          {[['student', '🧒', "O'quvchiman"], ['teacher', '👩‍🏫', "O'qituvchiman"]].map(([r, e, t]) => (
            <button type="button" key={r} className={`role-opt ${form.role === r ? 'sel' : ''}`} onClick={() => setForm({ ...form, role: r })}>
              <span className="e">{e}</span>
              {t}
            </button>
          ))}
        </div>
        {error && <div className="error">{error}</div>}
        <label className="field">
          <span>Ism va familiya</span>
          <input className="input" name="full_name" required value={form.full_name} onChange={set('full_name')} placeholder="Masalan: Ali Valiyev" />
        </label>
        {isStudent ? (
          <label className="field">
            <span>Sinf kodi</span>
            <input className="input" name="class_code" required value={form.class_code} onChange={set('class_code')} placeholder="Ustozingiz bergan 6 belgili kod" style={{ textTransform: 'uppercase', letterSpacing: 2 }} maxLength={6} />
          </label>
        ) : (
          <label className="field">
            <span>Sinfingiz nomi</span>
            <input className="input" name="class_name" required value={form.class_name} onChange={set('class_name')} placeholder='Masalan: 2-"A"' />
          </label>
        )}
        <label className="field">
          <span>Login</span>
          <input className="input" name="login" autoComplete="username" required value={form.login} onChange={set('login')} placeholder="Lotin harflari va raqamlar" />
        </label>
        <label className="field">
          <span>Parol</span>
          <input className="input" name="password" type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={set('password')} placeholder="Kamida 6 ta belgi" />
        </label>
        <div className="field">
          <span>Avatar tanlang</span>
          <div className="avatar-pick">
            {AVATARS.map((a) => (
              <button type="button" key={a} className={form.avatar === a ? 'sel' : ''} onClick={() => setForm({ ...form, avatar: a })} aria-label={a}>{a}</button>
            ))}
          </div>
        </div>
        <button className="btn mint block" disabled={busy}>{busy ? 'Saqlanmoqda...' : "Ro'yxatdan o'tish"}</button>
      </form>
      <p className="center" style={{ marginTop: 18 }}>
        Akkauntingiz bormi? <Link to="/login">Kirish</Link>
      </p>
    </AuthShell>
  );
}
