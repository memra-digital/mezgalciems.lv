<script lang="typescript">
    import Navbar from '../../components/Navbar.svelte';
	import Footer from '../../components/Footer.svelte';
    import CookieNotice from '../../components/CookieNotice.svelte';
</script>

<svelte:head>
    <title>Privātuma politika | Mežgalciema baptistu draudze</title>
</svelte:head>

<CookieNotice />
<Navbar />

<main>
    <h1>Privātuma politika</h1>
    <h3>Jūsu dati</h3>
    <p>Mēs no Jūsu informācijas saglabājam tikai laikus, kad Jūs apmeklējāt šo saiti. Nevienai trešajai partijai šie dati rokās nenonāk.</p>

    <h3>Sīkdatnes</h3>
    <p>Sīkdatnes ir neliels daudzums datu, ko mājaslapa var saglabāt, piemēram, iestatījumi kaut kādā mājaslapā vai tamlīdzīgi.</p>
    <p>Mēs sīkdatnes izmantojam pārsvarā statistiskiem nolūkiem, bet arī dažām funkcionālām daļām.</p>
    <p>Ieejot šajā mājaslapā, Jums parādās izvēlne lapas apakšā - vai Jūs vēlaties piekrist vai nepiekrist sīkdatnēm. Ja Jūs nepiekrītat,
        tad tiks saglabāta tikai viena sīkdatne, lai Jums šo izvēlni vairs nerādītu, un mēs nekādas citas sīkdatnes nesaglabāsim.</p>

    <h3>Statistika</h3>
    <p>Vienīgie statistiskie dati, kas tiek ievākti, ir laiki, kad Jūs apmeklējāt šo saiti, kā arī, ja Jūs atļaujat sīkdatnes, tad mēs saglabājam
        īpašu ID. Katram apmeklētājam šis ID ir atšķirīgs, un to mēs izmantojam, lai atšķirtu apmeklētājus.</p>
    <p>Visi statistikas dati bez izņēmuma tiek neatgriezeniski dzēsti 7 dienas pēc to ievākšanas.</p>
</main>

<Footer />