<script lang="ts">
	import type { Snippet } from 'svelte';
	import Clickable from './Clickable.svelte';
	interface Props {
		text?: string;
		onClick?: () => void;
	}
	let { text = '', onClick }: Props = $props();
</script>

<style>
	.menu-item {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.5cqw;
		text-align: center;
		font-size: 0.75vw;
		font-weight: bold;
		background-color: #222;
		color: #fff;
		cursor: pointer;
	}

	.menu-item:hover {
		background-color: #333;
	}
</style>

<Clickable {onClick}>
	<div class="menu-item">{text}</div>
</Clickable>
