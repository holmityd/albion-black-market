import { ALL_ITEMS_DATA, BASE_ITEM_NAMES, QUALITY_LIST, TAX } from '$lib/constants';
import type { ProfitItem, MarketDataEntry, ItemCategory } from '$lib/types';
import { parseItemName } from '$lib/utils/formatters';

function getItemsByCategory(category: ItemCategory): string[] {
	return ALL_ITEMS_DATA[category] || [];
}

export class AlbionApiService {
	static async fetchMarketData(
		city: string,
		category: string,
		serverUrl: string
	): Promise<ProfitItem[]> {
		const itemList = getItemsByCategory(category as ItemCategory);
		if (itemList.length === 0) {
			throw new Error('No items found for selected category');
		}

		// Split items into chunks of 50
		const chunks = this.chunkArray(itemList, 50);

		// Fetch all chunks in parallel
		const allCityData: MarketDataEntry[] = [];
		const allBlackMarketData: MarketDataEntry[] = [];

		for (const chunk of chunks) {
			const itemQuery = chunk.join(',');

			// Fetch city and black market prices for this chunk
			const [cityData, blackMarketData] = await Promise.all([
				this.fetchPrices(itemQuery, city, serverUrl),
				this.fetchPrices(itemQuery, 'blackmarket', serverUrl)
			]);

			allCityData.push(...cityData);
			allBlackMarketData.push(...blackMarketData);
		}

		return this.calculateProfits(allCityData, allBlackMarketData);
	}

	private static chunkArray<T>(array: T[], chunkSize: number): T[][] {
		const chunks: T[][] = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			chunks.push(array.slice(i, i + chunkSize));
		}
		return chunks;
	}

	private static async fetchPrices(
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

	private static calculateProfits(
		cityData: MarketDataEntry[],
		blackMarketData: MarketDataEntry[]
	): ProfitItem[] {
		const offerDict: Record<string, [number, number, string?, string?]> = {};

		// Process city data
		for (const entry of cityData) {
			const itemKey = `${entry.item_id}#${entry.quality}`;
			if (entry.sell_price_min) {
				offerDict[itemKey] = [entry.sell_price_min, 0, entry.sell_price_min_date, undefined];
			}
		}

		// Process black market data
		for (const entry of blackMarketData) {
			const qualities = Array.from({ length: 6 - entry.quality }, (_, i) => entry.quality + i);
			const itemsToPurchase = qualities.map((q) => `${entry.item_id}#${q}`);
			const cityValues = itemsToPurchase.map((key) => offerDict[key]?.[0]).filter(Boolean);

			if (cityValues.length > 0 && entry.buy_price_max) {
				const minCityValue = Math.min(...cityValues);
				// Find the corresponding city entry for the date
				const cityEntryKey = itemsToPurchase.find((key) => offerDict[key]?.[0] === minCityValue);
				const existingCityDate = cityEntryKey ? offerDict[cityEntryKey]?.[2] : undefined;

				offerDict[itemsToPurchase[0]] = [
					minCityValue,
					entry.buy_price_max,
					existingCityDate,
					entry.buy_price_max_date
				];
			}
		}

		// Calculate profits
		const results: ProfitItem[] = [];
		// Calculate timezone offset once outside the loop
		const timezoneOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;

		for (const [
			itemKey,
			[cityPrice, blackMarketPrice, cityPriceDate, blackMarketPriceDate]
		] of Object.entries(offerDict)) {
			if (blackMarketPrice > 0) {
				const profit = Math.round(blackMarketPrice * (1 - TAX) - cityPrice);
				if (profit > 0) {
					const { tier, enchant, quality, name } = parseItemName(itemKey);
					results.push({
						id: itemKey,
						name: `${tier}.${enchant} ${name}, ${quality}`,
						cityPrice,
						cityPriceDate: new Date(cityPriceDate || '').getTime() - timezoneOffsetMs,
						blackMarketPrice,
						blackMarketPriceDate: new Date(blackMarketPriceDate || '').getTime() - timezoneOffsetMs,
						profit,
						tier,
						enchant,
						quality
					});
				}
			}
		}

		return results.sort((a, b) => b.profit - a.profit);
	}
}
