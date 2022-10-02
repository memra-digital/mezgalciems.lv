/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				'title': ['Overpass', 'sans-serif'],
				'sans': ['Open Sans', 'sans-serif'],
				'serif': ['Libre Baskerville', 'serif']
			},
			screens: {
				'xs': '400px'
			}
		}
	},
	plugins: [],
}
