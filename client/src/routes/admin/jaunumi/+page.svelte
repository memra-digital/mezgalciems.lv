<script lang="ts">
	import AdminArticle from '$lib/components/AdminArticle.svelte';
	import Loading from '$lib/components/Loading.svelte';

	import { onMount } from 'svelte';
	import { apiUrl } from '$lib/globals';
	import { request, gql } from 'graphql-request';

	let isLoadingArticles: boolean = true,
		isLoadingNewArticle: boolean = false;

	let articles: Array<any> = [];

	let currentlyLoadedPages: number = 0;
	let totalPages: number = 1;

	let newArticleTitleValue: string = ``,
		newArticleContentValue: string = ``,
		newArticleAltValue: string = ``;

	let newArticleErrorMsg: string = ``,
		isNewArticleTitleInvalid: boolean = false,
		isNewArticleContentInvalid: boolean = false,
		isNewArticleImageInvalid: boolean = false,
		isNewArticleAltInvalid: boolean = false;

	let isImageSet: boolean = false,
		fileUploadElement: HTMLInputElement,
		uploadedImageData: string = ``;
	
	onMount(async () => {
		loadMoreArticles();
	});
	
	const loadMoreArticles = () => {
		isLoadingArticles = true;
		const query = gql`
			{
				articles(page: ${currentlyLoadedPages}) {
					totalPages
					articles {
						id
						title
						content
						image
						imageAlt
					}
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoadingArticles = false;

			totalPages = data.articles.totalPages;
			
			articles = [...articles, ...data.articles.articles];

			currentlyLoadedPages++;
		});
	}

	const publishNewArticle = () => {
		// Validate the fields
		isNewArticleTitleInvalid = newArticleTitleValue.trim() === ``;
		isNewArticleContentInvalid = newArticleContentValue.trim() === ``;
		isNewArticleAltInvalid = newArticleAltValue.trim() === ``;
		isNewArticleImageInvalid = !isImageSet;

		if (isNewArticleTitleInvalid || isNewArticleContentInvalid || isNewArticleImageInvalid || isNewArticleAltInvalid) {
			newArticleErrorMsg = `Visiem lauciņiem jābūt aizpildītiem!`;
			return;
		} else {
			newArticleErrorMsg = ``;
		}
		
		// Publish the article
		isLoadingNewArticle = true;

		const query = gql`
			mutation createArticle {
				createArticle(title: "${newArticleTitleValue.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${newArticleContentValue.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", image: "${uploadedImageData}", imageAlt: "${newArticleAltValue.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
					id
				}
			}
		`;
		request(apiUrl, query).then((data: any) => {
			isLoadingNewArticle = false;
			
			window.location.reload();
		}).catch((err: any) => {
			isLoadingNewArticle = false;

			console.error(err);
		});
	}
	const showNewArticleImgPreview = () => {
		if (fileUploadElement.files !== null) {
			const fileReader: FileReader = new FileReader();
			fileReader.readAsDataURL(fileUploadElement.files[0]);

			fileReader.onload = (event: any) => {
				uploadedImageData = event.target.result;
			};

			isImageSet = true;
		}
	}
</script>

<svelte:head>
	<title>Jaunumi | Admin | Mežgalciema baptistu draudze</title>
</svelte:head>

<h1 class="font-title text-3xl text-slate-900 mt-4 mb-2">Pievienot rakstu</h1>

{#if isLoadingNewArticle}
	<Loading />
{:else}
	<div class="grid grid-cols-1 gap-2 xs:grid-cols-2 xs:gap-4">
		<div>
			<div class="relative w-full rounded-3xl shadow-lg shadow-slate-800/20 bg-slate-800 overflow-hidden duration-200"
				class:border-red-500={isNewArticleImageInvalid}
				class:aspect-square={!isImageSet}
				style="border-width: {isNewArticleImageInvalid ? `2px` : `0`}; /* I'm using inline style here to make sure there's no weird CSS specificity stuff going on */">

				{#if isImageSet}
					<img class="w-full h-full"
						src={uploadedImageData}
						alt="Augšupielādētais attēls" />

					<button class="absolute top-4 right-4 block w-8 h-8 text-xl text-center bg-slate-800 text-white rounded-full z-10 shadow-sm shadow-slate-800/20 hover:shadow-md hover:shadow-slate-800/20 duration-200"
						on:click={() => isImageSet = false}>

						<i class="bi bi-x-lg"></i>
					</button>
				{:else}
					<button class="w-full h-full bg-none text-white text-center font-title text-2xl hover:opacity-75 duration-200"
						on:click={() => fileUploadElement.click()}>
						
						<i class="bi bi-image"></i>
						Izvēlēties attēlu
					</button>
				{/if}
			</div>

			<input class="block mt-2 py-1 px-2 w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
				class:border-red-500={isNewArticleAltInvalid} class:focus:border-red-500={isNewArticleAltInvalid}
				type="text"
				bind:value={newArticleAltValue} 
				placeholder="Attēla apraksts" />
		</div>
	
		<div>
			<input class="block pt-1 px-2 text-2xl font-title w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 transition duration-200"
				class:border-red-500={isNewArticleTitleInvalid} class:focus:border-red-500={isNewArticleTitleInvalid}
				type="text"
				bind:value={newArticleTitleValue}
				placeholder="Virsraksts" />

			<textarea class="block my-2 py-1 px-2 w-full rounded-lg bg-white border border-slate-300 focus:border-2 focus:border-blue-500 resize-y transition duration-200"
				class:border-red-500={isNewArticleContentInvalid} class:focus:border-red-500={isNewArticleContentInvalid}
				bind:value={newArticleContentValue}
				placeholder="Saturs" />

			<button class="block bg-gradient-to-tl from-blue-600 to-blue-300 text-white py-1 px-4 mb-2 rounded-full shadow-sm shadow-blue-200 hover:shadow-md hover:brightness-95 duration-200"
				on:click={() => publishNewArticle()}>
				
				<i class="bi bi-plus-lg"></i>
				Publicēt
			</button>

			<p class="font-bold text-red-500 duration-200" class:opacity-100={newArticleErrorMsg !== ``}>{newArticleErrorMsg}</p>
		</div>
	</div>
{/if}
<input
	class="hidden"
	type="file" 
	bind:this={fileUploadElement}
	on:change={() => showNewArticleImgPreview()}
	accept=".png,.jpg,.jpeg" />

<h1 class="font-title text-3xl text-slate-900 mt-4 mb-2">Jaunumi</h1>
{#each articles as article}
	<AdminArticle id={article.id} title={article.title} content={article.content} image={article.image} imageAlt={article.imageAlt} />
	<div class="mb-4 border-b-2 border-slate-300 xs:hidden"></div>
{/each}

{#if isLoadingArticles}
	<Loading />
{/if}

{#if currentlyLoadedPages < totalPages}
	<button class="block w-full xs:mt-[-1rem] font-title text-lg text-center text-slate-900 hover:text-blue-500 transition duration-200" on:click={() => loadMoreArticles()}>Ielādēt vairāk...</button>
{/if}