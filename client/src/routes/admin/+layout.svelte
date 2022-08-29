<script lang="ts">
	import AdminNavbar from '$lib/components/admin/AdminNavbar.svelte';
	import AdminFooter from '$lib/components/admin/AdminFooter.svelte';
</script>

<div class="bg-slate-100 min-h-screen">
	<AdminNavbar />

	<main class="w-1/2 mx-auto">
		<slot></slot>
	</main>

	<AdminFooter />
</div>