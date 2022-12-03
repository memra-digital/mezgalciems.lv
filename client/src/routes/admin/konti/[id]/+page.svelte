<script lang="ts">
	import Loading from "$lib/components/Loading.svelte";

	import { apiUrl } from "$lib/globals";
    import { request } from "graphql-request";
    import { onMount } from "svelte";
	
	let isLoadingFetch: boolean = true,
		isLoadingSave: boolean = false;

	let accountId: string = ``;

	let usernameValue: string = ``,
		firstNameValue: string = ``,
		lastNameValue: string = ``;
	
	let isUsernameInvalid: boolean = false,
		isFirstNameInvalid: boolean = false,
		isLastNameInvalid: boolean = false;

	onMount(async () => {
		accountId = location.pathname.split(`/`).pop() || ``;

		request(apiUrl, `
			query Accounts {
				account(token: "${localStorage.getItem(`adminAccountToken`)}", id: "${accountId}") {
					id
					username
					firstName
					lastName
					permissions
				}
			}
		`).then((data: any) => {
			isLoadingFetch = false;
			
			usernameValue = data.account.username;
			firstNameValue = data.account.firstName;
			lastNameValue = data.account.lastName;
		});
	});

	const save = () => {

		isLoadingSave = true;

		request(apiUrl, `
			mutation {
				editAccount(token: "${localStorage.getItem(`adminAccountToken`)}", id: "${accountId}") {
					
				}
			}
		`).then((data: any) => {
			isLoadingSave = true;
		});
	}
</script>

<svelte:head>
	<title>Konta iestatījumi | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

{#if isLoadingFetch}
	<h1 class="font-title text-3xl text-slate-900 mt-4">Konts</h1>
	<Loading />
{:else}
	<h1 class="font-title text-3xl text-slate-900 mt-4">Konts - {usernameValue}</h1>

	<p class="inline-block">Lietotājvārds: </p>
	<input class="inline-block mt-2 py-1 px-2 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
		class:border-red-500={isUsernameInvalid} class:focus:border-red-500={isUsernameInvalid}
		type="text"
		bind:value={usernameValue} 
		placeholder="Lietotājvārds" />
	<br />
	
	<p class="inline-block">Vārds: </p>
	<input class="inline-block mt-2 py-1 px-2 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
		class:border-red-500={isFirstNameInvalid} class:focus:border-red-500={isFirstNameInvalid}
		type="text"
		bind:value={firstNameValue} 
		placeholder="Lietotājvārds" />
	<br />

	<p class="inline-block">Uzvārds: </p>
	<input class="inline-block mt-2 py-1 px-2 rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
		class:border-red-500={isLastNameInvalid} class:focus:border-red-500={isLastNameInvalid}
		type="text"
		bind:value={lastNameValue} 
		placeholder="Lietotājvārds" />
	
	{#if isLoadingSave}
		<Loading />
	{:else}
		<button
			class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mt-2 mx-auto w-1/3 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200"
			on:click={() => save()}>

			Saglabāt
		</button>
	{/if}
	
	<h1 class="font-title text-3xl text-slate-900 mt-4">Nomainīt paroli</h1>
{/if}