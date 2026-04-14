/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                gold: { DEFAULT: '#C9A84C', light: '#E8C97A', dim: '#7A5E28' },
                jade: { DEFAULT: '#2E6B48', light: '#4A9B6A' },
                red: { DEFAULT: '#B83228' },
                ink: '#0D0A04',
                parchment: { DEFAULT: '#F0E6C8', 2: '#D8C89A' }
            },
            fontFamily: {
                serif: ['Noto Serif', 'serif'],
                display: ['Cinzel', 'serif']
            }
        }
    },
    plugins: []
}