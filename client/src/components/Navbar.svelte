<script lang="typescript">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { apiUrl } from '../globals';
	import { request } from 'graphql-request';

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
			navbarElement.style.borderTopLeftRadius = `1rem`;
			navbarElement.style.borderTopRightRadius = `1rem`;
		}
	}

	onMount(() => {
		currentPage = window.location.href.split(`/`).pop();

		// Send statistical data
		/* request(apiUrl, `
			mutation registerPageView {
				registerPageView(page: "${currentPage}", user: "${localStorage.getItem(`statisticsUserToken`)}")
			}
		`); */
	});
	
	const sidebarAnimationProgress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});
</script>

<svelte:window on:scroll={(e) => updateStickiness()} bind:scrollY={y}/>

<!-- {#if localStorage.getItem(`adminLoginToken`) !== null}
	<div
		class="admin-link"
		on:click={() => window.location.href = `#/admin/sakums`}>
		
		<div
			class="admin-link-label">
		
			<p>Iet uz Admin lapu <i class="bi bi-arrow-right"></i></p>
		</div>
		<div
			class="admin-link-icon">

			<i class="bi bi-person-circle"></i>
		</div>
	</div>
{/if} -->

<header>
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
			background-size: contain;`}/>
</header>

<div bind:this={wrapperElement} class="nav-wrapper">
	<nav bind:this={navbarElement}>
		<div class="desktop">
			{#each links as link}
				<a aria-current={currentPage === link.link ? `page` : undefined} href="/{link.link}" >{link.name}</a>
			{/each}
		</div>
		<div class="mobile">
			<button on:click={() => sidebarAnimationProgress.set(1)}>
				<i class="bi bi-list"></i>
			</button>

			<img src="/files/title.png" alt="Mežgalciema baptistu draudze" />
		</div>
	</nav>
</div>

<div 
	class="sidebar-nav-bg mobile"
	on:click={() => sidebarAnimationProgress.set(0)}
	style="opacity: {$sidebarAnimationProgress / 2};
			display: {($sidebarAnimationProgress === 0) ? `none` : `block`}">
</div>
<div 
	class="sidebar-nav mobile"
	style="left: {($sidebarAnimationProgress * 80) - 80}%;">

	<button on:click={() => sidebarAnimationProgress.set(0)}>
		<i class="bi bi-x"></i>
	</button>

	{#each links as link}
		<a
			aria-current="{currentPage === link.link ? `page` : undefined}" href="#/{link.link}" >{link.name}</a> <br />
	{/each}
</div>

<style lang="scss">
	@import '../theme.scss';

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

	// Navbar
	.nav-wrapper {
		top: 0; 

		display: flex;

		justify-content: center;
		align-items: center;

		min-height: 5rem;
	}
	nav {
		position: relative;
		top: -1.75rem;

		display: inline-block;

		border-radius: 1rem;   

		margin-bottom: 2rem;

		padding: 1rem;

		text-align: center;

		box-shadow: 0px 0px 23px -3px $shadow-color;

		background: $background-color;

		transition: .5s background, color, box-shadow;

		overflow: hidden;

		z-index: 2;

		a {
			text-decoration: none;

			margin-left: 1rem;
			margin-right: 1rem;

			font-family: $title-font;
			font-size: 1.2rem;

			color: $paragraph-color;

			position: relative;

			background: none;

			transition: .2s all;

			&::after {
				background: $theme-gradient;

				position: absolute;
				bottom: -2rem;
				left: 0;

				width: 100%;
				height: 1rem;

				border-radius: 1rem;

				opacity: 0;

				transition: .2s all;

				content: "";
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
				color: $theme-color;
			}
		}
	}

	// Admin link shown when logged in
	.admin-link {
		position: absolute;
		top: 1rem;
		right: 1rem;

		display: inline-block;
		height: 3rem;

		border-radius: 1.5rem;

		box-shadow: 0px 0px 10px -3px $shadow-color;

		background: #e2e2e2;
		color: #000000;

		z-index: 1;

		cursor: pointer;

		.admin-link-icon {
			display: inline-block;
			width: 3rem;
			height: 3rem;

			background: #ffffff;

			margin-left: -5px;

			padding: .25rem;

			font-size: 2.5rem;
			line-height: 2.5rem;

			vertical-align: top;

			border-radius: 1.5rem;
		}
		.admin-link-label {
			display: inline-block;
			height: 3rem;
			width: 0;
			
			padding: 0.8rem;
			padding-left: 0;
			padding-right: 0;

			border-top-left-radius: 1.5rem;
			border-bottom-left-radius: 1.5rem;

			overflow: hidden;

			transition: .2s all;
		}
		&:hover .admin-link-label {
			width: auto;

			padding: 0.8rem;
		}
	}

	.mobile {
		display: block;
		width: 100vw;
		height: 5rem;

		img {
			margin-right: 1.5rem;

			max-width: 50%;
			max-height: 5rem;

			float: right;
		}
		button {
			border: 0;

			background: none;
			color: #000000;

			width: 3rem;
			height: 3rem;

			margin: 1rem;

			padding: 0;

			float: left;

			cursor: pointer;
		}
		button i {
			font-size: 3rem;
			line-height: 3rem;
		}
	}
	
	.sidebar-nav-bg {
		position: fixed;
		top: 0; 
		left: 0;

		display: block;
		width: 100%;
		height: 100%;

		background: #000000;

		z-index: 7;
	}
	.sidebar-nav {
		position: fixed;
		top: 0; 
		left: -100px;

		display: block;
		width: 80%;
		height: 100%;

		background: #ffffff;

		padding: 1rem;

		z-index: 8;
		
		button {
			width: calc(100% - 1rem);

			background: none;
			color: #000000;

			padding: 0;

			border: 0;

			text-align: center;

			cursor: pointer;
			
			i {
				font-size: 3rem;
				line-height: 3rem;
			}
		}
		a {
			font-family: 'Overpass', sans-serif;
			font-size: 1.5rem;

			color: #000000;

			background: none;

			transition: .2s all;

			&:hover,
			&:focus {
				color: $theme-color;
			}
		}
	}

	@media only screen and (max-width: 875px) {
		.nav-wrapper {
			min-height: 10rem;
		}
		nav {
			padding-left: 0;
			padding-right: 0;
		}
		.header-banner {
			background-position-x: 0;
			background-size: cover;

			// Hide the title image in the banner on mobile
			&:nth-child(4) {
				display: none;
			}
		}
	}
	@media print {
		header,
		.nav-wrapper,
		.admin-link {
			display: none;
		}
	}
</style>