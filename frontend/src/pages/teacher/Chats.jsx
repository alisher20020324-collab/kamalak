import { useState } from 'react';
import { useApi } from '../../api.js';
import { PageHead, Loading, Empty } from '../../components/ui.jsx';
import { ChatCard } from '../../components/ChatCard.jsx';

export default function TeacherChats() {
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const { data, error } = useApi(`/teacher/chats${onlyFlagged ? '?flagged=1' : ''}`);

  return (
    <>
      <PageHead title="💬 Suhbatlar" sub="O'quvchilar qahramonlar bilan suhbatda bergan javoblari. Xavotirli javoblar 🔴 bilan belgilanadi.">
        <button className={`btn sm ${onlyFlagged ? 'ghost' : 'sun'}`} onClick={() => setOnlyFlagged(false)}>Hammasi</button>
        <button className={`btn sm ${onlyFlagged ? 'coral' : 'ghost'}`} onClick={() => setOnlyFlagged(true)}>🔴 Xavotirli</button>
      </PageHead>
      {!data ? (
        <Loading error={error} />
      ) : data.length ? (
        <div className="card">{data.map((c) => <ChatCard key={c.id} chat={c} />)}</div>
      ) : (
        <Empty emoji="💬">{onlyFlagged ? "Xavotirli javob yo'q 🎉" : "Hali hech kim suhbatlashmagan"}</Empty>
      )}
    </>
  );
}
