<script lang="typescript">
	export let id: number;
    export let title: string;
    export let content: string;
    export let image: string;
    export let imageAlt: string;

	import Loading from '../../components/Loading.svelte';

	import { apiUrl } from '../../globals';
	import { parseURLs, escapeHTML } from '../../processing';
	import { request, gql } from 'graphql-request';
	import { onMount } from 'svelte';

	let isDeleted: boolean = false;
	let isLoading: boolean = false;
	let isEditing: boolean = false;
	let wantsToDelete: boolean = false;

	let titleInput: string = title;
	let contentInput: string = content;

	let error: string = ``;
	let errorInTitle: boolean = false;
	let errorInContent: boolean = false;

	const openEditor = () => {
		isEditing = true;
		titleInput = title;
		contentInput = content;
	}
	const closeEditor = () => {
		isEditing = false;
		
		error = ``;
		errorInTitle = false;
		errorInContent = false;
	}
	const saveAndCloseEditor = () => {
		if (!checkTitle() || !checkContent()) {
			return;
		}

		isEditing = false;
		isLoading = true;

		const query = gql`
			mutation modifyArticle {
				modifyArticle(id: ${id}, title: "${titleInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${contentInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", imageAlt: "${imageAlt.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
					error
					title
					content
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoading = false;

			if (data.modifyArticle.error !== ``) {
				return;
			} else {
				title = data.modifyArticle.title;
				content = data.modifyArticle.content;
			}
		});
	}

	const removeArticle = () => {
		isLoading = true;

		const query = gql`
			mutation removeArticle {
				removeArticle(id: ${id}, token: "${localStorage.getItem(`adminLoginToken`)}") {
					error
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoading = false;

			if (data.removeArticle.error === ``) {
				isDeleted = true;
			}
		});
	}

	const checkTitle = () => {
		if (titleInput === ``) {
			error = `Virsraksts nevar būt tukšs!`;
			errorInTitle = true;
			return false;
		}

		errorInTitle = false;
		return true;
	}
	const checkContent = () => {
		if (contentInput === ``) {
			error = `Saturs nevar būt tukšs!`;
			errorInContent = true;
			return false;
		}

		errorInContent = false;
		return true;
	}


	let titleElement: HTMLElement,
		titleElementHeight: number;
	onMount(async () => {
		titleElementHeight = titleElement.offsetHeight;
	});
</script>

{#if !isDeleted}
	<article class="grid grid-cols-2 gap-4 mb-8">
		<img class="w-full rounded-3xl bg-slate-400 shadow-md shadow-slate-300" src={image} alt={imageAlt} />
		<div>
			{#if isLoading}
				<Loading />

			{:else if isEditing}
				<input class="block pt-1 px-2 text-2xl font-title w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200" bind:value={titleInput} />

				<textarea class="block my-2 pt-1 px-2 w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200" bind:value={contentInput} />

				<button class="w-8 h-8 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => saveAndCloseEditor()}><i class="bi-check2"></i></button>
				<button class="w-8 h-8 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => closeEditor()}><i class="bi-x"></i></button>

				<p class="" class:opacity-100={error !== ``}>{error}</p>

			{:else if wantsToDelete}
				<b>Vai Jūs tiešām vēlaties izdzēst rakstu "{title}"?</b> <br />
				<button class="dangerous" on:click={() => removeArticle()}><i class="bi-check2"></i></button>
				<button on:click={() => wantsToDelete = false}><i class="bi-x"></i></button>

			{:else}
				<h1 class="text-2xl text-slate-900" bind:this={titleElement}>{title}</h1>

				<p class="pb-2">{@html parseURLs(escapeHTML(content))}</p>

				<button class="w-8 h-8 bg-gradient-to-tl from-blue-600 to-blue-300 text-white rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => openEditor()}><i class="bi-pencil"></i></button>
				<button class="w-8 h-8 bg-gradient-to-tl from-red-600 to-red-400 text-white rounded-full shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 hover:brightness-95 duration-200" on:click={() => wantsToDelete = true}><i class="bi-trash"></i></button>

			{/if}
		</div>
	</article>
{/if}