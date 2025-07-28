// Create a single constants barrel file
import type { ItemCategory } from '$lib/types';
import ALL_ITEMS_DATA from './all_items.json';
import BASE_ITEM_NAMES from './base_item_names.json';

// App constants
export const CLIENT_VERSION = '0.4';
export const TAX = 0.06;

export const CITY_LIST = [
	'Lymhurst',
	'Bridgewatch',
	'Fortsterling',
	'Caerleon',
	'Martlock',
	'Thetford'
] as const;

export const QUALITY_LIST = ['normal', 'good', 'outstanding', 'excellent', 'masterpiece'] as const;

// Data exports
export { ALL_ITEMS_DATA, BASE_ITEM_NAMES };

// Item categories
export const ITEM_CATEGORIES: { value: ItemCategory; label: string }[] = [
	{ value: 'accessories', label: 'Accessories' },
	{ value: 'armor', label: 'Armor' },
	{ value: 'magic', label: 'Magic' },
	{ value: 'melee', label: 'Melee' },
	{ value: 'off-hand', label: 'Off-hand' },
	{ value: 'ranged', label: 'Ranged' }
];

export const SERVER_LIST = [
	{ value: 'https://europe.albion-online-data.com', label: 'Europe' },
	{ value: 'https://west.albion-online-data.com', label: 'America' },
	{ value: 'https://east.albion-online-data.com', label: 'Asia' }
] as const;
