<script lang="ts">
	import Icon from './Icon.svelte';
	interface Props {
		img?: string | undefined;
		alt?: string;
		bgColor?: string;
		borderColor?: string;
		onClick?: (event: MouseEvent) => void | undefined;
	}
	let { img, alt = '', bgColor = '#888', borderColor = '#333', onClick }: Props = $props();
</script>

<style>
	.widget-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5vw;
		height: 1.5vw;
		border: 0.2vw solid;
		border-radius: 0.25vw;
		cursor: pointer;
	}
</style>

<div class="widget-button" on:click={onClick} style:background-color={bgColor} style:border-color={borderColor}>
	{#if img}
		<Icon {img} {alt} />
	{/if}
</div>
