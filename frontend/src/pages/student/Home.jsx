import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, useApi } from '../../api.js';
import { useAuth } from '../../auth.jsx';
import { MoodPicker, Progress, Loading, Empty, toast } from '../../components/ui.jsx';
import { MoodWeek, RadarChart } from '../../components/charts.jsx';
import { MOODS, QUALITIES, greeting } from '../../constants.js';

export default function StudentHome() {
  const { user } = useAuth();
  const { data, error, reload, setData } = useApi('/student/dashboard');
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading error={error} />;

  const pickMood = async (mood) => {
    setBusy(true);
    const prev = data.today_mood;
    setData({ ...data, today_mood: { mood } }); // darhol ko'rsatamiz
    try {
      await api('/student/mood', { method: 'POST', body: { mood } });
      toast(`${MOODS[mood].emoji} Kayfiyatingiz saqlandi!`);
      reload();
    } catch (e) {
      setData({ ...data, today_mood: prev });
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ '--gap': '18px' }}>
      <div className="page-head">
        <div>
          <h1>{greeting()}, {user.full_name.split(' ')[0]}! {user.avatar}</h1>
          <p className="muted">Bugun ham yangi narsalarni o'rganamiz!</p>
        </div>
      </div>

      <div className="grid cols-3 stats">
        <div className="card tint-sun stat"><span className="ic">⭐</span><div><div className="big">{data.stars}</div><span className="muted">yulduz</span></div></div>
        <div className="card tint-coral stat"><span className="ic">🔥</span><div><div className="big">{data.streak}</div><span className="muted">kun ketma-ket</span></div></div>
        <div className="card tint-mint stat"><span className="ic">✅</span><div><div className="big">{data.done_count}</div><span className="muted">bajarilgan vazifa</span></div></div>
      </div>

      <div className="card tint-sky">
        <div className="card-head">
          <h2>{data.today_mood ? 'Bugungi kayfiyatingiz' : 'Bugun kayfiyatingiz qanday? 🌤'}</h2>
          {data.today_mood && <span className="tag sky">{MOODS[data.today_mood.mood].emoji} {MOODS[data.today_mood.mood].title}</span>}
        </div>
        <MoodPicker value={data.today_mood?.mood} onPick={pickMood} disabled={busy} />
        {data.today_mood?.mood <= 2 && (
          <p style={{ marginTop: 14, marginBottom: 0 }}>🤗 Xafa bo'lmang! Ustozingizga yoki ota-onangizga nima bo'lganini aytib bering — ular sizga yordam beradi.</p>
        )}
      </div>

      <Link to="/student/chat" className="card tint-mint chat-cta">
        <span className="e">🐼🐰🦊⛄</span>
        <div className="grow">
          <h3 style={{ margin: 0 }}>Qahramon bilan suhbat</h3>
          <span className="small muted">Sevimli qahramoningni tanla va u bilan gaplash!</span>
        </div>
        <span className="btn mint sm">Boshlash →</span>
      </Link>

      <div className="grid cols-2">
        <div className="card">
          <div className="card-head"><h3>📋 Vazifalarim</h3><Link to="/student/tasks" className="small">Hammasi →</Link></div>
          {data.pending_tasks.length ? (
            data.pending_tasks.map((t) => (
              <div key={t.id} className="list-item">
                <span style={{ fontSize: '1.6rem' }}>{QUALITIES[t.quality].emoji}</span>
                <div className="grow"><b>{t.title}</b><div className="small muted">{'⭐'.repeat(t.stars)}</div></div>
              </div>
            ))
          ) : (
            <Empty emoji="🎉">Hamma vazifalar bajarilgan!</Empty>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h3>📅 Shu haftam</h3><Link to="/student/mood" className="small">Kundalik →</Link></div>
          <MoodWeek moods={data.moods} />
        </div>

        <div className="card">
          <div className="card-head"><h3>🎯 Maqsadlarim</h3><Link to="/student/goals" className="small">Hammasi →</Link></div>
          {data.goals.length ? (
            data.goals.map((g) => (
              <div key={g.id} style={{ marginBottom: 14 }}>
                <div className="row between small" style={{ marginBottom: 4 }}>
                  <b>{QUALITIES[g.quality].emoji} {g.title}</b>
                  <span>{g.progress}%</span>
                </div>
                <Progress value={g.progress} />
              </div>
            ))
          ) : (
            <Empty emoji="🎯"><Link to="/student/goals">Birinchi maqsadingizni yozing</Link></Empty>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h3>🌟 Men qandayman?</h3><Link to="/student/me" className="small">{data.assessment ? 'Yangilash →' : 'Baholash →'}</Link></div>
          {data.assessment ? (
            <div className="center"><RadarChart scores={data.assessment.scores} size={280} /></div>
          ) : (
            <Empty emoji="🌟"><Link to="/student/me">O'zingizni baholab ko'ring</Link></Empty>
          )}
        </div>
      </div>

      {data.badges.length > 0 && (
        <div className="card tint-grape">
          <div className="card-head"><h3>🏆 Oxirgi nishonlarim</h3><Link to="/student/achievements" className="small">Hammasi →</Link></div>
          <div className="row" style={{ gap: 18 }}>
            {data.badges.map((b) => (
              <div key={b.id} className="center" title={b.message}>
                <div style={{ fontSize: '2.4rem' }}>{b.emoji}</div>
                <b className="small">{b.title}</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
