import { BASE_ITEM_NAMES, QUALITY_LIST } from "$lib/constants";

export function parseItemName(itemId: string): {
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
	const name = (BASE_ITEM_NAMES as Record<string, string>)[baseId] || baseId;

	return { tier, enchant, quality, name };
}

export function humanReadableValue(value: number): string {
	const isNegative = value < 0;
	const absValue = Math.abs(value);

	let result: string;
	if (absValue >= 1e6) {
		result = (absValue / 1e6).toFixed(1) + 'm';
	} else if (absValue >= 1e3) {
		result = Math.round(absValue / 1e3) + 'k';
	} else {
		result = absValue.toString();
	}

	return isNegative ? '-' + result : result;
}

export function formatTimeAgo(timestamp: number): string {
	const now = new Date().getTime();
	const diffMs = now - timestamp;

	// Convert to seconds
	const diffSeconds = Math.floor(diffMs / 1000);

	// Less than 1 minute
	if (diffSeconds < 60) {
		return `${diffSeconds}s`;
	}

	// Less than 1 hour
	const diffMinutes = Math.floor(diffSeconds / 60);
	if (diffMinutes < 60) {
		return `${diffMinutes}m`;
	}

	// Less than 1 day
	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) {
		return `${diffHours}h`;
	}

	// Less than 1 month (30 days)
	const diffDays = Math.floor(diffHours / 24);
	if (diffDays < 30) {
		return `${diffDays}d`;
	}

	// Less than 1 year (365 days)
	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) {
		return `${diffMonths}m`;
	}

	// 1 year or more
	const diffYears = Math.floor(diffDays / 365);
	return `${diffYears}y`;
}
