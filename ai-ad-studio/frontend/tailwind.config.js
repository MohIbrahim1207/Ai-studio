/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          ink: "#061117",
          steel: "#122533",
          cyan: "#19c9c0",
          peach: "#ffc27d"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(25,201,192,.35), 0 12px 30px rgba(0,0,0,.35)"
      }
    }
  },
  plugins: []
};
