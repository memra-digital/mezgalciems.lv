<script lang="typescript">
	import Router from 'svelte-spa-router';

	import Home from './routes/Home.svelte';
	import Map from './routes/Map.svelte';
	import Information from './routes/Information.svelte';
	import History from './routes/History.svelte';
	import PrivacyPolicy from './routes/PrivacyPolicy.svelte';
	import Error404 from './routes/Error404.svelte';

	import Login from './routes/admin/Login.svelte';
	import AdminHome from './routes/admin/AdminHome.svelte';
	import AdminArticles from './routes/admin/AdminArticles.svelte';
	import AdminInformation from './routes/admin/AdminInformation.svelte';
	import AdminHistory from './routes/admin/AdminHistory.svelte';
	import AdminStatistics from './routes/admin/AdminStatistics.svelte';

	const routes = {
		'/': Home,
		'/ka-noklut': Map,
		'/norises-draudze': Information,
		'/vesture': History,
		'/privatuma-politika': PrivacyPolicy,

		'/admin/': Login,
		'/admin/ienakt': Login,
		'/admin/sakums': AdminHome,
		'/admin/statistika': AdminStatistics,
		'/admin/jaunumi': AdminArticles,
		'/admin/norises-draudze': AdminInformation,
		'/admin/vesture': AdminHistory,
		
		'*': Error404
	}
</script>

<div>
	<Router {routes}/>
</div>

<style global lang="scss">
	@import './global.scss';
</style>