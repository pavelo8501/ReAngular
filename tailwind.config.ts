
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./projects/playground/src/**/*.{html,ts}",
    "./projects/form-controls/src/lib/item-editor/**/*.{html,ts}"
  ],
  theme: {
    screens: {
        'xs': '370px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
    },
    extend: {},
  },
  plugins: [],
}