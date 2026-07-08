import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E50914",
          dark: "#0B0B0F",
          card: "#14141A",
          muted: "#8B8B9A",
        },
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(229,9,20,0.35), transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
