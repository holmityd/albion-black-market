<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ArrowUpDown } from 'lucide-svelte';
	import { CITY_LIST, FILE_LIST } from '$lib/constants/albion';

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
		FILE_LIST.find((file) => file === selectedFile)?.replace('.txt', '') ?? 'Select item category'
	);

	// Functions to handle label clicks
	function handleCityLabelClick() {
		cityTriggerRef?.click();
	}

	function handleFileLabelClick() {
		fileTriggerRef?.click();
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
		<Select.Root type="single" name="itemFile" bind:value={selectedFile} onValueChange={onFileChange}>
			<Select.Trigger bind:ref={fileTriggerRef} class="w-full" aria-label="Select item category">
				{fileTriggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each FILE_LIST as file (file)}
						<Select.Item value={file} label={file.replace('.txt', '')}>
							{file.replace('.txt', '')}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<Button onclick={onSearch} disabled={isLoading} class="w-full mb-2">
		{isLoading ? 'Searching...' : 'Search'}
	</Button>

	{#if hasResults}
		<Button variant="outline" onclick={onToggleSort} class="w-full mb-2">
			<ArrowUpDown class="h-4 w-4 mr-2" />
			Sort Profit {sortDescending ? '↓' : '↑'}
		</Button>
	{/if}
</div>