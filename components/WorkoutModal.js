import { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { ConfirmDialog, BottomSheet, DragHandle } from './Modal';
import { getTodayDate, formatTime, formatTimeHHMMSS } from '../utils/storage';
import { getPresetColor } from '../utils/theme';

// Preset selector (Quick Add with 3 tabs)
export function PresetSelector({ open, onClose, presets, dark, onSelectPreset, proteinEntries, weightEntries, onProteinAdd, onWeightAdd, onToast }) {
  const [tab, setTab] = useState('workout');
  if (!open) return null;

  const tabs = [
    { id: 'workout', label: '🏋️ Workout', color: 'blue' },
    { id: 'protein', label: '🥩 Protein', color: 'green' },
    { id: 'weight', label: '⚖️ Weight', color: 'purple' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className={`${dark ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h3 className="font-bold text-lg">Quick Add</h3>
            <button onClick={onClose}><Icons.X /></button>
          </div>
          <div className="flex">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 ${tab === t.id
                  ? `border-${t.color}-500 text-${t.color}-500`
                  : `border-transparent ${dark ? 'text-gray-400' : 'text-gray-600'}`}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'workout' && (
            <div className="space-y-2">
              {presets.filter(p => p.includeInMenu !== false).map((p, i) => {
                const color = getPresetColor(presets, p.name);
                return (
                  <button key={i} onClick={() => { onSelectPreset(p); onClose(); }}
                    className={`w-full ${dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} p-4 rounded-lg text-left border-l-4 ${color.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${color.dot}`}></div>
                      <div className="font-medium text-base">{p.name}</div>
                    </div>
                    {p.name === 'Manual'
                      ? <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'} ml-5`}>Build your own</div>
                      : p.exercises.length > 0 && <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'} ml-5`}>{p.exercises.length} exercises</div>
                    }
                  </button>
                );
              })}
              {presets.length === 0 && <div className="text-center text-gray-500 py-8 text-sm">No presets yet. Add some in Settings!</div>}
            </div>
          )}
          {tab === 'protein' && (
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target), g = fd.get('grams'), f = fd.get('food');
              if (g && parseInt(g) > 0) { onProteinAdd({ date: getTodayDate(), grams: parseInt(g), food: f || 'Food', timestamp: Date.now() }); onClose(); onToast(`Added ${g}g protein`); }
            }} className="space-y-4">
              <div><label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Grams of Protein</label>
                <input type="number" name="grams" placeholder="45" autoFocus required min="1" className={`w-full ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-4 py-3 text-lg font-bold`} /></div>
              <div><label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>What did you eat?</label>
                <input type="text" name="food" placeholder="Chicken breast..." className={`w-full ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-4 py-3`} /></div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-bold text-white">Add Protein</button>
            </form>
          )}
          {tab === 'weight' && (
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target), w = fd.get('weight'), n = fd.get('notes');
              if (w && parseFloat(w) > 0) { onWeightAdd({ date: getTodayDate(), weight: parseFloat(w), notes: n || '' }); onClose(); onToast(`Logged ${w} lbs`); }
            }} className="space-y-4">
              <div><label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Weight (lbs)</label>
                <input type="number" name="weight" step="0.1" placeholder="185.5" autoFocus required min="1" className={`w-full ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-4 py-3 text-lg font-bold`} /></div>
              <div><label className={`block text-sm font-semibold mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Notes (optional)</label>
                <input type="text" name="notes" placeholder="Morning weigh-in..." className={`w-full ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-4 py-3`} /></div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-bold text-white">Log Weight</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// History reference modal
function HistoryModal({ open, onClose, workouts, presets, dark }) {
  if (!open) return null;
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className={dark ? 'bg-gray-800' : 'bg-white'}>
        <DragHandle dark={dark} />
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="font-bold text-lg">Recent Workouts</h3>
          <button onClick={onClose}><Icons.X /></button>
        </div>
        <div className="p-4 space-y-2">
          {[...workouts].sort((a, b) => b.date.localeCompare(a.date)).map((w, i) => {
            const [y, m, d] = w.date.split('-');
            const dow = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', { weekday: 'short' });
            const c = getPresetColor(presets, w.location);
            return (
              <div key={i} className={`${c.bg} rounded-lg p-3 border-l-4 ${c.border}`}>
                <div className="font-bold text-sm mb-2">{dow} {m}/{d}{w.location && <span className="ml-2 text-xs font-normal text-gray-400">· {w.location}</span>}</div>
                <div className="space-y-1">
                  {w.exercises.map((ex, ei) => {
                    const tot = ex.sets.reduce((s, x) => s + (x.reps || 0), 0);
                    return (
                      <div key={ei}>
                        <div className="flex items-start text-xs">
                          <div className="w-28 font-medium">{ex.name}</div>
                          <div className="flex-1 flex items-center gap-1">
                            {ex.sets.map((s, si) => <span key={si} className="text-gray-400">{s.reps}{si < ex.sets.length - 1 && <span className="text-gray-600 mx-0.5">·</span>}</span>)}
                            <span className="ml-1 font-bold">({tot})</span>
                          </div>
                        </div>
                        {ex.notes && <div className="text-[10px] text-gray-500 ml-28 -mt-0.5">{ex.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BottomSheet>
  );
}

// Main Workout Modal
export default function WorkoutModal({ open, onClose, current, setCurrent, exercises, presets, workouts, dark, editing, onSave, onToast }) {
  const [viewMode, setViewMode] = useState('table');
  const [started, setStarted] = useState(editing !== null);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastStart, setLastStart] = useState(null);
  const [showClose, setShowClose] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [delEx, setDelEx] = useState(null);

  // Timer
  useEffect(() => {
    if (!running || !lastStart) return;
    const update = () => setTimer(pausedTime + Math.floor((Date.now() - lastStart) / 1000));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [running, lastStart, pausedTime]);

  // Reset on open/close
  useEffect(() => {
    if (open && editing !== null) { setStarted(true); }
    if (!open) { setStarted(false); setTimer(0); setRunning(false); setPausedTime(0); setLastStart(null); }
  }, [open, editing]);

  if (!open) return null;

  const addEx = () => setCurrent({
    ...current,
    exercises: [...current.exercises, { name: '', sets: [{ reps: 0, weight: null }, { reps: 0, weight: null }, { reps: 0, weight: null }, { reps: 0, weight: null }], notes: '' }]
  });

  const updateEx = (i, f, v) => { const u = [...current.exercises]; u[i][f] = v; setCurrent({ ...current, exercises: u }); };
  const updateSet = (ei, si, v) => { const u = [...current.exercises]; if (!u[ei].sets[si]) u[ei].sets[si] = { reps: 0, weight: null }; u[ei].sets[si].reps = parseInt(v) || 0; setCurrent({ ...current, exercises: u }); };
  const addSet = (ei) => { const u = [...current.exercises]; u[ei].sets.push({ reps: 0, weight: null }); setCurrent({ ...current, exercises: u }); };

  const handleClose = () => {
    if (current.exercises.length > 0) setShowClose(true);
    else { onClose(); setCurrent({ date: getTodayDate(), exercises: [], notes: '', location: '', structure: '', structureDuration: '' }); }
  };

  const handleDiscard = () => {
    onClose(); setCurrent({ date: getTodayDate(), exercises: [], notes: '', location: '', structure: '', structureDuration: '' });
    setShowClose(false); setStarted(false); setTimer(0); setRunning(false); setPausedTime(0); setLastStart(null);
  };

  const handleSaveWorkout = () => {
    onSave(editing !== null ? null : timer);
    onClose(); setStarted(false); setTimer(0); setRunning(false); setPausedTime(0); setLastStart(null); setShowEnd(false);
  };

  const loadPreset = (name) => {
    const p = presets.find(x => x.name === name);
    if (p && editing === null) {
      setCurrent({
        ...current,
        exercises: p.exercises.map(n => ({ name: n, sets: [{ reps: 0, weight: null }, { reps: 0, weight: null }, { reps: 0, weight: null }, { reps: 0, weight: null }], notes: '' })),
        location: p.name
      });
    } else {
      setCurrent({ ...current, location: name });
    }
  };

  const isDayOff = current.location === 'Day Off';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose}>
      <div className={`fixed inset-x-0 top-0 bottom-0 ${dark ? 'bg-gray-900' : 'bg-gray-50'} overflow-y-auto flex flex-col`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`${dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{editing !== null ? 'Edit' : 'New'} Workout</h2>
            {started && editing === null && (
              <div className="flex items-center gap-2">
                <div className="text-xl font-mono font-bold text-blue-400">{formatTime(timer)}</div>
                <button onClick={() => {
                  if (running) { setPausedTime(timer); setRunning(false); }
                  else { setLastStart(Date.now()); setRunning(true); }
                }} className="text-blue-400 p-1">
                  {running ? <Icons.Pause /> : <Icons.Play />}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(true)} className="text-blue-400"><Icons.Calendar /></button>
              <button onClick={handleClose}><Icons.X /></button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3">
          {!isDayOff && <>
            {/* View toggle */}
            <div className={`flex gap-2 ${dark ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-1 rounded-lg`}>
              {['table', 'cards'].map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${viewMode === m ? 'bg-blue-600 text-white shadow-md' : dark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {m === 'table' ? 'Table View' : 'Card View'}
                </button>
              ))}
            </div>

            {/* Date & Preset */}
            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1.5`}>Date</label>
                <input type="text" value={current.date} onChange={e => setCurrent({ ...current, date: e.target.value })} placeholder="YYYY-MM-DD"
                  className={`w-full ${dark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2.5 text-sm`} />
              </div>
              <div>
                <label className={`block text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1.5`}>Workout & Structure</label>
                <div className="flex gap-2">
                  <select value={current.location} onChange={e => loadPreset(e.target.value)}
                    className={`flex-1 ${dark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2.5 text-sm`}>
                    <option value="">Select</option>
                    {presets.filter(p => p.includeInMenu !== false).map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                  </select>
                  {['pairs', 'circuit'].map(s => (
                    <button key={s} onClick={() => setCurrent({ ...current, structure: current.structure === s ? '' : s, structureDuration: s === 'pairs' && current.structure !== 'pairs' ? '3' : '' })}
                      className={`px-3 py-2.5 rounded-lg text-xs font-semibold ${current.structure === s ? (s === 'pairs' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white') : dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                {current.structure === 'pairs' && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-gray-400 self-center">Duration:</span>
                    {['3', '4', '5'].map(d => (
                      <button key={d} onClick={() => setCurrent({ ...current, structureDuration: d })}
                        className={`px-3 py-1.5 rounded text-xs font-semibold ${current.structureDuration === d ? 'bg-blue-600 text-white' : dark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                        {d}&apos;
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Exercises */}
            {viewMode === 'table' ? (
              <div className="overflow-x-auto -mx-3 px-3">
                {current.exercises.map((ex, ei) => {
                  const tot = ex.sets.reduce((s, x) => s + (x.reps || 0), 0);
                  const maxSets = Math.max(4, ex.sets.length);
                  return (
                    <div key={ei} className="flex gap-0.5 mb-1 overflow-x-auto pb-1">
                      <div className={`sticky left-0 ${dark ? 'bg-gray-900' : 'bg-gray-50'} z-10 pr-0.5`}>
                        <select value={ex.name} onChange={e => updateEx(ei, 'name', e.target.value)}
                          className={`w-[100px] ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded px-1 py-1 text-[11px]`}>
                          <option value="">Select</option>
                          {exercises.map((e, i) => <option key={i} value={e}>{e}</option>)}
                        </select>
                      </div>
                      {Array.from({ length: maxSets }, (_, si) => (
                        <input key={si} type="number" inputMode="numeric" value={ex.sets[si]?.reps || ''} onChange={e => updateSet(ei, si, e.target.value)}
                          disabled={!started} placeholder="0"
                          className={`w-[40px] ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded px-1 py-1 text-[11px] text-center disabled:opacity-50`} />
                      ))}
                      <div className={`w-[35px] ${dark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} border rounded px-1 py-1 text-[11px] text-center font-bold`}>{tot}</div>
                      <input type="text" value={ex.notes} onChange={e => updateEx(ei, 'notes', e.target.value)} placeholder="..."
                        className={`w-[80px] ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded px-1 py-1 text-[11px]`} />
                      <button onClick={() => setDelEx(ei)} className="w-[24px] text-red-400 text-lg">×</button>
                      <button onClick={() => addSet(ei)} className={`w-[36px] text-blue-400 text-xs ${dark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}>+</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {current.exercises.map((ex, ei) => {
                  const tot = ex.sets.reduce((s, x) => s + (x.reps || 0), 0);
                  return (
                    <div key={ei} className={`${dark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-lg p-2`}>
                      <select value={ex.name} onChange={e => updateEx(ei, 'name', e.target.value)}
                        className={`w-full ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded px-2 py-1 text-xs font-medium mb-2`}>
                        <option value="">Select Exercise</option>
                        {exercises.map((e, i) => <option key={i} value={e}>{e}</option>)}
                      </select>
                      <div className="flex items-center gap-1 mb-2 overflow-x-auto">
                        {ex.sets.map((s, si) => (
                          <div key={si} className="flex flex-col items-center">
                            <div className={`text-[10px] ${dark ? 'text-gray-400' : 'text-gray-600'} mb-0.5`}>S{si + 1}</div>
                            <input type="number" inputMode="numeric" value={s.reps || ''} onChange={e => updateSet(ei, si, e.target.value)}
                              disabled={!started} placeholder="0"
                              className={`w-12 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded px-1 py-1 text-[11px] text-center disabled:opacity-50`} />
                          </div>
                        ))}
                        <div className="flex flex-col items-center">
                          <div className={`text-[10px] ${dark ? 'text-gray-400' : 'text-gray-600'} mb-0.5`}>Tot</div>
                          <div className={`w-12 ${dark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300'} border rounded px-1 py-1 text-[11px] text-center font-bold`}>{tot}</div>
                        </div>
                        <button onClick={() => addSet(ei)} className={`text-blue-400 text-xs px-2 py-1 ${dark ? 'bg-gray-700' : 'bg-gray-200'} rounded mt-3.5`}>+</button>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="text" value={ex.notes} onChange={e => updateEx(ei, 'notes', e.target.value)} placeholder="Notes..."
                          className={`flex-1 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded px-2 py-1 text-[11px]`} />
                        <button onClick={() => setDelEx(ei)} className="text-red-400 px-2 py-1"><Icons.Trash /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={addEx}
              className={`w-full ${dark ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' : 'bg-white hover:bg-gray-50 border-gray-300'} py-3 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2`}>
              <span className="text-lg">+</span> Add Exercise
            </button>
          </>}

          <div>
            <label className={`block text-xs font-semibold ${dark ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1.5`}>{isDayOff ? 'Rest Day Notes' : 'Workout Notes'}</label>
            <textarea value={current.notes} onChange={e => setCurrent({ ...current, notes: e.target.value })}
              placeholder={isDayOff ? 'Why did you skip today?' : 'How did it go?'}
              className={`w-full ${dark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2.5 text-sm resize-none ${isDayOff ? 'h-40' : 'h-24'}`} />
          </div>
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 ${dark ? 'bg-gradient-to-t from-gray-900 via-gray-900 border-gray-700/50' : 'bg-gradient-to-t from-gray-50 via-gray-50 border-gray-200'} border-t p-4`}>
          {editing !== null ? (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleSaveWorkout} className="bg-gradient-to-r from-blue-600 to-blue-500 py-4 rounded-xl font-bold text-lg shadow-lg">Update</button>
              <button onClick={() => { onClose(); setCurrent({ date: getTodayDate(), exercises: [], notes: '', location: '', structure: '', structureDuration: '' }); }}
                className={`${dark ? 'bg-gray-700' : 'bg-gray-200'} py-4 rounded-xl font-bold text-lg`}>Cancel</button>
            </div>
          ) : !started ? (
            <button onClick={() => { setStarted(true); setRunning(true); setLastStart(Date.now()); setPausedTime(0); setTimer(0); }}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2">
              <span className="text-2xl">▶</span> Start Workout
            </button>
          ) : (
            <button onClick={() => setShowEnd(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-4 rounded-xl font-bold text-lg shadow-lg">Save Workout</button>
          )}
        </div>
      </div>

      {/* Sub-modals */}
      <ConfirmDialog open={showClose} title="Discard Workout?" message="You have unsaved changes."
        confirmText="Discard" confirmColor="bg-red-600 hover:bg-red-700" dark={dark}
        onConfirm={handleDiscard} onCancel={() => setShowClose(false)} />

      <ConfirmDialog open={showEnd} title="Finish Workout?" message="Save this workout to your log?"
        confirmText="Save Workout" confirmColor="bg-gradient-to-r from-green-600 to-green-500" dark={dark}
        onConfirm={handleSaveWorkout} onCancel={() => setShowEnd(false)} />

      <ConfirmDialog open={delEx !== null} title="Delete Exercise?" message="Remove this exercise?"
        confirmText="Delete" dark={dark}
        onConfirm={() => { const u = [...current.exercises]; u.splice(delEx, 1); setCurrent({ ...current, exercises: u }); setDelEx(null); }}
        onCancel={() => setDelEx(null)} />

      <HistoryModal open={showHistory} onClose={() => setShowHistory(false)} workouts={workouts} presets={presets} dark={dark} />
    </div>
  );
}
