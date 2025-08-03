<script lang="ts">
	import { parseItemName } from '$lib/utils/formatters';
	import { fade } from 'svelte/transition';
	import Badge from '../ui/badge/badge.svelte';
	import { Button } from '../ui/button';

	const { item, showTier = false } = $props();

	const info = parseItemName(item);
	const itemText = `${showTier ? `${info.tier}.${info.enchant} ` : ''}${info.name}`;
	let showTooltip = $state(false);

	function copyToClipboard() {
		navigator.clipboard
			.writeText(itemText)
			.then(() => {
				showTooltip = true;
				setTimeout(() => {
					showTooltip = false;
				}, 1000);
			})
			.catch((err) => {
				console.error('Failed to copy item name:', err);
			});
	}
</script>

<Button class="relative cursor-pointer" variant="ghost" onclick={copyToClipboard}>
	{itemText}
	{#if showTooltip}
		<span
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			class="absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2"
		>
			<Badge>copied</Badge>
		</span>
	{/if}
</Button>
