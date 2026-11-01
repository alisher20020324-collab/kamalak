import { useState } from 'react';
import { api, useApi } from '../../api.js';
import { PageHead, Loading, Empty, Progress, toast } from '../../components/ui.jsx';
import { QUALITIES } from '../../constants.js';

const IDEAS = ["Har kuni 10 bet kitob o'qiyman", "O'yinchoqlarimni o'zim yig'ishtiraman", "Do'stimga yordam beraman", "Yangi she'r yod olaman", "Ertalab o'zim turaman"];

export default function StudentGoals() {
  const { data, error, reload, setData } = useApi('/student/goals');
  const [form, setForm] = useState({ title: '', quality: 'mustaqillik' });
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading error={error} />;

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/student/goals', { method: 'POST', body: form });
      setForm({ ...form, title: '' });
      toast('🎯 Maqsad qo\'shildi!');
      reload();
    } catch (err) {
      toast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setProgress = async (g, progress) => {
    setData(data.map((x) => (x.id === g.id ? { ...x, progress } : x)));
    await api(`/student/goals/${g.id}`, { method: 'PATCH', body: { progress } }).catch((e) => toast(e.message));
    if (progress === 100) toast('🏆 Ofarin! Maqsadga erishdingiz!');
  };

  const remove = async (g) => {
    if (!confirm(`"${g.title}" maqsadini o'chirasizmi?`)) return;
    setData(data.filter((x) => x.id !== g.id));
    await api(`/student/goals/${g.id}`, { method: 'DELETE' });
  };

  return (
    <>
      <PageHead title="🎯 Maqsadlarim" sub="Kichik qadamlar — katta yutuqlar!" />
      <form className="card tint-mint" onSubmit={add} style={{ marginBottom: 18 }}>
        <h2>Yangi maqsad</h2>
        <div className="row" style={{ alignItems: 'stretch' }}>
          <input className="input" style={{ flex: 2, minWidth: 220 }} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Men ... qilaman" maxLength={120} required />
          <select className="input" style={{ flex: 1, minWidth: 160 }} value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
            {Object.entries(QUALITIES).map(([k, q]) => <option key={k} value={k}>{q.emoji} {q.title}</option>)}
          </select>
          <button className="btn mint" disabled={busy}>➕ Qo'shish</button>
        </div>
        <div className="row small" style={{ marginTop: 12, gap: 8 }}>
          <span className="muted">G'oyalar:</span>
          {IDEAS.map((i) => <button type="button" key={i} className="tag" style={{ border: 0, cursor: 'pointer' }} onClick={() => setForm({ ...form, title: i })}>{i}</button>)}
        </div>
      </form>

      <div className="card">
        {!data.length && <Empty emoji="🌱">Hali maqsad yo'q. Birinchisini yozing!</Empty>}
        {data.map((g) => (
          <div key={g.id} className={`list-item ${g.progress === 100 ? 'done' : ''}`} style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>{g.progress === 100 ? '🏆' : QUALITIES[g.quality].emoji}</span>
            <div className="grow" style={{ minWidth: 200 }}>
              <div className="row between"><b>{g.title}</b><b>{g.progress}%</b></div>
              <Progress value={g.progress} />
              <input type="range" min="0" max="100" step="10" value={g.progress} onChange={(e) => setData(data.map((x) => (x.id === g.id ? { ...x, progress: Number(e.target.value) } : x)))} onMouseUp={(e) => setProgress(g, Number(e.target.value))} onTouchEnd={(e) => setProgress(g, Number(e.target.value))} onKeyUp={(e) => setProgress(g, Number(e.target.value))} aria-label="Bajarilish foizi" />
            </div>
            <button className="icon-btn" onClick={() => remove(g)} aria-label="O'chirish">🗑️</button>
          </div>
        ))}
      </div>
    </>
  );
}
