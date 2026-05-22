import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PLACEHOLDERS = [
  "write about your day…",
  "how was your day, sweetie?",
  "what made you smile today?",
  "what's on your mind tonight?",
  "tell me everything…",
  "what are you grateful for today?",
  "how did today feel?",
  "what moment do you want to remember?",
  "what surprised you today?",
  "what did you learn today?",
  "how is your heart doing?",
  "what made today different?",
  "who made you feel something today?",
  "what would you tell your future self?",
  "what are you letting go of today?",
  "what do you wish had gone differently?",
  "what are you looking forward to?",
  "describe today in three words… or more.",
  "what did today teach you?",
  "pour it all out here…",
];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function wordCount(text) {
  const t = text?.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function randomPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

export default function Home() {
  const { data: session, status } = useSession();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selected, setSelected] = useState({ y: today.getFullYear(), m: today.getMonth(), d: today.getDate() });
  const [entries, setEntries] = useState({});
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const isFuture = new Date(selected.y, selected.m, selected.d) > today;
  const [placeholder, setPlaceholder] = useState(randomPlaceholder);

  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.classList.add('cursor');
    document.body.appendChild(cursor);

    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const addHover = () => cursor.classList.add('hover');
    const removeHover = () => cursor.classList.remove('hover');

    window.addEventListener('mousemove', move);
    document.querySelectorAll('button, a, textarea').forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    return () => {
      window.removeEventListener('mousemove', move);
      document.body.removeChild(cursor);
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch("/api/entries")
      .then((r) => r.json())
      .then(setEntries);
  }, [session]);

  useEffect(() => {
    const key = toKey(selected.y, selected.m, selected.d);
    setDraft(entries[key] || "");
    setSaved(false);
  }, [selected, entries]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const key = toKey(selected.y, selected.m, selected.d);
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: key, text: draft }),
    });
    setEntries((prev) => {
      const next = { ...prev };
      if (draft.trim()) next[key] = draft;
      else delete next[key];
      return next;
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [selected, draft]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  function buildCalendar() {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--)
      cells.push({ d: daysInPrev - i, m: month - 1, y: month === 0 ? year - 1 : year, other: true });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ d, m: month, y: year, other: false });
    let next = 1;
    while (cells.length % 7 !== 0)
      cells.push({ d: next++, m: month + 1, y: month === 11 ? year + 1 : year, other: true });
    return cells;
  }

  if (status === "loading") return <div className="loading"><span className="dot-pulse" /></div>;

  if (!session) {
    return (
      <div className="login-bg">
        <div className="login-card">
          <div className="login-icon">◈</div>
          <h1 className="login-title">journal</h1>
          <p className="login-sub fade-in-delay">a quiet place to write every day</p>
          <button className="google-btn" onClick={() => signIn("google")}>
            <GoogleIcon />
            continue with google
          </button>
        </div>
      </div>
    );
  }

  const cells = buildCalendar();
  const selectedDate = new Date(selected.y, selected.m, selected.d);
  const isToday = (c) => c.y === today.getFullYear() && c.m === today.getMonth() && c.d === today.getDate();
  const isSelected = (c) => c.y === selected.y && c.m === selected.m && c.d === selected.d;

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">◈ journal</span>
        <div className="user-area">
          <img src={session.user.image} alt="" className="avatar" />
          <button className="signout-btn" onClick={() => signOut()}>sign out</button>
        </div>
      </header>

      <main className="main">
        <section className="cal-section">
          <div className="cal-nav">
            <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} aria-label="Previous">‹</button>
            <span className="cal-title">{MONTHS[month]} {year}</span>
            <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} aria-label="Next">›</button>
          </div>
          <div className="day-labels">
            {SHORT_DAYS.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="cal-grid">
            {cells.map((c, i) => {
              const key = toKey(c.y, c.m, c.d);
              const hasEntry = !!entries[key];
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelected({ y: c.y, m: c.m, d: c.d });
                    setPlaceholder(randomPlaceholder());
                    if (c.other) { setMonth(c.m < 0 ? 11 : c.m > 11 ? 0 : c.m); setYear(c.y); }
                  }}
                  className={[
                    "cal-day",
                    c.other ? "other" : "",
                    isToday(c) ? "today" : "",
                    isSelected(c) ? "sel" : "",
                  ].join(" ")}
                >
                  {c.d}
                  {hasEntry && <span className="dot" />}
                </button>
              );
            })}
          </div>
          <div className="legend">
            <span className="dot-small" /> entry written
          </div>
        </section>

        <section className="journal-section">
          <div className="journal-header">
            <div>
              <div className="journal-weekday">{WEEKDAYS[selectedDate.getDay()]}</div>
              <div className="journal-date-full">
                {MONTHS[selected.m]} {selected.d}, {selected.y}
              </div>
            </div>
            <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave} disabled={saving || isFuture}>
              {saved ? "saved ✓" : saving ? "saving…" : "save"}
            </button>
          </div>
          <textarea
            className="journal-area"
            value={draft}
            onChange={e => { setDraft(e.target.value); setSaved(false); }}
            placeholder={isFuture ? "" : placeholder}
            autoFocus
            disabled={isFuture}
          />
          {isFuture && (
            <p className="future-note">
              ✦ this day is yet to arrive
            </p>
          )}
          <div className="wc">{wordCount(draft)} {wordCount(draft) === 1 ? "word" : "words"}</div>
        </section>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A9.009 9.009 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}