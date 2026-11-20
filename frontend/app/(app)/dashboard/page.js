'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  AlarmClock, CalendarDays, CalendarHeart, CircleCheck, Clock, Flame, ListTodo, MapPin, NotebookPen, Plus,
} from 'lucide-react';
import EventModal from '@/components/EventModal';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { DAY_SHORT, catColor, formatTime, fromISO, greeting, prettyDate, relativeDay } from '@/lib/dates';

function Stat({ icon: Icon, num, label, color }) {
  return (
    <div className="card stat">
      <div className="ic" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}><Icon size={22} /></div>
      <div><div className="num">{num}</div><div className="lbl">{label}</div></div>
    </div>
  );
}

function Ring({ pct }) {
  const r = 50, c = 2 * Math.PI * r;
  return (
    <div className="progress-ring">
      <svg width="120" height="120">
        <circle cx="60" cy="60" r={r} stroke="var(--surface-3)" strokeWidth="12" fill="none" />
        <circle cx="60" cy="60" r={r} stroke="url(#pg)" strokeWidth="12" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} style={{ transition: 'stroke-dashoffset .8s ease' }} />
        <defs>
          <linearGradient id="pg" x1="0" x2="1"><stop offset="0" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--primary)" /></linearGradient>
        </defs>
      </svg>
      <div className="pct">{pct}%</div>
    </div>
  );
}

function DatePill({ iso }) {
  const d = fromISO(iso);
  return (
    <div className="date-pill">
      <b>{d.getDate()}</b>
      <span>{d.toLocaleDateString(undefined, { month: 'short' })}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [modal, setModal] = useState(null);
  const [toast, showToast] = useToast();

  const load = useCallback(() => api('/dashboard/').then(setData).catch((e) => showToast(e.message)), [showToast]);
  useEffect(() => { load(); }, [load]);

  async function toggleTask(t) {
    await api(`/tasks/${t.id}/`, { method: 'PATCH', body: { completed: !t.completed } });
    load();
  }

  if (!data) return <div className="spinner" />;
  const { stats } = data;
  const maxBar = Math.max(1, ...data.week_breakdown.map((d) => d.total));
  const name = user.first_name || user.username;

  return (
    <div className="fade-in">
      <section className="hero">
        <h1>{greeting()}, {name}! 🌷</h1>
        <p>
          {data.today_tasks.length
            ? `You have ${data.today_tasks.filter((t) => !t.completed).length} task(s) left and ${data.today_events.length} event(s) today.`
            : 'Nothing planned for today yet — a fresh page to fill with lovely plans.'}
        </p>
        <div className="hero-actions">
          <Link href="/week" className="btn btn-white"><NotebookPen size={17} /> Open weekly planner</Link>
          <button className="btn btn-glass" onClick={() => setModal({})}><Plus size={17} /> New event</button>
        </div>
      </section>

      <div className="stats">
        <Stat icon={CalendarHeart} num={stats.upcoming_events} label="Upcoming events" color="var(--cat-personal)" />
        <Stat icon={ListTodo} num={stats.pending_tasks} label="Pending tasks" color="var(--cat-work)" />
        <Stat icon={CircleCheck} num={stats.completed_tasks} label="Completed tasks" color="var(--success)" />
        <Stat icon={AlarmClock} num={stats.overdue_tasks} label="Overdue tasks" color="var(--danger)" />
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <div className="card">
            <div className="card-title"><h3><Flame size={19} color="var(--primary)" /> This week&apos;s progress</h3></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <Ring pct={stats.week_progress} />
              <div className="week-bars">
                {data.week_breakdown.map((d, i) => (
                  <div key={d.date} className={`bar-col ${d.date === data.today ? 'today' : ''}`} title={`${d.done}/${d.total} done`}>
                    <div className="bar-track">
                      <div className="bar-total" style={{ height: `${(d.total / maxBar) * 100}%` }}>
                        <div className="bar-done" style={{ height: d.total ? `${(d.done / d.total) * 100}%` : 0 }} />
                      </div>
                    </div>
                    <span className="bar-lbl">{DAY_SHORT[i][0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3><CalendarDays size={19} color="var(--primary)" /> Upcoming events</h3>
              <Link href="/events" className="btn btn-ghost btn-sm">See all</Link>
            </div>
            <div className="list">
              {data.upcoming_events.length === 0 && <p className="empty">No upcoming events. Add one! 🎀</p>}
              {data.upcoming_events.map((e) => (
                <button key={e.id} className="list-item" style={{ textAlign: 'left' }} onClick={() => setModal(e)}>
                  <DatePill iso={e.date} />
                  <div className="info">
                    <b>{e.title}</b>
                    <small>
                      <span className="dot" style={{ background: catColor(e.category) }} /> {e.category}
                      {e.start_time && <><Clock size={12} /> {formatTime(e.start_time)}</>}
                      {e.location && <><MapPin size={12} /> {e.location}</>}
                    </small>
                  </div>
                  <span className="badge">{relativeDay(e.date)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-col">
          <div className="card">
            <div className="card-title"><h3><ListTodo size={19} color="var(--primary)" /> Upcoming tasks</h3><Link href="/week" className="btn btn-ghost btn-sm">Planner</Link></div>
            <div className="list">
              {data.upcoming_tasks.length === 0 && <p className="empty">All caught up! ✨</p>}
              {data.upcoming_tasks.map((t) => (
                <div key={t.id} className="list-item">
                  <button className={`check ${t.completed ? 'on' : ''}`} onClick={() => toggleTask(t)} aria-label="Toggle done">
                    {t.completed && <CircleCheck size={14} />}
                  </button>
                  <div className="info">
                    <b className={t.completed ? 'done-text' : ''}>{t.title}</b>
                    <small><span className={`prio ${t.priority}`} style={{ marginTop: 0 }} /> {t.priority} · {relativeDay(t.date)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.overdue_tasks.length > 0 && (
            <div className="card">
              <div className="card-title"><h3><AlarmClock size={19} color="var(--danger)" /> Overdue</h3></div>
              <div className="list">
                {data.overdue_tasks.map((t) => (
                  <div key={t.id} className="list-item">
                    <button className="check" onClick={() => toggleTask(t)} aria-label="Mark done" />
                    <div className="info"><b>{t.title}</b><small>Was due {prettyDate(t.date)}</small></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title"><h3><CalendarHeart size={19} color="var(--primary)" /> Events by category</h3></div>
            {Object.keys(data.events_by_category).length === 0 ? <p className="empty">No upcoming events yet.</p> : (
              <div className="list">
                {Object.entries(data.events_by_category).map(([cat, n]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                    <span className="dot" style={{ background: catColor(cat), width: 10, height: 10 }} />
                    <span style={{ textTransform: 'capitalize', width: 80, fontSize: '.88rem' }}>{cat}</span>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${(n / stats.upcoming_events) * 100}%`, background: catColor(cat) }} /></div>
                    <b style={{ fontSize: '.88rem', width: 20, textAlign: 'right' }}>{n}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <EventModal event={modal.id ? modal : null} onClose={() => setModal(null)}
          onSaved={(_, action) => { showToast(`Event ${action} 💖`); load(); }} />
      )}
      {toast}
    </div>
  );
}
