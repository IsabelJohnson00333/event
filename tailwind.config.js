export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#17b0cf",
        "accent-peach": "#F7B39E",
        "text-dark": "#3B424B",
        "background-light": "#f8fafc",
        "background-dark": "#0f172a"
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px"
      }
    }
  },
  plugins: []
};