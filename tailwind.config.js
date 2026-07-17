/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161514",
        paper: "#FAFAF7",
        panel: "#F1F0EA",
        line: "#E2E0D6",
        brand: {
          50: "#EEF5F3",
          100: "#D6E8E3",
          400: "#3E8F82",
          500: "#0F6B5E",
          600: "#0B554A",
          700: "#083F37",
        },
        warn: "#B45309",
        danger: "#B4231F",
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
