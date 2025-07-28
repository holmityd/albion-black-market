export function humanReadableValue(value: number): string {
	if (value >= 1e6) {
		return (value / 1e6).toFixed(1) + 'm';
	} else if (value >= 1e3) {
		return Math.round(value / 1e3) + 'k';
	}
	return value.toString();
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
