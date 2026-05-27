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
const TOAST_MESSAGES = [
  "✦ all saved",
  "✦ words kept safe",
  "✦ tucked away nicely",
  "✦ your day, remembered",
  "✦ saved with care",
  "✦ memory preserved",
  "✦ held safely",
  "✦ written and kept",
  "✦ your words are safe",
  "✦ another day, captured",
];
const SPLASH_MESSAGES = [
  "gathering your thoughts…",
  "opening your memories…",
  "finding your words…",
  "preparing your space…",
  "settling in…",
  "your journal awaits…",
  "making room for you…",
  "almost there…",
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
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [splash, setSplash] = useState(true);
  const [splashMsg, setSplashMsg] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const strip = document.querySelector('.strip');
    const sel = document.querySelector('.day-item.sel');
    if (!strip || !sel) return;
    const timer = setTimeout(() => {
      const stripRect = strip.getBoundingClientRect();
      const selRect = sel.getBoundingClientRect();
      const scrollLeft = sel.offsetLeft - strip.offsetLeft - (stripRect.width / 2) + (selRect.width / 2);
      strip.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [isMobile, selected, month, year]);

  useEffect(() => {
    setSplashMsg(SPLASH_MESSAGES[Math.floor(Math.random() * SPLASH_MESSAGES.length)]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!splash) return;
    const symbols = ['✦', '✧', '⋆', '·', '✦', '✧', '⋆'];
    const stars = [];
    for (let i = 0; i < 18; i++) {
      const star = document.createElement('span');
      star.style.cssText = `position:fixed;pointer-events:none;color:#c8c4bc;animation:floatStar linear infinite;opacity:0;font-style:normal;`;
      star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.fontSize = (Math.random() * 10 + 8) + 'px';
      star.style.animationDuration = (Math.random() * 8 + 6) + 's';
      star.style.animationDelay = (Math.random() * 4) + 's';
      document.body.appendChild(star);
      stars.push(star);
    }
    return () => stars.forEach(s => document.body.removeChild(s));
  }, [splash]);

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
    if (session) return;
    const symbols = ['✦', '✧', '⋆', '·', '◦', '∘'];
    const decos = [];

    for (let i = 0; i < 22; i++) {
      const el = document.createElement('span');
      el.style.cssText = `position:fixed;pointer-events:none;color:#c8c4bc;animation:floatDeco linear infinite;opacity:0;`;
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = (Math.random() * 100 + 20) + 'vh';
      el.style.fontSize = (Math.random() * 10 + 6) + 'px';
      el.style.animationDuration = (Math.random() * 12 + 10) + 's';
      el.style.animationDelay = (Math.random() * 6) + 's';
      document.body.appendChild(el);
      decos.push(el);
    }

    const planets = [
      [`<ellipse cx="36" cy="36" rx="34" ry="8" stroke="#c8c4bc" stroke-width="1" opacity="0.5"/><circle cx="36" cy="36" r="20" stroke="#c8c4bc" stroke-width="1.2" fill="#f5f2ed" fill-opacity="0.6"/><path d="M18 32 Q36 29 54 32" stroke="#d4cfc8" stroke-width="0.9" fill="none"/><path d="M17 36 Q36 39 55 36" stroke="#d4cfc8" stroke-width="0.7" fill="none"/>`, '72 72', 60],
      [`<ellipse cx="40" cy="46" rx="38" ry="9" stroke="#c8c4bc" stroke-width="1" fill="#f5f2ed" fill-opacity="0.3" opacity="0.6"/><circle cx="40" cy="40" r="18" stroke="#c8c4bc" stroke-width="1.2" fill="#f5f2ed" fill-opacity="0.7"/><path d="M25 36 Q40 33 55 36" stroke="#d4cfc8" stroke-width="0.8" fill="none"/>`, '80 80', 70],
      [`<path d="M20 6 A12 12 0 1 0 20 26 A8 8 0 1 1 20 6Z" stroke="#c8c4bc" stroke-width="1" fill="#f5f2ed" fill-opacity="0.5"/>`, '32 32', 28],
      [`<circle cx="46" cy="10" r="4" stroke="#c8c4bc" stroke-width="1" fill="#f5f2ed" fill-opacity="0.5"/><path d="M42 8 Q20 4 2 10 Q20 16 42 12" stroke="#c8c4bc" stroke-width="0.7" fill="#f5f2ed" fill-opacity="0.15"/>`, '55 20', 50],
    ];

    planets.forEach(([inner, vb, size]) => {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;pointer-events:none;animation:floatDeco linear infinite;opacity:0;`;
      el.innerHTML = `<svg viewBox="0 0 ${vb}" fill="none">${inner}</svg>`;
      el.style.width = size + 'px';
      el.style.left = (10 + Math.random() * 80) + 'vw';
      el.style.top = (Math.random() * 100 + 20) + 'vh';
      el.style.animationDuration = (Math.random() * 10 + 18) + 's';
      el.style.animationDelay = (Math.random() * 8) + 's';
      document.body.appendChild(el);
      decos.push(el);
    });

    return () => decos.forEach(el => document.body.removeChild(el));
  }, [session]);

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
    setToast(true);
    setToastMsg(TOAST_MESSAGES[Math.floor(Math.random() * TOAST_MESSAGES.length)]);
    setTimeout(() => { setSaved(false); setToast(false); }, 2000);
  }, [selected, draft]);

  const handlePendingNav = useCallback(async (save) => {
    if (save) await handleSave();
    setShowUnsavedModal(false);
    if (pendingDate) {
      setSelected({ y: pendingDate.y, m: pendingDate.m, d: pendingDate.d });
      setPlaceholder(randomPlaceholder());
      if (pendingDate.other) {
        setMonth(pendingDate.m < 0 ? 11 : pendingDate.m > 11 ? 0 : pendingDate.m);
        setYear(pendingDate.y);
      }
      setPendingDate(null);
    }
  }, [pendingDate, handleSave]);

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

  if (splash && session) {
    return (
      <div className="splash">
        <div className="splash-msg-wrap">
          <p className="splash-msg">{splashMsg}</p>
        </div>
        <span className="splash-dot"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="login-bg">
        <button className="theme-toggle login-theme-toggle" onClick={() => setDarkMode(d => !d)} title={darkMode ? 'light mode' : 'dark mode'}>
          ◐
        </button>
        <div className="login-corner tl">◈</div>
        <div className="login-corner tr">◈</div>
        <div className="login-corner bl">◈</div>
        <div className="login-corner br">◈</div>
        <div className="login-card">
          <div className="login-top-line" />
          <span className="login-icon">◈</span>
          <h1 className="login-title">journal</h1>
          <p className="login-sub fade-in-delay">a quiet place to write every day</p>
          <div className="login-divider">
            <span /><span className="login-dot">◆</span><span />
          </div>
          <button className="google-btn" onClick={() => signIn("google")}>
            <GoogleIcon />
            continue with google
          </button>
          <p className="login-footer">your thoughts, safe and private</p>
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
          <button className="theme-toggle" onClick={() => setDarkMode(d => !d)}>
            {darkMode ? '☀' : '☾'}
          </button>
          <img src={session.user.image} alt="" className="avatar" />
          <button className="signout-btn" onClick={() => signOut()}>sign out</button>
        </div>
      </header>

      <main className="main">
        <section className="cal-section">
          {isMobile ? (
            <div className="date-strip-wrap">
              <div className="month-nav">
                <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}>‹</button>
                <span className="cal-title">{MONTHS[month]} {year}</span>
                <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}>›</button>
              </div>
              <div className="strip">
                {Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1).map(d => {
                  const date = new Date(year, month, d);
                  const key = toKey(year, month, d);
                  const isDayToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  const isSel = d === selected.d && month === selected.m && year === selected.y;
                  const isFutureDay = new Date(year, month, d) > today;
                  return (
                    <div
                      key={d}
                      className={`day-item ${isDayToday ? 'today' : ''} ${isSel ? 'sel' : ''} ${isFutureDay ? 'future' : ''}`}
                      onClick={() => {
                        const key = toKey(selected.y, selected.m, selected.d);
                        const isDirty = draft !== (entries[key] || "");
                        if (isDirty) {
                          setPendingDate({ y: year, m: month, d });
                          setShowUnsavedModal(true);
                        } else {
                          setSelected({ y: year, m: month, d });
                          setPlaceholder(randomPlaceholder());
                        }
                      }}
                    >
                      <span className="day-name">{SHORT_DAYS[date.getDay()]}</span>
                      <div className="day-num">
                        {d}
                        {entries[key] && <span className="entry-dot" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
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
                        const key = toKey(selected.y, selected.m, selected.d);
                        const isDirty = draft !== (entries[key] || "");
                        if (isDirty) {
                          setPendingDate({ y: c.y, m: c.m, d: c.d, other: c.other });
                          setShowUnsavedModal(true);
                        } else {
                          setSelected({ y: c.y, m: c.m, d: c.d });
                          setPlaceholder(randomPlaceholder());
                          if (c.other) { setMonth(c.m < 0 ? 11 : c.m > 11 ? 0 : c.m); setYear(c.y); }
                        }
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
            </>
          )}
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
      <div className={`toast ${toast ? "show" : ""}`}>{toastMsg}</div>

      {showUnsavedModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p className="modal-title">Uh oh, you didn't save 🙊</p>
            <p className="modal-sub">Remember to save your entry ✨ </p>
            <div className="modal-actions">
              <button className="modal-btn discard" onClick={() => handlePendingNav(false)}>Discard </button>
              <button className="modal-btn save" onClick={() => handlePendingNav(true)}>Save & continue</button>
            </div>
          </div>
        </div>
      )}
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