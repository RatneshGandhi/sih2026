/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Sovereign Brand Identity pulled from Stitch
        primary: "#001533",
        "primary-container": "#132a4c",
        "on-primary": "#ffffff",
        "on-primary-container": "#7d92ba",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#b2c7f1",
        "on-primary-fixed": "#011b3d",
        "on-primary-fixed-variant": "#32476b",

        // Verification & Affirmed Possession (Emerald)
        secondary: "#006c49",
        govEmerald: "#0E9F6E",
        govEmeraldDark: "#057A55",
        "secondary-container": "#7ef6be",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#00714c",
        "secondary-fixed": "#81f9c1",
        "secondary-fixed-dim": "#63dca6",

        // Statutory Alert & Dispute Warning (Amber)
        tertiary: "#221200",
        govAmber: "#F2A93B",
        govAmberLight: "#FEF08A",
        "tertiary-container": "#3d2500",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#c68312",
        "tertiary-fixed": "#ffddb5",
        "tertiary-fixed-dim": "#ffb956",
        "on-tertiary-fixed": "#2a1800",
        "on-tertiary-fixed-variant": "#633f00",

        // Error / Destructive
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        // High-legibility administrative surfaces
        surface: "#f8f9ff",
        "surface-dim": "#ccdbf3",
        "surface-bright": "#f8f9ff",
        "surface-variant": "#d5e3fc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d5e3fc",
        "on-surface": "#0d1c2e",
        "on-surface-variant": "#44474e",
        "inverse-surface": "#233144",
        "inverse-on-surface": "#eaf1ff",
        outline: "#74777f",
        "outline-variant": "#c4c6cf",
        "surface-tint": "#4a5f84",

        // GovTech Theme Extension
        govNavy: "#132A4C",
        govNavyDark: "#0A172A",
        govSlate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        'space-2xs': '0.25rem',
        'space-xs': '0.5rem',
        'space-sm': '0.75rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2rem',
        'space-2xl': '3rem',
        gutter: '1.5rem',
        'margin-desktop': '2rem',
        'margin-mobile': '1rem',
      }
    },
  },
  plugins: [],
}
