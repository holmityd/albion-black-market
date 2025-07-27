<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { TrendingUp } from 'lucide-svelte';
	import { humanReadableValue } from '$lib/utils/formatters';
	import type { ProfitItem } from '$lib/types/albion';

	interface Props {
		items: ProfitItem[];
	}

	let { items }: Props = $props();

	const qualityMap: Record<string, number> = {
		normal: 1,
		good: 2,
		outstanding: 3,
		excellent: 4,
		masterpiece: 5
	};

	// Function to generate Albion Online item image URL with quality and enchantment
	function getItemImageUrl(item: ProfitItem): string {
		let identifier = item.id.substring(0, item.id.lastIndexOf('#'));
		const qualityNumber = qualityMap[item.quality.toLowerCase()] || 1;
		return `https://render.albiononline.com/v1/item/${identifier}?quality=${qualityNumber}`;
	}
</script>

<div class="rounded-md border">
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead class="w-16">Item</TableHead>
				<TableHead>Name</TableHead>
				<TableHead class="text-right">City Price</TableHead>
				<TableHead class="text-right">Black Market</TableHead>
				<TableHead class="text-right">Profit</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{#each items as item}
				<TableRow>
					<TableCell>
						<div
							class="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-muted"
						>
							<img src={getItemImageUrl(item)} alt={item.name} class="h-full w-full object-cover" />
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
						{humanReadableValue(item.cityPrice)}
					</TableCell>
					<TableCell class="text-right font-mono">
						{humanReadableValue(item.blackMarketPrice)}
					</TableCell>
					<TableCell class="text-right">
						<Badge variant={item.profit > 10000 ? 'default' : 'secondary'} class="font-mono">
							<TrendingUp class="mr-1 h-3 w-3" />
							{humanReadableValue(item.profit)}
						</Badge>
					</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
</div>
