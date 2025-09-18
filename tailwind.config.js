/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#0ea5e9',
					dark: '#0284c7',
					light: '#38bdf8',
				},
			},
			borderRadius: {
				xl: '1rem',
			},
		}
	},
	plugins: [],
}


