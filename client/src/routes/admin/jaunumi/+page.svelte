<script lang="typescript">
	import AdminNavbar from '../../../components/admin/AdminNavbar.svelte';
	import AdminFooter from '../../../components/admin/AdminFooter.svelte';
	import AdminArticle from '../../../components/admin/AdminArticle.svelte';
	import AddArticle from '../../../components/admin/AddArticle.svelte';
	import Loading from '../../../components/Loading.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '../../../globals';
	import { request, gql } from 'graphql-request';

	let loading: boolean = true;

	let articles: Array<any> = [];

	let currentlyLoadedPages: number = 0;
	let totalPages: number = 1;
	
	onMount(async () => {
		loadMoreArticles();
	});
	
	const loadMoreArticles = () => {
		loading = true;
		const query = gql`
			{
				articles(page: ${currentlyLoadedPages}) {
					totalPages
					articles {
						id
						title
						content
						image
						imageAlt
					}
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			loading = false;

			totalPages = data.articles.totalPages;
			
			articles = [...articles, ...data.articles.articles];

			currentlyLoadedPages++;
		});
	}
</script>

<svelte:head>
	<title>Jaunumi | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<AdminNavbar />
<main>
	<h1 class="font-title text-3xl text-slate-900 mt-2 mb-2">Pievienot jaunumu</h1>
	<AddArticle />

	<h1 class="font-title text-3xl text-slate-900 mt-2 mb-2">Jaunumi</h1>
	{#each articles as article}
		<AdminArticle id={article.id} title={article.title} content={article.content} image={article.image} imageAlt={article.imageAlt} />
	{/each}

	{#if loading}
		<Loading />
	{/if}

	{#if currentlyLoadedPages < totalPages}
		<button class="block w-full mt-[-1rem] font-title text-lg text-center text-slate-900 hover:text-blue-500 transition duration-200" on:click={() => loadMoreArticles()}>Ielādēt vairāk...</button>
	{/if}
</main>
<AdminFooter />

<style>
	h1 {
		margin-top: 1.5rem;
	}

	.load-more-btn {
		font-size: 1.2rem;

		font-family: 'Overpass', sans-serif;

		background: none;
		color: #2b2c3a;

		border: 0;

		cursor: pointer;

		text-align: center;

		display: block;
		width: 100%;
	}
</style>
