<script lang="typescript">
	import { year, version } from '../globals';
</script>

<footer>
	<p>&copy; Mežgalciema baptistu draudze, {year} • {version}<span class="no-print">&nbsp;• <a href="/privatuma-politika">Privātuma politika</a></span></p>

	<a class="social-link social-link-facebook" href="https://www.facebook.com/mezgalciems" target="_blank" rel="noreferer">
		<i class="bi bi-facebook"></i>
	</a>
	<a class="social-link social-link-youtube" href="https://www.youtube.com/channel/UC4qO8CQPqA_xrSe2ONdm-gg" target="_blank" rel="noreferer">
		<i class="bi bi-youtube"></i>
	</a>
	<a class="social-link social-link-spotify" href="https://open.spotify.com/show/2K9aHWInrMlwCqH25L4bRf?si=8400e25304ac469f" target="_blank" rel="noreferer">
		<i class="bi bi-spotify"></i>
	</a>
</footer>

<style lang="scss">
	footer {
		text-align: center;

		padding: 1rem;
		padding-bottom: 3rem;

		p {
			transition: .5s color;
		}
	}

	.social-link {
		background: none;

		display: inline-block;

		margin-top: .2rem;
		margin-left: .1rem;
		margin-right: .1rem;

		padding: 0;

		border: 0;

		font-size: 1.5rem;

		transition: .2s all;

		&:hover,
		&:focus {
			cursor: pointer;

			filter: brightness(0.75);
		}
	}

	.social-link-facebook {
		color: #527ff4;
	}
	.social-link-youtube {
		color: #fa5b5b;
	}
	.social-link-spotify {
		color: #0ee255;
	}
	.social-link-github {
		color: #474747;
	}

	@media print {
		.social-link,
		.no-print {
			display: none;
		}
	}
</style>
