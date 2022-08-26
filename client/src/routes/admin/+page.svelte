<script lang="typescript">
    import AdminNavbar from '../../components/admin/AdminNavbar.svelte';
    import AdminFooter from '../../components/admin/AdminFooter.svelte';
	import AdminArticle from '../../components/admin/AdminArticle.svelte';
	import Loading from '../../components/Loading.svelte';

	import { onMount } from 'svelte';
	import { request,  } from 'graphql-request';
    import { apiUrl } from '../../globals';
	import { formatDate } from '../../processing';
	import type { ArticleData } from '../../schemas';

	// The greeting that changes based on system time
	let time: number = new Date().getHours(),
		greeting: string = ``;
	if (time > 4 && time < 13) {
		greeting = `Labrīt!`;
	} else if (time > 12 && time < 19) {
		greeting = `Labdien!`;
	} else {
		greeting = `Labvakar!`;
	}

	// Data
	let loading: boolean = true,
		visitorsInLast7Days: number = 0,
		visitorsToday: number = 0,
		viewsInLast7Days: number = 0,
		newestArticle: ArticleData,
		nextDate: string;

	onMount(async () => {
		request(apiUrl, `
			{
				articles(page: 0) {
					articles {
						id
						title
						content
						image
						imageAlt
					}
				}
				information {
					nextDate
				}
				statistics(token: "${localStorage.getItem(`adminLoginToken`)}") {
					visitorsInLast7Days
					visitorsToday
					viewsInLast7Days
				}
			}
		`).then((data: any) => {
			loading = false;

			visitorsInLast7Days = data.statistics.visitorsInLast7Days;
			visitorsToday = data.statistics.visitorsToday;
			viewsInLast7Days = data.statistics.viewsInLast7Days;

			newestArticle = data.articles.articles[0];

			nextDate = formatDate(data.information.nextDate);
		});
	});
</script>

<svelte:head>
	<title>Sākums | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<svelte:body class="admin"></svelte:body>

<AdminNavbar />
<main>
	<h1>{greeting}</h1>

	{#if loading}
		<Loading />
	{:else}
		<div class="panel-container">
			<div class="panel">
				<h1>{visitorsInLast7Days}</h1>
				<p>atsevišķi apmeklētāji pēdējās 7 dienās</p>
			</div>
			<div class="panel">
				<h1>{visitorsToday}</h1>
				<p>atsevišķi apmeklētāji šodien</p>
			</div>
			<div class="panel">
				<h1>{viewsInLast7Days}</h1>
				<p>skatījumi pēdējās 7 dienās</p>
			</div>
		</div>
		<a href="/#/admin/statistika" class="see-more-btn">Apskatīt vairāk statistiku <i class="bi-arrow-right"></i></a>
	{/if}

	<h1>Jaunākais raksts</h1>
	{#if loading}
		<Loading />
	{:else}
		<AdminArticle id={newestArticle.id} title={newestArticle.title} image={newestArticle.image} imageAlt={newestArticle.imageAlt} content={newestArticle.content} />
		<a href="/#/admin/jaunumi" class="see-more-btn">Apskatīt un rediģēt visus rakstus <i class="bi-arrow-right"></i></a>
	{/if}

	<h1>Nākamais dievkalpojums</h1>
	{#if loading}
		<Loading />
	{:else}
		<h3>{nextDate}</h3>
		<a href="/#/admin/norises-draudze" class="see-more-btn">Rediģēt informāciju <i class="bi-arrow-right"></i></a>
	{/if}

</main>
<AdminFooter />

<style lang="scss">
	@import './panels.scss';
	@import '../../theme.scss';

	h1 {
		margin-top: 1.5rem;
	}

	.see-more-btn {
		font-size: 1.2rem;

		font-family: 'Overpass', sans-serif;

		background: none;
		color: $title-color;

		border: 0;

		cursor: pointer;

		text-align: center;

		display: block;
		width: 100%;

		i {
			transition: .2s all;
		}
		&:hover i {
			margin-left: 1.5rem;
		}
	}

	@media only screen and (max-width: 875px) {	
		.panel:not(:nth-child(1)) {
			display: none;
		}
	}
</style>
