import { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { BottomSheet, DragHandle, ConfirmDialog } from './Modal';
import { getTodayDate, formatTimeHHMMSS, copyToSheets, shareWorkout } from '../utils/storage';
import { getPresetColor } from '../utils/theme';

// Weekly calendar strip
function WeekCalendar({ workouts, presets, weekOffset, setWeekOffset, dark, onDayClick }) {
  const now = new Date();
  const dow = now.getDay();
  const toMon = dow === 0 ? 6 : dow - 1;
  const thisMon = new Date(now);
  thisMon.setDate(now.getDate() - toMon);
  thisMon.setHours(0, 0, 0, 0);

  const dispMon = new Date(thisMon);
  dispMon.setDate(thisMon.getDate() + weekOffset * 7);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(dispMon);
    d.setDate(dispMon.getDate() + i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({
      date: d, dateStr: ds,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      workout: workouts.find(w => w.date === ds),
      isToday: ds === getTodayDate()
    });
  }

  const isThis = weekOffset === 0;
  const isLast = weekOffset === -1;
  const label = isThis ? 'This Week' : isLast ? 'Last Week'
    : `${days[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${days[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const scrollToWeek = (offset) => {
    setTimeout(() => {
      const mon = new Date(thisMon);
      mon.setDate(thisMon.getDate() + offset * 7);
      const key = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
      const el = document.getElementById(`week-${key}`);
      const cal = document.querySelector('[data-calendar]');
      if (el && cal) {
        const off = el.getBoundingClientRect().top - cal.getBoundingClientRect().bottom - 12;
        window.scrollBy({ top: off, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setWeekOffset(p => p - 1); scrollToWeek(weekOffset - 1); }}
          className={`p-2 rounded-lg ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
          <Icons.ChevronLeft />
        </button>
        <div className="font-bold text-lg">{label}</div>
        <button onClick={() => { setWeekOffset(p => p + 1); scrollToWeek(weekOffset + 1); }}
          className={`p-2 rounded-lg ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
          <Icons.ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(({ dateStr, dayName, dayNum, workout, isToday }) => {
          const color = workout ? getPresetColor(presets, workout.location) : null;
          return (
            <button key={dateStr}
              onClick={() => workout && onDayClick(dateStr)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${workout ? `${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer` : `${dark ? 'bg-gray-800' : 'bg-gray-50'} opacity-60`}`}>
              <div className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{dayName}</div>
              <div className={`text-lg font-bold ${isToday ? 'text-blue-500' : ''}`}>{dayNum}</div>
              {workout ? <div className={`w-3 h-3 rounded-full mt-1 ${color.dot}`}></div> : <div className="w-3 h-3 mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Day detail bottom sheet
function DayModal({ open, onClose, dateStr, workouts, presets, proteinEntries, dark, onEdit, onDelete, onToast }) {
  if (!open || !dateStr) return null;
  const w = workouts.find(w => w.date === dateStr);
  if (!w) return null;

  const [yr, mo, dy] = dateStr.split('-');
  const dateObj = new Date(parseInt(yr), parseInt(mo) - 1, parseInt(dy));
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const wIdx = workouts.findIndex(x => x.date === dateStr);
  const color = getPresetColor(presets, w.location);
  const dayProtein = proteinEntries.filter(e => e.date === dateStr).reduce((s, e) => s + e.grams, 0);

  // Build metadata pieces — only show values that exist
  const metaParts = [];
  metaParts.push(`${w.exercises.length} exercise${w.exercises.length !== 1 ? 's' : ''}`);
  if (w.structure === 'pairs') metaParts.push(`Pairs ${w.structureDuration || 3}'`);
  else if (w.structure === 'circuit') metaParts.push('Circuit');
  if (w.elapsedTime) metaParts.push(formatTimeHHMMSS(w.elapsedTime));
  if (dayProtein > 0) metaParts.push(`${dayProtein}g protein`);

  const handleCopy = () => { copyToSheets(w); onToast('Workout copied to clipboard!'); onClose(); };
  const handleShare = async () => {
    const r = await shareWorkout(w);
    if (r === 'clipboard') onToast('Copied to clipboard!');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className={dark ? 'bg-gray-800' : 'bg-white'}>
        <DragHandle dark={dark} />
        <div className="p-4">
          {/* Header — stacked layout so nothing truncates */}
          <div className={`mb-4 p-3 rounded-lg border-l-4 ${color.border} ${dark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg leading-tight">
                  {dayOfWeek}, {mo}/{dy}/{yr.slice(2)}
                  {w.location && <span className="opacity-70"> · {w.location}</span>}
                </h3>
                <div className={`text-xs mt-1.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metaParts.join('  ·  ')}
                </div>
              </div>
              <button onClick={onClose} className={`flex-shrink-0 p-1 ${dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}><Icons.X /></button>
            </div>
          </div>

          {/* Exercises */}
          <div className={`rounded-lg overflow-hidden mb-4 ${dark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
            {w.exercises.map((ex, ei) => {
              const tot = ex.sets.reduce((s, x) => s + (x.reps || 0), 0);
              return (
                <div key={ei} className={`flex items-center justify-between p-3 ${ei < w.exercises.length - 1 ? (dark ? 'border-b border-gray-700' : 'border-b border-gray-200') : ''}`}>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{ex.name}</div>
                    {ex.notes && <div className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-gray-500'}`}>{ex.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ex.sets.map((s, si) => <span key={si}>{s.reps}{si < ex.sets.length - 1 && <span className="mx-1">·</span>}</span>)}
                    </div>
                    <div className={`font-bold text-sm min-w-[40px] text-right ${dark ? 'text-white' : 'text-gray-900'}`}>{tot}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {w.notes && (
            <div className={`p-3 rounded-lg mb-4 ${dark ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className={`text-xs font-semibold mb-1 ${dark ? 'text-yellow-500' : 'text-yellow-700'}`}>NOTES</div>
              <div className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>{w.notes}</div>
            </div>
          )}

          {/* Actions — added bottom padding for safe area */}
          <div className={`grid grid-cols-4 gap-2 pt-3 pb-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
            {[
              { icon: <Icons.Copy />, label: 'Copy', color: 'text-blue-400', fn: handleCopy },
              { icon: <Icons.Share />, label: 'Share', color: 'text-purple-400', fn: handleShare },
              { icon: <Icons.EditPen />, label: 'Edit', color: 'text-green-400', fn: () => { onEdit(wIdx); onClose(); } },
              { icon: <Icons.Trash />, label: 'Delete', color: 'text-red-400', fn: () => { onDelete(wIdx); onClose(); } },
            ].map(({ icon, label, color, fn }) => (
              <button key={label} onClick={fn}
                className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                <div className={`w-5 h-5 flex items-center justify-center ${color}`}>{icon}</div>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}

// Workout feed grouped by week
function WorkoutFeed({ workouts, presets, proteinEntries, search, dark, onDayClick }) {
  const getWeekKey = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const dow = date.getDay();
    const toMon = dow === 0 ? 6 : dow - 1;
    const mon = new Date(date);
    mon.setDate(date.getDate() - toMon);
    return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
  };

  const getWeekLabel = (monStr) => {
    const [y, m, d] = monStr.split('-');
    const mon = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const now = new Date();
    const dow = now.getDay();
    const toMon = dow === 0 ? 6 : dow - 1;
    const curMon = new Date(now); curMon.setDate(now.getDate() - toMon); curMon.setHours(0, 0, 0, 0);
    const lastMon = new Date(curMon); lastMon.setDate(curMon.getDate() - 7);
    if (mon.getTime() === curMon.getTime()) return 'THIS WEEK';
    if (mon.getTime() === lastMon.getTime()) return 'LAST WEEK';
    const sm = mon.toLocaleDateString('en-US', { month: 'short' });
    const em = sun.toLocaleDateString('en-US', { month: 'short' });
    return sm === em ? `${sm.toUpperCase()} ${mon.getDate()}-${sun.getDate()}` : `${sm.toUpperCase()} ${mon.getDate()} - ${em.toUpperCase()} ${sun.getDate()}`;
  };

  let filtered = [...workouts];
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(w =>
      w.date.includes(q) || w.location?.toLowerCase().includes(q) ||
      w.exercises.some(e => e.name.toLowerCase().includes(q)) ||
      w.notes?.toLowerCase().includes(q)
    );
  }

  const groups = {};
  filtered.forEach(w => {
    const k = getWeekKey(w.date);
    if (!groups[k]) groups[k] = [];
    groups[k].push(w);
  });

  const weeks = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  if (!weeks.length) return <div className={`text-center py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>{search ? 'No workouts found' : 'No workouts yet'}</div>;

  return (
    <div className="space-y-3 mt-2">
      {weeks.map(wk => (
        <div key={wk}>
          <div id={`week-${wk}`} className={`py-2 px-3 mb-3 mt-2 rounded-lg font-bold text-xs tracking-wider ${dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
            {getWeekLabel(wk)}
          </div>
          <div className="space-y-3">
            {groups[wk].sort((a, b) => b.date.localeCompare(a.date)).map((w, i) => {
              const [yr, mo, dy] = w.date.split('-');
              const dateObj = new Date(parseInt(yr), parseInt(mo) - 1, parseInt(dy));
              const dow = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
              const color = getPresetColor(presets, w.location);
              const dayP = proteinEntries.filter(e => e.date === w.date).reduce((s, e) => s + e.grams, 0);
              return (
                <button key={`${w.date}-${i}`} onClick={() => onDayClick(w.date)}
                  className={`w-full ${dark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-xl p-4 text-left transition-colors shadow-md border-l-4 ${color.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-bold text-base">{dow} {mo}/{dy}/{yr.slice(2)}{w.location && <span className="ml-2 text-base font-bold opacity-70">· {w.location}</span>}</div>
                      <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                        {w.structure && ` · ${w.structure === 'pairs' ? `Pairs ${w.structureDuration || 3}'` : 'Circuit'}`}
                        {w.elapsedTime && ` · ${formatTimeHHMMSS(w.elapsedTime)}`}
                        {dayP > 0 && ` · ${dayP}g`}
                      </div>
                    </div>
                    <Icons.ChevronRight />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main HomeView
export default function HomeView({ workouts, presets, proteinEntries, dark, theme, onEdit, onDelete, onToast }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDay, setShowDay] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);

  // Sync week offset on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headers = document.querySelectorAll('[id^="week-"]');
      const trigger = 320;
      let closest = null, dist = Infinity;
      headers.forEach(h => {
        const r = h.getBoundingClientRect();
        const d = Math.abs(r.top - trigger);
        if (r.top <= trigger + 100 && d < dist) { dist = d; closest = h; }
      });
      if (closest) {
        const [y, m, d] = closest.id.replace('week-', '').split('-');
        const targetMon = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const now = new Date();
        const dow = now.getDay();
        const toMon = dow === 0 ? 6 : dow - 1;
        const thisMon = new Date(now); thisMon.setDate(now.getDate() - toMon); thisMon.setHours(0, 0, 0, 0);
        const diffDays = Math.round((targetMon - thisMon) / (1000 * 60 * 60 * 24));
        setWeekOffset(Math.round(diffDays / 7));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [workouts.length]);

  return (
    <div className="pb-32 relative">
      {/* Sticky calendar — uses theme bg + shadow to fully hide content scrolling behind it */}
      <div data-calendar className={`fixed left-0 right-0 z-10 pt-2 pb-2 px-3`}
        style={{
          top: '52px',
          backgroundColor: 'inherit',
        }}>
        {/* Solid background layer to prevent bleed-through */}
        <div className={`absolute inset-0 ${theme.bg}`} style={{ zIndex: -1 }} />
        <div className="max-w-4xl mx-auto">
          <WeekCalendar workouts={workouts} presets={presets} weekOffset={weekOffset} setWeekOffset={setWeekOffset}
            dark={dark} onDayClick={(ds) => { setSelectedDay(ds); setShowDay(true); }} />
        </div>
        {/* Bottom fade edge so content doesn't just hard-cut */}
        <div className={`absolute left-0 right-0 h-3 pointer-events-none`}
          style={{
            bottom: '-12px',
            background: dark
              ? 'linear-gradient(to bottom, rgb(17,24,39), transparent)'
              : 'linear-gradient(to bottom, rgb(249,250,251), transparent)'
          }} />
      </div>
      <div className="h-[180px]"></div>

      {/* Search */}
      {searchOpen && (
        <div className="relative mb-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search workouts..."
            className={`w-full ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl px-4 py-3 pl-10 text-sm shadow-sm`} autoFocus
            onBlur={() => { if (!search) setSearchOpen(false); }} />
          <div className="absolute left-3 top-3.5"><Icons.Search /></div>
          {search && <button onClick={() => { setSearch(''); setSearchOpen(false); }} className="absolute right-3 top-3"><Icons.X /></button>}
        </div>
      )}

      {/* Feed */}
      <WorkoutFeed workouts={workouts} presets={presets} proteinEntries={proteinEntries} search={search} dark={dark}
        onDayClick={(ds) => { setSelectedDay(ds); setShowDay(true); }} />

      {/* Day modal */}
      <DayModal open={showDay} onClose={() => setShowDay(false)} dateStr={selectedDay}
        workouts={workouts} presets={presets} proteinEntries={proteinEntries} dark={dark}
        onEdit={onEdit} onDelete={(idx) => setDeleteIdx(idx)} onToast={onToast} />

      {/* Delete confirm */}
      <ConfirmDialog open={deleteIdx !== null} title="Delete Workout?" message="Are you sure? This cannot be undone."
        confirmText="Delete" dark={dark} onConfirm={() => { onDelete(deleteIdx); setDeleteIdx(null); }} onCancel={() => setDeleteIdx(null)} />
    </div>
  );
}

// Export search toggle for header
HomeView.SearchButton = function SearchButton({ searchOpen, setSearchOpen, dark }) {
  return (
    <button onClick={() => setSearchOpen(!searchOpen)}
      className={`${dark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} p-2`}>
      <Icons.Search />
    </button>
  );
};
