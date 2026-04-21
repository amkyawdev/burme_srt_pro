/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '2xl': '2rem',
      },
      colors: {
        'particle-1': '#88bbff',
        'particle-2': '#c2e0ff',
      },
      animation: {
        'subtitle-appear': 'subtitleAppear 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'pulse-fetch': 'pulseFetch 0.8s ease-in-out infinite',
        'toast-slide': 'toastSlide 0.3s ease-out',
      },
      keyframes: {
        subtitleAppear: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseFetch: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.8' },
        },
        toastSlide: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}