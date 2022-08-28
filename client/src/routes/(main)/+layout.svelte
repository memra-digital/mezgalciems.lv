<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import CookieNotice from '$lib/components/CookieNotice.svelte';
</script>

<div class="bg-slate-50">
	<CookieNotice />

	<Navbar />

	<main class="w-2/4 mx-auto">
		<slot></slot>
	</main>

	<Footer />
</div>