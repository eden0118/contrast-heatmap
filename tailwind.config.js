/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        'fail': '#3B82F6',     // Blue for fail
        'aa': '#FB923C',       // Orange for AA
        'aaa': '#EF4444'       // Red for AAA/Pass
      }
    }
  },
  plugins: []
};
