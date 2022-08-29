<script lang="typescript">
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
		title: string,
		content: string,
		font: string,
		videoLink: string
	}

	let isLoadingContent: boolean = false,
		loadingArticles: boolean = true,

		articleList: HistoryArticlePreview[] = [],
		currentArticle: HistoryArticle | null = null,
		currentArticleId: number,
		
		sidebar: HTMLElement,
		sidebarHeight: number,
		
		currentArticleFilterOption: number;

	// Fetch the article list on start
	onMount(async () => {
		sidebarHeight = sidebar.offsetTop;

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

	// When an article is selected from the list, fetch the articles content
	const loadArticle = (id: number) => {
		isLoadingContent = true;

		request(apiUrl, `
			{
				historyArticle(id: ${id.toString()}) {
					title
					content
					font
					videoLink
				}
			}
		`).then((data: any) => {
			isLoadingContent = false;

			currentArticleId = id;

			currentArticle = {
				title: data.historyArticle.title,
				content: data.historyArticle.content,
				font: data.historyArticle.font,
				videoLink: data.historyArticle.videoLink
			};
		});
	}

	// Updates the desktop sidebar on scroll
	const updateStickiness = () => {
		if (window.pageYOffset >= sidebarHeight - 64) {
			sidebar.style.position = `fixed`;
			sidebar.style.top = `2rem`;
			sidebar.style.width = `32%`;
		} else {
			sidebar.style.position = `static`;
			sidebar.style.width = `100%`;
		}
	}

	// Stuff for filtering
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
</script>

<svelte:head>
	<title>Vēsture | Mežgalciema baptistu draudze</title>
</svelte:head>

<svelte:window on:scroll={(e) => updateStickiness()} />

<h1 class="font-title font-bold text-3xl text-slate-900 mb-2">Vēsture</h1>
<div class="sidebar-wrapper desktop">
	<div class="sidebar" bind:this={sidebar}>
		<div
			class="filter">
			
			<p>Rādīt: </p>
			<div
				class="filter-dropdown">
				
				<Dropdown 
					options={filterOptionsDisplayList}
					bind:selected={currentArticleFilterOption} />
			</div>
		</div>

		<div
			class="sidebar-scrollarea">
			
			{#each filterArticles(currentArticleFilterOption) as article}
				<button
					class="sidebar-option"
					class:active={currentArticleId === article.id}
					on:click={() => loadArticle(article.id)}>

					<b>{article.title}</b>
					<p>{article.preview}...</p>
				</button>
			{:else}
				{#if loadingArticles}
					<Loading />
				{:else}
					<b>Nav rezultātu.</b>
				{/if}
			{/each}
		</div>
	</div>
</div>

<div class="reader">
	<div class="mobile">
		<button
			class="mobile-selector-open-btn"
			on:click={() => selectorAnimationProgress.set(1)}>

			Izvēlēties rakstu
		</button>
	</div>

	{#if isLoadingContent}
		<Loading />
	{:else if currentArticle !== null}
		<h1
			class:serif-font={currentArticle.font === `serif`}>
			
			{currentArticle.title}
		</h1>

		{#if currentArticle.videoLink !== ``}
			<iframe
				class="video"
				src="https://www.youtube.com/embed/{currentArticle.videoLink}"
				title="YouTube video atskaņotājs"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen>
			</iframe>
		{/if}

		<p
			class:serif-font={currentArticle.font === `serif`}>

			{@html parseURLs(escapeHTML(currentArticle.content)).replaceAll(`\n`, `<br />`)}
		</p>
	{:else}
		<p class="instructions desktop">
			<i class="bi bi-arrow-left moving-animation"></i> Izvēlieties kādu no rakstiem, lai to lasītu
		</p>
	{/if}
</div>
<div class="mobile">
	<div
		class="mobile-selector-bg"
		on:click={() => selectorAnimationProgress.set(0)}
		style={`opacity: ${$selectorAnimationProgress / 2};
				display: ${($selectorAnimationProgress === 0) ? `none` : `block`}`}></div>
	<div
		class="mobile-selector"
		style={`bottom: ${($selectorAnimationProgress * 85) - 85}%;
				box-shadow: 0px 0px 23px -3px rgba(66, 68, 74, ${$selectorAnimationProgress / 2});`}>

		<button on:click={() => selectorAnimationProgress.set(0)}>
			<i class="bi bi-x"></i>
		</button>

		<div
			class="filter">
			
			<p>Rādīt: </p>
			<div
				class="filter-dropdown">
				
				<Dropdown 
					options={filterOptionsDisplayList}
					bind:selected={currentArticleFilterOption} />
			</div>
		</div>

		<div
			class="mobile-selector-scrollarea">

			{#each filterArticles(currentArticleFilterOption) as article}
				<button class="sidebar-option" on:click={() => {
						loadArticle(article.id);
						selectorAnimationProgress.set(0);
					}}>

					<b>{article.title}</b>
					<p>{article.preview}...</p>
				</button>
			{:else}
				{#if loadingArticles}
					<Loading />
				{:else}
					<b>Nav rezultātu.</b>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	@import '../../../theme.scss';
	@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');

	main {
		margin-left: 10%;
		margin-right: 10%;

		width: 80%;
	}
	
	.sidebar-wrapper {
		display: inline-block;
		width: 40%;

		vertical-align: top;
	}
	.sidebar {
		margin-top: 1rem;

		text-align: left;
	}
	.sidebar-option {
		display: block;
		height: auto;
		
		text-align: left;

		padding: 0;

		border: 0; 

		background: none;
		color: $paragraph-color;

		margin: 0;
		margin-bottom: 1.5rem;

		transition: .2s all;
		
		&:hover,
		&:focus,
		&.active {
			opacity: 0.6;

			cursor: pointer;
		}
		b {
			font-size: 1.2rem;
			font-family: $title-font;
		}
		p {
			font-size: 1rem;
			line-height: 1.25rem;

			position: relative;
		}
	}
	.sidebar-scrollarea {
		padding-top: .5rem;

		max-height: calc(80vh - 3rem);

		overflow-y: auto;
		overflow-x: hidden;
	}

	.reader {
		display: inline-block;
		width: 60%;

		margin-left: -.5rem;

		padding: 1rem;
		
		h1 {
			font-weight: 700;
			text-align: center;
		}
	}

	.serif-font {
		font-family: 'Libre Baskerville', serif;
	}
	
	.video {
		display: block;
		width: 560px;
		height: 315px;

		margin: auto;
		margin-top: 1rem;
		margin-bottom: 1rem;

		border-radius: 1rem;

		background: #000000;

		box-shadow: 0px 0px 23px -3px $shadow-color;
	}

	.instructions {
		margin-top: 4rem;

		font-family: $title-font !important;
		font-size: 1.25rem;

		color: $title-color;
	
		opacity: 0.6;

		transition: .5s color;
	}
	.moving-animation {
		display: inline-block;

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

	.filter {
		margin-bottom: 1rem;

		transition: .5s color;

		p, .filter-dropdown {
			display: inline-block;

			vertical-align: middle;
		}
	}

	.mobile-selector-bg {
		position: fixed;
		top: 0; 
		left: 0;

		display: block;
		width: 100%;
		height: 100%;

		background: #000000;

		z-index: 5;
	}
	.mobile-selector {
		position: fixed;
		left: 0;

		display: block;
		width: 100%;
		height: 85%;

		color: $paragraph-color;
		background: $background-color;

		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;

		z-index: 6;
		
		button {
			width: calc(100% - 1rem);

			background: none;
			color: $paragraph-color;

			padding: 0;

			border: 0;

			font-size: 2rem;

			text-align: center;

			cursor: pointer;
		}
		b {
			font-family: $title-font;
			font-size: 1.2rem;
		}
		.sidebar-option {
			text-align: left;

			margin-left: 1rem;
			margin-right: 1rem;
		}
	}
	.mobile-selector-scrollarea {
		overflow-x: hidden;
		overflow-y: auto;

		height: calc(85% - 2rem);
	}
	.mobile-selector-open-btn {
		margin-bottom: 3rem;
	}
	
	.mobile {
		text-align: center;
	}

	@media only screen and (max-width: 875px) {
		main {
			width: calc(100% - 1rem);

			margin-left: .5rem;
			margin-right: .5rem;
		}
		.reader {
			width: 100%;
			
			margin-left: 0;
			
			p {
				text-align: left;
			}
		}
		.video {	
			width: 100%;
			height: 56vw;
		}
	}
	@media print {
		.mobile,
		.video,
		.moving-animation,
		.sidebar-wrapper {
			display: none;
		}
		.instructions {
			margin-top: 0;
		}
		.reader {
			width: 100%;
		}
	}
</style>