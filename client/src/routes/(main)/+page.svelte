<script lang="ts">
	import Article from '$lib/components/Article.svelte';
	import Loading from '$lib/components/Loading.svelte';

	import { onMount } from 'svelte';
	import { request } from 'graphql-request';
	import { apiUrl } from '$lib/globals';
	import type { ArticleData } from '$lib/schemas';

	let isLoading: boolean = true,
		articles: ArticleData[] = [],
		loadedPages: number = 0,
		totalPages: number = 1;

	onMount(async () => {
		loadMoreArticles();
	});

	const loadMoreArticles = () => {
		isLoading = true;

		request(apiUrl, `
			{
				articles(page: ${loadedPages}) {
					totalPages
					articles {
						title
						content
						image
						imageAlt
						author
						date
					}
				}
			}
		`).then((data: any) => {
			isLoading = false;

			totalPages = data.articles.totalPages;

			articles = [...articles, ...data.articles.articles];

			loadedPages++;
		});
	}
</script>

<svelte:head>
	<title>Jaunumi | Mežgalciema baptistu draudze</title>
</svelte:head>


<h1 class="font-title font-bold text-3xl text-slate-900 mb-2">Jaunumi</h1>
{#each articles as article}
	<Article title={article.title} content={article.content} image={article.image} imageAlt={article.imageAlt} author={article.author} date={parseInt(article.date)} />
{/each}

{#if isLoading}
	<Loading />
{/if}

{#if loadedPages < totalPages}
	<div class="block text-center">
		<button class="font-title text-lg text-center text-slate-800 hover:text-blue-500 transition duration-200" on:click={() => loadMoreArticles()}>Ielādēt vairāk...</button>
	</div>
{/if}
