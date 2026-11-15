import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        nasa: {
          blue: "#0B3D91",
          red: "#FC3D21",
          dark: "#051630",
          light: "#EBF3FF",
        },
      },
    },
  },
  plugins: [],
};
export default config;

