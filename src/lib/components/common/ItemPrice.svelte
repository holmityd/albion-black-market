<script lang="ts">
	import { Input } from '../ui/input';
	import { humanReadableValue } from '$lib/utils/formatters';
	let { price = $bindable(), isEditable = false } = $props();

	let isEditing = $state(false);
</script>

{#if isEditing}
	<Input
		type="number"
		value={price}
		onchange={(e) => {
			const value = parseFloat(e.currentTarget.value) || 0;
			price = value;
		}}
		onblur={() => {
			isEditing = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === 'Escape') {
				e.currentTarget.blur();
			}
		}}
		placeholder="Enter price"
		class="absolute top-1/2 left-0 w-24 -translate-y-1/2"
		autofocus
	/>
{:else}
	<button
		type="button"
		class="{isEditable
			? 'cursor-pointer'
			: ''} rounded px-2 py-1 text-left hover:bg-muted/50 focus:ring-2 focus:ring-ring focus:outline-none"
		onclick={() => {
			if (isEditable) isEditing = true;
		}}
		tabindex="0"
	>
		{price ? humanReadableValue(price) : '-'}
	</button>
{/if}
