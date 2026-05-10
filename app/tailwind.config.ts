import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          mint: "hsl(174 41% 92% / <alpha-value>)",       /* #E0F2F1 */
          "dark-blue": "hsl(234 64% 30% / <alpha-value>)", /* #1A237E */
          teal: "hsl(174 61% 40% / <alpha-value>)",        /* #26A69A */
          grey: "hsl(0 0% 46% / <alpha-value>)",           /* #757575 */
          "lavender-grey": "hsl(300 3% 94% / <alpha-value>)", /* #F0EEF0 */
          /* Legacy aliases kept for component compatibility */
          peach: "hsl(300 3% 94% / <alpha-value>)",
          pink: "hsl(300 3% 94% / <alpha-value>)",
          lavender: "hsl(300 3% 94% / <alpha-value>)",
          ice: "hsl(174 30% 94% / <alpha-value>)",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
