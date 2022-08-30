<script lang="ts">
	import AdminArticle from '$lib/components/AdminArticle.svelte';
	import Loading from '$lib/components/Loading.svelte';

	import { onMount } from 'svelte';
	import { request,  } from 'graphql-request';
	import { apiUrl } from '$lib/globals';
	import { formatDate } from '$lib/processing';
	import type { ArticleData } from '$lib/schemas';

	// The greeting that changes based on system time
	let time: number = new Date().getHours(),
		greeting: string = ``;
	if (time > 4 && time < 13) {
		greeting = `Labrīt!`;
	} else if (time > 12 && time < 19) {
		greeting = `Labdien!`;
	} else {
		greeting = `Labvakar!`;
	}

	let isLoading: boolean = true;

	let visitorsInLast7Days: number = 0,
		visitorsToday: number = 0,
		viewsInLast7Days: number = 0,
		newestArticle: ArticleData,
		nextDate: string;

	onMount(async () => {
		request(apiUrl, `
			{
				articles(page: 0) {
					articles {
						id
						title
						content
						image
						imageAlt
					}
				}
				information {
					nextDate
				}
				statistics(token: "${localStorage.getItem(`adminLoginToken`)}") {
					visitorsInLast7Days
					visitorsToday
					viewsInLast7Days
				}
			}
		`).then((data: any) => {
			isLoading = false;

			visitorsInLast7Days = data.statistics.visitorsInLast7Days;
			visitorsToday = data.statistics.visitorsToday;
			viewsInLast7Days = data.statistics.viewsInLast7Days;

			newestArticle = data.articles.articles[0];

			nextDate = formatDate(data.information.nextDate);
		});
	});
</script>

<svelte:head>
	<title>Sākums | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title text-3xl text-slate-900 mt-4 mb-2">{greeting}</h1>

{#if isLoading}
	<Loading />
{:else}
	<div class="grid grid-cols-3 gap-4 mb-4">
		<div class="text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
			<h1 class="text-4xl font-title text-slate-900">{visitorsInLast7Days}</h1>
			<p class="text-slate-600 font-bold">atsevišķi apmeklētāji pēdējās 7 dienās</p>
		</div>
		<div class="text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
			<h1 class="text-4xl font-title text-slate-900">{visitorsToday}</h1>
			<p class="text-slate-600 font-bold">atsevišķi apmeklētāji šodien</p>
		</div>
		<div class="text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
			<h1 class="text-4xl font-title text-slate-900">{viewsInLast7Days}</h1>
			<p class="text-slate-600 font-bold">skatījumi pēdējās 7 dienās</p>
		</div>
	</div>
	<a class="block w-full font-title text-lg text-center text-slate-900 hover:text-blue-500 transition duration-200" href="/admin/statistika">Apskatīt vairāk statistiku <i class="bi-arrow-right"></i></a>
{/if}

<h1 class="font-title text-3xl text-slate-900 mt-4 mb-1">Jaunākais raksts</h1>
{#if isLoading}
	<Loading />
{:else}
	<AdminArticle id={newestArticle.id} title={newestArticle.title} image={newestArticle.image} imageAlt={newestArticle.imageAlt} content={newestArticle.content} />
	<a class="block w-full mt-[-1rem] font-title text-lg text-center text-slate-900 hover:text-blue-500 transition duration-200" href="/admin/jaunumi">Apskatīt un rediģēt visus rakstus <i class="bi-arrow-right"></i></a>
{/if}

<h1 class="font-title text-3xl text-slate-900 mt-4">Nākamais dievkalpojums</h1>
{#if isLoading}
	<Loading />
{:else}
	<h3 class="font-title text-xl text-slate-700">{nextDate}</h3>
	<a class="block w-full font-title text-lg text-center text-slate-900 hover:text-blue-500 transition duration-200" href="/admin/norises-draudze">Rediģēt informāciju <i class="bi-arrow-right"></i></a>
{/if}