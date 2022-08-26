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
	<p class="error-text">{error}</p>
	<article>
		<img src={image} alt={imageAlt} />
		<div class="content">
			{#if isLoading}
				<Loading />

			{:else if isEditing}
				<textarea
					class="title-input"
					class:wrong={errorInTitle}
					style="height: {titleElementHeight}px;"
					bind:value={titleInput} />

				<textarea
					class="content-input"
					class:wrong={errorInContent}
					bind:value={contentInput} />

				<button on:click={() => saveAndCloseEditor()}><i class="bi-check2"></i></button>
				<button on:click={() => closeEditor()}><i class="bi-x"></i></button>

			{:else if wantsToDelete}
				<b>Vai Jūs tiešām vēlaties izdzēst rakstu "{title}"?</b> <br />
				<button class="dangerous" on:click={() => removeArticle()}><i class="bi-check2"></i></button>
				<button on:click={() => wantsToDelete = false}><i class="bi-x"></i></button>

			{:else}
				<h1
					bind:this={titleElement}>{title}</h1>

				<p>{@html parseURLs(escapeHTML(content))}</p>

				<button on:click={() => openEditor()}><i class="bi-pencil"></i></button>
				<button class="dangerous" on:click={() => wantsToDelete = true}><i class="bi-trash"></i></button>

			{/if}
		</div>
	</article>
{/if}

<style lang="scss">
    article {
        display: flex;
		
        margin-bottom: 2rem;
		
    	img {
			width: 50%;
			max-height: 100%;
			box-shadow: 0px 0px 23px -3px rgba(66, 68, 74, 0.4);
			border-radius: 1rem;
			object-fit: cover;
		}
	}

	.error-text {
		display: block;
		min-height: 1.125rem;

		margin-top: 1rem;
		margin-bottom: .5rem;

		color: #f85e5e;

		font-size: 1rem;
		line-height: 1.125rem;
		font-weight: bold;
	}

    .content {
        padding-left: 1rem;

        width: 50%;

		word-wrap: break-word;

    	h1 {
			margin-top: .1rem;
			margin-left: .1rem;
			margin-bottom: .5rem;
		}
		p {
			margin-left: .1rem;
		}
	}

	button {
		width: 3rem;

		padding: .75rem;

		font-size: 1.25rem;
		line-height: 1.25rem;
	}

	.title-input {
		display: block;
		width: 100%;

		font-size: 1.5rem;
		font-family: 'Overpass', sans-serif;

		background: #eaeaea;
		color: #000000;

		border-radius: .5rem;

		margin-bottom: .5rem;

		resize: vertical;
	}
	.content-input {
		display: block;
		width: 100%;

		background: #eaeaea;
		color: #000000;

		font-size: 1rem;

		border-radius: .5rem;

		resize: vertical;
	}

	textarea {
		padding: .1rem;

		margin: 0;

		border: 0 solid #f85e5e;

		transition: .2s all;
	}
	.wrong {
		border-width: 4px;
	}

	@media only screen and (max-width: 875px) {
		article img {
			max-height: 50vw;
		}
	}
</style>
