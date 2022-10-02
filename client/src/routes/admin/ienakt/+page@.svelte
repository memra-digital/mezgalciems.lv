<script lang="ts">
	import CookieNotice from '$lib/components/CookieNotice.svelte';
	import Loading from '$lib/components/Loading.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '$lib/globals';
	import { request } from 'graphql-request';
    import { dataset_dev } from 'svelte/internal';

	let usernameValue: string = ``,
		passwordValue: string = ``;

	let isLoading: boolean = false;

	let passwordElement: HTMLInputElement,
		isPasswordShown: boolean = false;
		
	let usernameError: string = ` `,
		isUsernameInvalid: boolean = false;
		
	let passwordError: string = ` `,
		isPasswordInvalid: boolean = false;

	// Show/hide password
	const togglePassword = () => {
		passwordElement.type = passwordElement.type === `text` ? `password` : `text`;
		isPasswordShown = isPasswordShown ? false : true;
	}

	// Try logging in
	const login = () => {
		// Client-side validation
		validateUsername();
		validatePassword();
		if (isUsernameInvalid || isPasswordInvalid) {
			return;
		}

		isLoading = true;

		request(apiUrl, `
			{
				login(username: "${usernameValue}", password: "${passwordValue}") {
					token
				}
			}
		`).then((data: any) => {
			isLoading = false;

			localStorage.setItem(`adminLoginToken`, data.login.token);
			localStorage.setItem(`adminLoginUsername`, usernameValue);
			window.location.pathname = `/admin/`;
		}).catch((err: any) => {
			isLoading = false;

			if (err.message.includes(`invalidUsernameOrPassword`)) {
				usernameError = `Nepareizs lietotājvārds/parole!`;
				passwordError = `Nepareizs lietotājvārds/parole!`;

				isUsernameInvalid = true;
				isPasswordInvalid = true;
			} else {
				console.error(err);
			}
		});
	}

	// Client-side validation
	const validateUsername = () => {
		if (usernameValue.trim() === ``) {
			usernameError = `Nedrīkst būt tukšs!`;
			isUsernameInvalid = true;
			return;
		}
		isUsernameInvalid = false;
	}
	const validatePassword = () => {
		if (passwordValue.trim() === ``) {
			passwordError = `Nedrīkst būt tukša!`;
			isPasswordInvalid = true;
			return;
		}
		isPasswordInvalid = false;
	}

	// Try logging in on Enter key press
	export const onBodyKeyPress = (e: KeyboardEvent) => {
		if (e.key === `Enter`) {
			login();
		}
	}

	onMount(() => {
		// If logged in already, go to admin home page
		if (localStorage.getItem(`adminLoginToken`) !== null && localStorage.getItem(`adminLoginUsername`) !== null) {
			window.location.href = `/admin`;
		}
	});
</script>

<svelte:head>
	<title>Ienākt | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<svelte:body on:keypress={(e) => onBodyKeyPress(e)}></svelte:body>

<CookieNotice />
<div class="block w-screen h-screen grid place-items-center bg-slate-200">
	<div class="block w-[25rem] h-[22rem] p-4 rounded-3xl bg-slate-50 shadow-lg shadow-slate-300">
		<img class="w-3/4 mx-auto mb-2 cursor-pointer" src="/files/title.png" alt="Mežgalciema baptistu draudze" on:click={() => window.location.pathname = `/`} />
		
		<h1 class="font-title text-2xl text-center text-slate-900 leading-5 mt-4">Ienākt</h1>

		<b class="text-slate-900 transition duration-200" class:text-red-500={isUsernameInvalid} class:font-bold={isUsernameInvalid}>Lietotājvārds <span class="italic opacity-0 transition duration-200" class:opacity-100={isUsernameInvalid}> - {usernameError}</span></b>
		<input class="block w-full mb-2 p-1 bg-white border border-slate-300 rounded-lg focus:border-2 focus:border-blue-500 transition duration-200" class:border-red-500={isUsernameInvalid} class:focus:border-red-500={isUsernameInvalid} type="text" bind:value={usernameValue} />

		<b class="text-slate-900 transition duration-200" class:text-red-500={isPasswordInvalid} class:font-bold={isPasswordInvalid}>Parole <span class="italic opacity-0 transition duration-200" class:opacity-100={isPasswordInvalid}> - {passwordError}</span></b>
		<div class="relative">
			<input class="block w-full mb-2 p-1 bg-white border border-slate-300 rounded-lg focus:border-2 focus:border-blue-500 transition duration-200" class:border-red-500={isPasswordInvalid} class:focus:border-red-500={isPasswordInvalid} type="password" bind:this={passwordElement} bind:value={passwordValue} />

			<button class="absolute right-2 top-1 block width-2 height-2 hover:opacity-75 transition duration-200" on:click={() => togglePassword()}>
				<i class="bi bi-eye{isPasswordShown ? `-slash` : ``}"></i>
			</button>
		</div>

		{#if isLoading}
			<Loading />
		{:else}
			<button class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mt-4 mx-auto w-1/3 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200 hover:brightness-95 duration-200" on:click={() => login()}>Ienākt</button>
		{/if}
	</div>
</div>