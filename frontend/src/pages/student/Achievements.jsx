import { useApi } from '../../api.js';
import { PageHead, Loading } from '../../components/ui.jsx';
import { BADGES, prettyDate } from '../../constants.js';

const LEVELS = [
  [0, '🌱', 'Nihol'],
  [10, '🌿', "O'simta"],
  [25, '🌳', 'Daraxt'],
  [50, '🌈', 'Kamalak'],
  [100, '🚀', 'Yulduz kashfiyotchisi'],
];

export default function StudentAchievements() {
  const { data, error } = useApi('/student/badges');
  if (!data) return <Loading error={error} />;

  const level = [...LEVELS].reverse().find(([min]) => data.stars >= min);
  const next = LEVELS.find(([min]) => min > data.stars);
  const owned = new Set(data.badges.map((b) => b.badge));

  return (
    <>
      <PageHead title="🏆 Yutuqlarim" sub="Har bir yulduz — sizning mehnatingiz!" />
      <div className="card tint-sun" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 20 }}>
          <span style={{ fontSize: '4rem' }}>{level[1]}</span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ marginBottom: 4 }}>Darajam: {level[2]}</h2>
            <p className="muted" style={{ margin: 0 }}>⭐ {data.stars} yulduz{next && ` · keyingi daraja "${next[2]}" uchun yana ${next[0] - data.stars} ta`}</p>
            {next && (
              <div className="progress" style={{ marginTop: 10 }}>
                <div style={{ width: `${((data.stars - level[0]) / (next[0] - level[0])) * 100}%`, background: 'linear-gradient(90deg,#ffc93c,#ff9f68)' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <h2>Nishonlar to'plamim</h2>
        <div className="grid cols-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
          {Object.entries(BADGES).map(([k, b]) => (
            <div key={k} className={`badge-tile ${owned.has(k) ? '' : 'locked'}`}>
              <span className="e">{b.emoji}</span>
              <b>{b.title}</b>
              <div className="small muted">{owned.has(k) ? `×${data.badges.filter((x) => x.badge === k).length}` : 'Hali yo\'q'}</div>
            </div>
          ))}
        </div>
      </div>

      {data.badges.length > 0 && (
        <div className="card">
          <h2>Ustozimning maqtovlari 💌</h2>
          {data.badges.map((b) => (
            <div key={b.id} className="list-item">
              <span style={{ fontSize: '2rem' }}>{b.emoji}</span>
              <div className="grow">
                <b>{b.title}</b>
                {b.message && <div>«{b.message}»</div>}
                <div className="small muted">{b.teacher_name} · {prettyDate(b.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
