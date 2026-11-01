import { useState } from 'react';
import { api, useApi } from '../../api.js';
import { PageHead, Loading, Empty, Modal, StarsPick, toast } from '../../components/ui.jsx';
import { QUALITIES, prettyDate } from '../../constants.js';

// Har bir sifat uchun tayyor topshiriq g'oyalari
const TEMPLATES = {
  mustaqillik: ["Ertalabki tartibni o'zingiz bajaring", "Sumkangizni o'zingiz yig'ing"],
  masuliyat: ['Bir hafta gul parvarish qiling', "Uy vazifasini o'z vaqtida bajaring"],
  hamkorlik: ['Bugun kimgadir yordam bering', "Do'stingiz bilan birga rasm chizing"],
  ijodkorlik: ['Oilam haqida rasm chizing', "Kichik ertak o'ylab toping"],
  qiziquvchanlik: ['"Nega osmon ko\'k?" savoliga javob toping', 'Bitta hayvon haqida 3 ta qiziq fakt toping'],
};

const EMPTY = { title: '', description: '', quality: 'mustaqillik', stars: 2, due_date: '' };

export default function TeacherTasks() {
  const { data, error, reload } = useApi('/teacher/tasks');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [viewing, setViewing] = useState(null);

  if (!data) return <Loading error={error} />;

  const create = async (e) => {
    e.preventDefault();
    try {
      await api('/teacher/tasks', { method: 'POST', body: form });
      toast('📋 Topshiriq berildi!');
      setCreating(false);
      setForm(EMPTY);
      reload();
    } catch (err) {
      toast(err.message);
    }
  };

  const remove = async (t) => {
    if (!confirm(`"${t.title}" topshirig'ini o'chirasizmi?`)) return;
    await api(`/teacher/tasks/${t.id}`, { method: 'DELETE' });
    reload();
  };

  return (
    <>
      <PageHead title="📋 Topshiriqlar" sub="Shaxsiy sifatlarni rivojlantiruvchi vazifalar">
        <button className="btn coral" onClick={() => setCreating(true)}>➕ Yangi topshiriq</button>
      </PageHead>

      <div className="card">
        {!data.length && <Empty emoji="📭">Hali topshiriq yo'q. Birinchisini yarating!</Empty>}
        {data.map((t) => (
          <div key={t.id} className="list-item" style={{ flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2rem' }}>{QUALITIES[t.quality].emoji}</span>
            <div className="grow" style={{ minWidth: 200 }}>
              <b>{t.title}</b>
              {t.description && <div className="small muted">{t.description}</div>}
              <div className="row small" style={{ gap: 8, marginTop: 4 }}>
                <span className={`tag ${QUALITIES[t.quality].color}`}>{QUALITIES[t.quality].title}</span>
                <span>{'⭐'.repeat(t.stars)}</span>
                {t.due_date && <span className="muted">📅 {prettyDate(t.due_date)}</span>}
              </div>
            </div>
            <div className="center" style={{ minWidth: 90 }}>
              <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{t.done_count}/{t.student_count}</div>
              <span className="small muted">bajardi</span>
            </div>
            <button className="btn sm ghost" onClick={() => setViewing(t.id)}>
              Javoblar {t.to_review > 0 && <span className="tag coral">{t.to_review}</span>}
            </button>
            <button className="icon-btn" onClick={() => remove(t)} aria-label="O'chirish">🗑️</button>
          </div>
        ))}
      </div>

      {creating && (
        <Modal title="Yangi topshiriq" onClose={() => setCreating(false)}>
          <form onSubmit={create}>
            <label className="field">
              <span>Qaysi sifatni rivojlantiradi?</span>
              <select className="input" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })}>
                {Object.entries(QUALITIES).map(([k, q]) => <option key={k} value={k}>{q.emoji} {q.title}</option>)}
              </select>
            </label>
            <div className="row small" style={{ gap: 6, marginBottom: 12 }}>
              <span className="muted">G'oyalar:</span>
              {TEMPLATES[form.quality].map((i) => <button type="button" key={i} className="tag" style={{ border: 0, cursor: 'pointer' }} onClick={() => setForm({ ...form, title: i })}>{i}</button>)}
            </div>
            <label className="field">
              <span>Nomi</span>
              <input className="input" required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="field">
              <span>Tavsif <span className="muted small">(ixtiyoriy)</span></span>
              <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <div className="field">
                <span>Mukofot</span>
                <StarsPick value={form.stars} onChange={(stars) => setForm({ ...form, stars })} />
              </div>
              <label className="field" style={{ flex: 1, minWidth: 160 }}>
                <span>Muddat <span className="muted small">(ixtiyoriy)</span></span>
                <input className="input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </label>
            </div>
            <button className="btn coral block">📤 Sinfga yuborish</button>
          </form>
        </Modal>
      )}

      {viewing && <Submissions taskId={viewing} onClose={() => { setViewing(null); reload(); }} />}
    </>
  );
}

function Submissions({ taskId, onClose }) {
  const { data, reload } = useApi(`/teacher/tasks/${taskId}/submissions`);
  const [drafts, setDrafts] = useState({});

  const review = async (s) => {
    const d = drafts[s.id] || {};
    try {
      await api(`/teacher/submissions/${s.id}/review`, { method: 'POST', body: { feedback: d.feedback ?? s.feedback ?? '', stars: d.stars ?? s.stars_awarded } });
      toast('✍️ Baholandi');
      reload();
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <Modal title={data ? data.task.title : 'Javoblar'} onClose={onClose}>
      {!data ? <p>Yuklanmoqda...</p> : !data.submissions.length ? <Empty emoji="⏳">Hali hech kim bajarmagan</Empty> : data.submissions.map((s) => {
        const d = drafts[s.id] || {};
        return (
          <div key={s.id} className="list-item" style={{ display: 'block' }}>
            <div className="row between">
              <b>{s.avatar} {s.full_name}</b>
              {s.reviewed ? <span className="tag mint">✓ Baholangan</span> : <span className="tag coral">Yangi</span>}
            </div>
            {s.answer && <p style={{ margin: '6px 0' }}>«{s.answer}»</p>}
            <div className="row" style={{ gap: 8 }}>
              <StarsPick value={d.stars ?? s.stars_awarded} onChange={(stars) => setDrafts({ ...drafts, [s.id]: { ...d, stars } })} />
            </div>
            <div className="row" style={{ marginTop: 8, alignItems: 'stretch' }}>
              <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="Izoh: Barakalla!" value={d.feedback ?? s.feedback ?? ''} onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...d, feedback: e.target.value } })} />
              <button className="btn mint sm" onClick={() => review(s)}>Saqlash</button>
            </div>
          </div>
        );
      })}
    </Modal>
  );
}
