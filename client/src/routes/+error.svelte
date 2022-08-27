<script lang="typescript">
    import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
    import CookieNotice from '../components/CookieNotice.svelte';

    let emojiList: string[] = [
            `emoji-dizzy`,
            `emoji-expressionless`,
            `emoji-frown`,
            `emoji-neutral`
        ],
        randomEmojiIndex: number = Math.floor(Math.random() * emojiList.length),
        randomEmoji: string = emojiList[randomEmojiIndex];
</script>

<svelte:head>
    <title>Šī lapa neeksistē! | Mežgalciema baptistu draudze</title>
</svelte:head>

<CookieNotice />
<div>
    <Navbar />

    <main>
        <i class="bi bi-{randomEmoji}"></i>
        <h1>Šī lapa neeksistē!</h1>
        <button on:click={() => location.pathname = ``}>Atpakaļ uz sākumlapu...</button>
    </main>

    <Footer />
</div>

<style lang="scss">
    @import '../theme.scss';
    
    main {
        text-align: center;

        padding-bottom: 3rem;
    }

    i {
        font-size: 5rem;
    }
</style>