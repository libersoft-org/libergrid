<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		disabled?: boolean;
		onClick?: () => void;
		children?: Snippet;
	}
	let { disabled = false, onClick, children }: Props = $props();
</script>

<style>
	.button {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.5cqw;
		text-align: center;
		font-size: 1cqw;
		font-weight: bold;
		border: 1px solid #444;
		background-color: #222;
		color: #fff;
		border-radius: 0.5cqw;
		cursor: pointer;
	}

	.button:disabled {
		background-color: #888;
		color: #555;
		cursor: not-allowed;
	}
</style>

<div class="button" {disabled} onclick={onClick}>
	{@render children()}
</div>
