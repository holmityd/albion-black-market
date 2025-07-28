import type { ALL_ITEMS_DATA, CITY_LIST, QUALITY_LIST, SERVER_LIST } from '$lib/constants';

export interface ProfitItem {
	id: string;
	name: string;
	cityPrice: number;
	cityPriceDate:number;
	blackMarketPrice: number;
	blackMarketPriceDate:number;
	profit: number;
	tier: string;
	enchant: string;
	quality: string;
}

export interface MarketDataEntry {
	item_id: string;
	quality: number;
	sell_price_min?: number;
	sell_price_min_date?: string;
	buy_price_max?: number;
	buy_price_max_date?: string;
}

export type ItemCategory = keyof typeof ALL_ITEMS_DATA;
export type City = (typeof CITY_LIST)[number];
export type Quality = (typeof QUALITY_LIST)[number];
export type Server = (typeof SERVER_LIST)[number]['value'];

export type SortField = 'name' | 'cityPrice' | 'blackMarketPrice' | 'profit';
export type SortDirection = 'asc' | 'desc' | 'none';
