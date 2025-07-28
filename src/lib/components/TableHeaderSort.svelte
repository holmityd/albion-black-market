<script lang="ts">
	import { TableHead } from '$lib/components/ui/table';
	import type { SortField } from '$lib/types';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import Tooltip from './Tooltip.svelte';

	interface Props {
		field: SortField;
		label: string;
		tooltipText: string;
		sortField: string | null;
		sortDirection: 'asc' | 'desc' | 'none';
		alignment?: 'left' | 'right';
		onSort: (field: SortField) => void;
	}

	let {
		field,
		label,
		tooltipText,
		sortField,
		sortDirection,
		alignment = 'left',
		onSort
	}: Props = $props();

	function getSortIcon() {
		if (sortField !== field || sortDirection === 'none') {
			return null;
		}
		return sortDirection === 'asc' ? ChevronUp : ChevronDown;
	}
</script>

<TableHead class="{alignment === 'right' ? 'text-right' : ''} select-none">
	<Tooltip
		title={tooltipText}
		onclick={() => onSort(field)}
		class="inline-flex cursor-pointer items-center {alignment === 'right'
			? 'justify-end'
			: ''} gap-1"
	>
		{label}
		{#if getSortIcon()}
			{@const SortIcon = getSortIcon()}
			<SortIcon class="h-4 w-4" />
		{/if}
	</Tooltip>
</TableHead>
