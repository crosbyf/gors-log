export const themes = {
  light: {
    name: 'Light', bg: 'bg-gray-50', text: 'text-gray-900',
    cardBg: 'bg-white', cardBorder: 'border-gray-200',
    inputBg: 'bg-white', inputBorder: 'border-gray-300',
    headerGradient: 'from-gray-100 to-gray-200',
    headerBorder: 'border-gray-300', accent: 'blue', isDark: false
  },
  dark: {
    name: 'Dark', bg: 'bg-gray-900', text: 'text-white',
    cardBg: 'bg-gray-800', cardBorder: 'border-gray-700',
    inputBg: 'bg-gray-800', inputBorder: 'border-gray-600',
    headerGradient: 'from-gray-800 to-gray-900',
    headerBorder: 'border-gray-700/50', accent: 'blue', isDark: true
  },
  neon: {
    name: 'Neon', bg: 'bg-black', text: 'text-green-50',
    cardBg: 'bg-zinc-950', cardBorder: 'border-green-500/30',
    inputBg: 'bg-zinc-950', inputBorder: 'border-green-500/50',
    headerGradient: 'from-zinc-950 to-black',
    headerBorder: 'border-green-500/50', accent: 'green', isDark: true
  },
  forest: {
    name: 'Forest', bg: 'bg-green-950', text: 'text-green-50',
    cardBg: 'bg-green-800', cardBorder: 'border-green-600',
    inputBg: 'bg-green-800', inputBorder: 'border-green-500',
    headerGradient: 'from-green-700 to-green-900',
    headerBorder: 'border-green-400/50', accent: 'green', isDark: true
  }
};

export const themeOrder = ['light', 'dark', 'neon', 'forest'];

export const nextTheme = (current) => {
  const idx = themeOrder.indexOf(current);
  return themeOrder[(idx + 1) % themeOrder.length];
};

export const getTheme = (key) => themes[key] || themes.dark;

// Preset color palette
export const presetColors = [
  { name: 'Blue', border: 'border-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  { name: 'Purple', border: 'border-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  { name: 'Green', border: 'border-green-400', bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  { name: 'Yellow', border: 'border-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  { name: 'Red', border: 'border-red-400', bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  { name: 'Pink', border: 'border-pink-400', bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-400' },
  { name: 'Orange', border: 'border-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
  { name: 'Cyan', border: 'border-cyan-400', bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
];

export const getPresetColor = (presets, locationName) => {
  const preset = presets.find(p => p.name === locationName);
  if (preset?.color) {
    return presetColors.find(c => c.name === preset.color) || presetColors[0];
  }
  // Legacy fallback
  const legacy = { 'Garage BW': 0, 'Manual': 2, 'Garage 10': 1, 'BW-only': 3 };
  return presetColors[legacy[locationName] ?? 0];
};
