<script lang="typescript">
	import Loading from '$lib/components/Loading.svelte';

	import { onMount } from 'svelte';
	import { request } from 'graphql-request';
	import { apiUrl } from '$lib/globals';
	import { formatDate, parseURLs, escapeHTML } from '$lib/processing';

	let isLoading: boolean = true;
	let nextDate: string,
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

<h1 class="font-title font-bold text-3xl text-slate-900 mb-2">Norises draudzē</h1>

{#if isLoading}
	<Loading />
{:else}
	<h3 class="font-title font-bold text-xl text-slate-800">Nākamais dievkalpojums {nextDate}</h3>
	<p class="mb-6">{@html parseURLs(escapeHTML(dateInfo))}</p>
	<p>{@html parseURLs(escapeHTML(information))}</p>
{/if}