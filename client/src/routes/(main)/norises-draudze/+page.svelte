<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';

	import { onMount } from 'svelte';
	import { request } from 'graphql-request';
	import { apiUrl } from '$lib/globals';
	import { formatDate, parseURLs, escapeHTML } from '$lib/processing';

	let isLoading: boolean = true;
	let nextDate: string | null,
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

			if (data.information.nextDate !== null) {
				nextDate = formatDate(data.information.nextDate).toLowerCase();
			} else {
				nextDate = null;
			}

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
	{#if nextDate !== null}
		<h3 class="font-title font-bold text-xl text-slate-800">Nākamais dievkalpojums {nextDate}</h3>
	{/if}

	<p class="mb-6">{@html parseURLs(escapeHTML(dateInfo))}</p>
	<p>{@html parseURLs(escapeHTML(information))}</p>
{/if}