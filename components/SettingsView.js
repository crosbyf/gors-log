import { useState } from 'react';
import * as Icons from './Icons';
import { ConfirmDialog, CenterModal } from './Modal';
import { presetColors, getPresetColor } from '../utils/theme';
import { exportCSV, parsePresetsCSV, parseWorkoutsCSV, loadBackups } from '../utils/storage';

export default function SettingsView({ presets, exercises, workouts, weightEntries, dark, onPresetsChange, onExercisesChange, onWorkoutsChange, onWeightChange, onToast }) {
  const [showPresets, setShowPresets] = useState(false);
  const [showExercises, setShowExercises] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showDeletion, setShowDeletion] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backupsList, setBackupsList] = useState([]);
  // Edit preset
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editExs, setEditExs] = useState([]);
  const [editColor, setEditColor] = useState('Blue');
  const [editMenu, setEditMenu] = useState(true);
  // Create preset
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newExs, setNewExs] = useState([]);
  const [newColor, setNewColor] = useState('Blue');
  const [newMenu, setNewMenu] = useState(true);
  // Delete preset
  const [delPreset, setDelPreset] = useState(null);

  const openEdit = (i) => {
    const p = presets[i];
    setEditIdx(i); setEditName(p.name); setEditExs([...p.exercises]);
    setEditColor(p.color || 'Blue'); setEditMenu(p.includeInMenu !== false);
  };
  const saveEdit = () => {
    const u = [...presets];
    u[editIdx] = { name: editName, exercises: editExs, color: editColor, includeInMenu: editMenu };
    onPresetsChange(u); setEditIdx(null);
  };
  const saveCreate = () => {
    if (newName.trim() && newExs.length > 0) {
      onPresetsChange([...presets, { name: newName.trim(), exercises: newExs, color: newColor, includeInMenu: newMenu }]);
      onToast('Preset created!');
    }
    setShowCreate(false);
  };
  const reorder = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= presets.length) return;
    const u = [...presets]; [u[i], u[j]] = [u[j], u[i]]; onPresetsChange(u);
  };

  const importPresets = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const { presets: ps, exercises: exs } = parsePresetsCSV(ev.target.result);
      onPresetsChange(ps); onExercisesChange(exs); e.target.value = '';
    };
    r.readAsText(file);
  };
  const importWorkouts = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const imp = parseWorkoutsCSV(ev.target.result);
      onWorkoutsChange([...imp, ...workouts]); e.target.value = '';
    };
    r.readAsText(file);
  };

  const Section = ({ title, icon, open, setOpen, children }) => (
    <div className={`${dark ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-md overflow-hidden`}>
      <button onClick={() => setOpen(!open)} className={`w-full p-4 flex items-center justify-between ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
        <div className="flex items-center gap-2"><span className="text-lg">{icon}</span><span className="font-bold">{title}</span></div>
        <div className={`transform transition-transform ${open ? 'rotate-180' : ''}`}><Icons.ChevronDown /></div>
      </button>
      {open && <div className={`p-3 space-y-2 ${dark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>{children}</div>}
    </div>
  );

  // Preset editor modal (shared for edit & create)
  const PresetModal = ({ show, onClose, title, name, setName, exList, setExList, color, setColor, menu, setMenu, onSave, saveLabel }) => {
    if (!show) return null;
    return (
      <CenterModal open={show} onClose={onClose}>
        <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto`}>
          <h3 className="text-xl font-bold mb-4">{title}</h3>
          <div className="space-y-3">
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? '' : 'text-gray-700'}`}>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Upper Body"
                className={`w-full ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`} />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${dark ? '' : 'text-gray-700'}`}>Color</label>
              <div className="grid grid-cols-4 gap-2">
                {presetColors.map(c => (
                  <button key={c.name} onClick={() => setColor(c.name)}
                    className={`h-10 rounded-lg border-2 transition-all ${color === c.name ? `${c.border} border-opacity-100 scale-105` : `${c.border} border-opacity-30`} ${c.bg}`}>
                    <div className={`text-xs font-semibold ${c.text}`}>{c.name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${dark ? '' : 'text-gray-700'}`}>Exercises</label>
              {exList.map((ex, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <select value={ex} onChange={e => { const u = [...exList]; u[i] = e.target.value; setExList(u); }}
                    className={`flex-1 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border rounded-lg px-3 py-2`}>
                    {exercises.map((e, ei) => <option key={ei} value={e}>{e}</option>)}
                  </select>
                  <button onClick={() => setExList(exList.filter((_, idx) => idx !== i))} className="text-red-400"><Icons.Trash /></button>
                </div>
              ))}
              <button onClick={() => setExList([...exList, exercises[0] || ''])} className="text-blue-400 text-sm">+ Add Exercise</button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={menu} onChange={e => setMenu(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm">Show in New Workout menu</span>
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onSave} className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold">{saveLabel}</button>
            <button onClick={onClose} className="flex-1 bg-gray-700 py-3 rounded-lg font-semibold">Cancel</button>
          </div>
        </div>
      </CenterModal>
    );
  };

  return (
    <div className="space-y-3 -mt-9">
      <h2 className="text-base font-semibold mb-2">Settings</h2>

      {/* Presets */}
      <Section title="Workout Presets" icon="💪" open={showPresets} setOpen={setShowPresets}>
        {presets.map((p, i) => {
          const color = getPresetColor(presets, p.name);
          return (
            <div key={i} className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg overflow-hidden`}>
              <div className={`flex items-center border-l-4 ${color.border}`}>
                <div className="flex flex-col px-1">
                  <button onClick={() => reorder(i, -1)} disabled={i === 0}
                    className={`p-1 ${i === 0 ? 'opacity-30' : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => reorder(i, 1)} disabled={i === presets.length - 1}
                    className={`p-1 ${i === presets.length - 1 ? 'opacity-30' : dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                <button onClick={() => openEdit(i)} className="flex-1 text-left flex items-center gap-3 py-3 pr-3">
                  <div className={`w-3 h-3 rounded-full ${color.dot} flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'} truncate`}>{p.exercises.length} exercises • {color.name || 'Blue'}</div>
                  </div>
                  <Icons.Edit />
                </button>
                <button onClick={() => setDelPreset(i)} className={`px-3 py-3 ${dark ? 'text-red-400' : 'text-red-500'}`}><Icons.Trash /></button>
              </div>
            </div>
          );
        })}
        <button onClick={() => { setNewName(''); setNewExs(exercises.length > 0 ? [exercises[0]] : []); setNewColor('Blue'); setNewMenu(true); setShowCreate(true); }}
          className={`w-full py-3 rounded-lg border-2 border-dashed ${dark ? 'border-gray-600 hover:border-blue-500 text-gray-400 hover:text-blue-400' : 'border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600'}`}>
          <div className="flex items-center justify-center gap-2"><Icons.Plus /><span className="font-semibold">Create New Preset</span></div>
        </button>
        {presets.length === 0 && <div className={`text-center py-8 ${dark ? 'text-gray-500' : 'text-gray-400'}`}><div className="text-4xl mb-2">💪</div><div className="text-sm">No presets yet</div></div>}
      </Section>

      {/* Exercises */}
      <Section title="Exercise Presets" icon="🏋️" open={showExercises} setOpen={setShowExercises}>
        {[...exercises].sort((a, b) => a.localeCompare(b)).map((ex, i) => (
          <div key={i} className={`${dark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3 flex items-center justify-between`}>
            <span className="font-medium">{ex}</span>
            <button onClick={() => { if (confirm(`Delete "${ex}"?`)) onExercisesChange(exercises.filter(e => e !== ex)); }}
              className="text-red-500 hover:text-red-400 p-1"><Icons.Trash /></button>
          </div>
        ))}
        <button onClick={() => {
          const n = prompt('Enter exercise name:');
          if (n?.trim() && !exercises.includes(n.trim())) onExercisesChange([...exercises, n.trim()]);
          else if (n?.trim()) alert('Exercise already exists!');
        }} className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
          <span className="text-lg">+</span> Add Exercise
        </button>
      </Section>

      {/* Data Management */}
      <Section title="Data Management" icon="💾" open={showData} setOpen={setShowData}>
        <label className="cursor-pointer block mt-2">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md"><Icons.Upload /> Import Presets</div>
          <input type="file" accept=".csv" onChange={importPresets} className="hidden" />
        </label>
        <label className="cursor-pointer block">
          <div className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md"><Icons.Upload /> Import Workouts</div>
          <input type="file" accept=".csv" onChange={importWorkouts} className="hidden" />
        </label>
        <button onClick={() => { exportCSV(workouts); onToast('CSV downloaded!'); }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md">
          <Icons.Download /> Export All Data
        </button>
        <button onClick={async () => { try { const b = await loadBackups(); setBackupsList(b); setShowBackups(true); } catch { onToast('Failed to load backups'); } }}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md">
          <Icons.Clock /> View Backups
        </button>
        <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'} mt-3 px-1`}>Auto-backups every 7 days • Last 5 kept</div>
      </Section>

      {/* Data Deletion */}
      <div className={`${dark ? 'bg-gray-800 border-red-900/30' : 'bg-white border-red-200'} rounded-xl shadow-md border-2 overflow-hidden`}>
        <button onClick={() => setShowDeletion(!showDeletion)} className="w-full p-4 flex items-center justify-between text-left">
          <h3 className="font-bold flex items-center gap-2 text-red-400"><span className="text-lg">⚠️</span> Data Deletion</h3>
          <div className={`transform transition-transform ${showDeletion ? 'rotate-180' : ''}`}><Icons.ChevronDown /></div>
        </button>
        {showDeletion && <div className={`px-4 pb-4 ${dark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
          <p className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'} mb-3 mt-2`}>Permanently delete all workout data. Cannot be undone.</p>
          <button onClick={() => setShowClear(true)} className="w-full bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 rounded-lg text-sm font-bold shadow-md">Delete All Workouts</button>
        </div>}
      </div>

      {/* Modals */}
      <PresetModal show={editIdx !== null} onClose={() => setEditIdx(null)} title="Edit Preset"
        name={editName} setName={setEditName} exList={editExs} setExList={setEditExs}
        color={editColor} setColor={setEditColor} menu={editMenu} setMenu={setEditMenu}
        onSave={saveEdit} saveLabel="Save Changes" />

      <PresetModal show={showCreate} onClose={() => setShowCreate(false)} title="Create New Preset"
        name={newName} setName={setNewName} exList={newExs} setExList={setNewExs}
        color={newColor} setColor={setNewColor} menu={newMenu} setMenu={setNewMenu}
        onSave={saveCreate} saveLabel="Create Preset" />

      <ConfirmDialog open={delPreset !== null} title="Delete Preset?" message="This cannot be undone." confirmText="Delete" dark={dark}
        onConfirm={() => { onPresetsChange(presets.filter((_, i) => i !== delPreset)); setDelPreset(null); }}
        onCancel={() => setDelPreset(null)} />

      <ConfirmDialog open={showClear} title="⚠️ Delete All Workouts?" message={`This will permanently delete all ${workouts.length} workout(s). Presets will NOT be deleted.`}
        confirmText="Yes, Delete All" dark={dark}
        onConfirm={() => { onWorkoutsChange([]); setShowClear(false); }}
        onCancel={() => setShowClear(false)} />

      {/* Backups modal */}
      {showBackups && <CenterModal open={showBackups} onClose={() => setShowBackups(false)}>
        <div className={`${dark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto`}>
          <h3 className="text-xl font-bold mb-4">Automatic Backups</h3>
          {backupsList.length === 0 ? <div className="text-center py-8"><div className="text-4xl mb-3">💾</div><div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>No backups yet.</div></div> : (
            <div className="space-y-2">{backupsList.map(b => {
              const d = new Date(b.timestamp);
              return <div key={b.timestamp} className={`${dark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div><div className="font-semibold text-sm">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div><div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div></div>
                  <button onClick={() => {
                    if (confirm(`Restore backup from ${d.toLocaleDateString()}?`)) {
                      onWorkoutsChange(b.workouts || []); onPresetsChange(b.presets || []);
                      onWeightChange(b.weightEntries || []); onExercisesChange(b.exercises || []);
                      setShowBackups(false); onToast('Backup restored!');
                    }
                  }} className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-xs font-semibold">Restore</button>
                </div>
                <div className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{b.workouts?.length || 0} workouts • {b.presets?.length || 0} presets</div>
              </div>;
            })}</div>
          )}
          <button onClick={() => setShowBackups(false)} className={`w-full mt-4 ${dark ? 'bg-gray-700' : 'bg-gray-200'} py-3 rounded-lg font-semibold`}>Close</button>
        </div>
      </CenterModal>}
    </div>
  );
}
