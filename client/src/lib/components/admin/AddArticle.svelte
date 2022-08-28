<script lang="typescript">
    import Loading from '$lib/components/Loading.svelte';

	import { apiUrl } from '$lib/globals';
	import { request, gql } from 'graphql-request';

    let titleInput: string = ``;
    let contentInput: string = ``;
    let imageAltInput: string = ``;

	let error: string = ``;
	let errorInTitle: boolean = false;
	let errorInContent: boolean = false;
	let errorInImage: boolean = false;
	let errorInImageAlt: boolean = false;

    let loading: boolean = false;

	let isImageSet: boolean = false;
	let fileUploadElement: HTMLInputElement;
	let uploadedImage: string = ``;

    const publish = () => {
		if (!checkTitle() || !checkContent() || !checkImage() || !checkImageAlt()) {
			return;
		}
		
        loading = true;

        const query = gql`
			mutation addArticle {
				addArticle(title: "${titleInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", content: "${contentInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", image: "${uploadedImage}", imageAlt: "${imageAltInput.replaceAll(`\n`, `\\n`).replaceAll(`"`, `\\"`)}", token: "${localStorage.getItem(`adminLoginToken`)}") {
                    error
                }
			}
		`;
		request(apiUrl, query).then((data: any) => {
            loading = false;
            
            if (data.addArticle.error !== ``) {
				
            } else {
				window.location.reload();
            }
		});
    }

	const showImgPreview = () => {
		if (fileUploadElement.files !== null) {
			const fileReader: FileReader = new FileReader();
			fileReader.readAsDataURL(fileUploadElement.files[0]);

			fileReader.onload = (event: any) => {
				uploadedImage = event.target.result;
			};

			isImageSet = true;
		}
	}

	const checkTitle = () => {
		if (titleInput === ``) {
			error = `Virsraksts nevar būt tukšs!`;
			errorInTitle = true;
			return false;
		}

		errorInTitle = false;
		return true;
	}
	const checkContent = () => {
		if (contentInput === ``) {
			error = `Saturs nevar būt tukšs!`;
			errorInContent = true;
			return false;
		}

		errorInContent = false;
		return true;
	}
	const checkImage = () => {
		if (!isImageSet) {
			error = `Rakstam ir nepieciešams attēls!`;
			errorInImage = true;
			return false;
		}

		errorInImage = false;
		return true;
	}
	const checkImageAlt = () => {
		if (imageAltInput === ``) {
			error = `Attēla apraksts nevar būt tukšs!`;
			errorInImageAlt = true;
			return false;
		}

		errorInImageAlt = false;
		return true;
	}
</script>

<p class="error-text">{error}</p>
<section>
    {#if loading}
        <Loading />
    {:else}
		<div class="img-info">
			<div
				class="img"
				class:img-shadow={isImageSet}
				class:wrong={errorInImage}>

				{#if isImageSet}
					<img 
						src={uploadedImage}
						alt="Augšupielādēts attēls" />
				{/if}
				<button
					on:click={() => fileUploadElement.click()}>Izvēlēties attēlu</button>
			</div>

			<textarea
				type="text"
				placeholder="Attēla apraksts"
				class="alt-input"
				class:wrong={errorInImageAlt}
				bind:value={imageAltInput} />
		</div>
		
		<div class="content">
			<textarea
				class="title-input"
				class:wrong={errorInTitle}
				bind:value={titleInput}
				placeholder="Virsraksts" />

			<textarea
				class="content-input"
				class:wrong={errorInContent}
				bind:value={contentInput}
				placeholder="Saturs" />

			<button on:click={() => publish()}>Publicēt</button>
		</div>
    {/if}

	<input 
		type="file" 
		bind:this={fileUploadElement}
		on:change={() => showImgPreview()}
		accept=".png,.jpg,.jpeg"
		style="display: none;" />
</section>

<style>
	section {
        display: flex;
        margin-top: 1rem;
        margin-bottom: 3rem;
    }

	.error-text {
		display: block;
		min-height: 1.125rem;

		color: #f85e5e;

		font-size: 1rem;
		line-height: 1.125rem;
		font-weight: bold;
	}

	.img-info {
		width: 100%;
		min-height: 100%;
	}
    .img {
        width: 100%;
        max-height: 100%;
		min-height: 5rem;

		background: #eaeaea;

        border-radius: 1rem;

		position: relative;
    }
	.img img {
		width: 100%;
		max-height: 100%;

		object-fit: cover;

		border-radius: 1rem;
	}
	.img button {
		position: absolute;
		left: 12.5%;
		bottom: .5rem;

		display: block;
		width: 75%;
		height: auto;
	}
	.shadow {
		box-shadow: 0px 0px 23px -3px rgba(66, 68, 74, 0.4);
	}

	.content {
        padding-left: 1rem;
		
        width: 100%;

		word-wrap: break-word;
    }

	textarea {
		display: block;
		width: 100%;

		background: #eaeaea;
		color: #000000;

		border: 0;

		border-radius: .5rem;

		resize: vertical;
	}
    .title-input {
		height: 2rem;

		font-size: 1.5rem;
		font-family: 'Overpass', sans-serif;

		border-radius: .5rem;

		margin-bottom: 1rem;

		resize: vertical;
	}
	.content-input {
		height: 6rem;

		font-size: 1rem;
	}
	.alt-input {
		height: 2.5rem;

		font-size: 1rem;

		margin-top: 1rem;

		padding: .5rem;
	}

	.img,
	textarea {
		border: 0 solid #f85e5e;

		transition: .2s all;
	}
	.wrong {
		border-width: 4px;
	}

	@media only screen and (max-width: 875px) {
		.img {
			max-height: 50vw;
		}
	}
</style>