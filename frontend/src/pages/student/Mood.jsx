import { useState } from 'react';
import { api, useApi } from '../../api.js';
import { MoodPicker, PageHead, Loading, toast } from '../../components/ui.jsx';
import { MoodCalendar } from '../../components/charts.jsx';
import { MOODS, today, prettyDate } from '../../constants.js';

const PROMPTS = ['Bugun nima sizni xursand qildi?', "Kim bilan o'ynadingiz?", "Bugun nimani yangi o'rgandingiz?", 'Sizni nima xafa qildi?'];

export default function StudentMood() {
  const { data, error, reload } = useApi('/student/moods?days=28');
  const todayEntry = data?.find((m) => m.day === today());
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading error={error} />;

  const curMood = mood ?? todayEntry?.mood;
  const curNote = note ?? todayEntry?.note ?? '';

  const save = async () => {
    if (!curMood) return toast('Avval kayfiyatni tanlang 🙂');
    setBusy(true);
    try {
      await api('/student/mood', { method: 'POST', body: { mood: curMood, note: curNote } });
      toast(`${MOODS[curMood].emoji} Saqlandi!`);
      setMood(null);
      setNote(null);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  const counts = [5, 4, 3, 2, 1].map((k) => [k, data.filter((m) => m.mood === k).length]);
  const recent = [...data].reverse().filter((m) => m.note).slice(0, 6);

  return (
    <>
      <PageHead title="😊 Kayfiyat kundaligi" sub="His-tuyg'ularingizni tanish — o'zingizni tanishning birinchi qadami" />
      <div className="grid cols-2">
        <div className="card tint-sun">
          <h2>Bugun o'zimni...</h2>
          <MoodPicker value={curMood} onPick={setMood} />
          <label className="field" style={{ marginTop: 16 }}>
            <span>{PROMPTS[new Date().getDate() % PROMPTS.length]} <span className="muted small">(ixtiyoriy)</span></span>
            <textarea className="input" value={curNote} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="Shu yerga yozing..." />
          </label>
          <button className="btn sun block" onClick={save} disabled={busy}>💾 Saqlash</button>
        </div>

        <div className="card">
          <h2>Oxirgi 4 hafta</h2>
          <MoodCalendar moods={data} />
          <div className="row" style={{ marginTop: 16, gap: 16 }}>
            {counts.map(([k, n]) => (
              <span key={k} className="row" style={{ gap: 4 }}><span style={{ fontSize: '1.3rem' }}>{MOODS[k].emoji}</span><b>{n}</b></span>
            ))}
          </div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <h2>📝 Yozganlarim</h2>
          {recent.map((m) => (
            <div key={m.day} className="list-item">
              <span style={{ fontSize: '1.8rem' }}>{MOODS[m.mood].emoji}</span>
              <div className="grow"><div className="small muted">{prettyDate(m.day)}</div>{m.note}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
