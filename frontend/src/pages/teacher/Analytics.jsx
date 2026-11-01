import { Link } from 'react-router-dom';
import { useApi } from '../../api.js';
import { PageHead, Loading, Empty, Progress } from '../../components/ui.jsx';
import { ClassMoodBars, MoodLegend, RadarChart } from '../../components/charts.jsx';
import { QUALITIES } from '../../constants.js';

// Sinfdagi eng past sifat bo'yicha tavsiyalar
const ADVICE = {
  mustaqillik: "Bolalarga kichik mas'uliyatlar bering: navbatchilik, materiallarni tarqatish. Tanlov imkoniyatini oshiring.",
  masuliyat: "Uzoq muddatli kichik loyihalar (gul o'stirish, kundalik yuritish) bering va natijasini birga muhokama qiling.",
  hamkorlik: "Juftlikda va kichik guruhlarda ishlash, rolli o'yinlar, 'yordamchi do'st' tizimini joriy qiling.",
  ijodkorlik: "Ochiq savollar bering, rasm, ertak, qo'l mehnati orqali o'z fikrini ifodalashga imkon yarating.",
  qiziquvchanlik: "'Nega?' savollari burchagi, kichik tajribalar va kuzatishlar orqali izlanishga undang.",
};

export default function TeacherAnalytics() {
  const { data, error } = useApi('/teacher/analytics');
  if (!data) return <Loading error={error} />;

  const hasScores = Object.values(data.qualities).some(Boolean);
  const weakest = hasScores ? Object.entries(data.qualities).filter(([, v]) => v).sort((a, b) => a[1] - b[1])[0][0] : null;

  return (
    <>
      <PageHead title="📊 Sinf tahlili" sub="Shaxsiy rivojlanish dinamikasi" />
      <div className="grid cols-3 stats" style={{ marginBottom: 18 }}>
        <div className="card tint-sky stat"><span className="ic">🧒</span><div><div className="big">{data.student_count}</div><span className="muted">o'quvchi</span></div></div>
        <div className="card tint-sun stat"><span className="ic">📝</span><div><div className="big">{data.checked_today}</div><span className="muted">bugun kayfiyat belgiladi</span></div></div>
        <div className="card tint-mint stat" style={{ display: 'block' }}>
          <div className="row between"><b>✅ Topshiriqlar bajarilishi</b><b>{data.completion}%</b></div>
          <div style={{ marginTop: 10 }}><Progress value={data.completion} /></div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>😊 Haftalik kayfiyat xaritasi</h3>
          <ClassMoodBars week={data.week} total={data.student_count} />
          <MoodLegend />
        </div>

        <div className="card center">
          <h3>🌟 Sinf bo'yicha o'rtacha sifatlar</h3>
          {hasScores ? <RadarChart scores={data.qualities} /> : <Empty emoji="🌟">O'quvchilar hali o'zini baholamagan</Empty>}
        </div>

        <div className={`card ${data.attention.length ? 'tint-coral' : 'tint-mint'}`}>
          <h3>⚠️ E'tibor talab qiladi</h3>
          <p className="small muted">Oxirgi 3 kunda kayfiyati o'rtacha 2.5 dan past bo'lgan o'quvchilar</p>
          {data.attention.length ? data.attention.map((s) => (
            <Link key={s.id} to={`/teacher/students/${s.id}`} className="list-item" style={{ color: 'inherit' }}>
              <span className="avatar">{s.avatar}</span>
              <div className="grow"><b>{s.full_name}</b><div className="small muted">O'rtacha kayfiyat: {s.avg_mood} · {s.days} kun</div></div>
              <span>→</span>
            </Link>
          )) : <Empty emoji="💚">Hammasi yaxshi! Kayfiyati past o'quvchi yo'q.</Empty>}
        </div>

        <div className="card tint-grape">
          <h3>💡 Pedagogik tavsiya</h3>
          {weakest ? (
            <>
              <p>Sinfda eng past baholangan sifat: <b>{QUALITIES[weakest].emoji} {QUALITIES[weakest].title}</b> ({data.qualities[weakest]} / 5)</p>
              <p style={{ margin: 0 }}>{ADVICE[weakest]}</p>
            </>
          ) : (
            <p className="muted">Tavsiya berish uchun o'quvchilar o'zini baholashi kerak.</p>
          )}
          <div style={{ marginTop: 16 }}>
            {Object.entries(data.qualities).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div className="row between small"><span>{QUALITIES[k].emoji} {QUALITIES[k].title}</span><b>{v || '—'}</b></div>
                <Progress value={(v / 5) * 100} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
