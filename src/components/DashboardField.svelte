<script lang="ts">
	interface Props {
		onClick: () => void;
	}
	let { onClick }: Props = $props();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		onClick();
	}

	function handleKeydown(e: KeyboardEvent) {
		e.stopPropagation();
	}
</script>

<style>
	.field {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		container-type: size;
		border: 0.2cqw dashed rgba(255, 255, 255, 0.5);
		border-radius: 1cqw;
		background-color: rgba(255, 255, 255, 0.2);
		transition: all 0.5s ease;
		overflow: hidden;
		cursor: pointer;
	}

	.field:hover {
		border-color: #fff;
		color: #fff;
		background-color: rgba(255, 255, 255, 0.5);
		backdrop-filter: blur(5px);
	}

	.plus {
		font-size: 30cqw;
		font-weight: bold;
		color: rgba(255, 255, 255, 0.5);
	}
</style>

<div class="field" onclick={handleClick} onkeydown={handleKeydown} role="button" tabindex="0">
	<div class="plus">+</div>
</div>
