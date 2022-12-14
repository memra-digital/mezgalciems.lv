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

	let pageTransitionProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});

	let deleteConfirmationDialogProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});
	let videoDialogProgress: Tweened<number> = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});

	let selectedArticleType: number = 0,
		selectedFont: number = 0;
	
	interface HistoryArticleListItem {
		id: string,
		title: string,
		preview: string
	}
	let articleList: HistoryArticleListItem[];

	interface HistoryArticle {
		id: string,
		title: string,
		content: string,
		type: string,
		font: string,
		videoLink: string
	}

	let editorArticle: HistoryArticle = {
		id: ``,
		title: ``,
		content: ``,
		type: ``,
		font: ``,
		videoLink: ``
	};
	
	const openList = () => {
		pageTransitionProgress.set(0);
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
	const openArticle = (id: string) => {
		pageTransitionProgress.set(-1);
		isLoadingEditor = true;

		const query = gql`
			{
				historyArticle(id: "${id.toString()}") {
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

			editorArticle.videoLink = editorArticle.videoLink ?? ``;

			selectedArticleType = data.historyArticle.type === `church` ? 0 : 1;
			selectedFont = data.historyArticle.font === `sans` ? 0 : 1;

			window.location.hash = editorArticle.id.toString();
		});
	}
	const newArticle = () => {
		pageTransitionProgress.set(-1);
		isLoadingEditor = false;

		window.location.hash = `jauns`;

		editorArticle = {
			id: ``,
			title: ``,
			content: ``,
			type: `church`,
			font: `sans`,
			videoLink: ``
		};
	}

	const saveArticle = () => {
		isSaving = true;

		editorArticle.type = [`church`, `baptist`][selectedArticleType];
		editorArticle.font = [`sans`, `serif`][selectedFont];

		let mutation;
		if (editorArticle.id === ``) {
			mutation = gql`
				mutation createHistoryArticle {
					createHistoryArticle(title: "${editorArticle.title.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${editorArticle.content.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", type: "${editorArticle.type}", font: "${editorArticle.font}", videoLink: "${editorArticle.videoLink.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminAccountToken`)}") {
						id
					}
				}
			`;
		} else {
			mutation = gql`
				mutation editHistoryArticle {
					editHistoryArticle(id: "${editorArticle.id}", title: "${editorArticle.title.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${editorArticle.content.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", type: "${editorArticle.type}", font: "${editorArticle.font}", videoLink: "${editorArticle.videoLink.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminAccountToken`)}") {
						id
					}
				}
			`;
		}

		request(apiUrl, mutation).then((data: any) => {
			isSaving = false;

			if (editorArticle.id === ``) {
				editorArticle.id = data.createHistoryArticle.id;
				window.location.hash = editorArticle.id.toString();
			}
		});
	}

	const deleteArticle = (id: string) => {
		isLoadingEditor = true;

		const mutation = gql`
			mutation deleteHistoryArticle {
				deleteHistoryArticle(id: "${id.toString()}", token: "${localStorage.getItem(`adminAccountToken`)}") {
					id
				}
			}
		`;
		request(apiUrl, mutation).then((data: any) => {
			openList();
		}).catch((err: any) => {
			isLoadingEditor = false;

			console.error(err);
		});
	}

	onMount(() => {
		// Load the article from the hash if it's present
		if (window.location.hash.trim() === `#` || window.location.hash.trim() === ``) {
			openList();
		} else if (window.location.hash.trim() === `#jauns`) {
			newArticle();
		} else {
			openArticle(window.location.hash.slice(1).trim());
		}
	});
</script>

<svelte:head>
	<title>V??sture | Admin | Me??galciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title text-3xl text-slate-900 mt-4">V??sture</h1>

<div class="relative block w-full h-[calc(100vh-13rem)] overflow-hidden">
	<div class="absolute top-0 grid grid-cols-2 w-[200%] h-full"
		style="left: calc({$pageTransitionProgress} * 100%);">

		<div class="h-full overflow-y-auto">

			<button class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mb-2 mx-auto w-2/3 xs:w-1/3 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
				on:click={() => newArticle()}>
				
				<i class="bi bi-plus-lg"></i> Pievienot
			</button>

			{#if isLoadingList}
				<Loading />
			{:else}
				{#each articleList as article}
					<button class="block text-left mb-4 w-full hover:opacity-75 transition-opacity-2 duration-200"
						on:click={() => openArticle(article.id)}>

						<b class="font-title text-slate-900 leading-4">{article.title}</b>
						<p class="text-slate-600 leading-4">{article.preview}...</p>
					</button>
				{/each}
			{/if}
		</div>
		<div class="h-full">

			{#if isLoadingEditor}
				<Loading />
			{:else}
				<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200"
					on:click={() => openList()}>
					
					<i class="bi bi-chevron-left"></i> Atpaka??
				</button>
				<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 ml-1 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200"
					on:click={() => videoDialogProgress.set(1)}>
					
					<i class="bi bi-camera-reels"></i> Pievienot video
				</button>
				
				<div class="float-right">
					{#if isSaving}
						<p class="inline-block w-24 text-center">Saglab??...</p>
					{:else if editorArticle.id !== ``}
						<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
							on:click={() => saveArticle()}>
							
							<i class="bi bi-cloud-arrow-up"></i> Saglab??t
						</button>
					{:else}
						<button class="bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
							on:click={() => saveArticle()}>
							
							<i class="bi bi-plus-lg"></i> Public??t
						</button>
					{/if}

					<button class="bg-gradient-to-tl from-red-600 to-red-400 text-white py-1 px-4 ml-1 rounded-full shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 hover:brightness-95 duration-200"
						on:click={() => deleteConfirmationDialogProgress.set(1)}>
						
						<i class="bi bi-trash"></i> Dz??st
					</button>
				</div>

				<div class="block mt-2">
					<p class="inline-block">Kategorija: </p>
					<Dropdown options={[`Draudzes v??sture`, `Baptistu v??sture`]} bind:selected={selectedArticleType} />

					<p class="inline-block ml-4">Fonts: </p>
					<Dropdown options={[`Sans`, `Serif`]} bind:selected={selectedFont} />
				</div>

				<input class="block mt-2 pt-1 text-center text-2xl font-bold font-title w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
					class:font-serif={editorArticle.font === `serif`}
					placeholder="Nosaukums"
					bind:value={editorArticle.title} />

				<textarea class="block mt-2 w-full h-[calc(100%-8rem)] resize-none p-2 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
					class:font-serif={editorArticle.font === `serif`}
					placeholder="Saturs"
					bind:value={editorArticle.content} />
			{/if}
		</div>
	</div>
</div>

<div class="fixed top-0 left-0 w-screen h-screen bg-black z-20"
	style="display: {$deleteConfirmationDialogProgress === 0 ? `none` : `block`}; opacity: {$deleteConfirmationDialogProgress / 2};"
	on:click={() => deleteConfirmationDialogProgress.set(0)}>
</div>
<div class="fixed top-[calc(50vh-6rem)] left-[calc(50vw-8rem)] w-64 h-48 p-2 bg-white rounded-3xl z-30"
	style="display: {$deleteConfirmationDialogProgress === 0 ? `none` : `block`}; transform: scale({$deleteConfirmationDialogProgress});">

	<div class="inline-block float-right text-2xl hover:opacity-75 duration-200 cursor-pointer"
		on:click={() => deleteConfirmationDialogProgress.set(0)}>
	
		<i class="bi bi-x"></i>
	</div>

	<p class="block w-full mt-12 text-center">Vai tie????m v??laties izdz??st rakstu "{editorArticle?.title || ``}"?</p>

	<div class="text-center mt-2">
		<button class="inline-block w-8 h-8 mr-1 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
			on:click={() => deleteConfirmationDialogProgress.set(0)}>
			
			<i class="bi bi-x-lg"></i>
		</button>
		<button class="inline-block w-8 h-8 ml-1 bg-gradient-to-tl from-red-600 to-red-400 text-white rounded-full shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 hover:brightness-95 duration-200"
			on:click={() => {deleteArticle(editorArticle.id); deleteConfirmationDialogProgress.set(0); }}>
			
			<i class="bi bi-check2"></i>
		</button>
	</div>
</div>

<div class="fixed top-0 left-0 w-screen h-screen bg-black z-20"
	style="display: {$videoDialogProgress === 0 ? `none` : `block`}; opacity: {$videoDialogProgress / 2};"
	on:click={() => videoDialogProgress.set(0)}>
</div>
<div class="fixed left-[calc(50vw-14rem)] top-[calc(50vh-10rem)] w-[28rem] h-[20rem] p-2 bg-white rounded-3xl z-30 overflow-hidden"
	style="display: {$videoDialogProgress === 0 ? `none` : `block`}; transform: scale({$videoDialogProgress});">

	<div class="inline-block float-right text-2xl hover:opacity-75 duration-200 cursor-pointer"
		on:click={() => videoDialogProgress.set(0)}>
	
		<i class="bi bi-x"></i>
	</div>

	<b class="block leading-4 mt-1">Pievienot saiti uz video:</b>

	<p class="inline-block leading-4">https://youtube.com/watch?v=</p>
	<input class="inline-block w-36 mt-2 px-1 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
		bind:value={editorArticle.videoLink} />
	
	{#if editorArticle.videoLink.length === 11}
		<iframe class="block w-full aspect-video mx-auto mt-2 bg-black rounded-3xl shadow-lg shadow-slate-300"
			src="https://www.youtube.com/embed/{editorArticle.videoLink}"
			title="YouTube video atska??ot??js"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
		</iframe>
	{:else}
		<div class="block w-full aspect-video mx-auto mt-2 bg-black rounded-3xl shadow-lg shadow-slate-300"></div>
	{/if}
</div>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
</style>