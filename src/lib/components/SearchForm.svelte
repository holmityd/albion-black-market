<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CITY_LIST } from '$lib/constants/albion';
	import { ITEM_CATEGORIES } from '$lib/constants/itemCategories';
	import { ArrowUpDown } from 'lucide-svelte';

	interface Props {
		selectedCity: string;
		selectedFile: string;
		isLoading: boolean;
		hasResults: boolean;
		sortDescending: boolean;
		onSearch: () => void;
		onToggleSort: () => void;
		onCityChange: (city: string) => void;
		onFileChange: (file: string) => void;
	}

	let {
		selectedCity = $bindable(),
		selectedFile = $bindable(),
		isLoading,
		hasResults,
		sortDescending,
		onSearch,
		onToggleSort,
		onCityChange,
		onFileChange
	}: Props = $props();

	// Initialize refs with null to avoid binding issues
	let cityTriggerRef = $state<HTMLButtonElement | null>(null);
	let fileTriggerRef = $state<HTMLButtonElement | null>(null);

	const cityTriggerContent = $derived(
		CITY_LIST.find((city) => city === selectedCity) ?? 'Select city'
	);

	const fileTriggerContent = $derived(
		ITEM_CATEGORIES.find((category) => category.value === selectedFile)?.label ??
			'Select item category'
	);

	// Functions to handle label clicks
	function handleCityLabelClick() {
		cityTriggerRef?.click();
	}

	function handleFileLabelClick() {
		fileTriggerRef?.click();
	}
</script>

<div class="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
	<div class="space-y-2">
		<Label class="cursor-pointer" onclick={handleCityLabelClick}>City</Label>
		<Select.Root type="single" name="city" bind:value={selectedCity} onValueChange={onCityChange}>
			<Select.Trigger bind:ref={cityTriggerRef} class="w-full" aria-label="Select city">
				{cityTriggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each CITY_LIST as city (city)}
						<Select.Item value={city} label={city}>
							{city}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<div class="space-y-2">
		<Label class="cursor-pointer" onclick={handleFileLabelClick}>Items</Label>
		<Select.Root
			type="single"
			name="itemFile"
			bind:value={selectedFile}
			onValueChange={onFileChange}
		>
			<Select.Trigger bind:ref={fileTriggerRef} class="w-full" aria-label="Select item category">
				{fileTriggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each ITEM_CATEGORIES as category (category.value)}
						<Select.Item value={category.value} label={category.label}>
							{category.label}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<Button onclick={onSearch} disabled={isLoading} class="mb-2 w-full">
		{isLoading ? 'Searching...' : 'Search'}
	</Button>

	{#if hasResults}
		<Button variant="outline" onclick={onToggleSort} class="mb-2 w-full">
			<ArrowUpDown class="mr-2 h-4 w-4" />
			Sort Profit {sortDescending ? '↓' : '↑'}
		</Button>
	{/if}
</div>
