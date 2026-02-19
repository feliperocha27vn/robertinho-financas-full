/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Include all source paths that contain NativeWind/Tailwind classes.
  // For Expo Router we keep src/app and src/**/* so files in src/ are scanned.
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
}
