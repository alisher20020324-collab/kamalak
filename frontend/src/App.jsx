import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, homeFor } from './auth.jsx';
import Layout from './components/Layout.jsx';
import { Logo } from './components/ui.jsx';
import Landing from './pages/Landing.jsx';
import { Login, Register } from './pages/Auth.jsx';

// Har bir bo'lim alohida yuklanadi — birinchi ochilish tezroq
const StudentHome = lazy(() => import('./pages/student/Home.jsx'));
const StudentMood = lazy(() => import('./pages/student/Mood.jsx'));
const StudentTasks = lazy(() => import('./pages/student/Tasks.jsx'));
const StudentGoals = lazy(() => import('./pages/student/Goals.jsx'));
const StudentMe = lazy(() => import('./pages/student/Me.jsx'));
const StudentAchievements = lazy(() => import('./pages/student/Achievements.jsx'));
const StudentChat = lazy(() => import('./pages/student/Chat.jsx'));
const TeacherChats = lazy(() => import('./pages/teacher/Chats.jsx'));
const TeacherClass = lazy(() => import('./pages/teacher/Class.jsx'));
const TeacherStudent = lazy(() => import('./pages/teacher/Student.jsx'));
const TeacherTasks = lazy(() => import('./pages/teacher/Tasks.jsx'));
const TeacherAnalytics = lazy(() => import('./pages/teacher/Analytics.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return children;
}

function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user)} replace /> : children;
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ animation: 'float 1.2s ease-in-out infinite' }}><Logo size={80} /></div>
    </div>
  );
}

export default function App() {
  const { ready } = useAuth();
  if (!ready) return <Splash />;
  return (
    <Suspense fallback={<Splash />}>
      <Routes>
        <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        <Route path="/student" element={<Guard role="student"><Layout /></Guard>}>
          <Route index element={<StudentHome />} />
          <Route path="mood" element={<StudentMood />} />
          <Route path="tasks" element={<StudentTasks />} />
          <Route path="goals" element={<StudentGoals />} />
          <Route path="me" element={<StudentMe />} />
          <Route path="achievements" element={<StudentAchievements />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/teacher" element={<Guard role="teacher"><Layout /></Guard>}>
          <Route index element={<TeacherClass />} />
          <Route path="students/:id" element={<TeacherStudent />} />
          <Route path="tasks" element={<TeacherTasks />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
          <Route path="chats" element={<TeacherChats />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
