import { useState } from 'react';
import { api, useApi } from '../api.js';
import { useAuth } from '../auth.jsx';
import { PageHead, toast } from '../components/ui.jsx';
import { AVATARS } from '../constants.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { data: meta } = useApi('/meta');
  const [form, setForm] = useState({ full_name: user.full_name, avatar: user.avatar });
  const bot = meta?.bot_username;

  const save = async (e) => {
    e.preventDefault();
    try {
      const d = await api('/me', { method: 'PATCH', body: form });
      setUser(d.user);
      toast('💾 Saqlandi');
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <PageHead title="👤 Profilim" />
      <div className="grid cols-2">
        <form className="card" onSubmit={save}>
          <div className="row" style={{ marginBottom: 16 }}>
            <span className="avatar lg">{form.avatar}</span>
            <div>
              <b>@{user.login}</b>
              <div className="muted small">{user.role === 'teacher' ? "O'qituvchi" : "O'quvchi"} · {user.class?.name}</div>
            </div>
          </div>
          <label className="field">
            <span>Ism va familiya</span>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </label>
          <div className="field">
            <span>Avatar</span>
            <div className="avatar-pick">
              {AVATARS.map((a) => (
                <button type="button" key={a} className={form.avatar === a ? 'sel' : ''} onClick={() => setForm({ ...form, avatar: a })}>{a}</button>
              ))}
            </div>
          </div>
          <button className="btn mint">💾 Saqlash</button>
        </form>

        <div className="card tint-sky">
          <h2>🤖 Telegram bot</h2>
          <p>Botga saytdagi <b>login</b> va <b>parolingiz</b> bilan kirasiz. Bir marta kirsangiz, keyingi safar so'ramaydi.</p>
          <ol style={{ paddingLeft: 20 }}>
            <li>Botni oching va <b>/start</b> bosing</li>
            <li>Loginingizni yozing: <code>{user.login}</code></li>
            <li>Parolingizni yozing</li>
          </ol>
          {user.role === 'teacher' ? (
            <p className="small">Botda: sinf ro'yxati, bugungi holat, topshiriqlar. Kayfiyati past o'quvchi bo'lsa, sizga darhol xabar keladi.</p>
          ) : (
            <p className="small">Botda: kayfiyat belgilash, vazifalarni bajarish, yutuqlar. Ustoz nishon bersa — xabar keladi!</p>
          )}
          <p>
            Holat: {user.telegram_linked ? <span className="tag mint">✓ Ulangan</span> : <span className="tag">Ulanmagan</span>}
          </p>
          {bot && <a className="btn" href={`https://t.me/${bot}`} target="_blank" rel="noreferrer">✈️ @{bot} botini ochish</a>}
        </div>
      </div>
    </>
  );
}
