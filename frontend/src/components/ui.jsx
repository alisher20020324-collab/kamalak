import { useEffect, useState } from 'react';
import { MOODS } from '../constants.js';

export function Logo({ size = 38 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <g fill="none" strokeWidth="7" strokeLinecap="round">
        <path d="M8 50a24 24 0 0 1 48 0" stroke="#FF6B6B" />
        <path d="M16 50a16 16 0 0 1 32 0" stroke="#FFC93C" />
        <path d="M24 50a8 8 0 0 1 16 0" stroke="#4CC9F0" />
      </g>
    </svg>
  );
}

// Oddiy global xabarnoma: toast("Saqlandi!")
export function toast(text) {
  window.dispatchEvent(new CustomEvent('kamalak:toast', { detail: text }));
}
export function ToastHost() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const on = (e) => {
      setMsg(e.detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2400);
    };
    window.addEventListener('kamalak:toast', on);
    return () => window.removeEventListener('kamalak:toast', on);
  }, []);
  return msg ? <div className="toast" role="status">{msg}</div> : null;
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="card-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Yopish">✖️</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Progress = ({ value }) => (
  <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div style={{ width: `${value}%` }} />
  </div>
);

export function MoodPicker({ value, onPick, disabled }) {
  return (
    <div className="moods">
      {Object.entries(MOODS).map(([k, m]) => (
        <button
          key={k}
          type="button"
          disabled={disabled}
          className={`mood-btn ${Number(value) === Number(k) ? 'sel' : ''}`}
          onClick={() => onPick(Number(k))}
        >
          <span className="e">{m.emoji}</span>
          {m.title}
        </button>
      ))}
    </div>
  );
}

export function StarsPick({ value, onChange, max = 5 }) {
  return (
    <div className="stars-pick">
      {Array.from({ length: max }, (_, i) => (
        <button type="button" key={i} className={i < value ? 'on' : ''} onClick={() => onChange(i + 1)} aria-label={`${i + 1} yulduz`}>
          ⭐
        </button>
      ))}
    </div>
  );
}

export const Skeleton = ({ h = 140 }) => <div className="skeleton" style={{ minHeight: h }} />;

export const Empty = ({ emoji = '🌱', children }) => (
  <div className="empty">
    <span className="e">{emoji}</span>
    {children}
  </div>
);

export const PageHead = ({ title, sub, children }) => (
  <div className="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p className="muted">{sub}</p>}
    </div>
    {children && <div className="row">{children}</div>}
  </div>
);

export function Loading({ error }) {
  if (error) return <div className="error">{error}</div>;
  return (
    <div className="grid cols-2">
      <Skeleton />
      <Skeleton />
      <Skeleton h={220} />
      <Skeleton h={220} />
    </div>
  );
}
