<script lang="typescript">
    import { tweened } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';

	const popupAnimation = tweened(-6, {
		duration: 600,
		easing: quartInOut
	});

    /* if (localStorage.getItem(`cookiesAllowed`) === undefined || localStorage.getItem(`cookiesAllowed`) === null) {
        popupAnimation.set(0);
    } */

    // The choices
    const agree = () => {
        popupAnimation.set(-6);
        localStorage.setItem(`cookiesAllowed`, `true`);
        localStorage.setItem(`statisticsUserToken`, Math.random().toString(16).substr(2, 64));
    }
    const disagree = () => {
        popupAnimation.set(-6);
        localStorage.setItem(`cookiesAllowed`, `false`);
        localStorage.setItem(`statisticsUserToken`, ``);
    }
</script>

<div 
    class="container"
    style="bottom: {$popupAnimation}rem;
            display: {$popupAnimation === -6 ? `none` : `block`}">
    
    <div class="popup"> 
        <p>
            Izmantojot šo mājaslapu, Jūs piekrītat izmantot sīkdatnes.
            <a href="/#/privatuma-politika">Uzzināt vairāk...</a>
        </p>
        <button on:click={() => agree()}>Piekrītu</button>
        <button on:click={() => disagree()}>Nepiekrītu</button>
    </div>
</div>

<style>
    .container {
        position: fixed;
        left: 0;

        display: block;
        width: 100vw;
        height: 5rem;
        
        text-align: center;

        z-index: 10;
    }
    .popup {
        display: inline-block;

        box-shadow: 0px 0px 23px -3px rgba(66, 68, 74, 0.4);

        background: #ffffff;
        color: #000000;
       
        border-radius: 3rem;

        text-align: center;

        margin-bottom: 1rem;
    }

    p {
        display: inline-block;

        margin-left: 1rem;
    }
    button {
        display: inline-block;

        margin: .5rem;
    }

    @media only screen and (max-width: 875px) {
        .container {
            display: block;
            width: 100vw;
            height: 6rem;
        }
    }
    @media print {
        * {
            display: none;
        }
    }
</style>