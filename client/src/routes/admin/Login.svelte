<script lang="typescript">
	import CookieNotice from '../../components/CookieNotice.svelte';
	import Loading from '../../components/Loading.svelte';

	import { apiUrl } from '../../globals';
	import { request } from 'graphql-request';

	// If logged in already, go to admin home page
	if (localStorage.getItem(`adminLoginToken`) !== null && localStorage.getItem(`adminLoginUsername`) !== null) {
        window.location.hash = `/admin/sakums`;
    }

	let usernameValue: string = ``,
		passwordValue: string = ``,

		isLoading: boolean = false,

		passwordElement: HTMLInputElement,
		isPasswordShown: boolean = false,

		serverError: string = ` `,
		serverHasError: boolean = false,
		
		usernameError: string = ` `,
		usernameHasError: boolean = false,
		
		passwordError: string = ` `,
		passwordHasError: boolean = false;

	// Show/hide password
	const togglePassword = () => {
		passwordElement.type = passwordElement.type === `text` ? `password` : `text`;
		isPasswordShown = isPasswordShown ? false : true;
	}

	// Try logging in
	const login = () => {
		isLoading = true;

		request(apiUrl, `
			{
				login(username: "${usernameValue}", password: "${passwordValue}") {
					error
					token
				}
			}
		`).then((data: any) => {
			isLoading = false;

			if (data.login.token !== ``) {
				localStorage.setItem(`adminLoginToken`, data.login.token);
				localStorage.setItem(`adminLoginUsername`, usernameValue);
				window.location.hash = `/admin/sakums`;
				return;
			}

			serverHasError = true;
			if (data.login.error === `usernameNotFound`) {
				serverError = `Lietotājvārds netika atrasts!`;
			} else if (data.login.error === `pwdNotCorrect`) {
				serverError = `Nepareiza parole!`;
			} else {
				serverError = `Notika nezināma kļūda!`;
			}
		});
	}

	// Client-side validation
	const validateUsername = () => {
		if (usernameValue === ``) {
			usernameError = `Lietotājvārds nevar būt tukšs!`;
			usernameHasError = true;
			return;
		}

		usernameHasError = false
	}
	const validatePassword = () => {
		if (passwordValue === ``) {
			passwordError = `Parole nevar būt tukša!`;
			passwordHasError = true;
			return;
		}

		passwordHasError = false;
	}

	// Try logging in on Enter key press
	export const onBodyKeyPress = (e: KeyboardEvent) => {
		if (e.key === `Enter`) {
			validateUsername();
			validatePassword();

			if (!usernameHasError && !passwordHasError) {
				login();
			}
		}
	}
</script>

<svelte:head>
	<title>Ienākt | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<svelte:body on:keypress={(e) => onBodyKeyPress(e)}></svelte:body>

<CookieNotice />
<div class="background">
	<div class="modal">
		<img
			src="/files/title.png"
			alt="Mežgalciema baptistu draudze"
			on:click={() => window.location.href = `/`} />
		
		<h1>Ienākt</h1>

		<p class="error {serverHasError ? `error-show` : `error-hide`}">{serverError}</p>

		<p class="label">Lietotājvārds:</p>
		<input
			type="text"
			bind:value={usernameValue}
			on:blur={() => validateUsername()}
			class:wrong={usernameHasError} />
		<p class="error {usernameHasError ? `error-show` : `error-hide`}">{usernameError}</p>

		<p class="label">Parole:</p>
		<div
			class="password-container"
			class:wrong={passwordHasError}>
			
			<input
				type="password"
				bind:this={passwordElement}
				bind:value={passwordValue}
				on:blur={() => validatePassword()} />

			<button
				class="show-password-btn"
				on:click={() => togglePassword()}>

				<i class="bi bi-eye-{isPasswordShown ? `slash-` : ``}fill"></i>
			</button>

			<p class="error password-error {passwordHasError ? `error-show` : `error-hide`}">{passwordError}</p>
		</div>

		{#if isLoading}
			<Loading />
		{:else}
			<button
				on:click={() => login()}>
				
				Ienākt
			</button>
		{/if}
	</div>
</div>

<style lang="scss">
	@import '../../theme.scss';

	.background {
		display: flex;
		justify-content: center;
		align-items: center;

		width: 100vw;
		height: 100vh;

		background: $admin-background;
	}

	.modal {
		display: block;
		width: 25%;

		padding: 1rem;

		border-radius: 1rem;

		box-shadow: 0px 0px 10px -3px $shadow-color;

		background: $background-color;
	}

	img {
		width: 50%;
		max-width: 50%;

		margin-left: 25%;
		margin-right: 25%;
		margin-bottom: 1rem;

		cursor: pointer;
	}

	h1 {
		text-align: center;
	}

	.label {
		margin-top: 1rem;
	}

	input {
		color: $paragraph-color;
		background: $background-accent;

		border: 0;

		border-radius: 2rem;

		padding: .5rem;

		font-size: 1rem;

		width: 100%;

		transition: .2s all;
	}

	.password-container {
		position: absolute;

		width: calc(25% - 2rem);
		height: 3rem;
	}
	.show-password-btn {
		position: absolute;
		right: 0;
		top: 0;

		display: block;
		width: 2rem;
		height: 2rem;

		margin: .25rem;

		border-radius: 1rem;

		border: 0;

		background: rgba(0, 0, 0, 0.4);
		color: $paragraph-color;

		cursor: pointer;

		padding: .5rem;

		transition: .2s all;

		i {
			display: block;
			width: 1rem;
			height: 1rem;
		}
	}
	.wrong .show-password-btn {
		margin: calc(.25rem + 5px);
	}

	input.wrong,
	.wrong input {
		border: $red-color 5px solid;

		transition: .2s all;
	}
	.error {
		color: $red-color;

		font-weight: bold;

		transition: .2s all;
	}
	.error-show {
		opacity: 1;
	}
	.error-hide {
		opacity: 0;
	}

	button {
		display: block;

		margin: auto;
		margin-top: 4.5rem;
	}

	@media only screen and (max-width: 875px) {
		.modal {
			width: 80%;
		}
		.password-container {
			width: calc(80% - 2rem);
		}
	}
</style>
