import { useState, useEffect } from 'react';
import Head from 'next/head';
import { load, save, loadTheme, saveTheme, getTodayDate, createBackup, shouldBackup } from '../utils/storage';
import { themes, themeOrder, nextTheme, getTheme } from '../utils/theme';
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

  // Toast
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const flash = (msg) => { setToast(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  // Workout modal state
  const [showWorkout, setShowWorkout] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [editing, setEditing] = useState(null);
  const [current, setCurrent] = useState({
    date: getTodayDate(), exercises: [], notes: '', location: '', structure: '', structureDuration: ''
  });

  // Search (passed to HomeView header button)
  const [searchOpen, setSearchOpen] = useState(false);

  const t = getTheme(theme);
  const dark = t.isDark;

  // Load data
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWorkouts(load('workouts') || []);
    setPresets(load('presets') || []);
    setExercises(load('exercises') || []);
    setWeightEntries(load('weightEntries') || []);
    setProteinEntries(load('proteinEntries') || []);
    setThemeKey(loadTheme());
    setTimeout(() => setLoading(false), 2000);
  }, []);

  // Auto-backup
  useEffect(() => {
    if (typeof window === 'undefined' || !workouts.length) return;
    if (shouldBackup()) {
      createBackup({ workouts, presets, weightEntries, exercises }).catch(console.error);
    }
  }, [workouts, presets, weightEntries, exercises]);

  // Persist helpers
  const setAndSave = (key, setter) => (data) => { save(key, data); setter(data); };
  const saveWorkouts = setAndSave('workouts', setWorkouts);
  const savePresets = setAndSave('presets', setPresets);
  const saveExercises = setAndSave('exercises', setExercises);
  const saveWeight = setAndSave('weightEntries', setWeightEntries);
  const saveProtein = setAndSave('proteinEntries', setProteinEntries);

  const cycleTheme = () => {
    const next = nextTheme(theme);
    setThemeKey(next);
    saveTheme(next);
  };

  // Workout actions
  const handleSelectPreset = (p) => {
    setCurrent({
      ...current,
      date: getTodayDate(),
      exercises: p.exercises.map(n => ({ name: n, sets: [{ reps: 0, weight: null }, { reps: 0, weight: null }, { reps: 0, weight: null }, { reps: 0, weight: null }], notes: '' })),
      location: p.name, notes: '', structure: '', structureDuration: ''
    });
    setEditing(null);
    setShowWorkout(true);
  };

  const handleEditWorkout = (idx) => {
    setCurrent(JSON.parse(JSON.stringify(workouts[idx])));
    setEditing(idx);
    setShowWorkout(true);
  };

  const handleDeleteWorkout = (idx) => {
    saveWorkouts(workouts.filter((_, i) => i !== idx));
  };

  const handleSaveWorkout = (elapsedTime) => {
    if (!current.exercises.length && !current.notes && current.location !== 'Day Off') return;
    const toSave = elapsedTime !== null ? { ...current, elapsedTime } : current;
    if (editing !== null) {
      const u = [...workouts]; u[editing] = toSave; saveWorkouts(u);
    } else {
      saveWorkouts([toSave, ...workouts]);
    }
    setCurrent({ date: getTodayDate(), exercises: [], notes: '', location: '', structure: '', structureDuration: '' });
    setEditing(null);
  };

  // Weight actions
  const handleWeightSave = (entry, editIdx) => {
    if (editIdx !== null) {
      const u = [...weightEntries]; u[editIdx] = entry; saveWeight(u);
    } else {
      saveWeight([...weightEntries, entry]);
    }
  };
  const handleWeightDelete = (idx) => saveWeight(weightEntries.filter((_, i) => i !== idx));

  // Protein actions
  const handleProteinAdd = (entry) => saveProtein([...proteinEntries, entry]);
  const handleProteinUpdate = (timestamp, updates) => {
    saveProtein(proteinEntries.map(e => e.timestamp === timestamp ? { ...e, ...updates } : e));
  };
  const handleProteinDelete = (timestamp) => {
    saveProtein(proteinEntries.filter(e => e.timestamp !== timestamp));
  };

  // Loading screen
  if (loading) {
    return (
      <div className={`min-h-screen ${t.bg} ${t.text} flex flex-col items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tight mb-4">GORS</h1>
          <div className={`w-20 h-1 mx-auto mb-6 ${theme === 'neon' || theme === 'forest' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'} font-medium tracking-widest`}>BE ABOUT IT</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <button onClick={() => setShowPresetSelector(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg p-2 shadow-lg shadow-blue-500/20 active
