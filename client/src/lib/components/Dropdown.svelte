<script lang="ts">
	export let options: string[];
	export let selected: number = 0;

	let isOpen: boolean = false;
</script>

<div class="inline-block relative">
	<div class="rounded-lg bg-slate-200 px-2 py-1 border border-slate-400 cursor-pointer"
		on:click={() => isOpen = !isOpen}>

		{options[selected]}
		<i class="bi bi-chevron-down inline-block ml-2 duration-200" class:rotate-180={isOpen}></i>
	</div>
	<div class="absolute bg-white h-0 max-h-[16rem] rounded-2xl shadow-lg shadow-slate-800/20 z-20 overflow-x-hidden duration-200"
		style={isOpen ? `height: ${options.length * 2 + 0.5}rem;` : ``}>

		{#each options as option, i}
			<p class="block my-2 mx-3 h-6 w-36 hover:opacity-75 duration-200 overflow-hidden cursor-pointer"
				class:font-bold={i === selected}
				on:click={() => { selected = i; isOpen = false; }}>{option}</p>
		{/each}
	</div>
</div>