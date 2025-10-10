<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		children?: Snippet;
	}
	let { children }: Props = $props();
</script>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		border: 0.1vw solid #444;
		border-radius: 0.5vw;
		overflow: hidden;
	}

	.menu :global(> :not(:last-child)::after) {
		content: '';
		display: block;
		height: 0.1vw;
		background-color: #444;
	}
</style>

<div class="menu">
	{@render children()}
</div>
