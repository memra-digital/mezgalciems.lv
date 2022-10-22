<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';

	const popupAnimation = tweened(-6, {
		duration: 600,
		easing: quartInOut
	});

	onMount(() => {
		if (localStorage.getItem(`cookiesAllowed`) === undefined || localStorage.getItem(`cookiesAllowed`) === null) {
			popupAnimation.set(0);
		}
	});

	// The choices
	const agree = () => {
		popupAnimation.set(-6);
		localStorage.setItem(`cookiesAllowed`, `true`);
		localStorage.setItem(`statisticsUserToken`, Math.random().toString(16));
	}
	const disagree = () => {
		popupAnimation.set(-6);
		localStorage.setItem(`cookiesAllowed`, `false`);
		localStorage.setItem(`statisticsUserToken`, ``);
	}
</script>

<div 
	class="fixed left-0 block w-full h-[5rem] text-center z-20 print:hidden"
	style="bottom: {$popupAnimation}rem;
			display: {$popupAnimation === -6 ? `none` : `block`}">
	
	<div class="inline-block shadow-lg shadow-slate-800/20 bg-white text-black rounded-3xl mb-4 print:hidden"> 
		<p class="inline-block ml-4">
			Vai Jūs piekrītat izmantot sīkdatnes?
			<a class="link" href="/privatuma-politika">Uzzināt vairāk...</a>
		</p>
		<button class="inline-block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 my-2 ml-2 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
			on:click={() => agree()}>Piekrītu</button>
		<button class="inline-block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 my-2 mr-2 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
			on:click={() => disagree()}>Nepiekrītu</button>
	</div>
</div>