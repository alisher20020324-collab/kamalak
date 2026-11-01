import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, useApi } from '../../api.js';
import { Loading, Empty, Modal, Progress, toast } from '../../components/ui.jsx';
import { MoodCalendar, RadarChart } from '../../components/charts.jsx';
import { ChatCard } from '../../components/ChatCard.jsx';
import { BADGES, MOODS, QUALITIES, prettyDate } from '../../constants.js';

export default function TeacherStudent() {
  const { id } = useParams();
  const { data, error, reload } = useApi(`/teacher/students/${id}`);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [badge, setBadge] = useState({ badge: 'yulduz', message: '' });
  const [note, setNote] = useState('');

  if (!data) return <Loading error={error} />;
  const { student: s, moods, assessments, goals, tasks, badges, notes, chats } = data;
  const avg = moods.length ? (moods.reduce((a, m) => a + m.mood, 0) / moods.length).toFixed(1) : '—';
  const doneTasks = tasks.filter((t) => t.done).length;

  const giveBadge = async () => {
    try {
      await api(`/teacher/students/${id}/badges`, { method: 'POST', body: badge });
      toast(`${BADGES[badge.badge].emoji} Nishon berildi!`);
      setBadgeOpen(false);
      setBadge({ badge: 'yulduz', message: '' });
      reload();
    } catch (e) {
      toast(e.message);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    try {
      await api(`/teacher/students/${id}/notes`, { method: 'POST', body: { text: note } });
      setNote('');
      reload();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <>
      <Link to="/teacher" className="small">← Sinfga qaytish</Link>
      <div className="card" style={{ margin: '12px 0 18px' }}>
        <div className="row" style={{ gap: 18 }}>
          <span className="avatar lg">{s.avatar}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ marginBottom: 2 }}>{s.full_name}</h1>
            <span className="muted">@{s.login} {s.telegram_linked && '· 🤖 Telegramga ulangan'}</span>
          </div>
          <button className="btn sun" onClick={() => setBadgeOpen(true)}>🏅 Nishon berish</button>
        </div>
        <div className="grid cols-4" style={{ marginTop: 18 }}>
          <div className="stat"><span className="ic" style={{ background: '#fff6d9' }}>⭐</span><div><div className="big">{data.stars}</div><span className="small muted">yulduz</span></div></div>
          <div className="stat"><span className="ic" style={{ background: '#ffeaea' }}>🔥</span><div><div className="big">{data.streak}</div><span className="small muted">kun ketma-ket</span></div></div>
          <div className="stat"><span className="ic" style={{ background: '#e6f8fd' }}>😊</span><div><div className="big">{avg}</div><span className="small muted">o'rtacha kayfiyat (30 kun)</span></div></div>
          <div className="stat"><span className="ic" style={{ background: '#e2f8f5' }}>✅</span><div><div className="big">{doneTasks}/{tasks.length}</div><span className="small muted">vazifa</span></div></div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>😊 Kayfiyat (4 hafta)</h3>
          <MoodCalendar moods={moods} />
          {moods.filter((m) => m.note).slice(-3).reverse().map((m) => (
            <p key={m.day} className="small" style={{ margin: '10px 0 0' }}>{MOODS[m.mood].emoji} <span className="muted">{prettyDate(m.day)}:</span> {m.note}</p>
          ))}
        </div>

        <div className="card center">
          <h3>🌟 O'zini baholashi</h3>
          {assessments.length ? (
            <>
              <RadarChart scores={assessments[0].scores} compare={assessments[1]?.scores} />
              <p className="small muted">
                <span style={{ color: '#1fa8d4', fontWeight: 900 }}>━ {prettyDate(assessments[0].day)}</span>
                {assessments[1] && <> · <span style={{ color: '#9b5de5', fontWeight: 900 }}>┅ {prettyDate(assessments[1].day)}</span></>}
              </p>
            </>
          ) : (
            <Empty emoji="🌟">Hali o'zini baholamagan</Empty>
          )}
        </div>

        <div className="card">
          <h3>🎯 Maqsadlari</h3>
          {goals.length ? goals.map((g) => (
            <div key={g.id} style={{ marginBottom: 12 }}>
              <div className="row between small"><b>{QUALITIES[g.quality].emoji} {g.title}</b><span>{g.progress}%</span></div>
              <Progress value={g.progress} />
            </div>
          )) : <Empty emoji="🎯">Maqsad qo'ymagan</Empty>}
        </div>

        <div className="card">
          <h3>📋 Vazifalar</h3>
          {tasks.length ? tasks.map((t) => (
            <div key={t.id} className={`list-item ${t.done ? 'done' : ''}`}>
              <span>{t.done ? '✅' : '⏳'}</span>
              <div className="grow"><b className="small">{t.title}</b>{t.answer && <div className="small muted">«{t.answer}»</div>}</div>
              {t.done && <span className="tag sun">+{t.stars_awarded}⭐</span>}
            </div>
          )) : <Empty emoji="📋">Vazifa berilmagan</Empty>}
        </div>

        <div className="card">
          <h3>🏅 Nishonlari</h3>
          {badges.length ? (
            <div className="row" style={{ gap: 14 }}>
              {badges.map((b) => <span key={b.id} title={`${b.title}${b.message ? ': ' + b.message : ''}`} style={{ fontSize: '2rem' }}>{b.emoji}</span>)}
            </div>
          ) : <Empty emoji="🏅">Hali nishon yo'q</Empty>}
        </div>

        <div className="card">
          <h3>💬 Qahramonlar bilan suhbatlari</h3>
          {chats.length ? chats.map((c) => <ChatCard key={c.id} chat={c} showStudent={false} />) : <Empty emoji="💬">Hali suhbatlashmagan</Empty>}
        </div>

        <div className="card tint-grape">
          <h3>🔒 Kuzatuv qaydlarim</h3>
          <p className="small muted">Faqat siz ko'rasiz. Bolaning xulq-atvori, yutuqlari va qiyinchiliklarini yozib boring.</p>
          <form onSubmit={addNote} className="row" style={{ alignItems: 'stretch', marginBottom: 12 }}>
            <input className="input" style={{ flex: 1, minWidth: 180 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yangi qayd..." required />
            <button className="btn grape">Qo'shish</button>
          </form>
          {notes.map((n) => (
            <div key={n.id} className="list-item"><div className="grow"><div className="small muted">{prettyDate(n.created_at)}</div>{n.text}</div></div>
          ))}
        </div>
      </div>

      {badgeOpen && (
        <Modal title={`${s.full_name}ga nishon`} onClose={() => setBadgeOpen(false)}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
            {Object.entries(BADGES).map(([k, b]) => (
              <button key={k} type="button" className={`mood-btn ${badge.badge === k ? 'sel' : ''}`} onClick={() => setBadge({ ...badge, badge: k })}>
                <span className="e">{b.emoji}</span>{b.title}
              </button>
            ))}
          </div>
          <label className="field">
            <span>Maqtov so'zi</span>
            <textarea className="input" value={badge.message} onChange={(e) => setBadge({ ...badge, message: e.target.value })} placeholder="Masalan: Bugun do'stingga yordam berding, barakalla!" />
          </label>
          <button className="btn sun block" onClick={giveBadge}>🎉 Berish</button>
        </Modal>
      )}
    </>
  );
}
