import { ALL_ITEMS_DATA } from './albion';
export type ItemCategory = keyof typeof ALL_ITEMS_DATA;

export const ITEM_CATEGORIES: { value: ItemCategory; label: string }[] = [
	{ value: 'accessories', label: 'Accessories' },
	{ value: 'armor', label: 'Armor' },
	{ value: 'magic', label: 'Magic' },
	{ value: 'melee', label: 'Melee' },
	{ value: 'off-hand', label: 'Off-hand' },
	{ value: 'ranged', label: 'Ranged' }
];

export const ALL_ITEMS = ALL_ITEMS_DATA;

// Get items by category
export function getItemsByCategory(category: ItemCategory): string[] {
	return ALL_ITEMS_DATA[category] || [];
}

// Get all item IDs
export const ALL_ITEM_IDS = Object.values(ALL_ITEMS_DATA).flat();

// Total count of items
export const TOTAL_ITEMS_COUNT = ALL_ITEM_IDS.length;

// Count by category
export const ITEMS_COUNT_BY_CATEGORY = Object.entries(ALL_ITEMS_DATA).reduce(
	(acc, [category, items]) => {
		acc[category as ItemCategory] = items.length;
		return acc;
	},
	{} as Record<ItemCategory, number>
);
