import type { ALL_ITEMS_DATA, CITY_LIST, QUALITY_LIST } from '$lib/constants';

export interface ProfitItem {
	id: string;
	name: string;
	cityPrice: number;
	blackMarketPrice: number;
	profit: number;
	tier: string;
	enchant: string;
	quality: string;
}

export interface MarketDataEntry {
	item_id: string;
	quality: number;
	sell_price_min?: number;
	buy_price_max?: number;
}

export type ItemCategory = keyof typeof ALL_ITEMS_DATA;
export type City = (typeof CITY_LIST)[number];
export type Quality = (typeof QUALITY_LIST)[number];
