<script lang="typescript">
	import { parseURLs, escapeHTML } from '$lib/processing';

	export let title: string;
	export let content: string;
	export let image: string;
	export let imageAlt: string;
	export let author: string;
	export let date: number;

	let articleDate: Date = new Date(date);
	let isLoaded: boolean = false;
</script>

<article class="grid grid-cols-2 gap-4 mb-8" title={`${author} - ${articleDate.getHours().toString().length === 1 ? `0` : ``}${articleDate.getHours()}:${articleDate.getMinutes().toString().length === 1 ? `0` : ``}${articleDate.getMinutes()} ${articleDate.getFullYear()}.${articleDate.getMonth().toString().length === 1 ? `0` : ``}${articleDate.getMonth() + 1}.${articleDate.getDate().toString().length === 1 ? `0` : ``}${articleDate.getDate()}`}>
	<img class="w-full rounded-3xl text-white text-center shadow-lg shadow-slate-800/20" class:bg-slate-800={!isLoaded} class:aspect-square={!isLoaded} src={image} alt={imageAlt} on:load={() => isLoaded = true} />

	<div class="content">
		<h1 class="font-title font-bold text-2xl text-slate-900">{title}</h1>
		<p>{@html parseURLs(escapeHTML(content))}</p>
	</div>
</article>