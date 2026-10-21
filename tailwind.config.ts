import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#23221E",
        muted: "#777164",
        canvas: "#FAF8F2",
        brand: { DEFAULT: "#F2B719", light: "#FBEFC0", dark: "#DFAE12" },
        line: "#E7E2D6",
      },
      boxShadow: { panel: "0 8px 30px rgba(48, 42, 26, 0.06)" },
    },
  },
  plugins: [forms],
};

export default config;
