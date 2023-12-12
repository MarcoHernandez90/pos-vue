/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './index.html',
    './src/**/*.{html,js,vue}',
    './formkit.config.js',
    './node_modules/vue-tailwind-datepicker/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        "vtd-primary": colors.indigo
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
