<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import * as Select from '$lib/components/ui/select/index.js';
	import { CITY_LIST, ITEM_CATEGORIES, SERVER_LIST } from '$lib/constants';

	interface Props {
		selectedCity: string;
		selectedFile: string;
		selectedServer: string;
		highlightTime: number;
		hideOldData: boolean;
		isLoading: boolean;
		onSearch: () => void;
		onCityChange: (city: string) => void;
		onFileChange: (file: string) => void;
		onServerChange: (server: string) => void;
		onHighlightTimeChange: (time: number) => void;
		onHideOldDataChange: (hide: boolean) => void;
	}

	let {
		selectedCity = $bindable(),
		selectedFile = $bindable(),
		selectedServer = $bindable(),
		highlightTime = $bindable(),
		hideOldData = $bindable(),
		isLoading,
		onSearch,
		onCityChange,
		onFileChange,
		onServerChange,
		onHighlightTimeChange,
		onHideOldDataChange
	}: Props = $props();

	// Initialize refs with null to avoid binding issues
	let cityTriggerRef = $state<HTMLButtonElement | null>(null);
	let fileTriggerRef = $state<HTMLButtonElement | null>(null);
	let serverTriggerRef = $state<HTMLButtonElement | null>(null);

	const cityTriggerContent = $derived(
		CITY_LIST.find((city) => city === selectedCity) ?? 'Select city'
	);

	const fileTriggerContent = $derived(
		ITEM_CATEGORIES.find((category) => category.value === selectedFile)?.label ??
			'Select item category'
	);

	const serverTriggerContent = $derived(
		SERVER_LIST.find((server) => server.value === selectedServer)?.label ?? 'Select server'
	);

	// Functions to handle label clicks
	function handleCityLabelClick() {
		cityTriggerRef?.click();
	}

	function handleFileLabelClick() {
		fileTriggerRef?.click();
	}

	function handleServerLabelClick() {
		serverTriggerRef?.click();
	}

	function handleHighlightTimeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value, 10);
		if (!isNaN(value) && value > 0) {
			onHighlightTimeChange(value);
		}
	}
</script>

<div class="space-y-4">
	<div class="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
		<div class="space-y-2">
			<Label class="cursor-pointer" onclick={handleServerLabelClick}>Server</Label>
			<Select.Root
				type="single"
				name="server"
				bind:value={selectedServer}
				onValueChange={onServerChange}
			>
				<Select.Trigger bind:ref={serverTriggerRef} class="w-full" aria-label="Select server">
					{serverTriggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each SERVER_LIST as server (server.value)}
							<Select.Item value={server.value} label={server.label}>
								{server.label}
							</Select.Item>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
		</div>

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
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<div class="flex items-center gap-2">
			<Label for="highlightTime" class="text-sm whitespace-nowrap">Time range (hours):</Label>
			<Input
				id="highlightTime"
				type="number"
				min="1"
				max="168"
				value={highlightTime}
				oninput={handleHighlightTimeChange}
				class="w-20"
				placeholder="8"
			/>
		</div>

		<div class="flex items-center gap-2">
			<Switch id="hideOldData" checked={hideOldData} onCheckedChange={onHideOldDataChange} />
			<Label for="hideOldData" class="text-sm">Hide old data</Label>
		</div>
	</div>
</div>
