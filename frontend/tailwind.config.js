/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          200: "#302e2b",
          300: "#ebecd3",
        },
        green: {
          300: "#7d945d",
          400: "#8cb55a",
          500: "#acd06f",
        },
      },
    },
  },
  plugins: [],
};
