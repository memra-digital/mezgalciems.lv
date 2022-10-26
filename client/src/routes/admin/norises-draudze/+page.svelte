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
		monthValue: number = 0,
		yearValue: string = ``;

	let isNextServiceDateEnabled: boolean = true;

	let isMinuteValueInvalid: boolean = false,
		isHourValueInvalid: boolean = false,
		isDateValueInvalid: boolean = false,
		isYearValueInvalid: boolean = false;

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

			if (data.information.nextDate === null) {
				isNextServiceDateEnabled = false;
			} else {
				let date: Date = new Date(data.information.nextDate);
				yearValue = date.getFullYear().toString();
				dateValue = date.getDate().toString();
				monthValue = date.getMonth();
				hourValue = date.getHours().toString();
				minuteValue = date.getMinutes().toString();

				if (hourValue.length === 1) hourValue = `0${hourValue}`;
				if (minuteValue.length === 1) minuteValue = `0${minuteValue}`;
			}
			
			dateInfoInput = data.information.dateInfo;
			infoInput = data.information.information;
		});
	});

	const save = () => {
		// Validate the date fields
		if (isNextServiceDateEnabled) {
			isHourValueInvalid = isNaN(hourValue as unknown as number);
			isMinuteValueInvalid = isNaN(minuteValue as unknown as number);
			isDateValueInvalid = isNaN(dateValue as unknown as number);
			isYearValueInvalid = isNaN(yearValue as unknown as number);

			isHourValueInvalid = isHourValueInvalid || (hourValue > `23` || hourValue < `0`);
			isMinuteValueInvalid = isMinuteValueInvalid || (minuteValue > `59` || minuteValue < `0`);

			// Kind of overkill to check the length of the month like this to ensure that the date is valid but ¯\_(ツ)_/¯
			let monthLengths: number[] = [31, 28, 31, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			if ((parseInt(yearValue) % 4 === 0) && (parseInt(yearValue) % 100 !== 0 || parseInt(yearValue) % 400 === 0)) {
				monthLengths[1] = 29;
			}
			isDateValueInvalid = isDateValueInvalid || parseInt(dateValue) > monthLengths[monthValue] || parseInt(dateValue) <= 0;

			if (isHourValueInvalid || isMinuteValueInvalid || isDateValueInvalid || isYearValueInvalid) {
				return;
			}
		}

		isLoadingSave = true;

		let nextServiceDateValue: number | null = null;
		if (isNextServiceDateEnabled) {
			let nextServiceDate: Date = new Date();
			nextServiceDate.setFullYear(parseInt(yearValue));
			nextServiceDate.setMonth(monthValue);
			nextServiceDate.setDate(parseInt(dateValue));
			nextServiceDate.setHours(parseInt(hourValue));
			nextServiceDate.setMinutes(parseInt(minuteValue));

			nextServiceDateValue = nextServiceDate.getTime();
		}

		const query = gql`
			mutation editInformation {
				editInformation(nextDate: ${nextServiceDateValue}, dateInfo: "${dateInfoInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", information: "${infoInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
					nextDate,
					dateInfo,
					information
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoadingSave = false;

			dateInfoInput = data.editInformation.dateInfo;
			infoInput = data.editInformation.information;
		}).catch((err: any) => {
			isLoadingSave = false;

			console.error(err);
		});
	}

	// Automatically sets the date
	const autoSetDate = () => {
		hourValue = `11`;
		minuteValue = `00`;

		let realDate: Date = new Date();

		let date: Date = new Date(realDate.getTime());
		date.setDate(date.getDate() - 7 + ((7 - date.getDay()) % 7));

		let isNextServiceDateFound: boolean = false;
		while (!isNextServiceDateFound) {
			date.setDate(date.getDate() + 7);

			if (date.getDate() < realDate.getDate() && date.getMonth() < realDate.getMonth() && date.getFullYear() < realDate.getFullYear()) {
				continue;
			} else if (date.getDate() === realDate.getDate() && date.getMonth() === realDate.getMonth() && date.getFullYear() === realDate.getFullYear()) {
				if (date.getHours() >= 11) {
					continue;
				}
			}

			let firstDayOfMonth: Date = new Date();
			firstDayOfMonth.setFullYear(date.getFullYear());
			firstDayOfMonth.setMonth(date.getMonth());
			firstDayOfMonth.setDate(1);

			let weekOfTheMonth = Math.floor((date.getDate() + (firstDayOfMonth.getDate() - 1)) / 7) + 1;

			if (weekOfTheMonth % 2 !== 0) {
				isNextServiceDateFound = true;
			}
		}

		dateValue = date.getDate().toString();
		monthValue = date.getMonth();
		yearValue = date.getFullYear().toString();

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
	<input type="checkbox" bind:checked={isNextServiceDateEnabled}>

	<div class="mb-2 transition" class:opacity-50={!isNextServiceDateEnabled} class:pointer-events-none={!isNextServiceDateEnabled}>
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
		<br />

		<p class="inline-block mt-2">Gads: </p>
		<input 
			class="inline-block w-16 px-1 text-center rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
			class:border-red-500={isYearValueInvalid} class:focus:border-red-500={isYearValueInvalid} 
			type="text"
			bind:value={yearValue} />
		<br />
	</div>

	<button 
		class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mb-6 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200"
		class:opacity-50={!isNextServiceDateEnabled}
		class:pointer-events-none={!isNextServiceDateEnabled}
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