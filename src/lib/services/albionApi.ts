import { DATA_ROUTE, TAX, QUALITY_LIST, BASE_ITEM_NAMES } from '$lib/constants/albion';
import { getItemsByCategory, type ItemCategory } from '$lib/constants/itemCategories';
import type { ProfitItem, MarketDataEntry } from '$lib/types/albion';

export class AlbionApiService {
	static async fetchMarketData(city: string, category: string): Promise<ProfitItem[]> {
		const itemList = getItemsByCategory(category as ItemCategory);
		if (itemList.length === 0) {
			throw new Error('No items found for selected category');
		}

		// Split items into chunks of 100
		const chunks = this.chunkArray(itemList, 100);

		// Fetch all chunks in parallel
		const allCityData: MarketDataEntry[] = [];
		const allBlackMarketData: MarketDataEntry[] = [];

		for (const chunk of chunks) {
			const itemQuery = chunk.join(',');

			// Fetch city and black market prices for this chunk
			const [cityData, blackMarketData] = await Promise.all([
				this.fetchPrices(itemQuery, city),
				this.fetchPrices(itemQuery, 'blackmarket')
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
		location: string
	): Promise<MarketDataEntry[]> {
		const response = await fetch(`${DATA_ROUTE}${itemQuery}?locations=${location}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${location} prices`);
		}
		return response.json();
	}

	private static calculateProfits(
		cityData: MarketDataEntry[],
		blackMarketData: MarketDataEntry[]
	): ProfitItem[] {
		const offerDict: Record<string, [number, number]> = {};

		// Process city data
		for (const entry of cityData) {
			const itemKey = `${entry.item_id}#${entry.quality}`;
			if (entry.sell_price_min) {
				offerDict[itemKey] = [entry.sell_price_min, 0];
			}
		}

		// Process black market data
		for (const entry of blackMarketData) {
			const qualities = Array.from({ length: 6 - entry.quality }, (_, i) => entry.quality + i);
			const itemsToPurchase = qualities.map((q) => `${entry.item_id}#${q}`);
			const cityValues = itemsToPurchase.map((key) => offerDict[key]?.[0]).filter(Boolean);

			if (cityValues.length > 0 && entry.buy_price_max) {
				const minCityValue = Math.min(...cityValues);
				offerDict[itemsToPurchase[0]] = [minCityValue, entry.buy_price_max];
			}
		}

		// Calculate profits
		const results: ProfitItem[] = [];
		for (const [itemKey, [cityPrice, blackMarketPrice]] of Object.entries(offerDict)) {
			if (blackMarketPrice > 0) {
				const profit = Math.round(blackMarketPrice * (1 - TAX) - cityPrice);
				if (profit > 0) {
					const { tier, enchant, quality, name } = this.parseItemName(itemKey);
					results.push({
						id: itemKey,
						name: `${tier}.${enchant} ${name}, ${quality}`,
						cityPrice,
						blackMarketPrice,
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

	private static parseItemName(itemId: string): {
		tier: string;
		enchant: string;
		quality: string;
		name: string;
	} {
		const [id, qualityStr] = itemId.split('#');
		const enchant = id.includes('@') ? id.split('@')[1] : '0';
		const tier = id.startsWith('T') ? id[1] : '';
		const quality = qualityStr ? QUALITY_LIST[parseInt(qualityStr) - 1] || 'normal' : 'normal';
		const baseId = id.split('@')[0];
		const name = (BASE_ITEM_NAMES as any)[baseId] || baseId;

		return { tier, enchant, quality, name };
	}
}
