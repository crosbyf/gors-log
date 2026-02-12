import { useState, useEffect } from 'react';
import Head from 'next/head';
import { load, save, loadTheme, saveTheme, getTodayDate, createBackup, shouldBackup } from '../utils/storage';
import { nextTheme, getTheme } from '../utils/theme';
import * as Icons from '../components/Icons';
import { Toast } from '../components/Modal';
import HomeView from '../components/HomeView';
import StatsView from '../components/StatsView';
import SettingsView from '../components/SettingsView';
import WorkoutModal, { PresetSelector } from '../components/WorkoutModal';

export default function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [presets, setPresets] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [proteinEntries, setProteinEntries] = useState([]);
  const [theme, setThemeKey] = useState('dark');
  const [view, setView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const emptyWorkout = { date: getTodayDate(), exercises: [], notes: '', location: '', structure: '', structureDuration: '' };
  const [current, setCurrent] = useState(emptyWorkout);

  const t = getTheme(theme), dark = t.isDark;
  const flash = (m) => { setToast(m); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };
  const ss = (key, setter) => (data) => { save(key, data); setter(data); };
  const sw = ss('workouts', setWorkouts), sp = ss('presets', setPresets);
  const se = ss('exercises', setExercises), swe = ss('weightEntries', setWeightEntries);
  const spe = ss('proteinEntries', setProteinEntries);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWorkouts(load('workouts') || []); setPresets(load('presets') || []);
    setExercises(load('exercises') || []); setWeightEntries(load('weightEntries') || []);
    setProteinEntries(load('proteinEntries') || []); setThemeKey(loadTheme());
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !workouts.length) return;
    if (shouldBackup()) createBackup({ workouts, presets, weightEntries, exercises }).catch(console.error);
  }, [workouts, presets, weightEntries, exercises]);

  const handleSelectPreset = (p) => {
    setCurrent({ date: getTodayDate(), exercises: p.exercises.map(n => ({ name: n, sets: Array.from({length:4}, () => ({reps:0,weight:null})), notes: '' })), location: p.name, notes: '', structure: '', structureDuration: '' });
    setEditing(null); setShowWorkout(true);
  };
  const handleEdit = (idx) => { setCurrent(JSON.parse(JSON.stringify(workouts[idx]))); setEditing(idx); setShowWorkout(true); };
  const handleDelete = (idx) => sw(workouts.filter((_, i) => i !== idx));
  const handleSave = (elapsed) => {
    if (!current.exercises.length && !current.notes && current.location !== 'Day Off') return;
    const w = elapsed !== null ? { ...current, elapsedTime: elapsed } : current;
    if (editing !== null) { const u = [...workouts]; u[editing] = w; sw(u); }
    else sw([w, ...workouts]);
    setCurrent(emptyWorkout); setEditing(null);
  };
  const cycleTheme = () => { const n = nextTheme(theme); setThemeKey(n); saveTheme(n); };

  if (loading) return (
    <div className={`min-h-screen ${t.bg} ${t.text} flex flex-col items-center justify-center`}>
      <h1 className="text-6xl font-black tracking-tight mb-4">GORS</h1>
      <div className={`w-20 h-1 mx-auto mb-6 ${theme==='neon'||theme==='forest'?'bg-green-500':'bg-blue-500'}`}/>
      <p className={`text-sm ${dark?'text-gray-400':'text-gray-600'} font-medium tracking-widest`}>BE ABOUT IT</p>
    </div>
  );

  return (<>
    <Head>
      <title>GORS LOG</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
    </Head>
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-20 bg-gradient-to-b ${t.headerGradient} ${t.headerBorder} border-b py-2 px-4 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {view === 'home' ? (
            <button onClick={() => setShowSelector(true)} className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-2 shadow-lg shadow-blue-500/20 active:scale-95"><Icons.Plus /></button>
          ) : <div className="w-10" />}
          <button onClick={cycleTheme} className="cursor-pointer hover:opacity-80 text-center">
            <h1 className={`text-xl font-extrabold tracking-tight bg-gradient-to-r ${dark?'from-white to-gray-300':'from-gray-900 to-gray-700'} bg-clip-text text-transparent`}>GORS LOG</h1>
          </button>
          {view === 'home' ? (
            <button onClick={() => { setSearchOpen(!searchOpen); if (!searchOpen) {} }} className={`${dark?'text-gray-400 hover:text-white':'text-gray-600 hover:text-gray-900'} p-2`}><Icons.Search /></button>
          ) : <div className="w-10" />}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 pb-24 pt-12"><div className="h-12" />
        {view === 'home' && <HomeView workouts={workouts} presets={presets} proteinEntries={proteinEntries} dark={dark} theme={t} onEdit={handleEdit} onDelete={handleDelete} onToast={flash} />}
        {view === 'stats' && <StatsView workouts={workouts} weightEntries={weightEntries} proteinEntries={proteinEntries} dark={dark} theme={t}
          onWeightSave={(e, idx) => { if (idx !== null) { const u = [...weightEntries]; u[idx] = e; swe(u); } else swe([...weightEntries, e]); }}
          onWeightDelete={(idx) => swe(weightEntries.filter((_, i) => i !== idx))}
          onProteinAdd={(e) => spe([...proteinEntries, e])}
          onProteinUpdate={(ts, u) => spe(proteinEntries.map(e => e.timestamp === ts ? { ...e, ...u } : e))}
          onProteinDelete={(ts) => spe(proteinEntries.filter(e => e.timestamp !== ts))}
          onToast={flash} />}
        {view === 'settings' && <SettingsView presets={presets} exercises={exercises} workouts={workouts} weightEntries={weightEntries} dark={dark}
          onPresetsChange={sp} onExercisesChange={se} onWorkoutsChange={sw} onWeightChange={swe} onToast={flash} />}
      </div>

      {/* Bottom nav */}
      <div className={`fixed bottom-0 left-0 right-0 ${dark?'bg-gray-800/95 border-gray-700/50':'bg-gray-100/95 border-gray-300'} backdrop-blur-sm border-t safe-area-pb shadow-2xl pb-2 z-20`}>
        <div className="max-w-4xl mx-auto flex">
          {[{id:'home',icon:<Icons.Calendar/>,label:'Home'},{id:'stats',icon:<Icons.TrendingUp/>,label:'Stats'},{id:'settings',icon:<Icons.Settings/>,label:'Settings'}].map(({id,icon,label})=>(
            <button key={id} onClick={() => { setView(id); window.scrollTo({top:0,behavior:'smooth'}); }}
              className={`flex-1 py-4 ${view===id?'text-blue-400':dark?'text-gray-500 hover:text-gray-300':'text-gray-600 hover:text-gray-800'}`}>
              <div className="flex flex-col items-center">
                <div className={view===id?'scale-110':''}>{icon}</div>
                <span className={`text-xs mt-1 font-medium ${view===id?'font-bold':''}`}>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset selector */}
      <PresetSelector open={showSelector} onClose={() => setShowSelector(false)} presets={presets} dark={dark}
        onSelectPreset={handleSelectPreset} proteinEntries={proteinEntries} weightEntries={weightEntries}
        onProteinAdd={(e) => spe([...proteinEntries, e])} onWeightAdd={(e) => swe([...weightEntries, e])} onToast={flash} />

      {/* Workout modal */}
      <WorkoutModal open={showWorkout} onClose={() => setShowWorkout(false)} current={current} setCurrent={setCurrent}
        exercises={exercises} presets={presets} workouts={workouts} dark={dark} editing={editing}
        onSave={handleSave} onToast={flash} />

      <Toast show={showToast} message={toast} />
    </div>
  </>);
}
