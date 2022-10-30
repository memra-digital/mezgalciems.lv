<script lang="ts">
	import Loading from "$lib/components/Loading.svelte";
	
	import { apiUrl } from "$lib/globals";
	import { request } from "graphql-request";
	import { onMount } from "svelte";

	interface Account {
		id: string,
		username: string,
		firstName: string,
		lastName: string,
		permissions: number
	}
	let accounts: Account[] = [];

	let isLoading: boolean = true;

	onMount(async () => {
		request(apiUrl, `
			query Accounts {
				accounts(token: "${localStorage.getItem(`adminAccountToken`)}") {
					id
					username
					firstName
					lastName
				}
			}
		`).then((data: any) => {
			isLoading = false;
			
			accounts = data.accounts;
		});
	});
</script>

<svelte:head>
	<title>Konti | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title text-3xl text-slate-900 mt-4">Konti</h1>

{#if isLoading}
	<Loading />
{:else}
	{#each accounts as account, i}
		<a class="block w-full p-2 transition hover:opacity-75 cursor-pointer"
			href="/admin/konti/{account.id}">

			<b>{account.username}</b> ({account.firstName} {account.lastName})
		</a>

		{#if i !== accounts.length - 1}
			<div class="block w-[95%] mx-auto border-b-2 border-slate-300"></div>
		{/if}
	{/each}
{/if}