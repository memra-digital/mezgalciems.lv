<script lang="typescript">
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import CookieNotice from '../components/CookieNotice.svelte';
	import { page } from '$app/stores';

	let emojiList: string[] = [
			`expressionlessFace`,
			`slightlyFrowningFace`,
			`perseveringFace`,
			`perseveringFace`,
			`sneezingFace`,
			`loudlyCryingFace`
		],
		randomEmojiIndex: number = Math.floor(Math.random() * emojiList.length),
		randomEmoji: string = emojiList[randomEmojiIndex];
</script>

<svelte:head>
	<title>Notika kļūda! | Mežgalciema baptistu draudze</title>
</svelte:head>

<CookieNotice />
<div>
	<Navbar />

	<main class="grid grid-cols-2 gap-8">
		<img class="mx-auto w-2/4 max-w-[12rem]" src="/files/errorEmoji/{randomEmoji}.png" alt="" />
		<div>
			<h1 class="font-title font-bold text-3xl text-slate-900">Notika kļūda!</h1>
			<p class="text-slate-600">{$page.status} - {$page.error.message}</p>
			<a class="block w-full mt-8 font-title text-lg text-slate-900 hover:text-blue-500 transition duration-200" href="/">Atpakaļ uz sākumlapu <i class="bi-arrow-right"></i></a>
		</div>
	</main>

	<Footer />
</div>s