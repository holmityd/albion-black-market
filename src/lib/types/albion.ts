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