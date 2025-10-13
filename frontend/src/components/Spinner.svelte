<script lang="ts">
	interface Props {
		show?: boolean;
		size?: string;
		color?: string;
	}
	let { show = true, size = '3vw', color = '#fff' }: Props = $props();
	let thickness: string = $derived(`calc(${size} * 0.2)`);
</script>

<style>
	.spinner {
		padding: 10px;
		margin: 0 auto;
		border-radius: 50%;
		background:
			radial-gradient(farthest-side, var(--spinner-color) 94%, transparent) top/var(--spinner-thickness) var(--spinner-thickness) no-repeat,
			conic-gradient(transparent 30%, var(--spinner-color));
		mask: radial-gradient(farthest-side, transparent calc(100% - var(--spinner-thickness)), var(--spinner-color) 0);
		-webkit-mask: radial-gradient(farthest-side, transparent calc(100% - var(--spinner-thickness)), var(--spinner-color) 0);
		animation: spinner 1s infinite linear;
	}

	@keyframes spinner {
		100% {
			transform: rotate(1turn);
		}
	}
</style>

{#if show}
	<div class="spinner" style:width={size} style:min-width={size} style:height={size} style:min-height={size} style:--spinner-color={color} style:--spinner-thickness={thickness}></div>
{/if}
