// LocalStorage helpers
export const load = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

export const save = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const t = localStorage.getItem('theme');
  const dm = localStorage.getItem('darkMode');
  if (t) {
    if (t === 'midnight') {
      localStorage.setItem('theme', 'neon');
      return 'neon';
    }
    return t;
  }
  if (dm !== null) return JSON.parse(dm) ? 'dark' : 'light';
  return 'dark';
};

export const saveTheme = (t) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('theme', t);
};

// Date helper - today in YYYY-MM-DD without timezone issues
export const getTodayDate = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

// Format seconds to M:SS
export const formatTime = (s) => {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};

// Format seconds to HH:MM:SS
export const formatTimeHHMMSS = (s) => {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

// IndexedDB backup system
export const createBackup = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open('GorsLogBackups', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'timestamp' });
        }
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(['backups'], 'readwrite');
        const store = tx.objectStore('backups');
        const backup = { timestamp: Date.now(), ...data };
        store.add(backup);
        // Prune old backups (keep last 5)
        const all = store.getAll();
        all.onsuccess = () => {
          const sorted = all.result.sort((a, b) => b.timestamp - a.timestamp);
          sorted.slice(5).forEach(b => store.delete(b.timestamp));
        };
        localStorage.setItem('lastBackup', backup.timestamp.toString());
        resolve();
      };
      req.onerror = () => reject(req.error);
    } catch (err) { reject(err); }
  });
};

export const loadBackups = () => {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open('GorsLogBackups', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'timestamp' });
        }
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(['backups'], 'readonly');
        const all = tx.objectStore('backups').getAll();
        all.onsuccess = () => resolve(all.result.sort((a, b) => b.timestamp - a.timestamp));
      };
      req.onerror = () => reject(req.error);
    } catch (err) { reject(err); }
  });
};

// Check if backup is needed (every 7 days)
export const shouldBackup = () => {
  const last = localStorage.getItem('lastBackup');
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return !last || now - parseInt(last) > sevenDays;
};

// CSV export
export const exportCSV = (workouts) => {
  const rows = [];
  [...workouts].sort((a, b) => a.date.localeCompare(b.date)).forEach(w => {
    const d = new Date(w.date);
    const ds = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear()}`;
    w.exercises.forEach((ex, i) => {
      const sets = ex.sets.slice(0, 4);
      const reps = sets.map(s => s.reps || '').concat(Array(4 - sets.length).fill(''));
      const tot = sets.reduce((s, x) => s + (x.reps || 0), 0);
      let notes = ex.notes || '';
      const wts = sets.filter(s => s.weight).map(s => s.weight);
      if (wts.length) notes = wts[0] + (notes ? '. ' + notes : '');
      rows.push(i === 0
        ? `${ds},${ex.name},${reps[0]},${reps[1]},${reps[2]},${reps[3]},${tot},${notes}`
        : `,${ex.name},${reps[0]},${reps[1]},${reps[2]},${reps[3]},${tot},${notes}`
      );
    });
    rows.push(`,${w.location || ''},,,,,,${[w.location, w.notes].filter(Boolean).join('. ')}`);
  });
  const csv = `Date,Exercise,1,2,3,4,Tot,Notes\n${rows.join('\n')}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workouts-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// Copy workout to sheets format
export const copyToSheets = (w) => {
  const d = new Date(w.date);
  const lines = [];
  w.exercises.forEach((ex, i) => {
    const s = ex.sets.slice(0, 4);
    const r = s.map(x => x.reps || '').concat(Array(4 - s.length).fill(''));
    const t = s.reduce((sum, x) => sum + (x.reps || 0), 0);
    let n = ex.notes || '';
    const wts = s.filter(x => x.weight).map(x => x.weight);
    if (wts.length) n = wts[0] + (n ? '. ' + n : '');
    const ds = `${d.getMonth() + 1}-${d.getDate()}-${d.toLocaleDateString('en-US', { weekday: 'short' })}`;
    lines.push(i === 0
      ? `${ds}\t${ex.name}\t${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}\t${t}\t${n}`
      : `\t${ex.name}\t${r[0]}\t${r[1]}\t${r[2]}\t${r[3]}\t${t}\t${n}`
    );
  });
  lines.push(`\t${w.location || ''}\t\t\t\t\t\t${[w.location, w.notes].filter(Boolean).join('. ')}`);
  navigator.clipboard.writeText(lines.join('\n'));
};

// Share workout
export const shareWorkout = async (w) => {
  const d = new Date(w.date);
  const ds = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  let txt = `GORS LOG - ${w.location || 'Workout'}\n${ds}\n`;
  if (w.elapsedTime) txt += `Duration: ${formatTimeHHMMSS(w.elapsedTime)}\n`;
  txt += '\n';
  w.exercises.forEach(ex => {
    const sets = ex.sets.map(s => s.reps || 0).join(', ');
    const tot = ex.sets.reduce((s, x) => s + (x.reps || 0), 0);
    txt += `${ex.name}: ${sets} (Total: ${tot})`;
    if (ex.notes) txt += ` - ${ex.notes}`;
    txt += '\n';
  });
  if (w.notes) txt += `\nNotes: ${w.notes}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: `GORS LOG - ${w.location || 'Workout'}`, text: txt });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
    }
  }
  navigator.clipboard.writeText(txt);
  return 'clipboard';
};

// Import presets from CSV
export const parsePresetsCSV = (text) => {
  const lines = text.split('\n');
  const ps = [], exs = new Set();
  lines.forEach(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (!cols[0]) return;
    const exercises = cols.slice(1).filter(Boolean);
    ps.push({ name: cols[0], exercises });
    exercises.forEach(e => exs.add(e));
  });
  return { presets: ps, exercises: Array.from(exs).sort() };
};

// Import workouts from CSV
export const parseWorkoutsCSV = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const imp = [];
  let cur = null, loc = '';
  
  const parseDate = (str) => {
    const p = str.split('-');
    if (p.length === 3) {
      const m = p[0].padStart(2, '0'), d = p[1].padStart(2, '0');
      const y = p[2].length === 4 ? p[2] : '2026';
      return `${y}-${m}-${d}`;
    }
    return str;
  };

  if (lines.length > 0 && !lines[0].toLowerCase().includes('date')) {
    loc = lines[0].split(',')[0].trim();
  }

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (cols[0]?.toLowerCase() === 'date' || cols[1]?.toLowerCase() === 'exercise') continue;
    if (i === 0 && !cols[0].match(/^\d/)) continue;

    if (cols[0]?.match(/^\d+-\d+/)) {
      if (cur && (cur.exercises.length > 0 || cur.location === 'Day Off')) imp.push(cur);
      cur = { date: parseDate(cols[0]), exercises: [], notes: '', location: loc };
      if (cols[1] === 'Day Off') {
        cur.location = 'Day Off';
        const n = [cols[7], cols[8], cols[9], cols[10]].filter(x => x?.trim());
        if (n.length) cur.notes = n.join(' ');
      } else if (cols[1]) {
        const sets = [cols[2], cols[3], cols[4], cols[5]].filter(s => s?.trim()).map(s => ({ reps: parseInt(s) || 0, weight: null }));
        cur.exercises.push({ name: cols[1], sets, notes: cols[7] || '' });
      }
    } else if (cur && cols[1]?.trim() && cols[1] !== 'Day Off') {
      const sets = [cols[2], cols[3], cols[4], cols[5]].filter(s => s?.trim()).map(s => ({ reps: parseInt(s) || 0, weight: null }));
      cur.exercises.push({ name: cols[1], sets, notes: cols[7] || '' });
    } else if (cur && cur.location !== 'Day Off' && cols[2]?.match(/Garage|BW|Manual/)) {
      cur.location = cols[2];
      const n = [cols[7], cols[8], cols[9], cols[10]].filter(x => x?.trim());
      if (n.length) cur.notes = n.join(' ');
    } else if (cur && cols[2] === 'Day Off') {
      cur.location = 'Day Off';
      const n = [cols[7], cols[8], cols[9], cols[10]].filter(x => x?.trim());
      if (n.length) cur.notes = n.join(' ');
    }
  }
  if (cur && (cur.exercises.length > 0 || cur.location === 'Day Off')) imp.push(cur);
  return imp;
};
