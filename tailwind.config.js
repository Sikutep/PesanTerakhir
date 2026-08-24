import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                obsidian: '#0B0F19',
                'slate-deep': '#0F172A',
                charcoal: '#1E293B',
                'charcoal-light': '#263347',
                'border-dim': 'rgba(255,255,255,0.07)',
                'border-subtle': 'rgba(255,255,255,0.12)',
                emerald: {
                    DEFAULT: '#10B981',
                    dim: 'rgba(16,185,129,0.15)',
                    glow: 'rgba(16,185,129,0.35)',
                },
                amber: {
                    DEFAULT: '#F59E0B',
                    dim: 'rgba(245,158,11,0.15)',
                },
                silver: '#94A3B8',
                snow: '#F8FAFC',
                'rose-alert': '#F43F5E',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                serif: ['"DM Serif Display"', ...defaultTheme.fontFamily.serif],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
        },
    },

    plugins: [forms],
};
