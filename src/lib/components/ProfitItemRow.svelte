<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { TableCell, TableRow } from '$lib/components/ui/table';
	import { QUALITY_LIST } from '$lib/constants';
	import type { ProfitItem, Quality } from '$lib/types';
	import { formatTimeAgo, humanReadableValue } from '$lib/utils/formatters';
	import { TrendingUp } from 'lucide-svelte';

	interface Props {
		item: ProfitItem;
		highlightTime: number;
		onCopyItemName: (item: ProfitItem) => void;
	}

	let { item, highlightTime, onCopyItemName }: Props = $props();

	function getItemImageUrl(item: ProfitItem): string {
		let identifier = item.id.substring(0, item.id.lastIndexOf('#'));
		const qualityNumber = QUALITY_LIST.indexOf(item.quality as Quality) + 1;
		return `https://render.albiononline.com/v1/item/${identifier}?quality=${qualityNumber}`;
	}

	function isTimeInRange(timestamp: number): boolean {
		const now = new Date().getTime();
		const diffMs = now - timestamp;
		const diffHours = diffMs / (1000 * 60 * 60);
		return diffHours <= highlightTime;
	}

	function getTimeBadgeClass(timestamp: number): string {
		if (isTimeInRange(timestamp)) {
			return 'bg-green-500/50 border-green-300/50';
		} else {
			return 'bg-red-500/50 border-red-300/50';
		}
	}
</script>

<TableRow
	class="cursor-pointer transition-colors hover:bg-muted/50"
	onclick={() => onCopyItemName(item)}
	title="Click to copy item name"
>
	<TableCell>
		<div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-muted">
			<img
				loading="lazy"
				src={getItemImageUrl(item)}
				alt={item.name}
				class="h-full w-full object-cover"
			/>
			<div
				class="flex hidden h-full w-full items-center justify-center rounded bg-muted font-mono text-xs"
			>
				{item.tier}{item.enchant !== '0' ? `.${item.enchant}` : ''}
			</div>
		</div>
	</TableCell>
	<TableCell>
		<div class="space-y-1">
			<div class="font-medium">{item.name.split(',')[0]}</div>
			<Badge variant="secondary" class="text-xs">
				{item.quality}
			</Badge>
		</div>
	</TableCell>
	<TableCell class="text-right font-mono">
		<div class="flex items-start justify-end gap-1">
			<span>{humanReadableValue(item.cityPrice)}</span>
			<Badge
				variant="outline"
				class="h-4 px-1 py-0 text-xs {getTimeBadgeClass(item.cityPriceDate)}"
			>
				{formatTimeAgo(item.cityPriceDate)}
			</Badge>
		</div>
	</TableCell>
	<TableCell class="text-right font-mono">
		<div class="flex items-start justify-end gap-1">
			<span>{humanReadableValue(item.blackMarketPrice)}</span>
			<Badge
				variant="outline"
				class="h-4 px-1 py-0 text-xs {getTimeBadgeClass(item.blackMarketPriceDate)}"
			>
				{formatTimeAgo(item.blackMarketPriceDate)}
			</Badge>
		</div>
	</TableCell>
	<TableCell class="text-right">
		<Badge variant={item.profit > 10000 ? 'default' : 'secondary'} class="font-mono">
			<TrendingUp class="mr-1 h-3 w-3" />
			{humanReadableValue(item.profit)}
		</Badge>
	</TableCell>
</TableRow>
