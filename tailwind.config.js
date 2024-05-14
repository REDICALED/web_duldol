module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dul-gray': '#656262',
        'dul-white': '#afb2b4',
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
  plugins: [],
}