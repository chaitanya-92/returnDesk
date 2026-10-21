import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211d",
        muted: "#69766f",
        canvas: "#f5f7f4",
        brand: { DEFAULT: "#245e4a", light: "#e3eee8", dark: "#174432" },
        line: "#e3e8e4",
      },
      boxShadow: { panel: "0 8px 30px rgba(20, 45, 32, 0.06)" },
    },
  },
  plugins: [forms],
};

export default config;
