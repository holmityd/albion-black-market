import type { ProfitItem, SortDirection, SortField } from '$lib/types';

export function useSorting(items: ProfitItem[]) {
	let sortField = $state<SortField | null>(null);
	let sortDirection = $state<SortDirection>('none');

	// Use $derived instead of $state and $effect
	const sortedItems = $derived(() => {
		if (sortDirection === 'none' || !sortField) {
			// Reset to original order
			return [...items];
		} else {
			// Sort the items
			return [...items].sort((a, b) => {
				let aValue: string | number;
				let bValue: string | number;

				switch (sortField) {
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
	});

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
	}

	return {
		sortField: () => sortField,
		sortDirection: () => sortDirection,
		sortedItems,
		handleSort
	};
}
