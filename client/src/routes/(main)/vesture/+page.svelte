<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { request, gql } from 'graphql-request';
	import { apiUrl } from '$lib/globals';
	import { parseURLs, escapeHTML } from '$lib/processing';

	interface HistoryArticlePreview {
		id: number,
		title: string,
		preview: string,
		type: string
	}
	interface HistoryArticle {
		id: number,
		title: string,
		content: string,
		font: string,
		videoLink: string
	}

	let isLoadingContent: boolean = false,
		loadingArticles: boolean = true;

	let articleList: HistoryArticlePreview[] = [],
		currentArticle: HistoryArticle | null = null;
		
	let sidebarElement: HTMLElement,
		sidebarHeight: number;
		
	let currentArticleFilterOption: number;

	// Fetches the content of the article
	const loadArticle = (id: number) => {
		isLoadingContent = true;

		request(apiUrl, `
			{
				historyArticle(id: ${id.toString()}) {
					id
					title
					content
					font
					videoLink
				}
			}
		`).then((data: any) => {
			isLoadingContent = false;

			currentArticle = data.historyArticle;
		});
	}

	// Updates the desktop sidebar on scroll
	const updateStickiness = () => {
		if (window.pageYOffset >= sidebarHeight - 64) {
			sidebarElement.style.position = `fixed`;
			sidebarElement.style.top = `4rem`;
			sidebarElement.style.width = `30%`;
		} else {
			sidebarElement.style.position = `static`;
			sidebarElement.style.width = `100%`;
		}
	}

	// Article filtering
	const filterOptionsDisplayList: string[] = [
		`Visu`,
		`Draudzes vēsturi`,
		`Baptistu vēsturi`
	];
	const filterOptionsValueList: string[] = [
		`church`,
		`baptist`
	];
	const filterArticles = (index: number) => {
		let results: HistoryArticlePreview[] = [];
		
		if (index === 0) {
			results = articleList;
		} else {
			for (let i: number = 0; i < articleList.length; i++) {
				if (filterOptionsValueList[index - 1] === articleList[i].type) {
					results.push(articleList[i]);
				}
			}
		}

		return results;
	}

	// Provides animation for the mobile selector
	const selectorAnimationProgress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	onMount(async () => {
		// Fetches the article list
		sidebarHeight = sidebarElement.offsetTop;

		loadingArticles = true;

		request(apiUrl, `
			{
				historyArticles {
					articles {
						id
						title
						preview
						type
					}
				}
			}
		`).then((data: any) => {
			loadingArticles = false;

			articleList = data.historyArticles.articles;
		});
	});
</script>

<svelte:head>
	<title>Vēsture | Mežgalciema baptistu draudze</title>
</svelte:head>

<svelte:window on:scroll={(e) => updateStickiness()} />

<h1 class="font-title font-bold text-3xl text-slate-900 mb-4 print:mb-0">Vēsture</h1>

<div class="hidden md:inline-block inline-block w-2/5 align-top print:hidden">
	<div class="hidden md:block" bind:this={sidebarElement}>
		<div class="mb-4 h-8">
			<p class="inline-block">Rādīt: </p>
			<div class="inline-block">
				
				<Dropdown 
					options={filterOptionsDisplayList}
					bind:selected={currentArticleFilterOption} />
			</div>
		</div>

		<div
			class="pt-2 max-h-[calc(80vh - 3rem)] overflow-y-auto overflow-x-hidden">
			
			{#each filterArticles(currentArticleFilterOption) as article}
				<button
					class="block text-left mb-6 w-full hover:opacity-75 transition duration-200"
					class:opacity-75={(currentArticle?.id ?? -1) === article.id}
					on:click={() => loadArticle(article.id)}>

					<b class="font-title text-slate-900 leading-5">{article.title}</b>
					<p class="text-slate-600 leading-5">{article.preview}...</p>
				</button>
			{:else}
				{#if loadingArticles}
					<Loading />
				{:else}
					<b class="text-slate-600">Nav rezultātu.</b>
				{/if}
			{/each}
		</div>
	</div>
</div>

<div class="block md:hidden print:hidden">
	<button class="block w-1/2 bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mx-auto rounded-full shadow-sm shadow-blue-200"
		on:click={() => selectorAnimationProgress.set(1)}>

		Izvēlēties rakstu
	</button>
</div>

<div class="inline-block w-full md:w-3/5 ml-[-5px] mt-4 md:mt-0">
	{#if isLoadingContent}
		<Loading />
	{:else if currentArticle !== null}
		<h1 class="block w-full text-center text-2xl font-title font-bold" class:font-serif={currentArticle.font === `serif`}>
			{currentArticle.title}
		</h1>

		{#if currentArticle.videoLink !== ``}
			<iframe
				class="block w-full max-w-[28rem] aspect-video mx-auto mt-2 mb-4 rounded-3xl bg-black shadow-lg shadow-slate-800/20"
				src="https://www.youtube.com/embed/{currentArticle.videoLink}"
				title="YouTube video atskaņotājs"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen>
			</iframe>
		{/if}

		<p class:font-serif={currentArticle.font === `serif`}>
			{@html parseURLs(escapeHTML(currentArticle.content)).replaceAll(`\n`, `<br />`)}
		</p>
	{:else}
		<p class="hidden md:block text-slate-600 font-bold mt-14 print:block print:text-center print:mt-0">
			<i class="bi bi-arrow-left moving-animation inline-block print:hidden"></i> Izvēlieties kādu no rakstiem, lai to lasītu
		</p>
	{/if}
</div>

<div
	class="fixed top-0 left-0 w-screen h-screen z-20 bg-black print:hidden"
	on:click={() => selectorAnimationProgress.set(0)}
	style={`opacity: ${$selectorAnimationProgress / 2};
			display: ${($selectorAnimationProgress === 0) ? `none` : `block`}`}></div>

<div class="fixed left-0 block w-screen h-[85vh] z-30 bg-white rounded-t-3xl p-4 print:hidden"
	style={`bottom: ${($selectorAnimationProgress * 85) - 85}%;`}>

	<button class="w-8 h-8 text-4xl float-right" on:click={() => selectorAnimationProgress.set(0)}>
		<i class="bi bi-x"></i>
	</button>

	<div class="mb-4 h-8">
		<p class="inline-block">Rādīt: </p>
		<div class="inline-block">
			<Dropdown options={filterOptionsDisplayList}
				bind:selected={currentArticleFilterOption} />
		</div>
	</div>

	<div class="overflow-x-hidden overflow-y-auto h-[calc(85%-2rem)]">
		{#each filterArticles(currentArticleFilterOption) as article}
			<button class="block text-left mb-6 w-full"
				on:click={() => {
					loadArticle(article.id);
					selectorAnimationProgress.set(0);
				}}>

				<b class="font-title text-slate-900 leading-5">{article.title}</b>
				<p class="text-slate-600 leading-5">{article.preview}...</p>
			</button>
		{:else}
			{#if loadingArticles}
				<Loading />
			{:else}
				<b class="block w-full text-center text-slate-600">Nav rezultātu.</b>
			{/if}
		{/each}
	</div>
</div>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');

	.moving-animation {
		animation-name: moving-animation;
		animation-iteration-count: infinite;
		animation-duration: 2.5s;
		animation-timing-function: ease-in-out;
	}
	@keyframes moving-animation {
		0% { transform: translateX(0); }
		50% { transform: translateX(-0.5rem); }
		100% { transform: translateX(0); }
	}
</style>