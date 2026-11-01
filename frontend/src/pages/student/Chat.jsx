import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useApi } from '../../api.js';
import { MoodPicker, PageHead, Loading, toast } from '../../components/ui.jsx';
import { HeroPic } from '../../components/ChatCard.jsx';
import { MOODS } from '../../constants.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function StudentChat() {
  const { data, error, reload } = useApi('/student/heroes');
  const [stage, setStage] = useState(null); // 'mood' | 'heroes' | 'chat'
  const [chat, setChat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  if (!data) return <Loading error={error} />;
  const current = stage ?? (data.today_mood ? 'heroes' : 'mood');

  const push = (from, t) => setMsgs((m) => [...m, { from, text: t }]);
  // Qahramon "yozayotgandek" bir oz kutib javob beradi
  const heroSays = async (...lines) => {
    for (const l of lines.filter(Boolean)) {
      setTyping(true);
      await wait(650);
      setTyping(false);
      push('hero', l);
    }
  };

  const pickMood = async (mood) => {
    try {
      await api('/student/mood', { method: 'POST', body: { mood } });
      toast(`${MOODS[mood].emoji} Saqlandi!`);
      await reload();
      setStage('heroes');
    } catch (e) {
      toast(e.message);
    }
  };

  const start = async (hero) => {
    try {
      const c = await api('/student/chats', { method: 'POST', body: { hero: hero.id } });
      setChat(c);
      setMsgs([]);
      setStage('chat');
      await heroSays(c.hello, c.question);
    } catch (e) {
      toast(e.message);
    }
  };

  const answer = async (value) => {
    if (typing || chat.done) return;
    push('me', value || "⏭ O'tkazib yubordim");
    setText('');
    try {
      const r = await api(`/student/chats/${chat.id}/answer`, { method: 'POST', body: { answer: value } });
      setChat({ ...chat, step: r.step, done: r.done });
      await heroSays(r.reply, r.question, r.bye);
    } catch (e) {
      toast(e.message);
    }
  };

  const finish = async () => {
    if (typing) return;
    try {
      const r = await api(`/student/chats/${chat.id}/finish`, { method: 'POST' });
      setChat({ ...chat, done: true });
      await heroSays(r.bye);
    } catch (e) {
      toast(e.message);
    }
  };

  if (current === 'mood') {
    return (
      <>
        <PageHead title="💬 Qahramon bilan suhbat" sub="Avval ayt-chi, bugun o'zingni qanday his qilyapsan?" />
        <div className="card tint-sun">
          <h2>Bugun o'zimni...</h2>
          <MoodPicker value={data.today_mood?.mood} onPick={pickMood} />
        </div>
      </>
    );
  }

  if (current === 'heroes') {
    const m = data.today_mood && MOODS[data.today_mood.mood];
    return (
      <>
        <PageHead title="💬 Qahramonni tanla" sub="Kim bilan gaplashmoqchisan? U senga qiziq savollar beradi">
          {m && (
            <button className="btn ghost sm" onClick={() => setStage('mood')}>{m.emoji} {m.title} · o'zgartirish</button>
          )}
        </PageHead>
        <div className="hero-grid">
          {data.heroes.map((h) => (
            <button key={h.id} className="hero-card" onClick={() => start(h)}>
              <HeroPic hero={h} size="fill" />
              <b>{h.name}</b>
              <span className="small muted">{h.trait}</span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const hero = chat.hero;
  return (
    <div className="chat-box card">
      <div className="chat-head">
        <HeroPic hero={hero} size={52} />
        <div className="grow">
          <b>{hero.name}</b>
          <div className="small muted">{chat.done ? 'Suhbat tugadi' : `Savol ${Math.min(chat.step + 1, chat.total)} / ${chat.total}`}</div>
        </div>
        {!chat.done && <button className="btn ghost sm" onClick={finish}>🛑 Tugatish</button>}
      </div>
      <div className="progress" style={{ height: 8 }}><div style={{ width: `${(chat.step / chat.total) * 100}%` }} /></div>

      <div className="chat-log" ref={logRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
        ))}
        {typing && <div className="bubble hero typing"><span /><span /><span /></div>}
      </div>

      {chat.done ? (
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn sun" onClick={() => { setChat(null); setStage('heroes'); }}>💬 Boshqa qahramon</button>
          <Link to="/student" className="btn ghost">🏠 Bosh sahifa</Link>
        </div>
      ) : (
        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); if (text.trim()) answer(text.trim()); }}>
          <textarea
            className="input"
            rows={2}
            maxLength={500}
            value={text}
            placeholder="Javobingni shu yerga yoz..."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (text.trim()) answer(text.trim()); } }}
          />
          <div className="row" style={{ gap: 8 }}>
            <button className="btn mint" disabled={typing || !text.trim()}>📨 Yuborish</button>
            <button type="button" className="btn ghost" disabled={typing} onClick={() => answer('')}>⏭ O'tkazib yuborish</button>
          </div>
        </form>
      )}
      <p className="small muted center" style={{ margin: 0 }}>🔒 Javoblaringni faqat ustozing ko'radi</p>
    </div>
  );
}
