import { MOODS, QUALITIES, today, weekday, prettyDate } from '../constants.js';

const KEYS = Object.keys(QUALITIES);

// Shaxsiy sifatlar "o'rgimchak to'ri" diagrammasi (1–5 ball)
export function RadarChart({ scores, compare, size = 300 }) {
  const c = size / 2;
  const r = size / 2 - 64;
  const pt = (i, v) => {
    const a = (Math.PI * 2 * i) / KEYS.length - Math.PI / 2;
    return [c + Math.cos(a) * r * (v / 5), c + Math.sin(a) * r * (v / 5)];
  };
  const poly = (s) => KEYS.map((k, i) => pt(i, s?.[k] || 0).join(',')).join(' ');
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, overflow: 'visible' }} role="img" aria-label="Shaxsiy sifatlar diagrammasi">
      {[1, 2, 3, 4, 5].map((lvl) => (
        <polygon key={lvl} points={KEYS.map((_, i) => pt(i, lvl).join(',')).join(' ')} fill={lvl % 2 ? '#fffaf0' : '#fff'} stroke="#f0e6d6" strokeWidth="1.5" />
      ))}
      {KEYS.map((_, i) => {
        const [x, y] = pt(i, 5);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#f0e6d6" strokeWidth="1.5" />;
      })}
      {compare && <polygon points={poly(compare)} fill="rgba(155,93,229,0.12)" stroke="#9b5de5" strokeWidth="2" strokeDasharray="5 4" />}
      {scores && <polygon points={poly(scores)} fill="rgba(76,201,240,0.3)" stroke="#1fa8d4" strokeWidth="3" strokeLinejoin="round" />}
      {scores && KEYS.filter((k) => scores[k]).map((k) => {
        const [x, y] = pt(KEYS.indexOf(k), scores[k]);
        return <circle key={k} cx={x} cy={y} r="5" fill="#fff" stroke="#1fa8d4" strokeWidth="3" />;
      })}
      {KEYS.map((k, i) => {
        const [x, y] = pt(i, 6.2);
        return (
          <g key={k}>
            <text x={x} y={y - 6} textAnchor="middle" fontSize="20">{QUALITIES[k].emoji}</text>
            <text x={x} y={y + 12} textAnchor="middle" fontSize="11" fontWeight="800" fill="#2d3047">{QUALITIES[k].title}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Oxirgi 7 kunlik kayfiyat (har kun — emoji ustuni)
export function MoodWeek({ moods }) {
  const map = Object.fromEntries((moods || []).map((m) => [m.day, m.mood]));
  const days = Array.from({ length: 7 }, (_, i) => today(i - 6));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 150 }}>
      {days.map((d) => {
        const m = map[d];
        return (
          <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '1.4rem' }}>{m ? MOODS[m].emoji : '·'}</span>
            <div
              title={m ? MOODS[m].title : "Belgilanmagan"}
              style={{
                width: '100%', maxWidth: 38, borderRadius: 10,
                height: m ? `${m * 16}px` : 6,
                background: m ? MOODS[m].color : '#f0e6d6',
                transition: 'height .4s',
              }}
            />
            <span className="small muted" style={{ fontWeight: d === today() ? 900 : 700, color: d === today() ? '#2d3047' : undefined }}>
              {weekday(d)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// 30 kunlik kayfiyat kalendari
export function MoodCalendar({ moods, days = 28 }) {
  const map = Object.fromEntries((moods || []).map((m) => [m.day, m]));
  const list = Array.from({ length: days }, (_, i) => today(i - days + 1));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
      {list.map((d) => {
        const m = map[d];
        return (
          <div
            key={d}
            title={`${prettyDate(d)}${m ? ' — ' + MOODS[m.mood].title + (m.note ? ': ' + m.note : '') : ''}`}
            style={{
              aspectRatio: '1', borderRadius: 14, display: 'grid', placeItems: 'center',
              background: m ? MOODS[m.mood].color + '40' : '#faf5ec',
              border: d === today() ? '3px solid #ffc93c' : '2px solid transparent',
              fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            }}
          >
            {m ? MOODS[m.mood].emoji : <span className="small muted">{Number(d.slice(8))}</span>}
          </div>
        );
      })}
    </div>
  );
}

// Sinf bo'yicha har kungi kayfiyat taqsimoti (o'qituvchi uchun)
export function ClassMoodBars({ week, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200 }}>
      {week.map(({ day, counts }) => {
        const sum = Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <span className="small" style={{ fontWeight: 800 }}>{sum}/{total}</span>
            <div style={{ width: '100%', maxWidth: 44, height: 150, display: 'flex', flexDirection: 'column-reverse', borderRadius: 12, overflow: 'hidden', background: '#faf5ec' }}>
              {[1, 2, 3, 4, 5].map((k) =>
                counts[k] ? <div key={k} title={`${MOODS[k].title}: ${counts[k]}`} style={{ height: `${(counts[k] / Math.max(total, 1)) * 100}%`, background: MOODS[k].color }} /> : null
              )}
            </div>
            <span className="small muted" style={{ fontWeight: 800 }}>{weekday(day)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MoodLegend() {
  return (
    <div className="row small" style={{ gap: 14, marginTop: 10 }}>
      {Object.values(MOODS).map((m) => (
        <span key={m.title} className="row" style={{ gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 4, background: m.color, display: 'inline-block' }} />
          {m.title}
        </span>
      ))}
    </div>
  );
}
