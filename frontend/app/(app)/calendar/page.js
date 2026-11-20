'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react';
import EventModal from '@/components/EventModal';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { DAY_SHORT, MONTHS, addDays, catColor, formatTime, prettyDate, startOfWeek, toISO, todayISO } from '@/lib/dates';

export default function CalendarPage() {
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState(todayISO());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const cells = useMemo(() => {
    const first = startOfWeek(new Date(month.y, month.m, 1));
    return Array.from({ length: 42 }, (_, i) => addDays(first, i));
  }, [month]);
  const start = toISO(cells[0]), end = toISO(cells[41]);

  const load = useCallback(async () => {
    try {
      const q = `?start=${start}&end=${end}`;
      const [e, t] = await Promise.all([api(`/events/${q}`), api(`/tasks/${q}`)]);
      setEvents(e); setTasks(t);
    } catch (err) { showToast(err.message); }
  }, [start, end, showToast]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with browser-only state / fetch on mount
  useEffect(() => { load(); }, [load]);

  const shift = (n) => setMonth(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const goToday = () => { setMonth({ y: now.getFullYear(), m: now.getMonth() }); setSelected(todayISO()); };

  const dayEvents = events.filter((e) => e.date === selected);
  const dayTasks = tasks.filter((t) => t.date === selected);

  async function toggle(t) {
    setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    await api(`/tasks/${t.id}/`, { method: 'PATCH', body: { completed: !t.completed } }).catch(load);
  }

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><h1>Calendar</h1><p>Tap a day to see its events and tasks.</p></div>
        <button className="btn btn-primary" onClick={() => setModal({ date: selected })}><Plus size={17} /> New event</button>
      </div>

      <div className="cal-layout">
        <div className="card">
          <div className="cal-head">
            <h3>{MONTHS[month.m]} {month.y}</h3>
            <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
              <button className="btn btn-ghost btn-sm" onClick={goToday}>Today</button>
              <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={20} /></button>
              <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div className="cal-grid">
            {DAY_SHORT.map((d) => <div key={d} className="cal-dow">{d}</div>)}
            {cells.map((d) => {
              const iso = toISO(d);
              const evs = events.filter((e) => e.date === iso);
              const tks = tasks.filter((t) => t.date === iso);
              const cls = ['cal-cell', d.getMonth() !== month.m && 'other', iso === todayISO() && 'today', iso === selected && 'selected'].filter(Boolean).join(' ');
              return (
                <button key={iso} className={cls} onClick={() => setSelected(iso)} onDoubleClick={() => setModal({ date: iso })}>
                  <span className="num">{d.getDate()}</span>
                  <div className="evs">
                    {evs.slice(0, 2).map((e) => <span key={e.id} className="ev-mini" style={{ background: catColor(e.category) }}>{e.title}</span>)}
                    {evs.length > 2 && <span className="more">+{evs.length - 2} more</span>}
                    {tks.length > 0 && <span className="more">☐ {tks.filter((t) => !t.completed).length} task(s)</span>}
                  </div>
                  <div className="dots">
                    {evs.slice(0, 3).map((e) => <span key={e.id} className="dot" style={{ background: catColor(e.category), width: 6, height: 6 }} />)}
                    {tks.length > 0 && <span className="dot" style={{ background: 'var(--muted)', width: 6, height: 6 }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <h3>{prettyDate(selected, { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <button className="icon-btn" onClick={() => setModal({ date: selected })} aria-label="Add event"><Plus size={19} /></button>
          </div>
          <div className="list">
            {dayEvents.length === 0 && dayTasks.length === 0 && <p className="empty">Nothing planned. Double-click a day (or tap +) to add an event 🌸</p>}
            {dayEvents.map((e) => (
              <button key={e.id} className="list-item" style={{ textAlign: 'left', borderLeft: `4px solid ${catColor(e.category)}` }} onClick={() => setModal(e)}>
                <div className="info">
                  <b>{e.title}</b>
                  <small>
                    <span className="badge" style={{ color: catColor(e.category), background: 'transparent', padding: 0 }}>{e.category}</span>
                    {e.start_time && <><Clock size={12} /> {formatTime(e.start_time)}{e.end_time && ` – ${formatTime(e.end_time)}`}</>}
                    {e.location && <><MapPin size={12} /> {e.location}</>}
                  </small>
                </div>
              </button>
            ))}
            {dayTasks.length > 0 && <div className="notes-label" style={{ marginTop: '.6rem' }}>Tasks</div>}
            {dayTasks.map((t) => (
              <div key={t.id} className="list-item">
                <button className={`check ${t.completed ? 'on' : ''}`} onClick={() => toggle(t)} aria-label="Toggle done">{t.completed && '✓'}</button>
                <div className="info"><b className={t.completed ? 'done-text' : ''}>{t.title}</b><small>{t.priority} priority</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <EventModal event={modal.id ? modal : null} defaultDate={modal.date} onClose={() => setModal(null)}
          onSaved={(_, action) => { showToast(`Event ${action} 💖`); load(); }} />
      )}
      {toast}
    </div>
  );
}
