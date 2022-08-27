<script lang="typescript">
	import AdminNavbar from '../../../components/admin/AdminNavbar.svelte';
	import AdminFooter from '../../../components/admin/AdminFooter.svelte';
	import Loading from '../../../components/Loading.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '../../../globals';
	import { request, gql } from 'graphql-request';

	let loading: boolean = true;
	
	let visitorsInLast7Days: number = 0;
	let visitorsToday: number = 0;
	let mostViewedPage: string = ``;
	let mostViewedPageViews: number = 0;
	let viewsInLast7Days: number = 0;
	let viewsToday: number = 0;
	let views6DaysAgo: number = 0;
	let views5DaysAgo: number = 0;
	let views4DaysAgo: number = 0;
	let views3DaysAgo: number = 0;
	let views2DaysAgo: number = 0;
	let viewsYesterday: number = 0;
	let maxViewsThisWeek: number = 0;

	onMount(async () => {
		const query = gql`
			{
				statistics(token: "${localStorage.getItem(`adminLoginToken`)}") {
					visitorsInLast7Days
					visitorsToday

					mostViewedPage
					mostViewedPageViews

					viewsInLast7Days
					viewsToday
					views6DaysAgo
					views5DaysAgo
					views4DaysAgo
					views3DaysAgo
					views2DaysAgo
					viewsYesterday
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			loading = false;

			visitorsInLast7Days = data.statistics.visitorsInLast7Days;
			visitorsToday = data.statistics.visitorsToday;
			mostViewedPage = data.statistics.mostViewedPage;
			mostViewedPageViews = data.statistics.mostViewedPageViews;
			viewsInLast7Days = data.statistics.viewsInLast7Days;
			viewsToday = data.statistics.viewsToday;
			views6DaysAgo = data.statistics.views6DaysAgo;
			views5DaysAgo = data.statistics.views5DaysAgo;
			views4DaysAgo = data.statistics.views4DaysAgo; 
			views3DaysAgo = data.statistics.views3DaysAgo;
			views2DaysAgo = data.statistics.views2DaysAgo;
			viewsYesterday = data.statistics.viewsYesterday;

			maxViewsThisWeek = Math.max(viewsToday, viewsYesterday, views2DaysAgo, views3DaysAgo, views4DaysAgo, views5DaysAgo, views6DaysAgo);
		});
	});

	const pageNames: any = {
		"": `Jaunumi`,
		"ka-noklut": `Kā nokļūt`,
		"norises-draudze": `Norises draudzē`,
		"vesture": `Vēsture`,
		"privatuma-politika": `Privātuma politika`,
	}

	let weekDayList: string[] = [
		`P`,
		`O`,
		`T`,
		`C`,
		`Pk`,
		`S`,
		`Sv`
	];
	let weekDayDisplayList: string[] = [];
	let dayOfWeek: number = new Date().getDay();
	for (let i: number = 0; i < 7; i++) {
		if (dayOfWeek + i < 7) {
			weekDayDisplayList.push(weekDayList[dayOfWeek + i]);
		} else {
			weekDayDisplayList.push(weekDayList[dayOfWeek + i - 7]);
		}
	}
</script>

<svelte:head>
	<title>Statistika | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<svelte:body class="admin"></svelte:body>

<AdminNavbar />
<main>
	<h1 class="font-title text-3xl text-slate-900 mt-4 mb-2">Statistika</h1>
	{#if loading}
		<Loading />
	{:else}
		<div class="flex flex-wrap gap-4">
			<div class="grow text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
				<h1 class="text-4xl font-title text-slate-900">{visitorsInLast7Days}</h1>
				<p class="text-slate-600 font-bold">atsevišķi apmeklētāji pēdējās 7 dienās</p>
			</div>
			<div class="grow text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
				<h1 class="text-4xl font-title text-slate-900">{visitorsToday}</h1>
				<p class="text-slate-600 font-bold">atsevišķi apmeklētāji šodien</p>
			</div>
			<div class="grow text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
				<h1 class="text-4xl font-title text-slate-900">{viewsInLast7Days}</h1>
				<p class="text-slate-600 font-bold">skatījumi pēdējās 7 dienās</p>
			</div>
			<div class="grow-[6] text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
				<h1 class="text-4xl font-title text-slate-900">{pageNames[mostViewedPage] === undefined ? `404` : pageNames[mostViewedPage]}</h1>
				<p class="text-slate-600 font-bold">ir visapmeklētākā lapa</p>
			</div>
			<div class="grow text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
				<h1 class="text-4xl font-title text-slate-900">{mostViewedPageViews}</h1>
				<p class="text-slate-600 font-bold">skatījumi visapmeklētākajai lapai</p>
			</div>
			<div class="grow-[6] text-center rounded-3xl bg-white p-2 shadow-md shadow-slate-300">
				<div class="flex items-end justify-center h-60">
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(views6DaysAgo / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{views6DaysAgo}</p>
					</div>
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(views5DaysAgo / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{views5DaysAgo}</p>
					</div>
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(views4DaysAgo / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{views4DaysAgo}</p>
					</div>
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(views3DaysAgo / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{views3DaysAgo}</p>
					</div>
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(views2DaysAgo / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{views2DaysAgo}</p>
					</div>
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(viewsYesterday / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{viewsYesterday}</p>
					</div>
					<div
						class="relative block w-8 rounded-full bg-gradient-to-tl from-blue-600 to-blue-300 mx-4"
						style="height: {Math.max(viewsToday / maxViewsThisWeek * 15, 2)}rem;">

						<p class="absolute bottom-1 w-8 font-bold text-white">{viewsToday}</p>
					</div>
				</div>
				<div
					class="block mt-1 mb-4">
					
					{#each weekDayDisplayList as w}
						<b class="inline-block w-16 text-slate-600">{w}</b>
					{/each}
				</div>
				<p class="text-slate-600 font-bold">Skatījumu pārskats pēdējās 7 dienās</p>
			</div>
		</div>
	{/if}
</main>
<AdminFooter />
