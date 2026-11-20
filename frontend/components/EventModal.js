'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import { api } from '@/lib/api';
import { CATEGORIES, catColor, todayISO } from '@/lib/dates';

const EMPTY = { title: '', description: '', location: '', date: '', start_time: '', end_time: '', category: 'personal' };

export default function EventModal({ event, defaultDate, onClose, onSaved }) {
  const editing = Boolean(event?.id);
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    date: defaultDate || todayISO(),
    ...(event || {}),
    start_time: event?.start_time?.slice(0, 5) || '',
    end_time: event?.end_time?.slice(0, 5) || '',
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const body = {
      title: form.title, description: form.description, location: form.location, date: form.date,
      category: form.category, start_time: form.start_time || null, end_time: form.end_time || null,
    };
    try {
      const saved = editing
        ? await api(`/events/${event.id}/`, { method: 'PUT', body })
        : await api('/events/', { method: 'POST', body });
      onSaved?.(saved, editing ? 'updated' : 'created');
      onClose();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function remove() {
    if (!confirm('Delete this event?')) return;
    setBusy(true);
    try {
      await api(`/events/${event.id}/`, { method: 'DELETE' });
      onSaved?.(event, 'deleted');
      onClose();
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title={editing ? 'Edit event' : 'New event ✨'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Title</label>
          <input className="input" required value={form.title} onChange={set('title')} placeholder="e.g. Coffee with Sita" autoFocus />
        </div>
        <div className="field">
          <label>Category</label>
          <div className="cat-pick">
            {CATEGORIES.map((c) => (
              <button type="button" key={c} style={{ '--c': catColor(c) }} className={form.category === c ? 'on' : ''}
                onClick={() => setForm((f) => ({ ...f, category: c }))}>
                <span className="dot" style={{ background: catColor(c) }} />{c}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" required value={form.date} onChange={set('date')} />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Start time</label>
            <input className="input" type="time" value={form.start_time} onChange={set('start_time')} />
          </div>
          <div className="field">
            <label>End time</label>
            <input className="input" type="time" value={form.end_time} onChange={set('end_time')} />
          </div>
        </div>
        <div className="field">
          <label>Location</label>
          <input className="input" value={form.location} onChange={set('location')} placeholder="Optional" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea className="input" value={form.description} onChange={set('description')} placeholder="Add details…" />
        </div>
        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          {editing && (
            <button type="button" className="btn btn-danger" onClick={remove} disabled={busy} style={{ marginRight: 'auto' }}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create event'}</button>
        </div>
      </form>
    </Modal>
  );
}
