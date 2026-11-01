import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useApi } from '../../api.js';
import { PageHead, Loading, Empty, toast } from '../../components/ui.jsx';
import { MOODS } from '../../constants.js';

export default function TeacherClass() {
  const { data, error } = useApi('/teacher/class');
  const [query, setQuery] = useState('');
  if (!data) return <Loading error={error} />;

  const { class: cls, students } = data;
  const checked = students.filter((s) => s.today_mood).length;
  const sad = students.filter((s) => s.today_mood && s.today_mood <= 2);
  const shown = students.filter((s) => s.full_name.toLowerCase().includes(query.toLowerCase()));

  const copy = () => {
    navigator.clipboard?.writeText(cls.code).then(() => toast('📋 Kod nusxalandi'), () => {});
  };

  return (
    <>
      <PageHead title={`👩‍🏫 ${cls.name} sinfi`} sub={`${students.length} nafar o'quvchi`}>
        <span className="muted small">Sinf kodi:</span>
        <button className="code-box" onClick={copy} title="Nusxalash" style={{ cursor: 'pointer' }}>{cls.code}</button>
      </PageHead>

      <div className="grid cols-3 stats" style={{ marginBottom: 18 }}>
        <div className="card tint-sky stat"><span className="ic">📝</span><div><div className="big">{checked}/{students.length}</div><span className="muted">bugun kayfiyat belgiladi</span></div></div>
        <div className={`card stat ${sad.length ? 'tint-coral' : 'tint-mint'}`}>
          <span className="ic">{sad.length ? '⚠️' : '💚'}</span>
          <div><div className="big">{sad.length}</div><span className="muted">kayfiyati past o'quvchi</span></div>
        </div>
        <div className="card tint-sun stat"><span className="ic">⭐</span><div><div className="big">{students.reduce((a, s) => a + s.stars, 0)}</div><span className="muted">sinf yulduzlari</span></div></div>
      </div>

      {sad.length > 0 && (
        <div className="card tint-coral" style={{ marginBottom: 18 }}>
          <b>⚠️ Bugun e'tibor bering: </b>
          {sad.map((s, i) => (
            <span key={s.id}>{i > 0 && ', '}<Link to={`/teacher/students/${s.id}`}>{s.avatar} {s.full_name} {MOODS[s.today_mood].emoji}</Link></span>
          ))}
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>O'quvchilar</h2>
          {students.length > 6 && <input className="input" style={{ maxWidth: 240 }} placeholder="🔍 Qidirish" value={query} onChange={(e) => setQuery(e.target.value)} />}
        </div>
        {!students.length ? (
          <Empty emoji="🧒">
            Hali o'quvchi yo'q. O'quvchilarga <b>{cls.code}</b> kodini bering — ular ro'yxatdan o'tishda shu kodni kiritadi.
          </Empty>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {shown.map((s) => (
              <Link key={s.id} to={`/teacher/students/${s.id}`} className={`kid-card ${s.today_mood && s.today_mood <= 2 ? 'alert' : ''}`}>
                <span className="mood-dot" title={s.today_mood ? MOODS[s.today_mood].title : 'Bugun belgilamagan'}>
                  {s.today_mood ? MOODS[s.today_mood].emoji : <span className="no-mood" />}
                </span>
                <span className="avatar lg">{s.avatar}</span>
                <b>{s.full_name}</b>
                <div className="row small" style={{ gap: 8, justifyContent: 'center' }}>
                  <span>⭐ {s.stars}</span>
                  <span>🏅 {s.badges}</span>
                  {s.telegram_linked && <span title="Telegram botga ulangan">🤖</span>}
                </div>
                {s.week_mood && <span className="small muted">Hafta o'rtachasi: {s.week_mood}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
