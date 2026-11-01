import { useState } from 'react';
import { api, useApi } from '../../api.js';
import { PageHead, Loading, Empty, Modal, toast } from '../../components/ui.jsx';
import { QUALITIES, prettyDate } from '../../constants.js';

export default function StudentTasks() {
  const { data, error, reload } = useApi('/student/tasks');
  const [open, setOpen] = useState(null);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading error={error} />;
  const pending = data.filter((t) => !t.done);
  const done = data.filter((t) => t.done);

  const complete = async () => {
    setBusy(true);
    try {
      await api(`/student/tasks/${open.id}/complete`, { method: 'POST', body: { answer } });
      toast(`🎉 Barakalla! +${open.stars} ⭐`);
      setOpen(null);
      setAnswer('');
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title="📋 Vazifalarim" sub={`${done.length} / ${data.length} ta bajarildi`} />
      {!data.length && <div className="card"><Empty emoji="🌴">Hozircha vazifa yo'q. Ustozingiz tez orada beradi!</Empty></div>}

      {pending.length > 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h2>Bajarilishi kerak</h2>
          {pending.map((t) => (
            <div key={t.id} className="list-item">
              <span style={{ fontSize: '2rem' }}>{QUALITIES[t.quality].emoji}</span>
              <div className="grow">
                <b>{t.title}</b>
                {t.description && <div className="small muted">{t.description}</div>}
                <div className="row small" style={{ gap: 8, marginTop: 4 }}>
                  <span className={`tag ${QUALITIES[t.quality].color}`}>{QUALITIES[t.quality].title}</span>
                  <span>{'⭐'.repeat(t.stars)}</span>
                  {t.due_date && <span className="muted">📅 {prettyDate(t.due_date)}</span>}
                </div>
              </div>
              <button className="btn mint sm" onClick={() => setOpen(t)}>✅ Bajardim</button>
            </div>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="card">
          <h2>Bajarilganlar 🎉</h2>
          {done.map((t) => (
            <div key={t.id} className="list-item done">
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div className="grow">
                <b>{t.title}</b>
                {t.answer && <div className="small muted">Mening javobim: {t.answer}</div>}
                {t.reviewed ? (
                  <div className="small" style={{ marginTop: 4 }}>👩‍🏫 Ustoz: {t.feedback || 'Tekshirildi'} {'⭐'.repeat(t.stars_awarded)}</div>
                ) : (
                  <div className="small muted">⏳ Ustoz tekshirmoqda</div>
                )}
              </div>
              <span className="tag sun">+{t.stars_awarded} ⭐</span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal title={open.title} onClose={() => setOpen(null)}>
          {open.description && <p>{open.description}</p>}
          <label className="field">
            <span>Qanday bajardingiz? Qisqacha yozing</span>
            <textarea className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Masalan: Onamga idish yuvishda yordam berdim" autoFocus />
          </label>
          <button className="btn mint block" onClick={complete} disabled={busy}>Topshirish (+{open.stars} ⭐)</button>
        </Modal>
      )}
    </>
  );
}
