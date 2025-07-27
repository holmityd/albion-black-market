<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { TrendingUp, ChevronUp, ChevronDown } from 'lucide-svelte';
	import { humanReadableValue } from '$lib/utils/formatters';
	import type { ProfitItem, Quality } from '$lib/types';
	import { QUALITY_LIST } from '$lib/constants';

	interface Props {
		items: ProfitItem[];
	}

	let { items }: Props = $props();

	type SortField = 'name' | 'cityPrice' | 'blackMarketPrice' | 'profit';
	type SortDirection = 'asc' | 'desc' | 'none';

	let sortField = $state<SortField | null>(null);
	let sortDirection = $state<SortDirection>('none');
	let sortedItems = $state<ProfitItem[]>([]);

	// Initialize sorted items
	$effect(() => {
		sortedItems = [...items];
	});

	function getItemImageUrl(item: ProfitItem): string {
		let identifier = item.id.substring(0, item.id.lastIndexOf('#'));
		const qualityNumber = QUALITY_LIST.indexOf(item.quality as Quality) + 1;
		return `https://render.albiononline.com/v1/item/${identifier}?quality=${qualityNumber}`;
	}

	async function copyItemName(item: ProfitItem) {
		try {
			const itemName = item.name.split(',')[0]; // Get just the item name without quality
			await navigator.clipboard.writeText(itemName);
			// Optional: Show a brief visual feedback
			console.log(`Copied: ${itemName}`);
		} catch (err) {
			console.error('Failed to copy item name:', err);
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = item.name.split(',')[0];
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	}

	function handleSort(field: SortField) {
		if (sortField === field) {
			// Cycle through: none -> asc -> desc -> none
			if (sortDirection === 'none') {
				sortDirection = 'asc';
			} else if (sortDirection === 'asc') {
				sortDirection = 'desc';
			} else {
				sortDirection = 'none';
				sortField = null;
			}
		} else {
			sortField = field;
			sortDirection = 'asc';
		}

		if (sortDirection === 'none' || !sortField) {
			// Reset to original order
			sortedItems = [...items];
		} else {
			// Sort the items
			sortedItems = [...items].sort((a, b) => {
				let aValue: string | number;
				let bValue: string | number;

				switch (field) {
					case 'name':
						aValue = a.name.split(',')[0].toLowerCase();
						bValue = b.name.split(',')[0].toLowerCase();
						break;
					case 'cityPrice':
						aValue = a.cityPrice;
						bValue = b.cityPrice;
						break;
					case 'blackMarketPrice':
						aValue = a.blackMarketPrice;
						bValue = b.blackMarketPrice;
						break;
					case 'profit':
						aValue = a.profit;
						bValue = b.profit;
						break;
					default:
						return 0;
				}

				if (typeof aValue === 'string' && typeof bValue === 'string') {
					const result = aValue.localeCompare(bValue);
					return sortDirection === 'asc' ? result : -result;
				} else {
					const result = (aValue as number) - (bValue as number);
					return sortDirection === 'asc' ? result : -result;
				}
			});
		}
	}

	function getSortIcon(field: SortField) {
		if (sortField !== field || sortDirection === 'none') {
			return null;
		}
		return sortDirection === 'asc' ? ChevronUp : ChevronDown;
	}
</script>

<div class="rounded-md border">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead class="w-16">Item</TableHead>
				<TableHead 
					class="cursor-pointer select-none hover:bg-muted/50 transition-colors"
					onclick={() => handleSort('name')}
					title="Click to sort by name"
				>
					<div class="flex items-center gap-1">
						Name
						{#if getSortIcon('name')}
							{@const SortIcon = getSortIcon('name')}
							<SortIcon class="h-4 w-4" />
						{/if}
					</div>
				</TableHead>
				<TableHead 
					class="text-right cursor-pointer select-none hover:bg-muted/50 transition-colors"
					onclick={() => handleSort('cityPrice')}
					title="Click to sort by city price"
				>
					<div class="flex items-center justify-end gap-1">
						City Price
						{#if getSortIcon('cityPrice')}
							{@const SortIcon = getSortIcon('cityPrice')}
							<SortIcon class="h-4 w-4" />
						{/if}
					</div>
				</TableHead>
				<TableHead 
					class="text-right cursor-pointer select-none hover:bg-muted/50 transition-colors"
					onclick={() => handleSort('blackMarketPrice')}
					title="Click to sort by black market price"
				>
					<div class="flex items-center justify-end gap-1">
						Black Market
						{#if getSortIcon('blackMarketPrice')}
							{@const SortIcon = getSortIcon('blackMarketPrice')}
							<SortIcon class="h-4 w-4" />
						{/if}
					</div>
				</TableHead>
				<TableHead 
					class="text-right cursor-pointer select-none hover:bg-muted/50 transition-colors"
					onclick={() => handleSort('profit')}
					title="Click to sort by profit"
				>
					<div class="flex items-center justify-end gap-1">
						Profit
						{#if getSortIcon('profit')}
							{@const SortIcon = getSortIcon('profit')}
							<SortIcon class="h-4 w-4" />
						{/if}
					</div>
				</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each sortedItems as item}
				<TableRow 
					class="cursor-pointer hover:bg-muted/50 transition-colors" 
					onclick={() => copyItemName(item)}
					title="Click to copy item name"
				>
					<TableCell>
						<div
							class="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-muted"
						>
							<img
								loading="lazy"
								src={getItemImageUrl(item)}
								alt={item.name}
								class="h-full w-full object-cover"
							/>
							<div
								class="flex hidden h-full w-full items-center justify-center rounded bg-muted font-mono text-xs"
							>
								{item.tier}{item.enchant !== '0' ? `.${item.enchant}` : ''}
							</div>
						</div>
					</TableCell>
					<TableCell>
						<div class="space-y-1">
							<div class="font-medium">{item.name.split(',')[0]}</div>
							<Badge variant="secondary" class="text-xs">
								{item.quality}
							</Badge>
						</div>
					</TableCell>
					<TableCell class="text-right font-mono">
						{humanReadableValue(item.cityPrice)}
					</TableCell>
					<TableCell class="text-right font-mono">
						{humanReadableValue(item.blackMarketPrice)}
					</TableCell>
					<TableCell class="text-right">
						<Badge variant={item.profit > 10000 ? 'default' : 'secondary'} class="font-mono">
							<TrendingUp class="mr-1 h-3 w-3" />
							{humanReadableValue(item.profit)}
						</Badge>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
