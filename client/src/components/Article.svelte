<script lang="typescript">
	import { parseURLs, escapeHTML } from '../processing';

	export let title: string;
	export let content: string;
	export let image: string;
	export let imageAlt: string;
	export let author: string;
	export let date: number;

	let articleDate: Date = new Date(date),
		
		imgLoaded: boolean = false;
</script>

<article title={`${author} - ${articleDate.getHours().toString().length === 1 ? `0` : ``}${articleDate.getHours()}:${articleDate.getMinutes().toString().length === 1 ? `0` : ``}${articleDate.getMinutes()} ${articleDate.getFullYear()}.${articleDate.getMonth().toString().length === 1 ? `0` : ``}${articleDate.getMonth() + 1}.${articleDate.getDate().toString().length === 1 ? `0` : ``}${articleDate.getDate()}`}>
	<img
		src={image}
		alt={imageAlt}
		on:load={() => imgLoaded = true}
		style={imgLoaded ? `` : `display: none;`} />

	<div
		class="img-placeholder"
		style={imgLoaded ? `display: none;` : ``}></div>

	<div class="content">
		<h1>{title}</h1>
		<p>{@html parseURLs(escapeHTML(content))}</p>
	</div>
</article>

<style lang="scss">
	@import '../theme.scss';

	article {
		display: flex;

		margin-top: 1rem;
		margin-bottom: 3rem;

		img {
			width: 100%;
			max-height: 100%;
			max-width: 50%;

			background: $background-accent;

			box-shadow: 0px 0px 23px -3px $shadow-color;

			border-radius: 1rem;

			transition: .5s box-shadow, background;

			object-fit: cover;
		}
		.img-placeholder {
			width: 100%;
			height: 18rem;

			background: $background-accent;

			box-shadow: 0px 0px 23px -3px $shadow-color;

			transition: .5s box-shadow, background;

			border-radius: 1rem;
		}
		.content {
			width: 100%;
			max-width: 50%;

			color: $paragraph-color;

			padding-left: 1rem;

			word-wrap: break-word;

			h1, p {
				transition: .5s color;
			}
		}
	}
</style>
