<script lang="typescript">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	
	interface Link {
		name: string,
		link: string,
		icon: string
	}
	let links: Link[] = [
		{
			name: `Sākums`,
			link: `/admin`,
			icon: `house`
		},
		{
			name: `Statistika`,
			link: `/admin/statistika`,
			icon: `bar-chart-line`
		},
		{
			name: `Jaunumi`,
			link: `/admin/jaunumi`,
			icon: `newspaper`
		},
		{
			name: `Norises draudzē`,
			link: `/admin/norises-draudze`,
			icon: `calendar`
		},
		{
			name: `Vēsture`,
			link: `/admin/vesture`,
			icon: `clock-history`
		},
		/* {
			name: `Konti`,
			link: `/#/admin/konti`,
			icon: `person`
		}, */
	];
	let selectedLink: string;

	// Animation for mobile sidebar
	const sidebarAnimationProgress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	// Account menu popup
	/* let accountPopupElement: HTMLElement,
		accountPopupOpen: boolean = false;
	const toggleAccountPopup = () => {
		console.log(accountPopupElement, `toggle`);
		if (accountPopupElement === null) {
			return;
		}

		if (!accountPopupOpen) {
			accountPopupElement.style.display = `block`;
			setTimeout(() => accountPopupOpen = true, 10);
		} else {
			accountPopupOpen = false;
			setTimeout(() => accountPopupElement.style.display = `none`, 200);
		}
	}

	// Close the account menu popup when it's open and you click anywhere else on the page
	const bodyClick = (e: MouseEvent) => {
		console.log(accountPopupElement, `bodyClick`);
		if (accountPopupElement === null) {
			return;
		}

		if (accountPopupOpen) {
			if (e.target !== accountPopupElement &&
				e.target !== accountPopupElement.children[0] &&
				e.target !== accountPopupElement.children[0].children[0] &&
				e.target !== accountPopupElement.children[1] &&
				e.target !== accountPopupElement.children[2]) {
				toggleAccountPopup();
			}
		}
	} */

	onMount(() => {
		// If the client has not been logged in, redirect to login page
		const username: string | null = localStorage.getItem(`adminLoginUsername`);
		if (localStorage.getItem(`adminLoginToken`) === null || username === null) {
			window.location.pathname = `/admin/ienakt`;
		}

		// Set the selected link
		selectedLink = window.location.pathname;
	});
</script>

<!-- <svelte:body on:click={(e) => bodyClick(e)}></svelte:body> -->

<nav class="block w-5/6 h-20 mx-auto border-b-2 border-slate-300">
	<div class="hidden lg:block my-2">
		<img class="inline-block w-44" src="/files/title.png" alt="Mežgalciema baptistu draudze" />

		<div class="block h-6 my-7 float-right">
			{#each links as link}
				<a class="mx-2 hover:opacity-75 transition duration-200" class:font-bold={selectedLink === link.link} class:text-blue-500={selectedLink === link.link} href={link.link}>
					<i class="bi bi-{link.icon}"></i>
					{link.name}
				</a>
			{/each}

			<a class="ml-2 hover:opacity-75 transition duration-200" on:click={() => localStorage.removeItem(`adminLoginToken`)} href="/admin/ienakt">
				
				<i class="bi bi-door-open"></i>
				Iziet
			</a>

			<!-- <div
				class="account">

				<button
					class:active={accountPopupOpen}
					on:click={() => toggleAccountPopup()}>

					<i class="bi bi-person-circle"></i>
				</button>

				<div
					class="account-popup"
					class:account-popup-open={accountPopupOpen}
					bind:this={accountPopupElement}>

					<b>
						<i class="bi bi-person-circle"></i>
						{username}
					</b>

					<div class="separator"></div>

					<a
						href="/admin/iestatijumi">

						<i class="bi bi-gear"></i>
						Iestatījumi
					</a>
					<br />
					<a
						href="/admin/mainit-paroli">

						<i class="bi bi-arrow-repeat"></i>
						Mainīt paroli
					</a>
					<br />
					<a
						on:click={() => localStorage.removeItem(`adminLoginToken`)}
						href="/admin/ienakt">

						<i class="bi bi-box-arrow-right"></i>
						Iziet
					</a>
				</div>
			</div> -->
		</div>
	</div>
	<div class="lg:hidden">
		<button class="block w-16 h-16 my-2 float-left text-4xl" on:click={() => sidebarAnimationProgress.set(1)}>
			<i class="bi bi-list"></i>
		</button>

		<img class="block w-40 my-1 float-right" src="/files/title.png" alt="Mežgalciema baptistu draudze" on:click={() => window.location.pathname = `/`} />
	</div>
</nav>

<div 
	class="fixed w-full h-full top-0 left-0 bg-black z-10"
	on:click={() => sidebarAnimationProgress.set(0)}
	style={`opacity: ${$sidebarAnimationProgress / 2};
			display: ${($sidebarAnimationProgress === 0) ? `none` : `block`}`}>
</div>
<div 
	class="fixed w-[2/3] h-full top-0 bg-slate-50 z-20 p-4"
	style={`left: ${($sidebarAnimationProgress * 80) - 80}%;
			opacity: ${$sidebarAnimationProgress};`}>

	<button class="float-right text-xl" on:click={() => sidebarAnimationProgress.set(0)}>
		<i class="bi bi-x-lg"></i>
	</button>

	{#each links as link}
		<a class="block mb-2" class:font-bold={selectedLink === link.link} class:text-blue-500={selectedLink === link.link} href={link.link}>
			<i class="bi bi-{link.icon}"></i>
			{link.name}
		</a>
	{/each}
	
	<a
		on:click={() => localStorage.removeItem(`adminLoginToken`)}
		href="/admin/ienakt">

		<i class="bi bi-box-arrow-right"></i>
		Iziet
	</a>
</div>