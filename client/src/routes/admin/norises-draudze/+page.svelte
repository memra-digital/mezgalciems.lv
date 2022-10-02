<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '$lib/globals';
	import { request, gql } from 'graphql-request';

	let isLoadingFetch: boolean = true,
		isLoadingSave: boolean = false;

	let minuteValue: string = ``,
		hourValue: string = ``,
		dateValue: string = ``,
		monthValue: number = 1;

	let isMinuteValueInvalid: boolean = false,
		isHourValueInvalid: boolean = false,
		isDateValueInvalid: boolean = false;

	let dateInfoInput: string = ``,
		infoInput: string = ``;
	
	onMount(async () => {
		// Fetch the data
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
			isLoadingFetch = false;

			let date: Array<string> = data.information.nextDate.split(`-`);
			dateValue = date[0];
			monthValue = parseInt(date[1]) - 1;
			hourValue = date[2];
			minuteValue = date[3];

			if (hourValue.length === 1) hourValue = `0${hourValue}`;
			if (minuteValue.length === 1) minuteValue = `0${minuteValue}`;
			
			dateInfoInput = data.information.dateInfo;
			infoInput = data.information.information;
		});
	});

	const save = () => {
		// Validate the fields
		isHourValueInvalid = isNaN(hourValue as unknown as number);
		isMinuteValueInvalid = isNaN(minuteValue as unknown as number);
		isDateValueInvalid = isNaN(dateValue as unknown as number);

		if (isHourValueInvalid || isMinuteValueInvalid || isDateValueInvalid) {
			return;
		}

		// Save everything
		isLoadingSave = true;
		
		const query = gql`
			mutation modifyInformation {
				modifyInformation(nextDate: "${parseInt(dateValue)}-${monthValue + 1}-${parseInt(hourValue)}-${parseInt(minuteValue)}", dateInfo: "${dateInfoInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", information: "${infoInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
					nextDate,
					dateInfo,
					information
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoadingSave = false;

			if (true) { // TODO: handle errors
				dateInfoInput = data.modifyInformation.dateInfo;
				infoInput = data.modifyInformation.information;
			} else {
				console.error(data.modifyInformation.error);
			}
		});
	}

	// Automatically sets the date
	const autoSetDate = () => {
		hourValue = `11`;
		minuteValue = `00`;

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

			dateValue = (nextDate.getDate()).toString();
			monthValue = (nextDate.getMonth() + 1) - 1;
		}

		save();
	}
</script>

<svelte:head>
	<title>Norises draudzē | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title text-3xl text-slate-900 mt-4 mb-2">Norises draudzē</h1>
{#if isLoadingFetch}
	<Loading />
{:else}
	<b class="font-title font-bold text-xl text-slate-800">Nākamā dievkalpojuma datums</b>
	<div class="mb-2">
		<p class="inline-block">Laiks: </p>
		<input 
			class="inline-block w-8 px-1 text-center rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
			class:border-red-500={isHourValueInvalid} class:focus:border-red-500={isHourValueInvalid} 
			type="text"
			bind:value={hourValue} />
		<p class="inline-block">:</p>
		<input 
			class="inline-block w-8 px-1 text-center rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
			class:border-red-500={isMinuteValueInvalid} class:focus:border-red-500={isMinuteValueInvalid} 
			type="text"
			bind:value={minuteValue} />
		<br />
		
		<p class="inline-block mt-2">Datums: </p>
		<input 
			class="inline-block w-8 px-1 text-center rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
			class:border-red-500={isDateValueInvalid} class:focus:border-red-500={isDateValueInvalid} 
			type="text"
			bind:value={dateValue} />
		<br />
		
		<p class="inline-block mt-3">Mēnesis: </p>
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
			bind:selected={monthValue} />
	</div>

	<button 
		class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mb-6 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200"
		on:click={() => autoSetDate()}>
		
		<i class="bi bi-arrow-repeat"></i>
		Automātiski iestatīt
	</button>

	<b class="font-title font-bold text-xl text-slate-800">Informācija par dievkalpojumiem</b>
	<textarea
		class="block w-full h-[calc(100%-5.5rem)] resize-vertical p-2 mb-6 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
		bind:value={dateInfoInput} />
	
	<b class="font-title font-bold text-xl text-slate-800">Pārējā informācija</b>
	<textarea
		class="block w-full h-[calc(100%-5.5rem)] resize-vertical p-2 mb-6 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
		bind:value={infoInput} />

	{#if isLoadingSave}
		<Loading />
	{:else}
		<button
			class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mb-6 mx-auto w-1/3 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
			on:click={() => save()}>

			Saglabāt
		</button>
	{/if}
{/if}