<script lang="typescript">
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import CookieNotice from '../components/CookieNotice.svelte';

	import { onMount } from 'svelte';

	// I know this may look like an error, but it works!
	onMount(async () => {
		loadMapbox();
	});

	const loadMapbox = () => {
		try {
			mapboxgl.accessToken = `pk.eyJ1IjoiZGF2bmlpbm8iLCJhIjoiY2s3NjR6aGR4MGx2bjNlc2J1ODd3enBpaSJ9.WMFnOuFQ0Q7HS8ZV9uDLHw`;
			var map = new mapboxgl.Map({
				container: `map`,
				style: `mapbox://styles/davniino/ckc6em1gv17ht1ioz6grd997m`,
				center: [21.1187, 56.3677],
				zoom: 18
			});
			map.on(`load`, () => {
				map.loadImage(`/files/church.png`, (error: any, image: any) => {
					if (error) throw error;
					map.addImage(`custom-marker`, image);
					map.addLayer({
						id: `markers`,
						type: `symbol`,
						source: {
							type: `geojson`,
							data: {
								type: `FeatureCollection`,
								features: [{
									type: `Feature`,
									properties: {},
									geometry: {
										type: `Point`,
										coordinates: [21.1187, 56.3677]
									}
								}]
							}
						},
						layout: {
							"icon-image": `custom-marker`,
						}
					});
				});
			});
		} catch (e: any) {
			// If the loading failed, it's probably because Mapbox GL JS hasn't loaded yet, so just
			// try again a little bit later
			setTimeout(loadMapbox, 500);
		}
	}
</script>

<svelte:head>
	<title>Kā nokļūt | Mežgalciema baptistu draudze</title>
	<script src="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.js"></script>
	<link href="https://api.mapbox.com/mapbox-gl-js/v1.12.0/mapbox-gl.css" rel="stylesheet" />
</svelte:head>

<CookieNotice />
<Navbar />

<main>
	<h1>Kā nokļūt</h1>
	<div id="map" class="map"></div>

	<h2 class="printing-disclaimer">Diemžēl karti nav iespējams izprintēt.</h2>

	<a href="https://www.google.com/maps/@56.3677,21.1187,18z" target="_blank" rel="noopener">
		<p>Atvērt Google Maps</p>
		<i class="bi bi-arrow-right"></i>
	</a>
</main>

<Footer />

<style lang="scss">
	@import '../theme.scss';

	.map {
		height: 20rem;

		border-radius: 1rem;

		margin-top: 1rem;
		margin-bottom: 1rem;

		box-shadow: 0px 0px 23px -3px $shadow-color;
		
		background: #7babe5;

		border: 0;
	}

	.printing-disclaimer {
		display: none;
	}

	a {
		display: inline-block;
		width: 100%;
			
		text-align: center;

		background: none;

		margin-bottom: 2rem;
		
		p, i {
			display: inline-block;

			font-size: 1.2rem;
			font-family: $title-font;

			color: $title-color;

			margin: 0;

			transition: .2s all;
		}
		&:hover p {
			margin-right: .5rem;
		}
		&:hover i {
			margin-left: .5rem;
		}
		&:focus-visible {
			color: $theme-color;
		}
	}

	@media print {
		.printing-disclaimer {
			display: block;
		}
		.map,
		a {
			display: none;
		}
	}
</style>