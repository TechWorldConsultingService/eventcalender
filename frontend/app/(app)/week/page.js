'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import EventModal from '@/components/EventModal';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { DAY_NAMES, DAY_SHORT, addDays, catColor, formatTime, startOfWeek, toISO, todayISO } from '@/lib/dates';

const PRIORITIES = ['low', 'medium', 'high'];

function DayCard({ iso, index, tasks, events, note, onAddTask, onToggle, onDelete, onNote, onEvent, saved }) {
  const [text, setText] = useState('');
  const [prio, setPrio] = useState('medium');
  const isToday = iso === todayISO();
  const d = new Date(iso + 'T00:00:00');
  const done = tasks.filter((t) => t.completed).length;

  function submit(e) {
    e.preventDefault();
    const title = text.trim();
    if (!title) return;
    onAddTask(iso, title, prio);
    setText('');
  }

  return (
    <article id={`day-${iso}`} className={`card day-card ${isToday ? 'today' : ''}`}>
      <header className="day-head">
        <div>
          <div className="dname">{DAY_NAMES[index]}{isToday && ' · Today'}</div>
          <div className="ddate">{d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
        </div>
        <span className="count">{done}/{tasks.length}</span>
      </header>

      <div className="day-body">
        {events.length > 0 && (
          <div className="day-events">
            {events.map((e) => (
              <button key={e.id} className="ev-chip" style={{ borderLeftColor: catColor(e.category) }} onClick={() => onEvent(e)}>
                <span className="dot" style={{ background: catColor(e.category) }} />
                <span>{e.title}</span>
                {e.start_time && <time>{formatTime(e.start_time)}</time>}
              </button>
            ))}
          </div>
        )}

        <div>
          {tasks.map((t) => (
            <div key={t.id} className="task-row">
              <button className={`check ${t.completed ? 'on' : ''}`} onClick={() => onToggle(t)} aria-label="Toggle done">
                {t.completed && <Check size={13} strokeWidth={3} />}
              </button>
              <span className={`prio ${t.priority}`} title={`${t.priority} priority`} />
              <span className={`t-title ${t.completed ? 'done-text' : ''}`}>{t.title}</span>
              <button className="t-del" onClick={() => onDelete(t)} aria-label="Delete task"><Trash2 size={14} /></button>
            </div>
          ))}
          <form className="add-task" onSubmit={submit}>
            <button
              type="button"
              className={`prio ${prio}`}
              style={{ width: 12, height: 12, marginTop: 0 }}
              title={`Priority: ${prio} (tap to change)`}
              onClick={() => setPrio(PRIORITIES[(PRIORITIES.indexOf(prio) + 1) % 3])}
            />
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a task…" aria-label={`Add task for ${DAY_NAMES[index]}`} />
            <button className="plus" aria-label="Add"><Plus size={18} /></button>
          </form>
        </div>

        <div className="notes-label">
          <span>✎ Notes & to-dos</span>
          {saved && <span className="saved">saved ✓</span>}
        </div>
        <textarea
          className="lined"
          value={note}
          onChange={(e) => onNote(iso, e.target.value)}
          placeholder="Write your to-dos here…"
        />
      </div>
    </article>
  );
}

export default function WeekPlanner() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState({});
  const [savedDay, setSavedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();
  const timers = useRef({});

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => toISO(addDays(weekStart, i))), [weekStart]);
  const start = days[0], end = days[6];

  const load = useCallback(async () => {
    try {
      const q = `?start=${start}&end=${end}`;
      const [t, e, n] = await Promise.all([api(`/tasks/${q}`), api(`/events/${q}`), api(`/notes/${q}`)]);
      setTasks(t); setEvents(e);
      setNotes(Object.fromEntries(n.map((x) => [x.date, x.content])));
    } catch (err) { showToast(err.message); }
    finally { setLoading(false); }
  }, [start, end, showToast]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with browser-only state / fetch on mount
  useEffect(() => { setLoading(true); load(); }, [load]);

  // On first load scroll to today on phones
  useEffect(() => {
    if (loading) return;
    const el = document.getElementById(`day-${todayISO()}`);
    if (el && window.innerWidth < 860) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [loading]);

  async function addTask(date, title, priority) {
    try {
      const t = await api('/tasks/', { method: 'POST', body: { date, title, priority } });
      setTasks((ts) => [...ts, t]);
    } catch (err) { showToast(err.message); }
  }

  async function toggle(t) {
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    try { await api(`/tasks/${t.id}/`, { method: 'PATCH', body: { completed: !t.completed } }); }
    catch (err) { showToast(err.message); load(); }
  }

  async function remove(t) {
    setTasks((ts) => ts.filter((x) => x.id !== t.id));
    try { await api(`/tasks/${t.id}/`, { method: 'DELETE' }); showToast('Task removed'); }
    catch (err) { showToast(err.message); load(); }
  }

  function changeNote(date, content) {
    setNotes((n) => ({ ...n, [date]: content }));
    setSavedDay(null);
    clearTimeout(timers.current[date]);
    timers.current[date] = setTimeout(async () => {
      try {
        await api('/notes/', { method: 'POST', body: { date, content } });
        setSavedDay(date);
        setTimeout(() => setSavedDay((d) => (d === date ? null : d)), 1500);
      } catch (err) { showToast(err.message); }
    }, 700);
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const rangeLabel = `${addDays(weekStart, 0).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${addDays(weekStart, 6).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const isThisWeek = days.includes(todayISO());

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <h1>Weekly Planner</h1>
          <p>Write your tasks under each day — notes save automatically.</p>
        </div>
        <div className="week-toolbar">
          <button className="icon-btn btn-outline" onClick={() => setWeekStart((w) => addDays(w, -7))} aria-label="Previous week"><ChevronLeft size={20} /></button>
          <span className="week-range">{rangeLabel}</span>
          <button className="icon-btn btn-outline" onClick={() => setWeekStart((w) => addDays(w, 7))} aria-label="Next week"><ChevronRight size={20} /></button>
          {!isThisWeek && <button className="btn btn-ghost btn-sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>This week</button>}
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ date: isThisWeek ? todayISO() : start })}><Plus size={16} /> Event</button>
        </div>
      </div>

      <div className="card week-progress">
        <b style={{ fontSize: '.88rem', whiteSpace: 'nowrap' }}>Week progress</b>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <span style={{ fontSize: '.85rem', color: 'var(--text-soft)', whiteSpace: 'nowrap' }}>{done}/{total} · {pct}%</span>
      </div>

      <div className="day-chips">
        {days.map((iso, i) => {
          const has = tasks.some((t) => t.date === iso) || events.some((e) => e.date === iso);
          return (
            <button key={iso} className={iso === todayISO() ? 'today' : ''}
              onClick={() => document.getElementById(`day-${iso}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              {DAY_SHORT[i]}<b>{Number(iso.slice(8))}</b>{has && <span className="has" />}
            </button>
          );
        })}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="week-grid">
          {days.map((iso, i) => (
            <DayCard
              key={iso}
              iso={iso}
              index={i}
              tasks={tasks.filter((t) => t.date === iso)}
              events={events.filter((e) => e.date === iso)}
              note={notes[iso] || ''}
              saved={savedDay === iso}
              onAddTask={addTask}
              onToggle={toggle}
              onDelete={remove}
              onNote={changeNote}
              onEvent={(e) => setModal(e)}
            />
          ))}
        </div>
      )}

      {modal && (
        <EventModal event={modal.id ? modal : null} defaultDate={modal.date} onClose={() => setModal(null)}
          onSaved={(_, action) => { showToast(`Event ${action} 💖`); load(); }} />
      )}
      {toast}
    </div>
  );
}
