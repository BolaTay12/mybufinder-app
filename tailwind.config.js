/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#136dec',
                    dark: '#3b82f6',
                },
                background: {
                    light: '#f8fafc', // slate-50 equivalent
                    dark: '#0f172a', // slate-900 equivalent
                }
            },
            fontFamily: {
                sans: ['Lexend', 'sans-serif'],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                }
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out forwards',
                'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
                'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scale-in': 'scale-in 0.3s ease-out forwards',
            }
        },
    },
    plugins: [
        require('tailwindcss-animate')
    ],
}
