<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { SERVER_LIST } from '$lib/constants';
	import data from '$lib/constants/crafting-data.json';
	import type { MarketDataEntry } from '$lib/types';
	import { humanReadableValue, parseItemName } from '$lib/utils/formatters';
	import { Loader2, TrendingUp } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const dataByTiers = (() => {
		const result: Record<string, Record<string, { resources: (string | number)[] }>> = {};

		// Initialize tiers
		for (let i = 1; i <= 8; i++) {
			result[`T${i}`] = {};
		}

		// Group items by tier
		for (const [item, resources] of Object.entries(data)) {
			const tier = item.slice(0, 2);
			if (result[tier]) {
				result[tier][item] = { resources };
			}
		}

		return result;
	})();

	let isLoading = $state(false);
	let selectedTier = $state('T1');
	let craftPrices = $state<Record<string, number>>({});
	let itemPrices = $state<Record<string, number>>({});
	let sortColumn = $state<'name' | 'craftPrice' | 'itemPrice' | 'profit' | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');

	const availableTiers = Object.keys(dataByTiers).filter(
		(tier) => Object.keys(dataByTiers[tier]).length > 0
	);

	const selectedTierData = $derived(dataByTiers[selectedTier] || {});
	const sortedItems = $derived.by(() => {
		const items = Object.entries(selectedTierData);

		if (!sortColumn) return items;

		return items.sort(([itemA, infoA], [itemB, infoB]) => {
			let valueA: string | number;
			let valueB: string | number;

			switch (sortColumn) {
				case 'name':
					valueA = parseItemName(itemA).name;
					valueB = parseItemName(itemB).name;
					break;
				case 'craftPrice':
					valueA = craftPrices[itemA] || 0;
					valueB = craftPrices[itemB] || 0;
					break;
				case 'itemPrice':
					valueA = itemPrices[itemA] || 0;
					valueB = itemPrices[itemB] || 0;
					break;
				case 'profit':
					valueA =
						(itemPrices[itemA] || 0) - (itemPrices[itemA] || 0) * 0.105 - (craftPrices[itemA] || 0);
					valueB =
						(itemPrices[itemB] || 0) - (itemPrices[itemB] || 0) * 0.105 - (craftPrices[itemB] || 0);
					break;
				default:
					return 0;
			}

			if (typeof valueA === 'string' && typeof valueB === 'string') {
				return sortDirection === 'asc'
					? valueA.localeCompare(valueB)
					: valueB.localeCompare(valueA);
			}

			return sortDirection === 'asc'
				? (valueA as number) - (valueB as number)
				: (valueB as number) - (valueA as number);
		});
	});

	// Handle sorting
	function handleSort(column: typeof sortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	// Trigger content for select
	const tierTriggerContent = $derived(
		availableTiers.find((tier) => tier === selectedTier) ?? 'Select tier'
	);

	// Ref for trigger
	let tierTriggerRef = $state<HTMLButtonElement | null>(null);

	// Handle tier change
	async function handleTierChange(tier: string) {
		isLoading = true;
		selectedTier = tier;
		// Reset craft prices when tier changes
		craftPrices = {};

		const resources = new Set();
		for (const info of Object.values(dataByTiers[tier])) {
			for (let i = 0; i < info.resources.length; i = i + 2) {
				const resource = info.resources[i] as string;
				if (resource.includes('LEVEL')) {
					resources.add(`${resource}@${resource.slice(-1)}`);
				} else {
					resources.add(resource);
				}
			}
		}

		const resourceData = await fetchPrices(
			Array.from(resources).join(','),
			'Lymhurst',
			SERVER_LIST[0].value
		);

		const resourcePrices: Record<string, number> = {};

		for (const entry of resourceData) {
			const itemKey = entry.item_id.includes('LEVEL') ? entry.item_id.split('@')[0] : entry.item_id;
			if (entry.sell_price_min) {
				resourcePrices[itemKey] = entry.sell_price_min;
			}
		}

		console.log(resourcePrices);

		// Create new craft prices object to trigger reactivity
		const newCraftPrices: Record<string, number> = {};
		for (const [item, info] of Object.entries(selectedTierData)) {
			let craftPrice = 0;
			const resources = info.resources;
			for (let i = 0; i < resources.length; i = i + 2) {
				const resource = resources[i] as string;
				const count = resources[i + 1] as number;
				if (resourcePrices[resource]) {
					craftPrice += Math.round(
						count * resourcePrices[resource] -
							(count > 1 ? count * resourcePrices[resource] * 0.15 : 0)
					);
				} else {
					craftPrice = 0;
				}
			}
			newCraftPrices[item] = craftPrice;
		}

		// Update the reactive state
		craftPrices = newCraftPrices;

		// Batch items into groups of 50
		const itemsArr = Object.keys(dataByTiers[tier]);
		const batchSize = 50;
		const batches: string[][] = [];

		for (let i = 0; i < itemsArr.length; i += batchSize) {
			batches.push(itemsArr.slice(i, i + batchSize));
		}

		// Fetch all batches concurrently
		const batchPromises = batches.map((batch) =>
			fetchPrices(batch.join(','), 'Lymhurst', SERVER_LIST[0].value)
		);

		// Wait for all responses
		const allItemsData = await Promise.all(batchPromises);

		// Flatten results and build price map
		const newItemPrices: Record<string, number> = {};
		for (const itemsData of allItemsData) {
			for (const entry of itemsData) {
				const itemKey = entry.item_id;
				if (entry.sell_price_min) {
					newItemPrices[itemKey] = entry.sell_price_min;
				}
			}
		}
		itemPrices = newItemPrices;

		isLoading = false;
	}

	async function fetchPrices(
		itemQuery: string,
		location: string,
		serverUrl: string
	): Promise<MarketDataEntry[]> {
		const apiUrl = `${serverUrl}/api/v2/stats/prices/${itemQuery}?locations=${location}`;
		const response = await fetch(apiUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${location} prices from ${serverUrl}`);
		}
		return response.json();
	}

	// Handle label click
	function handleTierLabelClick() {
		tierTriggerRef?.click();
	}

	function getItemImageUrl(identifier: string): string {
		return `https://render.albiononline.com/v1/item/${identifier}?quality=1`;
	}

	onMount(() => {
		handleTierChange(Object.keys(dataByTiers)[0]);
	});
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold">Crafting Data</h1>

	<!-- Tier Selector -->
	<div class="mb-6 space-y-2">
		<Label class="cursor-pointer" onclick={handleTierLabelClick}>Select Tier:</Label>
		<Select.Root
			type="single"
			name="tier"
			bind:value={selectedTier}
			onValueChange={handleTierChange}
		>
			<Select.Trigger bind:ref={tierTriggerRef} class="w-[180px]" aria-label="Select tier">
				{tierTriggerContent}
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each availableTiers as tier (tier)}
						<Select.Item value={tier} label={tier}>
							{tier}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	{#if isLoading}
		<Card>
			<CardContent class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4 text-muted-foreground">
					<Loader2 class="h-8 w-8 animate-spin" />
					<div class="text-lg font-medium">Fetching market data...</div>
					<div class="text-sm">This may take a few moments</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Crafting Table -->
	{#if Object.keys(selectedTierData).length > 0 && !isLoading}
		<div class="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead class="w-16">Item</TableHead>
						<TableHead
							class="cursor-pointer select-none hover:bg-muted/50"
							onclick={() => handleSort('name')}
						>
							<div class="flex items-center gap-1">
								Name
								{#if sortColumn === 'name'}
									<span class="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</TableHead>
						<TableHead>Crafting Requirements</TableHead>
						<TableHead
							class="cursor-pointer select-none hover:bg-muted/50"
							onclick={() => handleSort('craftPrice')}
						>
							<div class="flex items-center gap-1">
								Crafting Price
								{#if sortColumn === 'craftPrice'}
									<span class="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</TableHead>
						<TableHead
							class="cursor-pointer select-none hover:bg-muted/50"
							onclick={() => handleSort('itemPrice')}
						>
							<div class="flex items-center gap-1">
								Item Price
								{#if sortColumn === 'itemPrice'}
									<span class="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</TableHead>
						<TableHead
							class="cursor-pointer select-none hover:bg-muted/50"
							onclick={() => handleSort('profit')}
						>
							<div class="flex items-center gap-1">
								Profit
								{#if sortColumn === 'profit'}
									<span class="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each sortedItems as [item, info] (item)}
						{@const craftPrice = craftPrices[item]}
						{@const itemPrice = itemPrices[item]}
						{@const profit =
							craftPrice && itemPrice
								? itemPrice - Math.round(itemPrice * 0.105) - craftPrice
								: undefined}
						{#if profit && profit > 0}
							<TableRow class="hover:bg-muted/50">
								<TableCell class="font-medium">
									<div
										class="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-muted"
									>
										<img
											loading="lazy"
											src={getItemImageUrl(item)}
											alt={item}
											class="h-full w-full object-cover"
										/>
									</div>
								</TableCell>
								<TableCell class="font-medium">
									{parseItemName(item).name}
								</TableCell>
								<TableCell>
									<div class="flex flex-col flex-wrap gap-2">
										{#each info.resources as requirement, index}
											{#if index % 2 === 0}
												<div class="flex items-center space-x-2">
													<span class="text-sm font-medium"
														>{parseItemName(requirement as string).name}</span
													>
													{#if info.resources[index + 1]}
														<Badge variant="secondary" class="text-xs">
															×{info.resources[index + 1]}
														</Badge>
													{/if}
												</div>
											{/if}
										{/each}
									</div>
								</TableCell>
								<TableCell>{craftPrice ? humanReadableValue(craftPrice) : '-'}</TableCell>
								<TableCell>{itemPrice ? humanReadableValue(itemPrice) : '-'}</TableCell>
								<TableCell>
									<Badge
										variant={profit && profit > 10000 ? 'default' : 'secondary'}
										class="font-mono"
									>
										<TrendingUp class="mr-1 h-3 w-3" />
										{profit ? humanReadableValue(profit) : '-'}
									</Badge>
								</TableCell>
							</TableRow>
						{/if}
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>
