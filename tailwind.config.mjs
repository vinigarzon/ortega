/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // PALETA ORTEGA & ORTEGA — Navy + Gold + Grises neutros
        ink: {
          DEFAULT: "#434c8c", // navy/indigo brand
          50: "#eef0f8",
          100: "#d5d9ec",
          200: "#a8b1d4",
          300: "#7a86bd",
          400: "#5961a3",
          500: "#434c8c",
          600: "#363d70",
          700: "#2a2f57",
          800: "#1f233f",
          900: "#13162a",
          dark: "#363d70",
          light: "#5961a3",
        },
        gold: {
          DEFAULT: "#ccbc54",
          50: "#faf7e6",
          100: "#f3edc4",
          200: "#e7da8a",
          300: "#dccc6c",
          400: "#d4c45e",
          500: "#ccbc54",
          600: "#a89829",
          700: "#7d7320",
          light: "#d9cb70",
          dark: "#a89829",
        },
        // Fondos claros
        bone: {
          DEFAULT: "#f3f3f3",
          50: "#ffffff",
          100: "#fafafa",
          200: "#f3f3f3",
          300: "#ececec",
        },
        // Grises medios (footer, secciones intermedias)
        stone: {
          DEFAULT: "#a4a4a4",
          light: "#c4c4c4",
          dark: "#7a7a7a",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        prose: ['Lora', 'Georgia', 'serif'],
      },
      maxWidth: {
        site: "1200px",
      },
      letterSpacing: {
        widest: "0.18em",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(67, 76, 140, 0.10)",
      },
    },
  },
  plugins: [],
};
