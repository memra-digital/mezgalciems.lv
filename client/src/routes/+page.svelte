<script lang="typescript">
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import Article from '../components/Article.svelte';
	import Loading from '../components/Loading.svelte';
	import CookieNotice from '../components/CookieNotice.svelte';

	import { onMount } from 'svelte';
	import { request } from 'graphql-request';
	import { apiUrl } from '../globals';
	import type { ArticleData } from '../schemas';

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

<CookieNotice />
<Navbar />

<main>
	<h1>Jaunumi</h1>
	{#each articles as article, i}
		<Article title={article.title} content={article.content} image={article.image} imageAlt={article.imageAlt} author={article.author} date={parseInt(article.date)} />
	{/each}

	{#if isLoading}
		<Loading />
	{/if}

	{#if loadedPages < totalPages}
		<button class="load-more-btn" on:click={() => loadMoreArticles()}>Ielādēt vairāk...</button>
	{/if}
</main>

<Footer />

<style lang="scss">
	@import '../theme.scss';

	.load-more-btn {
		display: block;
		width: 100%;
		
		text-align: center;
		font-size: 1.2rem;
		font-family: $title-font;

		background: none;
		color: $title-color;

		border: 0;

		cursor: pointer;

		&:focus-visible {
			color: $theme-color;
		}
	}
</style>
