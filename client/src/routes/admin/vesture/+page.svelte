<script lang="ts">
	import AdminNavbar from '../../../components/admin/AdminNavbar.svelte';
	import AdminFooter from '../../../components/admin/AdminFooter.svelte';
	import Loading from '../../../components/Loading.svelte';
	import Dropdown from '../../../components/Dropdown.svelte';

	import { onMount } from 'svelte';
	import { tweened, type Tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { apiUrl } from '../../../globals';
	import { request, gql } from 'graphql-request';

	let isLoadingList: boolean = true,
		isLoadingEditor: boolean = true;

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
	
	interface HistoryArticleListItem {
		id: number,
		title: string,
		preview: string
	}
	let articleList: HistoryArticleListItem[];

	interface HistoryArticle {
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
	const openEditor = (id: number) => {
		listTransitionProgress.set(-listEl.clientWidth);
		editorTransitionProgress.set(0);
		isLoadingEditor = true;

		const query = gql`
			{
				historyArticle(id: ${id.toString()}) {
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
		});
	}

	onMount(() => {
		openList();
	});
</script>

<svelte:head>
	<title>Vēsture | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<AdminNavbar />
<main>
	<h1>Draudzes vēsture</h1>

	<div class="workspace">
		<div class="list" bind:this={listEl} style="left: {$listTransitionProgress}px;">
			{#if isLoadingList}
				<Loading />
			{:else}
				{#each articleList as article}
					<button on:click={() => openEditor(article.id)}>
						<b>{article.title}</b>
						<p>{article.preview}</p>
					</button>
				{/each}
			{/if}
		</div>
			<div class="editor" bind:this={editorEl} style="right: {$editorTransitionProgress}px;">
				<button on:click={() => openList()}><i class="bi bi-chevron-left"></i> Atpakaļ</button>

				{#if isLoadingEditor}
					<Loading />
				{:else}
					<input bind:value={editorArticle.title} />

					<textarea bind:value={editorArticle.content}></textarea>
				{/if}
			</div>
	</div>
</main>
<AdminFooter />

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
	@import '../../../theme.scss';
	
	main {
		overflow: hidden;
	}

	.workspace {
		position: relative;
		display: block;
		width: 100%;
		height: calc(100vh - 13rem);

		.list, .editor {
			position: absolute;
			top: 0;
			width: 100%;
		}
	}

	.list {
		button {
			display: block;
			width: 100%;
			text-align: left;
			font-size: 1rem;
			background: none;
			padding: 0;
			margin: 0;
			margin-top: 0.5rem;
			transition: .2s opacity;

			b {
				font-family: $title-font;
				color: $title-color;
			}
			p {
				color: $paragraph-color;
			}

			&:hover {
				opacity: 0.7;
			}
			&:first-child {
				margin-top: 0;
			}
		}
	}

	.editor {
		height: 100%;

		input, textarea {
			border-radius: .5rem;
			border: 2px solid #d4d4d4;
		}
		input {
			width: 100%;
			font-size: 2rem;
			text-align: center;
			margin-bottom: .5rem;
		}
		textarea {
			width: 100%;
			height: calc(100% - 7.5rem);
			font-size: 1rem;
			resize: none;
		}
	}

	h1 {
		margin-top: 1.5rem;
	}
</style>