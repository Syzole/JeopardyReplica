const {nextui} = require('@nextui-org/theme');
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
  darkMode: "class",
 plugins: [nextui()],
};
exports.default = config;
