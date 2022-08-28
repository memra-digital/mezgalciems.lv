<script lang="typescript">
	export let options: string[];
	export let selected: number = 0;
</script>

<div class="main">
	<div class="button">
		<p>{options[selected]}</p>

		<i class="bi bi-caret-down-fill"></i>
	</div>
	<div class="dropdown">
		{#each options as option, i}
			<p on:click={() => selected = i}>{option}</p>
		{/each}
	</div>
</div>

<style lang="scss">
	@import '../../theme.scss';
	
	.button {
		display: inline-block;

		padding: .5rem;
		padding-left: 1rem;
		padding-right: 1rem;

		border-radius: 1rem;

		background: $background-accent;
		color: $paragraph-color;

		cursor: pointer;

		transition: .5s background, color;

		user-select: none;

		* {
			display: inline-block;

			transition: .2s all;
		}
	}

	.dropdown {
		position: absolute;

		display: block;
		height: 0;

		padding: 0;
		padding-left: 1rem;
		padding-right: 1rem;

		border-radius: 1rem;

		box-shadow: 0px 0px 10px -3px $shadow-color;
		
		background: $background-color;
		color: $paragraph-color;
		
		overflow: hidden;

		transition: .2s all;

		z-index: 1;

		p {
			display: block;

			margin-bottom: .5rem;

			color: $paragraph-color;

			user-select: none;

			cursor: pointer;

			transition: .2s all;

			&:hover {
				opacity: 0.75;
			}
		}
	}

	.main:hover .button i {
		transform: rotate(180deg);
	}
	.main:hover .dropdown {
		height: auto;
		
		padding: 1rem;
	}
</style>