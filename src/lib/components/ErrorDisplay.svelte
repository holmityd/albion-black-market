<script lang="ts">
	interface Props {
		error: string;
	}

	let { error }: Props = $props();
</script>

{#if error}
	<div class="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
		{error}
	</div>
{/if}