import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const BACKEND_URL = `${API_BASE_URL}/api/notes`;
const MAX_TITLE = 80;
const MAX_CONTENT = 1000;

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { width: 100%; min-height: 100vh; background: #f5f4f0; }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-8px)  } to { opacity:1; transform:translateX(0) } }
  @keyframes pop     { 0%  { opacity:0; transform:scale(.94) } 100% { opacity:1; transform:scale(1) } }
`;

(function injectGlobalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('nota-global')) return;
  const style = document.createElement('style');
  style.id = 'nota-global';
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
})();

// ─── Toast ────────────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, icon = 'check') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
  };
  return [toasts, push];
}
function ToastStack({ toasts }) {
  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={s.toast}>
          <i className={`ti ti-${t.icon}`} aria-hidden="true" style={{ fontSize: 15 }} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
function Tabs({ active, onChange }) {
  const tabs = [
    { id: 'notes',  icon: 'ti-notes',      label: 'Notes'  },
    { id: 'create', icon: 'ti-plus',        label: 'Create' },
    { id: 'about',  icon: 'ti-info-circle', label: 'About'  },
  ];
  return (
    <div style={s.tabBar}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{ ...s.tab, ...(active === tab.id ? s.tabActive : {}) }}
        >
          <i className={`ti ${tab.icon}`} aria-hidden="true" style={{ fontSize: 15 }} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Notes view ───────────────────────────────────────────────────────────────
function NotesView({ notes, onDelete, onCreateClick }) {
  const [query, setQuery] = useState('');
  const [sort, setSort]   = useState('new');

  const filtered = (() => {
    const q = query.toLowerCase();
    let arr = q
      ? notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      : [...notes];
    if (sort === 'new') arr.sort((a, b) => b.id - a.id);
    else if (sort === 'old') arr.sort((a, b) => a.id - b.id);
    else arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  })();

  return (
    <div style={{ animation: 'fadeUp .25s ease both' }}>
      <div style={s.searchWrap}>
        <i className="ti ti-search" aria-hidden="true" style={s.searchIcon} />
        <input
          style={s.searchInput}
          placeholder="Search notes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div style={s.sortRow}>
        {['new', 'old', 'az'].map(m => (
          <button
            key={m}
            onClick={() => setSort(m)}
            style={{ ...s.sortBtn, ...(sort === m ? s.sortBtnActive : {}) }}
          >
            {m === 'new' ? 'Newest' : m === 'old' ? 'Oldest' : 'A–Z'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={s.emptyState}>
          <i className={`ti ti-${query ? 'search' : 'notebook'}`} aria-hidden="true" style={s.emptyIcon} />
          <p style={s.emptyTitle}>{query ? 'No matches' : 'No notes yet'}</p>
          <p style={s.emptySub}>
            {query
              ? 'Try a different search term'
              : <span>Hit <button onClick={onCreateClick} style={s.inlineLink}>Create</button> to write your first note</span>}
          </p>
        </div>
      ) : (
        <div style={s.noteGrid}>
          {filtered.map((note, i) => (
            <div key={note.id} style={{ ...s.noteCard, animationDelay: `${Math.min(i * 40, 200)}ms` }}>
              <div style={s.noteCardTop}>
                <p style={s.noteTitle}>{note.title}</p>
                <button
                  style={{ ...s.btnIcon, ...s.btnDanger }}
                  onClick={() => onDelete(note.id)}
                  title="Delete"
                  aria-label="Delete note"
                >
                  <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 13 }} />
                </button>
              </div>
              <p style={s.noteMeta}>Note #{note.id}</p>
              <p style={s.notePreview}>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create view ──────────────────────────────────────────────────────────────
function CreateView({ onSave }) {
  const [title,   setTitle]   = useState('');
  const [content, setContent] = useState('');
  const [saving,  setSaving]  = useState(false);
  const titleRef = useRef();
  useEffect(() => { titleRef.current?.focus(); }, []);

  const ready = title.trim().length > 0 && content.trim().length > 0;
  const handleSave = async () => {
    if (!ready) return;
    setSaving(true);
    await onSave(title.trim(), content.trim());
    setTitle(''); setContent('');
    setSaving(false);
  };

  return (
    <div style={{ animation: 'pop .2s cubic-bezier(.34,1.56,.64,1) both' }}>
      <div style={s.formCard}>
        <div style={s.formField}>
          <label style={s.formLabel}>Title</label>
          <input ref={titleRef} type="text" style={s.formInput}
            placeholder="Give it a name…" value={title} maxLength={MAX_TITLE}
            onChange={e => setTitle(e.target.value)} />
          <div style={s.charCount}>{title.length} / {MAX_TITLE}</div>
        </div>
        <div style={s.formField}>
          <label style={s.formLabel}>Content</label>
          <textarea style={{ ...s.formInput, resize: 'vertical' }} rows={6}
            placeholder="What's on your mind…" value={content} maxLength={MAX_CONTENT}
            onChange={e => setContent(e.target.value)} />
          <div style={s.charCount}>{content.length} / {MAX_CONTENT}</div>
        </div>
        <button
          style={{ ...s.btnPrimary, ...((!ready || saving) ? s.btnDisabled : {}) }}
          onClick={handleSave} disabled={!ready || saving}
        >
          {saving ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </div>
  );
}

// ─── About view ───────────────────────────────────────────────────────────────
function AboutView({ notes, createdAt }) {
  const totalWords = notes.reduce((a, n) =>
    a + (n.title + ' ' + n.content).split(/\s+/).filter(Boolean).length, 0);
  const daysOld = createdAt
    ? Math.max(0, Math.floor((Date.now() - createdAt) / 86400000))
    : null;

  const endpoints = [
    { method: 'GET',    path: '/api/notes',     desc: 'fetch all' },
    { method: 'POST',   path: '/api/notes',     desc: 'create'    },
    { method: 'DELETE', path: '/api/notes/:id', desc: 'remove'    },
  ];
  const stack = ['React', 'Spring Boot', 'REST API', 'Java', 'Jackson', 'CSS-in-JS'];

  return (
    <div style={{ animation: 'fadeUp .25s ease both' }}>
      <div style={s.statGrid}>
        {[
          { num: notes.length, lbl: 'notes' },
          { num: totalWords,   lbl: 'words' },
          { num: daysOld !== null ? (daysOld < 1 ? '<1' : daysOld) : '—', lbl: 'days old' },
        ].map(({ num, lbl }) => (
          <div key={lbl} style={s.statCard}>
            <div style={s.statNum}>{num}</div>
            <div style={s.statLbl}>{lbl}</div>
          </div>
        ))}
      </div>

      {[
        { label: 'About this project', content: (
          <>
            <p style={{ ...s.aboutText, ...s.aboutTextCentered }}>Noted is a minimal note-taking app built with React on the frontend and Spring Boot on the backend. It stores notes through a REST API — no login, no clutter, just writing.</p>
            <p style={{ ...s.aboutText, ...s.aboutTextCentered, marginTop: '.65rem' }}>The goal was to keep everything simple: one form, one archive, nothing in the way.</p>
          </>
        )},
        { label: 'Stack', centered: true, content: (
          <div style={{ ...s.badgeRow, justifyContent: 'center' }}>
            {stack.map(b => <span key={b} style={s.badge}>{b}</span>)}
          </div>
        )},
        { label: 'API endpoints', centered: true, content: (
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              {endpoints.map((ep, i) => (
                <tr key={ep.path} style={i < endpoints.length - 1 ? { borderBottom: '1px solid #e8e6e0' } : {}}>
                  <td style={s.epMethod}>{ep.method}</td>
                  <td style={s.epPath}>{ep.path}</td>
                  <td style={s.epDesc}>{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )},
      ].map(({ label, content }) => (
        <div key={label} style={{ ...s.aboutSection, ...s.aboutSectionCentered }}>
          <p style={{ ...s.aboutLabel, ...s.aboutLabelCentered }}>{label}</p>
          <div style={{ ...s.aboutCard, ...s.aboutCardCentered }}>{content}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,       setTab]       = useState('notes');
  const [notes,     setNotes]     = useState([]);
  const [createdAt, setCreatedAt] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [toasts,    pushToast]    = useToasts();

  const loadNotes = async () => {
    try {
      const res = await fetch(BACKEND_URL);
      if (res.ok) { setNotes(await res.json()); setApiStatus('online'); }
      else setApiStatus('offline');
    } catch { setApiStatus('offline'); }
  };
  useEffect(() => { loadNotes(); }, []);

  const handleSave = async (title, content) => {
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        await loadNotes(); setApiStatus('online');
        pushToast('Note saved', 'check');
        if (!createdAt) setCreatedAt(Date.now());
        setTab('notes');
      } else { setApiStatus('offline'); pushToast('Server rejected request', 'alert-circle'); }
    } catch {
      setApiStatus('offline');
      setNotes(prev => [...prev, { id: Date.now(), title, content }]);
      pushToast('Saved locally (server offline)', 'wifi-off');
      if (!createdAt) setCreatedAt(Date.now());
      setTab('notes');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/${id}`, { method: 'DELETE' });
      setApiStatus(res.ok ? 'online' : 'offline');
    } catch { setApiStatus('offline'); }
    setNotes(prev => prev.filter(n => n.id !== id));
    pushToast('Note removed', 'trash');
  };

  const statusStyle = apiStatus === 'online' ? s.pillOnline
    : apiStatus === 'offline' ? s.pillOffline : s.pillChecking;

  return (
    <div style={s.page}>
      <div style={s.shell}>
        <div style={s.topbar}>
          <div style={s.wordmark}>Noted</div>
          <div style={s.topbarRight}>
            <div style={{ ...s.pill, ...statusStyle }}>
              {apiStatus === 'online' ? 'API online' : apiStatus === 'offline' ? 'API offline' : 'Checking…'}
            </div>
            <div style={s.pill}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </div>
          </div>
        </div>

        <Tabs active={tab} onChange={setTab} />
        <ToastStack toasts={toasts} />

        {tab === 'notes'  && <NotesView  notes={notes} onDelete={handleDelete} onCreateClick={() => setTab('create')} />}
        {tab === 'create' && <CreateView onSave={handleSave} />}
        {tab === 'about'  && <AboutView  notes={notes} createdAt={createdAt} />}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page:  { width: '100%', minHeight: '100vh', backgroundColor: '#f5f4f0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif', color: '#2c2b2a' },
  shell: { width: '100%', padding: '1.5rem 2rem 3rem' },

  topbar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  wordmark:    { fontSize: 16, fontWeight: 600, color: '#1a1918', letterSpacing: '-.4px' },
  pill:        { fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: '#eceae4', color: '#7a7874', border: '1px solid #e0ded8' },
  pillOnline:  { background: '#e8f7ed', color: '#17683a', borderColor: '#c6eacf' },
  pillOffline: { background: '#fdebec', color: '#8d1e26', borderColor: '#f4c9cd' },
  pillChecking:{ background: '#eceae4', color: '#7a7874', borderColor: '#e0ded8' },

  tabBar:    { display: 'flex', gap: 2, background: '#eceae4', borderRadius: 10, padding: 3, marginBottom: '1.25rem', border: '1px solid #e0ded8' },
  tab:       { flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 500, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#9a9895', transition: 'all .18s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 },
  tabActive: { background: '#fdfcfb', color: '#1a1918', border: '1px solid #e0ded8' },

  toast: { background: '#1a1918', color: '#fdfcfb', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, animation: 'pop .2s cubic-bezier(.34,1.56,.64,1) both' },

  searchWrap:    { position: 'relative', marginBottom: '.75rem' },
  searchIcon:    { position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa9a4', pointerEvents: 'none' },
  searchInput:   { width: '100%', padding: '9px 12px 9px 32px', fontSize: 13, background: '#eceae4', border: '1px solid #e0ded8', borderRadius: 8, color: '#2c2b2a', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  sortRow:       { display: 'flex', gap: 6, marginBottom: '1rem' },
  sortBtn:       { fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 6, border: '1px solid #e0ded8', background: 'transparent', color: '#9a9895', cursor: 'pointer' },
  sortBtnActive: { background: '#fdfcfb', color: '#1a1918', borderColor: '#d4d2cc' },

  noteGrid:    { columns: '220px', columnGap: '12px', marginTop: '.25rem' },
  noteCard:    { background: '#fdfcfb', border: '1px solid #e8e6e0', borderRadius: 12, padding: '1rem', marginBottom: '12px', breakInside: 'avoid', animation: 'pop .2s cubic-bezier(.34,1.56,.64,1) both', display: 'block' },
  noteCardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  noteTitle:   { fontSize: 14, fontWeight: 500, color: '#1a1918', lineHeight: 1.35, flex: 1, minWidth: 0 },
  noteMeta:    { fontSize: 11, color: '#aaa9a4', marginBottom: 6 },
  notePreview: { fontSize: 13, color: '#6a6865', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  btnIcon:     { background: 'none', border: '1px solid #e0ded8', borderRadius: 6, padding: '5px 7px', cursor: 'pointer', color: '#9a9895', display: 'flex', alignItems: 'center', transition: 'all .15s', flexShrink: 0 },
  btnDanger:   {},

  emptyState: { textAlign: 'center', padding: '3rem 1rem' },
  emptyIcon:  { fontSize: 32, color: '#c8c6c0', marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: 500, color: '#7a7874', marginBottom: 6 },
  emptySub:   { fontSize: 13, color: '#aaa9a4' },
  inlineLink: { background: 'none', border: 'none', color: '#1a1918', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', fontSize: 13, padding: 0 },

  formCard:    { background: '#fdfcfb', border: '1px solid #e8e6e0', borderRadius: 14, padding: '1.5rem' },
  formField:   { marginBottom: '1rem' },
  formLabel:   { display: 'block', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: .5, color: '#aaa9a4', marginBottom: 6 },
  formInput:   { width: '100%', fontSize: 14, color: '#2c2b2a', background: '#f0efe9', border: '1px solid #e0ded8', borderRadius: 8, padding: '10px 12px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  charCount:   { fontSize: 11, color: '#aaa9a4', textAlign: 'right', marginTop: 4 },
  btnPrimary:  { width: '100%', padding: 11, background: '#1a1918', color: '#fdfcfb', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: '.25rem' },
  btnDisabled: { opacity: .35, cursor: 'not-allowed' },

  statGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1.5rem' },
  statCard:     { background: '#eceae4', borderRadius: 8, padding: '.9rem', textAlign: 'center' },
  statNum:      { fontSize: 22, fontWeight: 500, color: '#1a1918' },
  statLbl:      { fontSize: 11, color: '#9a9895', marginTop: 2 },
  aboutSection: { marginBottom: '1.25rem' },
  aboutSectionCentered: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  aboutLabel:   { fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: .6, color: '#aaa9a4', marginBottom: '.6rem' },
  aboutLabelCentered: { textAlign: 'center' },
  aboutCard:    { background: '#fdfcfb', border: '1px solid #e8e6e0', borderRadius: 12, padding: '1.25rem' },
  aboutCardCentered: { width: 'min(900px, 100%)' },
  aboutText:    { fontSize: 14, color: '#6a6865', lineHeight: 1.7 },
  aboutTextCentered: { textAlign: 'center' },
  badgeRow:     { display: 'flex', flexWrap: 'wrap', gap: 6 },
  badge:        { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: '#eceae4', color: '#6a6865', border: '1px solid #e0ded8' },
  epMethod:     { padding: '8px 0', color: '#aaa9a4', width: 60, fontSize: 13 },
  epPath:       { padding: '8px 0', fontFamily: 'monospace', fontSize: 12, color: '#1a1918' },
  epDesc:       { padding: '8px 0', color: '#aaa9a4', textAlign: 'right', fontSize: 13 },
};