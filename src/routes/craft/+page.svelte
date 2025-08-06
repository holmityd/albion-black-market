<script lang="ts">
	import ItemImage from '$lib/components/common/ItemImage.svelte';
	import ItemName from '$lib/components/common/ItemName.svelte';
	import ItemPrice from '$lib/components/common/ItemPrice.svelte';
	import ProfitBadge from '$lib/components/common/ProfitBadge.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import SelectLabel from '$lib/components/ui/SelectLabel.svelte';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { CITY_LIST, SERVER_LIST } from '$lib/constants';
	import category_tree from '$lib/constants/category_tree.json';
	import craftData from '$lib/constants/crafting-data.json';
	import type { MarketDataEntry } from '$lib/types';
	import { parseItemName } from '$lib/utils/formatters';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';

	const CRAFT_DATA = craftData as Record<string, (string | number)[]>;

	const serverMap = SERVER_LIST.reduce(
		(acc, curr) => ({ ...acc, [curr.label]: curr.value }),
		{} as Record<string, string>
	);
	const serverList = Object.keys(serverMap);
	let selectedServer = $state(serverList[0]);

	const cityList = [...CITY_LIST];
	let selectedCity = $state(cityList[0]);

	// Category
	const categoryTree = category_tree as Record<string, Record<string, string[]>>;
	const categories = Object.keys(categoryTree);
	let selectedCategory = $state(categories[0]);

	// Sub category
	const subCategories = $derived(Object.keys(categoryTree[selectedCategory]));
	let selectedSubCategory = $derived(subCategories[0] || '');

	// Tiers
	const availableTiers = ['All', ...Array.from({ length: 8 }, (_, i) => `T${i + 1}`)];
	let selectedTier = $state(availableTiers[0]);

	// Items
	const items = $derived(
		categoryTree[selectedCategory][selectedSubCategory]?.filter(
			(i) => selectedTier === 'All' || i.startsWith(selectedTier)
		) || []
	);

	// Prices
	let isLoading = $state(false);
	let itemPrices = $state<Record<string, number>>({});
	let resourcePrices: Record<string, number> = $state({});
	const craftPrices = $derived.by(() => {
		const newCraftPrices: Record<string, number> = {};

		for (const item of items) {
			let craftPrice = 0;
			const resources = CRAFT_DATA[item];
			if (resources) {
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
			}

			newCraftPrices[item] = craftPrice;
		}

		return newCraftPrices;
	});
	const profitPrices = $derived.by(() => {
		const newProfitPrices: Record<string, number> = {};

		for (const item of items) {
			newProfitPrices[item] =
				craftPrices[item] && itemPrices[item]
					? itemPrices[item] - Math.round(itemPrices[item] * 0.105) - craftPrices[item]
					: 0;
		}
		return newProfitPrices;
	});
	$effect(() => {
		if (items.length === 0) return;

		isLoading = true;

		const resources: Set<string> = new Set();
		for (const item of items) {
			const info = CRAFT_DATA[item];
			if (info) {
				for (let i = 0; i < info.length; i = i + 2) {
					const resource = info[i] as string;
					if (resource.includes('LEVEL')) {
						resources.add(`${resource}@${resource.slice(-1)}`);
					} else {
						resources.add(resource);
					}
				}
			}
		}
		fetchPrices(Array.from(resources).join(','), selectedCity, serverMap[selectedServer]).then(
			(resourceData) => {
				const newResourcePrices: Record<string, number> = {};
				for (const entry of resourceData) {
					const itemKey = entry.item_id.includes('LEVEL')
						? entry.item_id.split('@')[0]
						: entry.item_id;
					if (entry.sell_price_min) {
						newResourcePrices[itemKey] = entry.sell_price_min;
					}
				}
				resources.forEach((item) => {
					const itemKey = item.includes('LEVEL') ? item.split('@')[0] : item;
					if (!newResourcePrices[itemKey]) {
						newResourcePrices[itemKey] = 0;
					}
				});
				resourcePrices = newResourcePrices;
			}
		);

		fetchPrices(items.join(','), selectedCity, serverMap[selectedServer])
			.then((allItemsData) => {
				const newItemPrices: Record<string, number> = {};
				for (const entry of allItemsData) {
					const itemKey = entry.item_id;
					if (entry.sell_price_min) {
						newItemPrices[itemKey] = entry.sell_price_min;
					}
				}
				itemPrices = newItemPrices;

				isLoading = false;
			})
			.catch((error) => {
				console.error('Failed to fetch prices:', error);
				isLoading = false;
			});
	});
	async function fetchPricesSingle(
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
	async function fetchPrices(itemQuery: string, location: string, serverUrl: string) {
		const BATCH_SIZE = 50;

		// Early return for empty queries
		if (!itemQuery?.trim()) {
			return [];
		}

		// Split and filter out empty items
		const itemsArr = itemQuery.split(',').filter((item) => item.trim());

		// If items fit in one batch, no need to batch
		if (itemsArr.length <= BATCH_SIZE) {
			return await fetchPricesSingle(itemQuery, location, serverUrl);
		}

		// Create batches more efficiently
		const batches: string[][] = [];
		for (let i = 0; i < itemsArr.length; i += BATCH_SIZE) {
			batches.push(itemsArr.slice(i, i + BATCH_SIZE));
		}

		try {
			// Process batches with error handling
			const batchPromises = batches.map(async (batch, index) => {
				try {
					return await fetchPricesSingle(batch.join(','), location, serverUrl);
				} catch (error) {
					console.error(`Batch ${index + 1} failed:`, error);
					return []; // Return empty array for failed batches
				}
			});

			const allItemsData = await Promise.all(batchPromises);
			return allItemsData.flat();
		} catch (error) {
			console.error('Failed to fetch prices in batches:', error);
			throw new Error('Failed to fetch item prices');
		}
	}

	// Sort
	let sortColumn = $state<'name' | 'craftPrice' | 'itemPrice' | 'profit' | null>(null);
	let sortDirection = $state<'asc' | 'desc'>('asc');
	function handleSort(column: typeof sortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}
	const sortedItems = $derived.by(() => {
		if (!sortColumn) return items;

		return [...items].sort((itemA, itemB) => {
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
					valueA = profitPrices[itemA] || 0;
					valueB = profitPrices[itemB] || 0;
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
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold">Crafting Data</h1>

	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
		<SelectLabel
			label="Server"
			placeholder="Select server"
			class="w-full"
			bind:value={selectedServer}
			options={serverList}
		/>
		<SelectLabel
			label="City"
			placeholder="Select city"
			class="w-full"
			bind:value={selectedCity}
			options={cityList}
		/>
		<SelectLabel
			label="Category"
			placeholder="Select category"
			class="w-full"
			bind:value={selectedCategory}
			options={categories}
		/>

		<SelectLabel
			label="Subcategory"
			placeholder="Select subcategory"
			class="w-full"
			bind:value={selectedSubCategory}
			options={subCategories}
		/>

		<SelectLabel
			label="Tier"
			placeholder="Select tier"
			class="w-full"
			bind:value={selectedTier}
			options={availableTiers}
		/>
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

	<!-- Resource Prices Table -->
	{#if Object.keys(resourcePrices).length > 0 && !isLoading}
		<Card class="mb-6">
			<CardContent>
				<Collapsible.Root>
					<Collapsible.Trigger class="flex w-full cursor-pointer items-center justify-between">
						<h2 class="text-xl font-semibold">Resource Prices</h2>
						<ChevronDown size={24} />
					</Collapsible.Trigger>
					<Collapsible.Content>
						<div class="mt-6 rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead class="w-16">Item</TableHead>
										<TableHead>Name</TableHead>
										<TableHead>Price</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{#each Object.keys(resourcePrices) as item (item)}
										<TableRow class="hover:bg-muted/50">
											<TableCell class="font-medium">
												<ItemImage {item} />
											</TableCell>
											<TableCell>
												<ItemName {item} />
											</TableCell>
											<TableCell class="relative">
												<ItemPrice bind:price={resourcePrices[item]} isEditable />
											</TableCell>
										</TableRow>
									{/each}
								</TableBody>
							</Table>
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			</CardContent>
		</Card>
	{/if}

	<!-- Crafting Table -->
	{#if sortedItems.length > 0 && !isLoading}
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
									{#if sortDirection === 'asc'}
										<ChevronUp size={12} />
									{:else}
										<ChevronDown size={12} />
									{/if}
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
									{#if sortDirection === 'asc'}
										<ChevronUp size={12} />
									{:else}
										<ChevronDown size={12} />
									{/if}
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
									{#if sortDirection === 'asc'}
										<ChevronUp size={12} />
									{:else}
										<ChevronDown size={12} />
									{/if}
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
									{#if sortDirection === 'asc'}
										<ChevronUp size={12} />
									{:else}
										<ChevronDown size={12} />
									{/if}
								{/if}
							</div>
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each sortedItems as item (item)}
						{@const resources = CRAFT_DATA[item]}
						<TableRow class="hover:bg-muted/50">
							<TableCell class="font-medium">
								<ItemImage {item} />
							</TableCell>
							<TableCell class="font-medium">
								<ItemName {item} showTier />
							</TableCell>
							<TableCell>
								<div class="flex flex-col flex-wrap gap-2">
									{#each resources as requirement, index}
										{#if index % 2 === 0}
											<div class="flex items-center space-x-2">
												<ItemName item={requirement} />
												{#if resources[index + 1]}
													<Badge variant="secondary" class="text-xs">
														×{resources[index + 1]}
													</Badge>
												{/if}
											</div>
										{/if}
									{/each}
								</div>
							</TableCell>
							<TableCell>
								<ItemPrice price={craftPrices[item]} />
							</TableCell>
							<TableCell class="relative">
								<ItemPrice bind:price={itemPrices[item]} isEditable />
							</TableCell>
							<TableCell>
								<ProfitBadge profit={profitPrices[item]} />
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>
