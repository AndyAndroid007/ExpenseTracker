/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#007aff',
        accent: '#5856d6',
        appbg: '#f2f2f7',
        surface: '#ffffff',
        labelPrimary: '#1c1c1e',
        labelSecondary: '#3c3c43',
        labelTertiary: '#8e8e93',
        separator: '#d1d1d6',
        blueLight: '#e8f1ff',
        violetLight: '#eeecff',
      },
    },
  },
  plugins: [],
}
