export function humanReadableValue(value: number): string {
	if (value >= 1e6) {
		return (value / 1e6).toFixed(1) + 'm';
	} else if (value >= 1e3) {
		return Math.round(value / 1e3) + 'k';
	}
	return value.toString();
}
