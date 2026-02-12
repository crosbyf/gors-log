# GORS LOG — Product Requirements Document

## 1. Product Overview

**GORS LOG** is a mobile-first workout logging and fitness tracking progressive web application (PWA) built with Next.js and React. It serves as a personal training journal that enables users to log workouts, track exercise volume over time, monitor body weight, and record daily protein intake — all from a single, fast, offline-capable interface.

The tagline — *"BE ABOUT IT"* — reflects a no-nonsense, action-oriented philosophy. The app is designed for a single user who trains consistently (primarily bodyweight/calisthenics exercises like pull-ups, dips, chin-ups, push-ups) and wants a lightweight, privacy-respecting tool that lives entirely in the browser with no server or account required.

---

## 2. Target User

- Individual fitness enthusiast, likely training with bodyweight exercises and minimal equipment (e.g., a home/garage gym setup).
- Wants fast, frictionless workout logging — not a social fitness platform.
- Values data ownership: all data stays on-device (localStorage + IndexedDB).
- Uses the app primarily on an iPhone/mobile browser (PWA-optimized with safe-area insets, swipe-to-dismiss modals, touch-friendly inputs).

---

## 3. Core Features

### 3.1 Workout Logging

| Capability | Details |
|---|---|
| **Preset-based workouts** | Users define reusable workout presets (e.g., "Garage BW", "BW-only") with a fixed list of exercises. Starting a workout from a preset pre-populates the exercise list. |
| **Manual workouts** | A "Manual" preset allows building a workout from scratch by adding exercises one at a time. |
| **Exercise entry** | Each exercise has N sets (default 4). Each set records reps and an optional weight. Users can add/remove sets. |
| **Workout structure** | Workouts can be tagged as "Pairs" (with 3/4/5-minute durations) or "Circuit" to describe the training format. |
| **Workout timer** | A live timer starts when the user begins a workout, supports pause/resume, and the elapsed time is saved with the workout. |
| **Day Off logging** | Users can log rest days with notes explaining why they skipped training. |
| **Workout notes** | Free-text notes field per workout and per exercise. |
| **Edit & delete** | Saved workouts can be edited in-place or deleted with confirmation dialogs. |
| **Two view modes** | Workout entry supports a compact **Table View** and an expanded **Card View**. |

### 3.2 Home Screen — Weekly Calendar & Feed

| Capability | Details |
|---|---|
| **Weekly calendar strip** | A sticky, horizontally-scrolling week view (Mon–Sun) shows which days have logged workouts. Color-coded dots correspond to the workout preset used. |
| **Week navigation** | Users can navigate forward/backward through weeks. The feed auto-syncs to the visible week on scroll. |
| **Workout feed** | Below the calendar, workouts are grouped by week in reverse-chronological order. Each card shows date, preset name, exercise count, structure, duration, and protein intake. |
| **Day detail modal** | Tapping a workout card opens a bottom-sheet modal showing the full exercise breakdown (exercise name, set-by-set reps, totals), notes, and action buttons (Copy, Share, Edit, Delete). |
| **Search** | A collapsible search bar filters the feed by date, exercise name, location, or notes. |

### 3.3 Stats Dashboard

The Stats tab is a hub with sub-views:

#### 3.3.1 Volume Trend Chart
- Bar chart showing **total reps per week** over the last 12 weeks.
- Supports filtering by specific exercises (e.g., show only Pull-ups + Dips) with stacked, color-coded bars.
- Displays the current week's total.

#### 3.3.2 Exercise Statistics
- Lists all exercises ever logged, sorted alphabetically, with total workout count and lifetime reps.
- Drill-down view per exercise shows **weekly volume** and **monthly volume** as horizontal bar charts.
- A **Monthly Volume Widget** at the top tracks Pull-ups, Dips, and Chin-ups month-over-month with progress bars comparing to the previous month.

#### 3.3.3 Body Weight Tracking
- Add/edit/delete weight entries with date (calendar picker), weight (lbs), and optional notes.
- **Summary card**: current weight, starting weight, total change, rate of change (lbs/week), entry count.
- **Line chart** with gradient fill showing weight trend over time, with Y-axis labels, gridlines, and data points.
- **History list**: chronological entries with day-over-day change indicators (color-coded green/red).

#### 3.3.4 Protein Intake Tracking
- Log protein entries (grams + food description) with timestamps.
- **30-day view**: shows each day's total protein, number of meals, and expandable per-entry details.
- Today is always expanded by default; past days are collapsible.
- Edit and delete individual protein entries.

### 3.4 Quick Add Menu

A unified "+" button on the Home screen opens a **3-tab modal**:

1. **Workout** — Select a preset to start a new workout.
2. **Protein** — Quick-add protein entry (grams + food).
3. **Weight** — Quick-log a body weight entry.

### 3.5 Settings & Data Management

#### Workout Presets Management
- Create, edit, reorder (up/down), and delete workout presets.
- Each preset has: name, color (8-color palette), exercise list, and a "show in menu" toggle.
- Exercises are selected from a global exercise library.

#### Exercise Library
- Add/delete exercises from a master list.
- Exercises are available across all presets and workout forms.

#### Import/Export
- **Import presets** from CSV (name, exercise1, exercise2, ...).
- **Import workouts** from CSV (supports a specific columnar format with dates, exercises, sets, notes, and location).
- **Export all workouts** as CSV.

#### Backup System
- **Automatic backups** every 7 days via IndexedDB.
- Keeps the last 5 backups with timestamps.
- Users can view and restore any backup from the Settings screen.

#### Data Deletion
- "Delete All Workouts" with a two-step confirmation dialog. Presets are preserved.

### 3.6 Sharing & Clipboard

- **Copy to Sheets**: Formats a workout into a tab-separated format matching a specific Google Sheets structure (date, exercise, set1–set4, total, notes).
- **Share**: Uses the Web Share API (native iOS share sheet) to share a formatted text summary. Falls back to clipboard on unsupported browsers.

---

## 4. Theming

Four built-in themes, cycled by tapping the header logo:

| Theme | Background | Accent | Character |
|---|---|---|---|
| **Light** | Gray-50 | Blue | Clean, minimal |
| **Dark** | Gray-900 | Blue | Default, high-contrast |
| **Neon** | Black | Green | Cyberpunk/hacker aesthetic |
| **Forest** | Green-950 | Green | Earthy, nature-inspired |

Theme preference is persisted in localStorage. Legacy `darkMode` and `midnight` theme values are auto-migrated.

---

## 5. Technical Architecture

| Layer | Technology |
|---|---|
| **Framework** | Next.js (Pages Router) |
| **UI** | React with Hooks (functional components, ~100+ `useState` calls) |
| **Styling** | Tailwind CSS (utility-first, inline classes) |
| **Icons** | Custom inline SVG components |
| **Persistence** | `localStorage` for all primary data (workouts, presets, exercises, weight, protein, theme) |
| **Backup storage** | IndexedDB (`GorsLogBackups` database) |
| **PWA support** | `apple-mobile-web-app-capable`, viewport meta, safe-area handling |
| **Sharing** | Web Share API with clipboard fallback |

### Data Models (localStorage)

```
workouts[]        → { date, exercises[], notes, location, structure, structureDuration, elapsedTime }
  exercises[]     → { name, sets[], notes }
    sets[]        → { reps: number, weight: number|null }

presets[]         → { name, exercises: string[], color, includeInMenu }
exercises[]       → string[] (global exercise name list)
weightEntries[]   → { date, weight, notes }
proteinEntries[]  → { date, grams, food, timestamp }
theme             → 'light' | 'dark' | 'neon' | 'forest'
lastBackup        → timestamp string
```

---

## 6. UX Patterns

- **Bottom-sheet modals** with swipe-to-dismiss (touch gesture handling via `onTouchStart/Move/End`).
- **Confirmation dialogs** for all destructive actions (delete workout, delete preset, discard unsaved workout, end workout).
- **Toast notifications** for transient feedback (copy, save, export actions).
- **Sticky headers** — the weekly calendar and navigation bar remain fixed during scroll.
- **Scroll-linked week sync** — scrolling through the workout feed updates the weekly calendar strip.
- **Keyboard-aware** — numeric inputs use `inputMode="numeric"`, extra bottom padding on modals for on-screen keyboards.
- **Background scroll lock** when modals are open.
- **2-second branded loading screen** on app launch.

---

## 7. Non-Functional Requirements

| Requirement | Implementation |
|---|---|
| **Offline-first** | All data in localStorage/IndexedDB; no network requests required. |
| **Privacy** | Zero telemetry, no accounts, no server-side storage. |
| **Performance** | Single-page app, no external API calls, lightweight SVG icons. |
| **Mobile-optimized** | Touch targets ≥44px, safe-area insets, no-zoom viewport, swipe gestures. |
| **Data portability** | CSV import/export for workouts and presets. |
| **Data safety** | Auto-backup every 7 days, 5-backup retention, manual restore. |

---

## 8. Known Limitations & Future Considerations

- **Single-device**: No sync across devices (no backend/cloud).
- **localStorage limits**: ~5–10MB depending on browser; heavy users may eventually hit limits.
- **No authentication**: Anyone with device access can view/modify data.
- **Hardcoded exercise focus**: The Monthly Volume Widget is hardcoded to Pull-ups, Dips, and Chin-ups — not user-configurable.
- **No progressive overload tracking**: Weight per set is captured but not surfaced in stats (no weight progression charts).
- **No rest timer**: The workout timer tracks total duration but doesn't provide per-set rest period alerts.
- **CSV format is fragile**: Import relies on specific column positions and formatting conventions.
