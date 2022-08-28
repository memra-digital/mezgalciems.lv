<script lang="ts">
	import "../app.css";

	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import CookieNotice from '../components/CookieNotice.svelte';
</script>

<div class="bg-slate-50">
	<CookieNotice />

	<Navbar />

	<main class="w-2/4 mx-auto">
		<slot></slot>
	</main>

	<Footer />
</div>