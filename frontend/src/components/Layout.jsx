import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { useAuth } from '../auth.jsx';
import { Logo, Loading } from './ui.jsx';

const NAV = {
  student: [
    ['/student', '🏠', 'Bosh sahifa'],
    ['/student/chat', '💬', 'Qahramon bilan suhbat', 'Suhbat'],
    // Pastki menyuga sig'ishi uchun kayfiyat faqat yon menyuda (bosh sahifada va suhbatda ham belgilanadi)
    ['/student/mood', '😊', 'Kayfiyat', null, 'sidebar'],
    ['/student/tasks', '📋', 'Vazifalar'],
    ['/student/goals', '🎯', 'Maqsadlar'],
    ['/student/me', '🌟', 'Men qandayman?', 'Men'],
    ['/student/achievements', '🏆', 'Yutuqlar'],
  ],
  teacher: [
    ['/teacher', '👩‍🏫', 'Sinfim'],
    ['/teacher/chats', '💬', 'Suhbatlar'],
    ['/teacher/analytics', '📊', 'Tahlil'],
    ['/teacher/tasks', '📋', 'Topshiriqlar'],
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user.role];
  const profile = `/${user.role}/profile`;

  const doLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to={links[0][0]} className="logo"><Logo /> Kamalak</NavLink>
        {links.map(([to, ic, label]) => (
          <NavLink key={to} to={to} end className="nav-link">
            <span className="ic">{ic}</span>
            {label}
          </NavLink>
        ))}
        <div className="spacer" />
        <NavLink to={profile} className="me-chip">
          <span className="avatar">{user.avatar}</span>
          <span style={{ minWidth: 0 }}>
            <b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</b>
            <span className="small muted">{user.role === 'teacher' ? "O'qituvchi" : "O'quvchi"} · {user.class?.name}</span>
          </span>
        </NavLink>
        <button className="nav-link icon-btn" onClick={doLogout} style={{ width: '100%', fontSize: '1rem' }}>
          <span className="ic">🚪</span> Chiqish
        </button>
      </aside>

      <main className="main">
        <div className="mobile-top">
          <span className="logo" style={{ padding: 0 }}><Logo size={32} /> Kamalak</span>
          <div className="row" style={{ gap: 6 }}>
            <NavLink to={profile} className="avatar" aria-label="Profil">{user.avatar}</NavLink>
            <button className="icon-btn" onClick={doLogout} aria-label="Chiqish">🚪</button>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>

      <nav className="bottom-nav">
        {links.filter((l) => l[4] !== 'sidebar').map(([to, ic, label, short]) => (
          <NavLink key={to} to={to} end className="nav-link">
            <span className="ic">{ic}</span>
            {short || label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
