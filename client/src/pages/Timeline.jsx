import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Filter } from 'lucide-react';
import API from '../services/api';

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {
      const res = await API.get('/dashboard');
      setEvents(res.data.recentActivity || []);
    } catch (err) {
      console.error('Failed to load timeline events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 font-sans text-xs text-slate-500 dark:text-slate-400">Loading custody timeline events...</div>;
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Title Bar with Serif Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-3xl font-medium text-slate-900 dark:text-slate-100 tracking-tight">Timeline</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chronological sequence of custody events logged for every evidence record.</p>
        </div>
      </div>

      {/* Vertical Stepped Log */}
      <div className="app-card max-w-3xl">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
          {events.map((evt, idx) => (
            <div key={idx} className="relative group space-y-1">
              {/* Small colored dot per entry */}
              <div className={`absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full ${
                evt.state === 'success' ? 'bg-emerald-600' : 'bg-amber-600'
              }`}></div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 capitalize">{evt.event}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{new Date(evt.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{evt.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono pt-1">
                <span>Actor: {evt.actor}</span>
                <span>·</span>
                <span>Evidence ID: {evt.evidenceId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
