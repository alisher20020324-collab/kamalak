import { useState } from 'react';
import { api, useApi } from '../../api.js';
import { PageHead, Loading, toast } from '../../components/ui.jsx';
import { RadarChart } from '../../components/charts.jsx';
import { QUALITIES, prettyDate } from '../../constants.js';

const LEVELS = ['🌱', '🌿', '🌳', '🌲', '🏔️'];
const LEVEL_TEXT = ['Hali qiyin', "Ba'zan", "Ko'pincha", 'Deyarli doim', 'Doim!'];

export default function StudentMe() {
  const { data, error, reload } = useApi('/student/assessments');
  const [scores, setScores] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!data) return <Loading error={error} />;
  const latest = data[0];
  const previous = data[1];
  const cur = scores || latest?.scores || {};
  const complete = Object.keys(QUALITIES).every((k) => cur[k]);

  const save = async () => {
    setBusy(true);
    try {
      await api('/student/assessments', { method: 'POST', body: { scores: cur } });
      toast('🌟 Saqlandi! Siz zo\'rsiz!');
      setScores(null);
      reload();
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title="🌟 Men qandayman?" sub="Har bir sifat bo'yicha o'zingizni halol baholang. Bu yerda xato javob yo'q!" />
      <div className="grid cols-2">
        <div className="card">
          {Object.entries(QUALITIES).map(([k, q]) => (
            <div key={k} style={{ marginBottom: 18 }}>
              <div className="row" style={{ gap: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>{q.emoji}</span>
                <div>
                  <b>{q.title}</b>
                  <div className="small muted">{q.hint}</div>
                </div>
              </div>
              <div className="row" style={{ gap: 6, marginTop: 8 }}>
                {LEVELS.map((e, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`mood-btn ${cur[k] === i + 1 ? 'sel' : ''}`}
                    style={{ padding: '6px 2px', minWidth: 54 }}
                    onClick={() => setScores({ ...cur, [k]: i + 1 })}
                    title={LEVEL_TEXT[i]}
                  >
                    <span className="e" style={{ fontSize: '1.4rem' }}>{e}</span>
                    <span style={{ fontSize: '0.7rem' }}>{LEVEL_TEXT[i]}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button className="btn grape block" onClick={save} disabled={busy || !complete || !scores}>
            {complete ? '💾 Saqlash' : 'Hamma sifatlarni baholang'}
          </button>
        </div>

        <div className="card tint-sky center">
          <h2>Mening kamalagim</h2>
          <RadarChart scores={cur} compare={previous?.scores} />
          {previous && (
            <p className="small muted">
              <span style={{ color: '#1fa8d4', fontWeight: 900 }}>━ hozir</span> · <span style={{ color: '#9b5de5', fontWeight: 900 }}>┅ {prettyDate(previous.day)}</span>
            </p>
          )}
          {latest && <p className="small muted">Oxirgi baholash: {prettyDate(latest.day)}</p>}
        </div>
      </div>
    </>
  );
}
