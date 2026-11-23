import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 12px 32px rgba(15, 23, 42, 0.08)",
      },
      colors: {
        ink: "#152032",
        brand: {
          50: "#eff8ff",
          100: "#d9efff",
          500: "#087ea4",
          600: "#066787",
          700: "#07536f",
          950: "#052f3e",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
