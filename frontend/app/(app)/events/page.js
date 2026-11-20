'use client';
import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import EventModal from '@/components/EventModal';
import { useToast } from '@/components/Toast';
import { api } from '@/lib/api';
import { CATEGORIES, catColor, formatTime, prettyDate, relativeDay, todayISO } from '@/lib/dates';

export default function EventsPage() {
  const [events, setEvents] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const load = useCallback(() => api('/events/').then(setEvents).catch((e) => showToast(e.message)), [showToast]);
  useEffect(() => { load(); }, [load]);

  async function remove(e) {
    if (!confirm(`Delete "${e.title}"?`)) return;
    await api(`/events/${e.id}/`, { method: 'DELETE' });
    showToast('Event deleted');
    load();
  }

  const today = todayISO();
  const list = (events || [])
    .filter((e) => (tab === 'upcoming' ? e.date >= today : e.date < today))
    .filter((e) => cat === 'all' || e.category === cat)
    .filter((e) => !query || `${e.title} ${e.description} ${e.location}`.toLowerCase().includes(query.toLowerCase()));
  if (tab === 'past') list.reverse();

  return (
    <div className="fade-in">
      <div className="page-head">
        <div><h1>Events</h1><p>All your plans in one place.</p></div>
        <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={17} /> New event</button>
      </div>

      <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div className="tabs">
          <button className={tab === 'upcoming' ? 'on' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
          <button className={tab === 'past' ? 'on' : ''} onClick={() => setTab('past')}>Past</button>
        </div>
        <select className="input" style={{ width: 'auto', padding: '.5rem 1rem', textTransform: 'capitalize' }} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input className="input" style={{ flex: 1, minWidth: 180, padding: '.5rem 1rem' }} placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {!events ? <div className="spinner" /> : list.length === 0 ? (
        <div className="card empty" style={{ padding: '3rem 1rem' }}>
          <CalendarDays size={40} color="var(--accent)" style={{ marginBottom: '.6rem' }} />
          <p>No {tab} events found.</p>
        </div>
      ) : (
        <div className="event-grid">
          {list.map((e) => (
            <div key={e.id} className="card event-card" style={{ '--c': catColor(e.category) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', alignItems: 'start' }}>
                <h4>{e.title}</h4>
                <span className="badge" style={{ color: catColor(e.category), background: `color-mix(in srgb, ${catColor(e.category)} 14%, transparent)` }}>{e.category}</span>
              </div>
              <div className="meta">
                <span><CalendarDays size={14} /> {prettyDate(e.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · <b style={{ color: 'var(--primary)' }}>{relativeDay(e.date)}</b></span>
                {e.start_time && <span><Clock size={14} /> {formatTime(e.start_time)}{e.end_time && ` – ${formatTime(e.end_time)}`}</span>}
                {e.location && <span><MapPin size={14} /> {e.location}</span>}
              </div>
              {e.description && <p className="desc">{e.description}</p>}
              <div className="actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setModal(e)}><Pencil size={14} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => remove(e)}><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <EventModal event={modal.id ? modal : null} onClose={() => setModal(null)}
          onSaved={(_, action) => { showToast(`Event ${action} 💖`); load(); }} />
      )}
      {toast}
    </div>
  );
}
