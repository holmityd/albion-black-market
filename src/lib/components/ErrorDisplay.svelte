<script lang="ts">
	interface Props {
		error: string;
	}

	let { error }: Props = $props();
</script>

{#if error}
	<div class="rounded-md bg-destructive/15 px-4 py-3 text-destructive">
		{error}
	</div>
{/if}
