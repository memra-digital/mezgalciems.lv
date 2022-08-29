<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { onMount } from 'svelte';

	onMount(async () => {
		mapboxgl.accessToken = `pk.eyJ1IjoiZGF2bmlpbm8iLCJhIjoiY2s3NjR6aGR4MGx2bjNlc2J1ODd3enBpaSJ9.WMFnOuFQ0Q7HS8ZV9uDLHw`;

		let map = new mapboxgl.Map({
			container: `map`,
			style: `mapbox://styles/davniino/ckc6em1gv17ht1ioz6grd997m`,
			center: [21.1187, 56.3677],
			zoom: 18
		});
		map.on(`load`, () => {
			map.loadImage(`/files/map/church.png`, (error: any, image: any) => {
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
									coordinates: [21.11872, 56.36769]
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
	});
</script>

<svelte:head>
	<title>Kā nokļūt | Mežgalciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title font-bold text-3xl text-slate-900 mb-2">Kā nokļūt</h1>
<div class="h-80 mb-4 rounded-3xl bg-blue-300 shadow-lg shadow-slate-800/20 print:hidden" id="map"></div>

<h2 class="hidden print:block">Diemžēl karti nav iespējams izprintēt šeit. Jūs varat doties uz Google Maps, lai karti izprintētu.</h2>

<div class="block w-full text-center mt-4 print:hidden">
	<a class="font-title text-lg text-center text-slate-800 hover:text-blue-500 transition duration-200"
		href="https://www.google.com/maps/@56.3677,21.1187,18z"
		target="_blank" rel="noopener">

		Atvērt Google Maps
		<i class="bi bi-arrow-right"></i>
	</a>
</div>