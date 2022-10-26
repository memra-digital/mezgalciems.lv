<script lang="ts">
	import CookieNotice from '$lib/components/CookieNotice.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { apiUrl } from '$lib/globals';
	import { request } from 'graphql-request';
	import { afterNavigate } from '$app/navigation';

	interface Link {
		name: string,
		link: string
	}
	
	let y: number,
		wrapperElement: HTMLElement,
		navbarElement: HTMLElement,
		currentPage: string | undefined,
		bannerImageHeight: number;

	const links: Link[] = [
		{	
			name: `Jaunumi`,
			link: ``
		},
		{	
			name: `Kā nokļūt`,
			link: `ka-noklut`
		},
		{	
			name: `Norises draudzē`,
			link: `norises-draudze`
		},
		{	
			name: `Vēsture`,
			link: `vesture`
		},
	];
	
	// This gets executed on every scroll change to update the navbar as using a sticky CSS element is too limited
	const updateStickiness = () => {
		if (window.pageYOffset >= wrapperElement.offsetTop - 28) {
			navbarElement.style.position = `fixed`;
			navbarElement.style.top = `0`;
			navbarElement.style.borderTopLeftRadius = `0`;
			navbarElement.style.borderTopRightRadius = `0`;
		} else {
			navbarElement.style.position = `relative`;
			navbarElement.style.top = `-1.75rem`;
			navbarElement.style.borderTopLeftRadius = ``;
			navbarElement.style.borderTopRightRadius = ``;
		}
	}

	let mainElement: HTMLElement;

	afterNavigate((nav) => {
		currentPage = nav.to.pathname.split(`/`).pop();

		// Redirect #/admin/* links to the new ones to avoid any confusion
		if (nav.to.hash.includes(`admin`)) {
			window.location.pathname = `/admin/ienakt`;
		}
		
		// Some pages might require wider main elements
		if (nav.to.pathname === `/vesture`) {
			mainElement.style.width = `80vw`;
		} else {
			mainElement.style.width = ``;
		}

		// Send statistical data
		request(apiUrl, `
			mutation registerPageView {
				registerPageView(page: "${currentPage}", user: "${localStorage.getItem(`statisticsUserToken`) ?? ``}")
			}
		`);
	});
	
	const sidebarAnimationProgress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});
</script>

<svelte:window on:scroll={(e) => updateStickiness()} bind:scrollY={y}/>

<div class="bg-slate-50 print:bg-white min-h-[100vh]">
	<CookieNotice />

	<header class="print:hidden">
		<div class="header-banner"
			alt="Mežgalciema baptistu draudzes baznīca"
			style={`transform: translateY(${(y / 1.75)}px); background-image: url("/files/banner_0.png");`}
			bind:clientHeight={bannerImageHeight} />
	
		<div class="header-banner"
			alt="Mežgalciema baptistu draudzes baznīca"
			style={`transform: translateY(${(y / 1.75) - (bannerImageHeight)}px); background-image: url("/files/banner_1.png");`} />
	
		<div class="header-banner"
			alt="Mežgalciema baptistu draudzes baznīca"
			style={`transform: translateY(${(y / 2) - (bannerImageHeight * 2)}px); background-image: url("/files/banner_2.png");`} />
	
		<div class="header-banner"
			alt="Mežgalciema baptistu draudzes baznīca"
			style={`
				transform: translateY(${(y / 4) - (bannerImageHeight * 3)}px);
				background-image: url("/files/banner_3.png");
				margin-left: 40%;
				max-width: 50vw;
				background-size: contain;`} />
	</header>
	
	<div class="flex place-content-center min-h-[5rem] md:mb-[-1.5rem] print:hidden" bind:this={wrapperElement}>
		<nav class="relative top-[-1.75rem] inline-block w-full md:h-[3.75rem] md:w-auto rounded-none md:rounded-2xl bg-white p-4 shadow-lg shadow-slate-800/20 overflow-hidden z-10"
			bind:this={navbarElement}>

			<div class="hidden md:block">
				{#each links as link}
					<a
						class="relative font-title text-lg mx-3"
						aria-current={currentPage === link.link ? `page` : undefined}
						href="/{link.link}"
						on:click={() => currentPage = link.link}>

						{link.name}
					</a>
				{/each}
			</div>
			<div class="block md:hidden">
				<button class="block w-16 h-16 text-5xl m-2 float-left" on:click={() => sidebarAnimationProgress.set(1)}>
					<i class="bi bi-list"></i>
				</button>
	
				<img class="block max-w-[12rem] float-right mr-4" src="/files/title.png" alt="Mežgalciema baptistu draudze" />
			</div>
		</nav>
	</div>
	
	<div class="fixed top-0 left-0 block w-screen h-screen z-20 bg-black print:hidden"
		on:click={() => sidebarAnimationProgress.set(0)}
		style="opacity: {$sidebarAnimationProgress / 2}; display: {($sidebarAnimationProgress === 0) ? `none` : `block`}"></div>
	
	<div class="fixed top-0 block w-[80%] h-screen z-30 bg-white print:hidden" style="left: {($sidebarAnimationProgress * 80) - 80}%;">
		<button class="w-12 h-12 text-4xl float-right" on:click={() => sidebarAnimationProgress.set(0)}>
			<i class="bi bi-x"></i>
		</button>
	
		{#each links as link}
			<a 
				class="block m-4 text-xl font-title"
				class:text-blue-500={currentPage === link.link ? `page` : undefined}
				aria-current="{currentPage === link.link ? `page` : undefined}"
				href="/{link.link}"
				on:click={() => { sidebarAnimationProgress.set(0); currentPage = link.link; } }>

				{link.name}
			</a>
		{/each}
	</div>

	<main class="p-2 w-full sm:w-3/4 md:w-2/4 mx-auto" bind:this={mainElement}>
		<slot></slot>
	</main>

	<footer class="w-full pt-4 pb-12 text-center">
		<p class="text-slate-600">&copy; Mežgalciema baptistu draudze, 2022<span class="print:hidden">&nbsp;• <a href="/privatuma-politika" class="link">Privātuma politika</a></span></p>
	
		<a class="mx-1 text-2xl text-blue-600 hover:opacity-75 transition duration-200 print:hidden" href="https://www.facebook.com/mezgalciems" target="_blank" rel="noreferer">
			<i class="bi bi-facebook"></i>
		</a>
		<a class="mx-1 text-2xl text-red-600 hover:opacity-75 transition duration-200 print:hidden" href="https://www.youtube.com/channel/UC4qO8CQPqA_xrSe2ONdm-gg" target="_blank" rel="noreferer">
			<i class="bi bi-youtube"></i>
		</a>
		<a class="mx-1 text-2xl text-green-500 hover:opacity-75 transition duration-200 print:hidden" href="https://open.spotify.com/show/2K9aHWInrMlwCqH25L4bRf?si=8400e25304ac469f" target="_blank" rel="noreferer">
			<i class="bi bi-spotify"></i>
		</a>
	</footer>
</div>

<style lang="scss">
	// Banner
	header {
		background: #edeef1;
		display: block;
		height: 500px;

		overflow: hidden;

		.header-banner {
			background-size: 70%;
			background-position: center 10%;
			background-repeat: no-repeat;

			width: 100%;
			height: 100%;
		}
	}
	@media print {
		header, .header-banner {
			display: none;
		}
	}

	nav a {
		&::after {
			content: "";
			background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
			position: absolute;
			bottom: -2rem;
			left: 0;
			width: 100%;
			height: 1rem;
			border-radius: 1rem;
			opacity: 0;
			transition: .2s all;
		}
		&:hover::after,
		&[aria-current=page]::after {
			bottom: -1.5rem;
			opacity: 1;
		}
		&[aria-current=page]::after {
			transition: 0s all;
		}
		&:focus-visible {
			color: #3b82f6;
		}
	}
</style>