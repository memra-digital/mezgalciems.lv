<script lang="ts">
	export let id: number;
    export let title: string;
    export let content: string;
    export let image: string;
    export let imageAlt: string;

	import Loading from '$lib/components/Loading.svelte';

	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { apiUrl } from '$lib/globals';
	import { parseURLs, escapeHTML } from '$lib/processing';
	import { request, gql } from 'graphql-request';

	let isDeleted: boolean = false,
		isLoading: boolean = false,
		isEditing: boolean = false;

	let titleValue: string = title,
		contentValue: string = content;

	let errorMsg: string = ``,
		isTitleInvalid: boolean = false,
		isContentInvalid: boolean = false;
	
	let deleteConfirmationDialogProgress = tweened(0, {
		duration: 300,
		easing: cubicInOut
	});

	const openEditor = () => {
		isEditing = true;
		titleValue = title;
		contentValue = content;
	}
	const closeEditor = () => {
		isEditing = false;
		
		errorMsg = ``;
		isTitleInvalid = false;
		isContentInvalid = false;
	}
	const saveAndCloseEditor = () => {
		// Validate the fields
		isTitleInvalid = titleValue.trim() === ``;
		isContentInvalid = contentValue.trim() === ``;

		if (isTitleInvalid || isContentInvalid) {
			errorMsg = `Visiem lauciņiem jābūt aizpildītiem!`;
			return;
		} else {
			errorMsg = ``;
		}

		// Apply the changes
		isEditing = false;
		isLoading = true;

		const query = gql`
			mutation modifyArticle {
				modifyArticle(id: ${id}, title: "${titleValue.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${contentValue.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", imageAlt: "${imageAlt.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
					title
					content
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoading = false;

			title = data.modifyArticle.title;
			content = data.modifyArticle.content;
		}).catch((err: any) => {
			isLoading = false;

			console.error(err);
		});
	}

	const deleteArticle = () => {
		isLoading = true;

		const query = gql`
			mutation removeArticle {
				removeArticle(id: ${id}, token: "${localStorage.getItem(`adminLoginToken`)}") {
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoading = false;

			isDeleted = true;
		}).catch((err: any) => {
			isLoading = false;

			console.error(err);
		});
	}
</script>

{#if !isDeleted}
	<article class="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-4 mb-0 xs:mb-8">
		<img class="w-full rounded-3xl bg-slate-700 shadow-lg shadow-slate-800/20" src={image} alt={imageAlt} />
		<div class="px-2 pb-4 xs:p-0">
			{#if isLoading}
				<Loading />

			{:else if isEditing}
				<input class="block pt-1 px-2 text-2xl font-title w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
					class:border-red-500={isTitleInvalid} class:focus:border-red-500={isTitleInvalid}
					bind:value={titleValue}
					placeholder="Virsraksts" />

				<textarea
					class="block my-2 pt-1 px-2 w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
					class:border-red-500={isContentInvalid} class:focus:border-red-500={isContentInvalid}
					bind:value={contentValue}
					placeholder="Saturs" />

				<button class="w-8 h-8 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => saveAndCloseEditor()}><i class="bi-check2"></i></button>
				<button class="w-8 h-8 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => closeEditor()}><i class="bi-x-lg"></i></button>

				<p class="font-bold text-red-500 duration-200" class:opacity-100={errorMsg !== ``}>{errorMsg}</p>

			{:else}
				<h1 class="font-title text-2xl text-slate-900">{title}</h1>

				<p class="pb-2">{@html parseURLs(escapeHTML(content))}</p>

				<button class="w-8 h-8 mr-1 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => openEditor()}><i class="bi-pencil"></i></button>
				<button class="w-8 h-8 ml-1 bg-gradient-to-tl from-red-600 to-red-400 text-white rounded-full shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 hover:brightness-95 duration-200" on:click={() => deleteConfirmationDialogProgress.set(1)}><i class="bi-trash"></i></button>

			{/if}
		</div>
	</article>
{/if}

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

	<p class="block w-full mt-12 text-center">Vai tiešām vēlaties izdzēst rakstu "{title}"?</p>

	<div class="text-center mt-2">
		<button class="inline-block w-8 h-8 mr-1 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => deleteConfirmationDialogProgress.set(0)}><i class="bi bi-x-lg"></i></button>
		<button class="inline-block w-8 h-8 ml-1 bg-gradient-to-tl from-red-600 to-red-400 text-white rounded-full shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 hover:brightness-95 duration-200" on:click={() => {deleteArticle(); deleteConfirmationDialogProgress.set(0); isDeleted = true;}}><i class="bi bi-check2"></i></button>
	</div>
</div>