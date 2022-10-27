<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut, cubicOut } from 'svelte/easing';
	import { year } from '$lib/globals';
	import { afterNavigate } from '$app/navigation';
	
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
		}
	];
	let accountLinks: Link[] = [
		{
			name: `Konta iestatījumi`,
			link: `/admin/konti`,
			icon: `gear`
		},
		{
			name: `Visi konti`,
			link: `/admin/konti`,
			icon: `list-ul`
		}
	]
	let selectedLink: string;

	// Animation for mobile sidebar
	const sidebarAnimationProgress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});

	// Account menu popup
	let	isAccountPopupOpen: boolean = false,
		accountPopupElement: HTMLElement;
	const accountPopupAnimationProgress = tweened(0, {
		duration: 200,
		easing: cubicInOut
	});
	const toggleAccountPopup = () => {
		if (!isAccountPopupOpen) {
			accountPopupAnimationProgress.set(1);
			setTimeout(() => isAccountPopupOpen = true, 10);
		} else {
			accountPopupAnimationProgress.set(0);
			isAccountPopupOpen = false;
		}
	}

	// Close the account menu popup when it's open and you click anywhere else on the page
	const bodyClick = (e: MouseEvent) => {
		if (accountPopupElement === null) {
			return;
		}

		if (isAccountPopupOpen) {
			if (!accountPopupElement.contains(<HTMLElement> e.target)) {
				toggleAccountPopup();
			}
		}
	}

	let accountUsername: string | null = null,
		accountId: string | null = null,
		accountPermissions: string | null = null;
	afterNavigate(() => {
		accountUsername = localStorage.getItem(`adminAccountUsername`);
		accountId = localStorage.getItem(`adminAccountID`);
		accountPermissions = localStorage.getItem(`adminAccountPermissions`);

		// If the client has not been logged in, redirect to login page
		if (localStorage.getItem(`adminAccountToken`) === null || accountUsername === null || accountId === null || accountPermissions === null) {
			window.location.pathname = `/admin/ienakt`;
			localStorage.removeItem(`adminAccountToken`);
		}

		accountLinks[0].link = `/admin/konti/${accountId}`;

		// Set the selected link
		selectedLink = window.location.pathname;
	});
</script>

<svelte:body on:click={(e) => bodyClick(e)}></svelte:body>

<div class="bg-slate-100 min-h-screen">
	<nav class="block w-[95%] md:w-5/6 h-20 mx-auto border-b-2 border-slate-300">
		<div class="hidden lg:block mb-2">
			<img class="inline-block w-44" src="/files/title.png" alt="Mežgalciema baptistu draudze" />

			<div class="block h-6 my-7 float-right">
				{#each links as link}
					<a class="mx-2 hover:opacity-75 transition duration-200" class:font-bold={selectedLink === link.link} class:text-blue-500={selectedLink === link.link} href={link.link}>
						<i class="bi bi-{link.icon}"></i>
						{link.name}
					</a>
				{/each}

				<div class="float-right">
					<button class="text-2xl ml-2 transition mt-[-0.2rem]"
						class:text-blue-500={isAccountPopupOpen}
						on:click={() => toggleAccountPopup()}>

						<i class="bi bi-person-circle"></i>
					</button>

					<div class="absolute right-16 block w-48 h-36 bg-white rounded-2xl shadow-lg shadow-slate-800/20 z-20 p-4 pt-2"
						style="transform: translateY({(1 - $accountPopupAnimationProgress) * 10}px); opacity: {$accountPopupAnimationProgress}; display: {$accountPopupAnimationProgress === 0 ? `none` : `block`}"
						bind:this={accountPopupElement}>

						<b class="block w-full text-center">{accountUsername}</b>

						<div class="block w-full h-1 rounded bg-gradient-to-tl from-blue-500 to-sky-400 mb-2 mt-1"></div>

						{#each accountLinks as link}
							<a class="block my-1 hover:opacity-75 transition" class:font-bold={selectedLink === link.link} class:text-blue-500={selectedLink === link.link} href={link.link}>
								<i class="bi bi-{link.icon}"></i>
								{link.name}
							</a>
						{/each}

						<a class="block my-1 hover:opacity-75 transition" on:click={() => localStorage.removeItem(`adminAccountToken`)}
							href="/admin/ienakt">
							<i class="bi bi-box-arrow-right"></i>
							Iziet
						</a>
					</div>
				</div>
			</div>
		</div>
		<div class="lg:hidden">
			<button class="block w-16 h-16 my-2 float-left text-4xl" on:click={() => sidebarAnimationProgress.set(1)}>
				<i class="bi bi-list"></i>
			</button>

			<img class="block w-40 my-1 float-right" src="/files/title.png" alt="Mežgalciema baptistu draudze" on:click={() => window.location.pathname = `/`} />
		</div>
	</nav>

	<main class="p-2 w-full sm:w-3/4 md:w-2/4 mx-auto">
		<slot></slot>
	</main>

	<footer class="block pt-2 pb-8 w-full text-center">
		<p>&copy; Mežgalciema baptistu draudze, {year} • <a class="link" href="/privatuma-politika">Privātuma politika</a></p>
	</footer>
</div>

<div 
	class="fixed w-full h-full top-0 left-0 bg-black z-10"
	on:click={() => sidebarAnimationProgress.set(0)}
	style={`opacity: ${$sidebarAnimationProgress / 2};
			display: ${($sidebarAnimationProgress === 0) ? `none` : `block`}`}>
</div>
<div 
	class="fixed w-[80%] h-full top-0 bg-slate-50 z-20 p-4"
	style="left: {($sidebarAnimationProgress * 80) - 80}%;">

	<button class="float-right text-xl" on:click={() => sidebarAnimationProgress.set(0)}>
		<i class="bi bi-x-lg"></i>
	</button>

	{#each links as link}
		<a class="block my-4 text-xl font-title"
			class:text-blue-500={selectedLink === link.link}
			href={link.link}
			on:click={() => sidebarAnimationProgress.set(0)}>

			<i class="bi bi-{link.icon}"></i>
			{link.name}
		</a>
	{/each}
	
	<a
		class="block my-4 text-xl font-title"
		on:click={() => localStorage.removeItem(`adminAccountToken`)}
		href="/admin/ienakt">

		<i class="bi bi-box-arrow-right"></i>
		Iziet
	</a>
</div>