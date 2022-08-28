<svg class="spinner" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
	<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
</svg>
<b class="text">Ielādējas...</b>

<style lang="scss">
	.spinner {
		display: inline-block;
		width: 2rem;
		height: 2rem;

		vertical-align: middle;

		animation: spin .5s infinite;

		@keyframes spin {
			from {
				transform:rotate(0deg);
			}
			to {
				transform:rotate(360deg);
			}
		}
	}
	.text {
		display: inline-block;

		vertical-align: middle;

		padding-left: .5rem;
	}
</style>
