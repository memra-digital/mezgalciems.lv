<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

	import { onMount } from 'svelte';
	import { tweened, type Tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { apiUrl } from '$lib/globals';
	import { request, gql } from 'graphql-request';

	let isLoadingList: boolean = true,
		isLoadingEditor: boolean = true,
		isSaving: boolean = false;

	let listEl: HTMLElement,
		editorEl: HTMLElement;

	let listTransitionProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});
	let editorTransitionProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});

	let confirmationDialogProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});
	let videoDialogProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});
	
	interface HistoryArticleListItem {
		id: number,
		title: string,
		preview: string
	}
	let articleList: HistoryArticleListItem[];

	interface HistoryArticle {
		id: number,
		title: string,
		content: string,
		type: string,
		font: string,
		videoLink: string
	}
	let editorArticle: HistoryArticle;
	
	const openList = () => {
		editorTransitionProgress.set(-editorEl.clientWidth);
		listTransitionProgress.set(0);
		isLoadingList = true;

		window.location.hash = ``;

		const query = gql`
			{
				historyArticles {
					articles {
						id
						title
						preview
					}
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoadingList = false;

			articleList = data.historyArticles.articles;
		});
	}
	const openArticle = (id: number) => {
		listTransitionProgress.set(-listEl.clientWidth);
		editorTransitionProgress.set(0);
		isLoadingEditor = true;

		const query = gql`
			{
				historyArticle(id: ${id.toString()}) {
					id
					title
					content
					type
					font
					videoLink
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoadingEditor = false;
			editorArticle = data.historyArticle;
			window.location.hash = editorArticle.id.toString();
		});
	}
	const newArticle = () => {
		listTransitionProgress.set(-listEl.clientWidth);
		editorTransitionProgress.set(0);
		isLoadingEditor = false;

		window.location.hash = `jauns`;

		editorArticle = {
			id: -1,
			title: ``,
			content: ``,
			type: `church`,
			font: `sans`,
			videoLink: ``
		};
	}

	const saveArticle = () => {
		isSaving = true;

		let mutation;
		if (editorArticle.id === -1) {
			mutation = gql`
				mutation addHistoryArticle {
					addHistoryArticle(title: "${editorArticle.title.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${editorArticle.content.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", type: "${editorArticle.type}", font: "${editorArticle.font}", videoLink: "${editorArticle.videoLink.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
						id
					}
				}
			`;
		} else {
			mutation = gql`
				mutation modifyHistoryArticle {
					modifyHistoryArticle(id: ${editorArticle.id}, title: "${editorArticle.title.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${editorArticle.content.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", type: "${editorArticle.type}", font: "${editorArticle.font}", videoLink: "${editorArticle.videoLink.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
						id
					}
				}
			`;
		}

		request(apiUrl, mutation).then((data: any) => {
			isSaving = false;

			if (editorArticle.id === -1) {
				editorArticle.id = data.addHistoryArticle.id;
				window.location.hash = editorArticle.id.toString();
			}
		});
	}

	const editVideo = (id: number) => {

	}
	const deleteArticle = (id: number) => {
		isLoadingEditor = true;

		const mutation = gql`
			mutation removeHistoryArticle {
				removeHistoryArticle(id: ${id.toString()}, token: "${localStorage.getItem(`adminLoginToken`)}") {
					error
				}
			}
		`;
		request(apiUrl, mutation).then((data: any) => {
			if (data.removeHistoryArticle.error === ``) {
				openList();
			} else {
				isLoadingEditor = false;
				console.error(data.removeHistoryArticle.error);
			}
		});
	}

	onMount(() => {
		// Load the article from the hash if it's present
		if (window.location.hash.trim() === `#` || window.location.hash.trim() === ``) {
			openList();
		} else if (window.location.hash.trim() === `#jauns`) {
			newArticle();
		} else {
			openArticle(parseInt(window.location.hash.slice(1).trim()));
		}
	});
</script>

<svelte:head>
	<title>Vēsture | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title text-3xl text-slate-900 mt-2 mb-2">Vēsture</h1>

<div class="relative block w-full h-[calc(100vh-13rem)] overflow-hidden">
	<div class="absolute top-0 w-full h-full" bind:this={listEl} style="left: {$listTransitionProgress}px;">
		<button class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mb-2 mx-auto w-1/3 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => newArticle()}><i class="bi bi-plus-lg"></i> Pievienot</button>

		{#if isLoadingList}
			<Loading />
		{:else}
			{#each articleList as article}
				<button class="block text-left mb-4 w-full hover:opacity-75 transition-opacity-2 duration-200" on:click={() => openArticle(article.id)}>
					<b class="font-title text-slate-900 leading-4">{article.title}</b>
					<p class="text-slate-600 leading-4">{article.preview}</p>
				</button>
			{/each}
		{/if}
	</div>
	<div class="absolute top-0 w-full h-full" bind:this={editorEl} style="right: {$editorTransitionProgress}px;">
		{#if isLoadingEditor}
			<Loading />
		{:else}
			<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200" on:click={() => openList()}><i class="bi bi-chevron-left"></i> Atpakaļ</button>
			<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200" on:click={() => editVideo(editorArticle.id)}><i class="bi bi-camera-reels"></i> Pievienot video</button>
			
			<div class="float-right">
				{#if isSaving}
					<p class="inline-block w-24 text-center">Saglabā...</p>
				{:else if editorArticle.id != -1}
					<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => saveArticle()}><i class="bi bi-cloud-arrow-up"></i> Saglabāt</button>
				{:else}
					<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => saveArticle()}><i class="bi bi-plus-lg"></i> Publicēt</button>
				{/if}

				<button class="bg-gradient-to-tl from-red-600 to-red-400 text-white py-1 px-4 rounded-full shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 hover:brightness-95 duration-200" on:click={() => deleteArticle(editorArticle.id)}><i class="bi bi-trash"></i> Dzēst</button>
			</div>

			<input placeholder="Nosaukums" bind:value={editorArticle.title} class="block mt-2 pt-1 text-center text-2xl font-title w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200" class:font-serif={editorArticle.font === `serif`} />

			<textarea placeholder="Saturs" class="block mt-2 w-full h-[calc(100%-5.5rem)] resize-none p-2 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200" bind:value={editorArticle.content}></textarea>
		{/if}
	</div>
</div>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
</style>