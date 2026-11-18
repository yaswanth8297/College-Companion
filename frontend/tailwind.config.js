/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: '#F0EEE6',
          pink: {
            primary: '#F6C2D3',
            secondary: '#F4B1C8',
            accent: '#EF83B9',
            dark: '#D9529B',
          },
          green: {
            accent: '#9DCD59',
            dark: '#7AA73D',
            light: '#D4E9B3',
          },
          surface: '#FFFFFF',
          card: '#FBF9F5',
          border: '#E3DFD3',
          text: {
            primary: '#1A1C1E',
            secondary: '#4A5568',
            muted: '#718096',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
