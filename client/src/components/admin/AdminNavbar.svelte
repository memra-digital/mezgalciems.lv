<script lang="typescript">
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
			link: `/#/admin/sakums`,
			icon: `house`
		},
		{
			name: `Statistika`,
			link: `/#/admin/statistika`,
			icon: `bar-chart-line`
		},
		{
			name: `Jaunumi`,
			link: `/#/admin/jaunumi`,
			icon: `newspaper`
		},
		{
			name: `Norises draudzē`,
			link: `/#/admin/norises-draudze`,
			icon: `calendar`
		},
		{
			name: `Vēsture`,
			link: `/#/admin/vesture`,
			icon: `clock-history`
		},
		/* {
			name: `Konti`,
			link: `/#/admin/konti`,
			icon: `person`
		}, */
	];

	// If the client has not been logged in, redirect to login page
	const username: string | null = localStorage.getItem(`adminLoginUsername`);
	if (localStorage.getItem(`adminLoginToken`) === null || username === null) {
		window.location.hash = `/admin/ienakt`;
	}

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
</script>

<!-- <svelte:body on:click={(e) => bodyClick(e)}></svelte:body> -->

<nav>
	<div class="desktop">
		<img
			src="/files/title.png"
			alt="Mežgalciema baptistu draudze"
			on:click={() => window.location.href = `/`}
			style={localStorage.getItem(`theme`) === `dark` ? `filter: invert();` : ``} />

		<div class="links">
			{#each links as link}
				<a
					class:active={window.location.hash === link.link.slice(1)}
					href={link.link}>
					
					{link.name}
				</a>
			{/each}

			<a
				on:click={() => localStorage.removeItem(`adminLoginToken`)}
				href="/#/admin/ienakt">
				
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
						href="/#/admin/iestatijumi">

						<i class="bi bi-gear"></i>
						Iestatījumi
					</a>
					<br />
					<a
						href="/#/admin/mainit-paroli">

						<i class="bi bi-arrow-repeat"></i>
						Mainīt paroli
					</a>
					<br />
					<a
						on:click={() => localStorage.removeItem(`adminLoginToken`)}
						href="/#/admin/ienakt">

						<i class="bi bi-box-arrow-right"></i>
						Iziet
					</a>
				</div>
			</div> -->
		</div>
	</div>
	<div class="mobile">
		<button on:click={() => sidebarAnimationProgress.set(1)}>
			<i class="bi bi-list"></i>
		</button>

		<img
			src="/files/title.png"
			alt="Mežgalciema baptistu draudze"
			on:click={() => window.location.href = `/`} />
	</div>
</nav>

<div 
	class="sidebar-nav-bg"
	on:click={() => sidebarAnimationProgress.set(0)}
	style={`opacity: ${$sidebarAnimationProgress / 2};
			display: ${($sidebarAnimationProgress === 0) ? `none` : `block`}`}>
</div>
<div 
	class="sidebar-nav"
	style={`left: ${($sidebarAnimationProgress * 80) - 80}%;
			box-shadow: 0px 0px 23px -3px rgba(66, 68, 74, ${$sidebarAnimationProgress / 2});`}>

	<button on:click={() => sidebarAnimationProgress.set(0)}>
		<i class="bi bi-x"></i>
	</button>

	{#each links as link}
		<a href={link.link}>
			<i class="bi bi-{link.icon}"></i>
			{link.name}
		</a>
		<br />
	{/each}
	
	<a
		on:click={() => localStorage.removeItem(`adminLoginToken`)}
		href="/#/admin/ienakt">

		<i class="bi bi-box-arrow-right"></i>
		Iziet
	</a>
</div>

<style lang="scss">
	@import '../../theme.scss';

	nav {
		display: block;
		width: 80%;
		height: 5rem;

		margin: auto;

		border-bottom: 2px solid $background-accent;

		transition: .5 border;
	}
	
	img {
		float: left;

		max-width: 10rem;

		margin-top: .25rem;

		cursor: pointer;
	}

	.links {
		float: right;

		margin-top: 1.75rem;

		.account-popup a {
			color: $paragraph-color;
		}
		.account-popup a:hover {
			background: none;
		}
		a {
			color: #808080;

			font-weight: bold;

			margin: .5rem;
			margin-bottom: 0;

			vertical-align: middle;

			transition: .2s all;
		}
		a:hover,
		a.active,
		button:hover,
		button.active {
			color: $theme-color;
		}
		a.active {
			background-size: 100% 2px;
		}
	}

	.account {
		position: relative;
		
		display: inline-block;

		vertical-align: middle;

		button {
			height: 1.5rem;
			
			background: none;
			color: #808080;

			padding: 0;

			margin: 0;

			font-size: 1.5rem;

			transition: .2s all;
		}
		.account-popup {
			position: absolute;
			top: 3rem;
			left: -5.25rem;

			display: none;
			width: 12rem;
			height: 8.5rem;

			background: $background-color;
			color: $paragraph-color;

			opacity: 0;
			
			transform: translateY(-20px);

			padding: .5rem;

			border-radius: 1rem;

			box-shadow: 0px 0px 23px -3px $shadow-color;

			transition-duration: .2s;
			transition-property: opacity, transform;

			&::before {
				content: "";

				position: absolute;
				top: -1rem;
				left: 5rem;

				display: block;
				width: 2rem;
				height: 1rem;

				transform: translateY(20px);

				background: $background-color;

				clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
				
				transition: .2s transform;
			}
		}
		.account-popup-open {
			display: block;

			opacity: 1;

			transform: none;

			&::before {
				transform: none;
			}
		}
		b {
			display: block;
			width: 100%;

			text-align: center;
		}
	}
	.separator {
		display: block;
		width: 90%;
		height: 3px;

		border-radius: 1.5px;

		margin-left: 5%;
		margin-right: 5%;
		margin-top: .5rem;
		margin-bottom: .5rem;

		background: $theme-gradient;
	}

	.mobile {
		img {
			margin-right: 1.5rem;
			
			max-height: 5rem;

			float: right;
		}
		button {
			border: 0;

			background: none;
			color: $paragraph-color;

			width: 3rem;
			height: 3rem;

			margin: 1rem;

			padding: 0;

			float: left;

			cursor: pointer;

			i {
				font-size: 3rem;
				line-height: 3rem;
			}
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

		z-index: 5;
	}
	.sidebar-nav {
		position: fixed;
		top: 0; 
		left: -100px;

		display: block;
		width: 80%;
		height: 100%;

		background: $background-color;

		font-weight: normal;

		padding: 1rem;

		z-index: 6;
	
		button {
			width: calc(100% - 1rem);

			background: none;
			color: $paragraph-color;

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
			font-size: 1.2rem;

			color: $paragraph-color;
		}
	}
</style>