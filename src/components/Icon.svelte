<script lang="ts">
	import Clickable from './Clickable.svelte';
	interface Props {
		img?: string;
		alt?: string;
		size?: string;
		padding?: string;
		onClick?: (e: Event) => void;
		enabled?: boolean;
		testId?: string;
	}
	let { img, alt = '', size = '24px', padding = '10px', onClick, enabled = true, testId }: Props = $props();
</script>

<style>
	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon img {
		display: flex;
		user-select: none;
	}

	.icon img:not(.enabled) {
		cursor: default;
		opacity: 0.5;
	}
</style>

{#snippet icon()}
	<div class="icon" style:padding data-testid={testId}>
		<img class:enabled style:min-width={size} style:min-height={size} style:max-width={size} style:max-height={size} src={img} {alt} />
	</div>
{/snippet}
{#if img}
	{#if onClick && enabled}
		<Clickable {onClick}>
			{@render icon()}
		</Clickable>
	{:else}
		{@render icon()}
	{/if}
{/if}
