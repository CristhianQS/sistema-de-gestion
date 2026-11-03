/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Títulos: grotesca moderna con carácter
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        // Color institucional UPeU Juliaca: #003366 = brand-900.
        // Rojo, verde y ámbar se reservan para estados (error, éxito, pendiente).
        brand: {
          50: '#eef4fa',
          100: '#d8e5f3',
          200: '#b0c9e6',
          300: '#7fa7d3',
          400: '#5288c0',
          500: '#2f6eab',
          600: '#1d5a97',
          700: '#124b85',
          800: '#0a3f75',
          900: '#003366',
          950: '#001f3f',
        },
      },
    },
  },
  plugins: [],
}
