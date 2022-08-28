<script lang="typescript">
	import AdminNavbar from '$lib/components/admin/AdminNavbar.svelte';
	import AdminFooter from '$lib/components/admin/AdminFooter.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '$lib/globals';
	import { request, gql } from 'graphql-request';

	let loadingFetch: boolean = true;
	let loadingSave: boolean = false;

	let minuteInput: string = ``;
	let hourInput: string = ``;
	let dateInput: string = ``;
	let monthInput: number = 1;

	let dateInfoInput: string = ``;
	let infoInput: string = ``;
	
	onMount(async () => {
		const query = gql`
			{
				information {
					nextDate,
					dateInfo,
					information
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			loadingFetch = false;

			let date: Array<string> = data.information.nextDate.split(`-`);
			dateInput = date[0];
			monthInput = parseInt(date[1]) - 1;
			hourInput = date[2];
			minuteInput = date[3];

			if (hourInput.length === 1) hourInput = `0${hourInput}`;
			if (minuteInput.length === 1) minuteInput = `0${minuteInput}`;
			
			dateInfoInput = data.information.dateInfo;
			infoInput = data.information.information;
		});
	});

	const save = () => {
		loadingSave = true;
		
		const query = gql`
			mutation modifyInformation {
				modifyInformation(nextDate: "${parseInt(dateInput)}-${monthInput + 1}-${parseInt(hourInput)}-${parseInt(minuteInput)}", dateInfo: "${dateInfoInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", information: "${infoInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
					error,
					nextDate,
					dateInfo,
					information
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			loadingSave = false;

			if (data.modifyInformation.error === ``) {
				dateInfoInput = data.modifyInformation.dateInfo;
				infoInput = data.modifyInformation.information;
			}
		});
	}

	const setDate = () => {
		hourInput = `11`;
		minuteInput = `00`;

		for (let i: number = 1; i <= 31; i++) {
			let realDate: Date = new Date();
			realDate.setDate(i);
			let nextDate: Date = new Date();
			
			let weekOfTheMonth = Math.floor((realDate.getDate()) / 7);
			console.log(`Date:`, i, `Week of the month:`, weekOfTheMonth);

			if (weekOfTheMonth % 2 === 0) {
				nextDate.setDate(realDate.getDate() + ((7 - realDate.getDay()) % 7));
			} else {
				nextDate.setDate(realDate.getDate() + ((7 - realDate.getDay()) % 7) + 7);
			}

			dateInput = (nextDate.getDate()).toString();
			monthInput = (nextDate.getMonth() + 1) - 1;
		}

		save();
	}
</script>

<svelte:head>
	<title>Norises draudzē | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<AdminNavbar />
<main>
	<h1 class="font-title text-3xl text-slate-900 mt-2 mb-2">Norises draudzē</h1>
	{#if loadingFetch}
		<Loading />
	{:else}
		<b>Nākamā dievkalpojuma datums</b>
		<div class="datePicker">
			<p>Laiks: </p>
			<input 
				type="text"
				bind:value={hourInput} />
			<p>:</p>
			<input 
				type="text"
				bind:value={minuteInput} />
			<br />
			
			<p>Datums: </p>
			<input 
				type="text"
				bind:value={dateInput} />
			<br />
			
			<p>Mēnesis: </p>
			<Dropdown 
				options={[
					`Janvāris`,
					`Februāris`,
					`Marts`,
					`Aprīlis`,
					`Maijs`,
					`Jūnijs`,
					`Jūlijs`,
					`Augusts`,
					`Septembris`,
					`Oktobris`,
					`Novembris`,
					`Decembris`
				]}
				bind:selected={monthInput} />
			<br />

			<button on:click={() => setDate()}>Automātiski iestatīt</button>
		</div>
		<br />

		<b>Informācija par dievkalpojumiem</b>
		<textarea
			bind:value={dateInfoInput} />
		
		<b>Pārējā informācija</b>
		<textarea
			bind:value={infoInput} />

		{#if loadingSave}
			<Loading />
		{:else}
			<button on:click={() => save()}>Saglabāt</button>
		{/if}

	{/if}
</main>
<AdminFooter />

<style>
	h1 {
		margin-top: 1.5rem;
	}
	
	textarea, input {
		display: block;
		width: 100%;

		background: #eaeaea;
		color: #000000;

		font-size: 1rem;
		line-height: 1.25rem;

		border-radius: .5rem;

		margin-bottom: 1rem;

		border: 0;

		resize: vertical;
	}

	.datePicker {
		padding-left: 1rem;
	}
	.datePicker input,
	.datePicker p {
		display: inline-block;
	}
	.datePicker input {
		width: 4ch;

		padding: .5rem;
	}

	select {
		background: #eaeaea;
		color: #000000;

		border-radius: .5rem;

		border: 0;

		font-size: 1rem;
		
		padding: .5rem;
	}
</style>