<script lang="ts">
	interface Props {
		onAddClick: () => void;
	}
	let { onAddClick }: Props = $props();
</script>

<style>
	.field {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		min-height: 0;
		min-width: 0;
		container-type: size;
		border: 0.2cqw dashed rgba(255, 255, 255, 0.5);
		border-radius: 1vw;
		background-color: rgba(255, 255, 255, 0.2);
		transition: all 0.5s ease;
		cursor: pointer;
	}

	.field:hover {
		border-color: rgba(255, 255, 255, 1);
		color: rgba(255, 255, 255, 1);
		background-color: rgba(255, 255, 255, 0.4);
		backdrop-filter: blur(5px);
	}

	.plus {
		font-size: 30cqw;
		font-weight: bold;
		color: rgba(255, 255, 255, 0.5);
	}
</style>

<div class="field" onclick={(e) => {e.stopPropagation(); onAddClick();}} onkeydown={(e) => e.stopPropagation()} role="button" tabindex="0">
	<div class="plus">+</div>
</div>
