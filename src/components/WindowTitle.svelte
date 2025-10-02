<script lang="ts">
	interface Props {
		text: string;
	}
	let { text }: Props = $props();
</script>

<style>
	.title {
		padding: 0.5vw;
		font-size: 1vw;
		font-weight: bold;
		color: #fff;
		background-color: #444;
		border-radius: 0.5vw;
	}
</style>

<div class="title">{text}</div>
