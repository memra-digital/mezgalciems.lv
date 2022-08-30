<script lang="ts">
	import { page } from '$app/stores';

	let emojiList: string[] = [
		`expressionlessFace`,
		`slightlyFrowningFace`,
		`perseveringFace`,
		`perseveringFace`,
		`sneezingFace`,
		`loudlyCryingFace`
	];
	let randomEmojiIndex: number = Math.floor(Math.random() * emojiList.length);
</script>

<svelte:head>
	<title>Notika kļūda! | Mežgalciema baptistu draudze</title>
</svelte:head>

<div class="w-screen h-screen bg-slate-50">
	<div class="grid grid-cols-2 gap-8 w-1/2 h-full mx-auto place-items-center">
		<img class="mx-auto w-2/4 max-w-[12rem]" src="/files/errorEmoji/{emojiList[randomEmojiIndex]}.png" alt="" />
		<div>
			<h1 class="font-title font-bold text-3xl text-slate-900">Notika kļūda!</h1>
			<p class="text-slate-600">{$page.status} - {$page.error.message}</p>
			<a class="block w-full mt-4 font-title text-lg text-slate-900 hover:text-blue-500 transition duration-200" href="/">Doties uz sākumlapu <i class="bi-arrow-right"></i></a>
		</div>
	</div>
</div>