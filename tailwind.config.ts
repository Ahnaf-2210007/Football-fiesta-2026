import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#1A1A1A",
        "deep-blue": "#0B2D3A",
        "primary-yellow": "#FFD600",
        "vibrant-orange": "#FF6B00",
        "fiery-red": "#E63946",
        teal: "#00B3A4",
        "light-cyan": "#4EE4FF",
        stadium: {
          dark: "#0F141A",
          card: "#152430",
          border: "#1E384C",
          highlight: "#FFD600"
        }
      },
      fontFamily: {
        bebas: ["var(--font-bebas)", "Bebas Neue", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(255, 214, 0, 0.4)',
        'glow-cyan': '0 0 20px rgba(78, 228, 255, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 107, 0, 0.4)',
        'glow-red': '0 0 20px rgba(230, 57, 70, 0.4)',
      },
      backgroundImage: {
        'brush-gradient': 'linear-gradient(135deg, #FFD600 0%, #FF6B00 50%, #E63946 100%)',
        'stadium-glow': 'radial-gradient(circle at 50% 20%, rgba(11, 45, 58, 0.8) 0%, rgba(26, 26, 26, 1) 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
