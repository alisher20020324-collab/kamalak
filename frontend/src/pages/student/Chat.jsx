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
  const [recording, setRecording] = useState(false);
  const recRef = useRef(null);
  const audioRef = useRef(null);
  const voices = useRef(new Map()); // matn -> ovoz (object URL), qayta so'ramaslik uchun

  // Qahramon ovozi: matnni uning ovozida o'qiydi. Ovoz bo'lmasa yoki brauzer bloklasa — jim
  const voiceOf = (heroId, text) => {
    const key = `${heroId}:${text}`;
    if (!voices.current.has(key)) {
      voices.current.set(key, api('/student/tts', { method: 'POST', body: { hero: heroId, text }, as: 'blob' })
        .then((b) => (b ? URL.createObjectURL(b) : null))
        .catch(() => null));
    }
    return voices.current.get(key);
  };
  const stopAudio = () => audioRef.current?.pause();
  const play = async (url) => {
    if (!url) return;
    stopAudio();
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
  };
  useEffect(() => () => { stopAudio(); recRef.current?.state === 'recording' && recRef.current.stop(); }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  if (!data) return <Loading error={error} />;
  const current = stage ?? (data.today_mood ? 'heroes' : 'mood');

  const push = (from, t) => setMsgs((m) => [...m, { from, text: t }]);
  // Qahramon "yozayotgandek" bir oz kutib javob beradi
  const heroSays = async (heroId, ...lines) => {
    lines = lines.filter(Boolean);
    const audio = lines.length ? voiceOf(heroId, lines.join(' ')) : null; // ovoz parallel tayyorlanadi
    for (const l of lines) {
      setTyping(true);
      await wait(650);
      setTyping(false);
      push('hero', l);
    }
    play(await audio);
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
      await heroSays(c.hero.id, c.hello, c.question);
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
      await heroSays(chat.hero.id, r.reply, r.question, r.bye);
    } catch (e) {
      toast(e.message);
    }
  };

  // ----- Ovozli javob: bosib gapiradi, yana bosganda yuboriladi -----
  const sendVoice = async (blob) => {
    setMsgs((m) => [...m, { from: 'me', text: '🎤 ...', pending: true }]);
    setTyping(true);
    try {
      const r = await api(`/student/chats/${chat.id}/voice`, { method: 'POST', raw: blob });
      setMsgs((m) => m.map((x) => (x.pending ? { from: 'me', text: `🎤 «${r.heard}»` } : x)));
      setTyping(false);
      setChat((c) => ({ ...c, step: r.step, done: r.done }));
      await heroSays(chat.hero.id, r.reply, r.question, r.bye);
    } catch (e) {
      setMsgs((m) => m.filter((x) => !x.pending));
      setTyping(false);
      toast(e.message);
    }
  };

  const startRec = async () => {
    if (typing || chat.done) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return toast("Bu brauzerda ovoz yozib bo'lmaydi 🙈");
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return toast('🎤 Mikrofonga ruxsat bering');
    }
    stopAudio();
    const rec = new MediaRecorder(stream);
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
      if (blob.size > 2000) sendVoice(blob);
      else toast("Ovoz juda qisqa — tugmani bosib, gapirib, keyin yana bos");
    };
    rec.start();
    recRef.current = rec;
    setRecording(true);
    setTimeout(() => rec.state === 'recording' && rec.stop(), 60_000); // ko'pi bilan 1 daqiqa
  };
  const stopRec = () => recRef.current?.state === 'recording' && recRef.current.stop();

  const finish = async () => {
    if (typing) return;
    try {
      const r = await api(`/student/chats/${chat.id}/finish`, { method: 'POST' });
      setChat({ ...chat, done: true });
      await heroSays(chat.hero.id, r.bye);
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
          m.from === 'hero' ? (
            <div key={i} className="bubble-row">
              <div className="bubble hero">{m.text}</div>
              <button
                type="button"
                className="say-btn"
                title="O'qib berish"
                aria-label="O'qib berish"
                onClick={async () => {
                  const url = await voiceOf(hero.id, m.text);
                  url ? play(url) : toast('🔇 Ovoz hozircha ishlamayapti');
                }}
              >
                🔊
              </button>
            </div>
          ) : (
            <div key={i} className={`bubble ${m.from}`}>{m.text}</div>
          )
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
            placeholder="...yoki javobingni shu yerga yoz"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (text.trim()) answer(text.trim()); } }}
          />
          <button
            type="button"
            className={`btn mic ${recording ? 'coral rec' : 'grape'}`}
            disabled={typing && !recording}
            onClick={recording ? stopRec : startRec}
          >
            {recording ? '⏹ Tugatdim — yuborish' : '🎤 Gapirib javob berish'}
          </button>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn mint" disabled={typing || recording || !text.trim()}>📨 Yuborish</button>
            <button type="button" className="btn ghost" disabled={typing} onClick={() => answer('')}>⏭ O'tkazib yuborish</button>
          </div>
        </form>
      )}
    </div>
  );
}
