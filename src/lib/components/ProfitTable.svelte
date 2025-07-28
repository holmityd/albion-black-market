<script lang="ts">
	import { Table, TableBody, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { useSorting } from '$lib/hooks/useSorting.svelte';
	import type { ProfitItem } from '$lib/types';
	import ProfitItemRow from './ProfitItemRow.svelte';
	import TableHeaderSort from './TableHeaderSort.svelte';

	interface Props {
		items: ProfitItem[];
		highlightTime: number;
		hideOldData: boolean;
	}

	let { items, highlightTime, hideOldData }: Props = $props();

	const { sortField, sortDirection, sortedItems, handleSort } = useSorting(items);

	async function copyItemName(item: ProfitItem) {
		try {
			const itemName = item.name.split(',')[0];
			await navigator.clipboard.writeText(itemName);
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

	function isTimeInRange(timestamp: number): boolean {
		const now = new Date().getTime();
		const diffMs = now - timestamp;
		const diffHours = diffMs / (1000 * 60 * 60);
		return diffHours <= highlightTime;
	}

	function shouldShowItem(item: ProfitItem): boolean {
		if (!hideOldData) return true;
		return isTimeInRange(item.cityPriceDate) && isTimeInRange(item.blackMarketPriceDate);
	}
</script>

<div class="rounded-md border">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead class="w-16">Item</TableHead>
				<TableHeaderSort
					field="name"
					label="Name"
					tooltipText="Click to sort by name"
					sortField={sortField()}
					sortDirection={sortDirection()}
					onSort={handleSort}
				/>
				<TableHeaderSort
					field="cityPrice"
					label="City Price"
					tooltipText="Click to sort by city price"
					sortField={sortField()}
					sortDirection={sortDirection()}
					alignment="right"
					onSort={handleSort}
				/>
				<TableHeaderSort
					field="blackMarketPrice"
					label="Black Market"
					tooltipText="Click to sort by black market price"
					sortField={sortField()}
					sortDirection={sortDirection()}
					alignment="right"
					onSort={handleSort}
				/>
				<TableHeaderSort
					field="profit"
					label="Profit"
					tooltipText="Click to sort by profit"
					sortField={sortField()}
					sortDirection={sortDirection()}
					alignment="right"
					onSort={handleSort}
				/>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each sortedItems() as item}
				{#if shouldShowItem(item)}
					<ProfitItemRow {item} {highlightTime} onCopyItemName={copyItemName} />
				{/if}
			{/each}
		</TableBody>
	</Table>
</div>
