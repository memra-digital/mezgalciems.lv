<script lang="typescript">
    import AdminNavbar from '../../components/admin/AdminNavbar.svelte';
	import AdminFooter from '../../components/admin/AdminFooter.svelte';
	import Loading from '../../components/Loading.svelte';
	import Dropdown from '../../components/Dropdown.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '../../globals';
	import { request, gql } from 'graphql-request';

    let loadingFetch: boolean = true;
    let loadingSave: boolean = false;
    
    let editorOpen: boolean = false;

    let historyArticles: Array<any> = [];

    let currentHistoryArticleTitle: string = ``;
    let currentHistoryArticleContent: string = ``;
	let currentHistoryArticleId: number = -1;
	let currentHistoryArticlePublished: boolean = true;
	let currentHistoryArticleCategory: number = 0;
	let currentHistoryArticleFont: number = 0;
	let currentHistoryArticleVideoLink: string = ``;

	let deleteConfirmationOpen: boolean = false;
	let videoSelectorOpen: boolean = false;

	let error: string = ``;
	let errorInTitle: boolean = false;
	let errorInContent: boolean = false;
	let errorInVideoLink: boolean = false;

	const categories: string[] = [
		`church`,
		`baptist`
	];
	const fonts: string[] = [
		`serif`,
		`sans`
	];
    
    onMount(async () => {
        loadHistoryArticles();
    });

    const loadHistoryArticles = () => {
        loadingFetch = true;
        editorOpen = false;
        
        const query = gql`
            {
				historyArticles {
					articles {
						id
						title
						preview
					}
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			loadingFetch = false;

            historyArticles = data.historyArticles.articles;
		});
    }
    const loadHistoryArticle = (id: number) => {
        loadingFetch = true;
        editorOpen = true;

        const query = gql`
			{
				historyArticle(id: ${id.toString()}) {
					title
					content
					type
					font
					videoLink
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			loadingFetch = false;

			currentHistoryArticleTitle = data.historyArticle.title;
			currentHistoryArticleContent = data.historyArticle.content;
			currentHistoryArticleId = id;
			currentHistoryArticlePublished = true;
			currentHistoryArticleCategory = categories.indexOf(data.historyArticle.type);
			currentHistoryArticleFont = fonts.indexOf(data.historyArticle.font);
			currentHistoryArticleVideoLink = `https://youtu.be/${data.historyArticle.videoLink}`;

			error = ``;
			errorInTitle = false;
			errorInContent = false;
		});
    }
	const newHistoryArticle = () => {
        editorOpen = true;

		currentHistoryArticleTitle = ``;
		currentHistoryArticleContent = ``;
		currentHistoryArticleId = -1;
		currentHistoryArticlePublished = false;
		currentHistoryArticleCategory = 0;
		currentHistoryArticleFont = 0;
		currentHistoryArticleVideoLink = ``;

		error = ``;
		errorInTitle = false;
		errorInContent = false;
	}
	const saveHistoryArticle = () => {
		if (!checkTitle() || !checkContent() || !checkVideoLink()) {
			return;
		}

		loadingSave = true;
		console.log(currentHistoryArticlePublished);

		if (currentHistoryArticlePublished) {
			const query = gql`
				mutation modifyHistoryArticle {
					modifyHistoryArticle(id: ${currentHistoryArticleId}, title: "${currentHistoryArticleTitle.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", type: "${categories[currentHistoryArticleCategory]}", font: "${fonts[currentHistoryArticleFont]}", content: "${currentHistoryArticleContent.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", videoLink: "${extractYTIDFromURL(currentHistoryArticleVideoLink)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
						id
					}
				}
			`;
			request(apiUrl, query).then((data: any) => {
				loadingSave = false;
			});
		} else {
			const query = gql`
				mutation addHistoryArticle {
					addHistoryArticle(title: "${currentHistoryArticleTitle.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${currentHistoryArticleContent.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", type: "${categories[currentHistoryArticleCategory]}", font: "${fonts[currentHistoryArticleFont]}", videoLink: "${extractYTIDFromURL(currentHistoryArticleVideoLink)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
						id
					}
				}
			`;
			request(apiUrl, query).then((data: any) => {
				loadingSave = false;

				currentHistoryArticleId = data.addHistoryArticle.id;
				currentHistoryArticlePublished = true;
			});
		}
	}
	const deleteHistoryArticle = () => {
		if (currentHistoryArticlePublished) {
			loadingFetch = true;

			const query = gql`
				mutation removeHistoryArticle {
					removeHistoryArticle(id: ${currentHistoryArticleId}, token: "${localStorage.getItem(`adminLoginToken`)}") {
						id
					}
				}
			`;
			request(apiUrl, query).then((data: any) => {
				loadingFetch = false;
			});
		}

		deleteConfirmationOpen = false;

		loadHistoryArticles();
	}

	const checkTitle = () => {
		if (currentHistoryArticleTitle === ``) {
			error = `Virsraksts nevar būt tukšs!`;
			errorInTitle = true;
			return false;
		}

		errorInTitle = false;
		return true;
	}
	const checkContent = () => {
		if (currentHistoryArticleContent === ``) {
			error = `Saturs nevar būt tukšs!`;
			errorInContent = true;
			return false;
		}

		errorInContent = false;
		return true;
	}
	const checkVideoLink = () => {
		if (/((https?:\/\/)?((.*).)?(youtube.com)\/(watch\?v=.*))/gi.test(currentHistoryArticleVideoLink) ||
			/((https?:\/\/)?((.*).)?(youtu.be)\/(.*))/gi.test(currentHistoryArticleVideoLink) ||
			currentHistoryArticleVideoLink === ``) {
			
			errorInVideoLink = false;
			return true;
		}

		error = `Nederīga video saite!`;
		errorInVideoLink = true;
		return false;
	}

	const extractYTIDFromURL = (input: string) => {
		if (/((https?:\/\/)?((.*).)?(youtube.com)\/(watch\?v=.*))/gi.test(input)) {
			return input.split(`v=`).pop()?.split(`&`).shift();			
		} else if (/((https?:\/\/)?((.*).)?(youtu.be)\/(.*))/gi.test(input)) {
			return input.split(`/`).pop();
		} else {
			return ``;
		}
	}
</script>

<svelte:head>
	<title>Vēsture | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<AdminNavbar />
<main>
    <h1>Draudzes vēsture</h1>
    {#if loadingFetch}
        <Loading />
    {:else if editorOpen}
		{#if deleteConfirmationOpen}
			<b>Vai Jūs tiešām vēlaties izdzēst rakstu "{currentHistoryArticleTitle}"?</b> <br />
			<button class="dangerous" on:click={() => deleteHistoryArticle()}><i class="bi-check2"></i></button>
			<button on:click={() => deleteConfirmationOpen = false}><i class="bi-x"></i></button>
		{:else if videoSelectorOpen}
			<button on:click={() => videoSelectorOpen = false}>
				<i class="bi bi-arrow-left"></i>
			</button>

			<p class="error-text">{error}</p>

			<p>Saite uz YouTube video:</p>
			<input
				class:wrong={errorInVideoLink}
				on:blur={() => { error = ``; checkVideoLink(); }}
				bind:value={currentHistoryArticleVideoLink} />

			{#if currentHistoryArticleVideoLink && checkVideoLink()}
				<iframe
					class="video"
					width="560"
					height="315"
					src="https://www.youtube.com/embed/{extractYTIDFromURL(currentHistoryArticleVideoLink)}"
					title="YouTube video atskaņotājs"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen>
				</iframe>
			{/if}
		{:else}
			<button on:click={() => loadHistoryArticles()}>
				<i class="bi bi-arrow-left"></i>
			</button>
			<button on:click={() => saveHistoryArticle()}>
				Saglabāt
			</button>
			<button on:click={() => videoSelectorOpen = true}>
				Izvēlēties video
			</button>
			<button class="dangerous" on:click={() => deleteConfirmationOpen = true}>
				Dzēst
			</button>

			<p class="error-text">{error}</p>

			<textarea
				class="titleInput"
				class:wrong={errorInTitle}
				placeholder="Virsraksts"
				bind:value={currentHistoryArticleTitle}
				style="font-family: '{currentHistoryArticleFont === 0 ? `Libre Baskerville` : `Overpass`}';" />

			<div class="dropdown-wrapper">
				<p>Kategorija:</p>
				<Dropdown
					options={[
						`Draudzes vēsture`,
						`Baptistu vēsture`
					]}
					bind:selected={currentHistoryArticleCategory} />
			</div>
			<div class="dropdown-wrapper">
				<p>Fonts:</p>
				<Dropdown
					options={[
						`Serif`,
						`Sans Serif`
					]}
					bind:selected={currentHistoryArticleFont} />
			</div>

			<textarea
				class="contentInput"
				class:wrong={errorInContent}
				placeholder="Saturs"
				bind:value={currentHistoryArticleContent}
				style="font-family: '{currentHistoryArticleFont === 0 ? `Libre Baskerville` : `Open Sans`}';" />

			<button on:click={() => saveHistoryArticle()}>
				Saglabāt
			</button>
			<button on:click={() => videoSelectorOpen = true}>
				Izvēlēties video
			</button>
			<button class="dangerous" on:click={() => deleteConfirmationOpen = true}>
				Dzēst
			</button>
		{/if}
    {:else}
		<button on:click={() => newHistoryArticle()}>
			Pievienot rakstu
		</button>

        {#each historyArticles as historyArticle}
            <button class="sidebar-option" on:click={() => loadHistoryArticle(historyArticle.id)}>
                <b>{historyArticle.title}</b>
                <p>{historyArticle.preview}...</p>
            </button>
        {/each}
    {/if}
</main>
<AdminFooter />

<style>
	@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap');
	
    h1 {
		margin-top: 1.5rem;
	}

	.error-text {
		display: block;
		min-height: 1.125rem;

		margin-bottom: .5rem;

		color: #f85e5e;

		font-size: 1rem;
		line-height: 1.125rem;
		font-weight: bold;
	}

    .sidebar-option {
        display: block;
		height: auto;

		text-align: left;

		padding: 0;

		border: 0;

		background: none;
		color: #000000;

		margin-bottom: 1.5rem;

		border-radius: 0;

		transition: .2s all;
	}
	.sidebar-option:hover {
		color: #585858;

		cursor: pointer;
	}
	.sidebar-option b {
		font-size: 1.2rem;
		font-family: 'Overpass', sans-serif;
	}
	.sidebar-option p {
		font-size: 1rem;
		line-height: 1.25rem;

		position: relative;
	}

	textarea,
	input {
		display: block;
		width: 100%;

		background: #eaeaea;
		color: #000000;

		border: 0;

		border-radius: .5rem;

		resize: vertical;
	}
    .titleInput {
		height: 3rem;

		font-size: 2rem;
		font-weight: 700;
		text-align: center;

		border-radius: .5rem;

		margin-bottom: 1rem;

		resize: vertical;
	}
	.contentInput {
		height: 50vh;

		font-size: 1rem;
	}

	input {
		width: auto;

		padding: .5rem;
	}
	.video {
		display: block;

		margin: auto;
		margin-top: 1rem;
		margin-bottom: 1rem;

		border-radius: 1rem;

		background: #000000;

		box-shadow: 0px 0px 23px -3px rgba(66, 68, 74, 0.4);
	}

	.dropdown-wrapper {
		display: inline-block;

		margin-bottom: 1rem;
		margin-left: .5rem;
	}

	textarea,
	input {
		border: 0 solid #f85e5e;

		transition: .2s all;
	}
	.wrong {
		border-width: 4px;
	}

	@media only screen and (max-width: 875px) {
		main {
			text-align: center;
		}
	}
</style>