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
                warm: {
                    50: '#FDFBF7',
                    100: '#F6F2EB',
                    200: '#E9E0D2',
                    300: '#D5C4AC',
                    400: '#BBA07F',
                    500: '#A48259',
                    600: '#8A6741',
                    700: '#6D5034',
                    800: '#56402A',
                    900: '#483626',
                },
                sage: {
                    50: '#F4F7F4',
                    100: '#E6EFE6',
                    200: '#CDE0CE',
                    300: '#A7C7A9',
                    400: '#7BA77E',
                    500: '#5B8B5F',
                    600: '#436E46',
                    700: '#355738',
                    800: '#2C472E',
                    900: '#253B27',
                },
                sand: '#EFEBE4',
                'text-main': '#483626',
                'text-muted': '#8A6741',
                'border-soft': '#E9E0D2',
                'rose-alert': '#F43F5E',
            },
            fontFamily: {
                sans: ['"Nunito"', ...defaultTheme.fontFamily.sans],
                serif: ['"DM Serif Display"', ...defaultTheme.fontFamily.serif],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
        },
    },

    plugins: [forms],
};
