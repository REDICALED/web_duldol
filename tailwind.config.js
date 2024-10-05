module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'dul-gray': '#656262',
        'dul-white': '#afb2b4',
      },
      fontFamily: {
        dongle: ['Dongle', 'sans-serif'], // Dongle 폰트
      },
    },
    screens: {
      "2sm": "300px",
      'sm': "640px",
      'md': "768px",
      'lg': "1024px",
      'xl': "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}