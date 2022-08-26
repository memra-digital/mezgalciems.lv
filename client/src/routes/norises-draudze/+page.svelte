<script lang="typescript">
	import Navbar from '../../components/Navbar.svelte';
	import Footer from '../../components/Footer.svelte';
	import Loading from '../../components/Loading.svelte';
	import CookieNotice from '../../components/CookieNotice.svelte';

	import { onMount } from 'svelte';
	import { request } from 'graphql-request';
	import { apiUrl } from '../../globals';
	import { formatDate, parseURLs, escapeHTML } from '../../processing';

	let isLoading: boolean = true,
		nextDate: string,
		dateInfo: string,
		information: string;

	onMount(async () => {
		request(apiUrl, `
			{
				information {
					nextDate
					dateInfo
					information
				}
			}
		`).then((data: any) => {
			isLoading = false;

			nextDate = formatDate(data.information.nextDate).toLowerCase();
			dateInfo = data.information.dateInfo;
			information = data.information.information;
		});
	});
</script>

<svelte:head>
	<title>Norises draudzē | Mežgalciema baptistu draudze</title>
</svelte:head>

<CookieNotice />
<Navbar />

<main>
	<h1>Norises draudzē</h1>

	{#if isLoading}
		<Loading />
	{:else}
		<h3>Nākamais dievkalpojums {nextDate}</h3>
		<p>{@html parseURLs(escapeHTML(dateInfo))}</p>
		<br />
		<p>{@html parseURLs(escapeHTML(information))}</p>
	{/if}
</main>

<Footer />

<style lang="scss">
    main {
        margin-bottom: 1rem;

		word-wrap: break-word;

		h3 {
			font-size: 1.5rem;
		}
		p {
			transition: .5s color;
		}
    }
</style>
