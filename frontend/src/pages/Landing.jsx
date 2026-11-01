import { Link } from 'react-router-dom';
import { Logo } from '../components/ui.jsx';
import { QUALITIES } from '../constants.js';

const FEATURES = [
  ['😊', 'Kayfiyat kundaligi', "Bola har kuni o'z his-tuyg'usini belgilaydi. Ustoz kimga e'tibor kerakligini darhol ko'radi.", 'tint-sun'],
  ['🎯', 'Shaxsiy maqsadlar', "Kichik va aniq maqsadlar qo'yib, ularga qadam-baqadam yetishishni o'rganadi.", 'tint-mint'],
  ['🌟', 'Men qandayman?', "5 ta asosiy sifat bo'yicha o'zini baholaydi va o'sishini diagrammada ko'radi.", 'tint-sky'],
  ['📋', 'Rivojlantiruvchi topshiriqlar', 'Ustoz mustaqillik, hamkorlik, ijodkorlikni rivojlantiruvchi vazifalar beradi.', 'tint-grape'],
  ['🏆', 'Rag\'bat va nishonlar', "Yulduzchalar va maqtov nishonlari bolaning o'ziga ishonchini oshiradi.", 'tint-coral'],
  ['🤖', 'Telegram bot', "Login va parol bilan botga kiriladi: kayfiyat, vazifalar va xabarlar — telefonda.", 'tint-sun'],
];

export default function Landing() {
  return (
    <div>
      <nav className="landing-nav">
        <span className="logo" style={{ padding: 0 }}><Logo /> Kamalak</span>
        <div className="row">
          <Link to="/login" className="btn ghost sm">Kirish</Link>
          <Link to="/register" className="btn sun sm">Ro'yxatdan o'tish</Link>
        </div>
      </nav>

      <header className="hero">
        <div>
          <span className="tag sun" style={{ marginBottom: 14 }}>🎒 1–4-sinflar uchun</span>
          <h1>
            Har bir bola — <span className="rb">o'z kamalagi</span>ning rassomi
          </h1>
          <p className="lead">
            Kamalak — boshlang'ich sinf o'quvchilarining shaxsiy rivojlanishini qo'llab-quvvatlovchi raqamli kundalik.
            O'quvchi o'zini taniydi, ustoz esa har bir bolani yaqindan kuzatadi.
          </p>
          <div className="row" style={{ marginTop: 22 }}>
            <Link to="/register" className="btn coral">🚀 Boshlash</Link>
            <Link to="/login" className="btn ghost">Menda akkaunt bor</Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <svg viewBox="0 0 400 400" width="100%" height="100%">
            <circle cx="200" cy="200" r="180" fill="#fff" />
            <g fill="none" strokeWidth="26" strokeLinecap="round">
              {['#FF6B6B', '#FF9F68', '#FFC93C', '#2EC4B6', '#4CC9F0', '#9B5DE5'].map((c, i) => (
                <path key={c} d={`M${70 + i * 22} 270a${130 - i * 22} ${130 - i * 22} 0 0 1 ${260 - i * 44} 0`} stroke={c} />
              ))}
            </g>
            <circle cx="95" cy="285" r="34" fill="#fff" />
            <circle cx="125" cy="275" r="40" fill="#fff" />
            <circle cx="290" cy="280" r="40" fill="#fff" />
            <circle cx="320" cy="290" r="30" fill="#fff" />
          </svg>
          <div className="bubble" style={{ top: '6%', left: '-4%' }}><span className="e">😄</span> Bugun zo'r!</div>
          <div className="bubble" style={{ top: '40%', right: '-6%', animationDelay: '1s' }}><span className="e">⭐</span> +3 yulduz</div>
          <div className="bubble" style={{ bottom: '4%', left: '10%', animationDelay: '2s' }}><span className="e">🎨</span> Ijodkor nishoni</div>
        </div>
      </header>

      <section className="section">
        <h2 className="center" style={{ fontSize: '1.8rem' }}>Nimalar qila olasiz?</h2>
        <p className="center muted" style={{ marginBottom: 24 }}>O'quvchi va o'qituvchi uchun bitta qulay makon</p>
        <div className="grid cols-3">
          {FEATURES.map(([e, t, d, tint]) => (
            <div key={t} className={`card feature ${tint}`}>
              <span className="e">{e}</span>
              <h3>{t}</h3>
              <p className="muted" style={{ margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="card">
          <h2 className="center">Rivojlantiriladigan 5 ta sifat</h2>
          <div className="grid cols-4" style={{ marginTop: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {Object.values(QUALITIES).map((q) => (
              <div key={q.title} className="center" style={{ padding: 10 }}>
                <div style={{ fontSize: '2.6rem' }}>{q.emoji}</div>
                <b>{q.title}</b>
                <p className="small muted" style={{ margin: 0 }}>{q.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid cols-2">
          <div className="card tint-sky">
            <h2>👩‍🏫 O'qituvchi uchun</h2>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li>Ro'yxatdan o'ting va sinf yarating</li>
              <li>Sinf kodini o'quvchilarga bering</li>
              <li>Kayfiyat, sifatlar va topshiriqlarni kuzating</li>
            </ol>
          </div>
          <div className="card tint-mint">
            <h2>🧒 O'quvchi uchun</h2>
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              <li>Ustozingizdan sinf kodini oling</li>
              <li>Ro'yxatdan o'ting va avatar tanlang</li>
              <li>Har kuni kayfiyatingizni belgilang va yulduz yig'ing!</li>
            </ol>
          </div>
        </div>
      </section>

      <footer className="section center small muted" style={{ paddingBottom: 40 }}>
        <Logo size={28} />
        <p>Boshlang'ich sinflarda o'quvchilarning shaxsiy rivojlanishini qo'llab-quvvatlash · Kamalak © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
