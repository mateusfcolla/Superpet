import type { Config } from "tailwindcss";

const colors = require("tailwindcss/colors");
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        wk: {
          primary: "#0085FE",
          "primary-dark": "#165656",
          secondary: "#FBFF3A",
          "secondary-dark": "#DFE242",
          success: "#28A745",
          error: "#DC3545",
          warning: "#FBFF3A",
          info: "#DFE242",
        },
        front: {
          blue: "#0071bc",
        },
        "dark-tremor": {
          brand: {
            faint: "#0B1229",
            muted: colors.blue[950],
            subtle: colors.blue[800],
            DEFAULT: colors.blue[500],
            emphasis: colors.blue[400],
            inverted: colors.blue[950],
          },
          background: {
            muted: "#131A2B",
            subtle: colors.gray[800],
            DEFAULT: colors.gray[900],
            emphasis: colors.gray[300],
          },
          border: {
            DEFAULT: colors.gray[800],
          },
          ring: {
            DEFAULT: colors.gray[800],
          },
          content: {
            subtle: colors.gray[600],
            DEFAULT: colors.gray[500],
            emphasis: colors.gray[200],
            strong: colors.gray[50],
            inverted: colors.gray[950],
          },
        },
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",
      },
      fontSize: {
        "tremor-label": ["0.75rem", { lineHeight: "1rem" }],
        "tremor-default": ["1.75rem", { lineHeight: "2rem" }],
        "tremor-title": ["2rem", { lineHeight: "2.25rem" }],
        "tremor-metric": ["2.5rem", { lineHeight: "2.75rem" }],
      },
      fontFamily: {
        Inconsolata: ["Inconsolata", "monospace"],
        SourceSansPro: ["Source Code Pro", "monospace"],
        Inter: ["Inter", "sans-serif"],
        Hind: ["Hind Siliguri", "sans-serif"],
      },
      screens: {
        "2xl": "1685px",
      },
      padding: {
        "100": "25rem",
        "104": "26rem",
        "108": "27rem",
        "112": "28rem",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "7%",
        xl: "8%",
        "2xl": "10%",
      },
    },
  },
};
export default config;
