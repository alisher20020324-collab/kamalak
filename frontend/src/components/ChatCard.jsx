import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { toast } from './ui.jsx';
import { MOODS, prettyDate } from '../constants.js';

// Qahramon rasmi; rasm yuklanmasa emoji ko'rsatiladi
export function HeroPic({ hero, size = 56 }) {
  const style = size === 'fill' ? { width: '100%', aspectRatio: '1', fontSize: '4rem' } : { width: size, height: size, fontSize: size * 0.55 };
  return (
    <span className={`hero-pic bg-${hero.color}`} style={style}>
      <span aria-hidden="true">{hero.emoji}</span>
      <img src={hero.image} alt={hero.name} loading="lazy" onError={(e) => e.currentTarget.remove()} />
    </span>
  );
}

// Bolaning asl ovozli javobini eshitish
function VoicePlay({ id }) {
  const [busy, setBusy] = useState(false);
  const play = async () => {
    setBusy(true);
    try {
      const blob = await api(`/teacher/voices/${id}`, { as: 'blob' });
      if (blob) new Audio(URL.createObjectURL(blob)).play().catch(() => toast("Ovozni ijro etib bo'lmadi"));
    } catch (e) {
      toast(e.message);
    }
    setBusy(false);
  };
  return <button className="btn ghost sm" disabled={busy} onClick={play}>▶️ Ovozini eshitish</button>;
}

// O'qituvchi uchun: bitta suhbat va bolaning javoblari
export function ChatCard({ chat, showStudent = true }) {
  return (
    <div className={`list-item chat-card ${chat.flagged ? 'flagged' : ''}`}>
      <div className="row" style={{ gap: 10 }}>
        <HeroPic hero={chat.hero} size={44} />
        <div className="grow">
          {showStudent && (
            <Link to={`/teacher/students/${chat.student_id}`}>{chat.avatar} {chat.full_name}</Link>
          )}
          <div className="small muted">
            {chat.hero.name} bilan · {prettyDate(chat.day)} · kayfiyat {MOODS[chat.mood]?.emoji || '—'}
          </div>
        </div>
        {chat.flagged && <span className="tag coral">🔴 Xavotirli</span>}
        {!chat.finished && <span className="tag">⏸ Tugallanmagan</span>}
      </div>
      <details open={chat.flagged}>
        <summary className="small">Javoblar ({chat.answers.length})</summary>
        {chat.answers.map((a, i) => (
          <div key={i} className={`qa ${a.flagged ? 'flagged' : ''}`}>
            <div className="small muted">{a.ai ? <span title="AI tuzgan savol">🤖</span> : '❓'} {a.question}</div>
            <div>{a.answer ? `${a.voice_id ? '🎤' : '💬'} ${a.answer}` : <i className="muted">javob bermadi</i>}</div>
            {a.voice_id && <VoicePlay id={a.voice_id} />}
          </div>
        ))}
      </details>
    </div>
  );
}
