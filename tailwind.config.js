/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  safelist: [
    // Preset colors - must be safelisted since they're dynamically constructed
    { pattern: /border-(blue|purple|green|yellow|red|pink|orange|cyan)-400/ },
    { pattern: /bg-(blue|purple|green|yellow|red|pink|orange|cyan)-(400|500)/ },
    { pattern: /text-(blue|purple|green|yellow|red|pink|orange|cyan)-400/ },
    { pattern: /bg-(blue|purple|green|yellow|red|pink|orange|cyan)-500\/10/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
