<script lang="ts">
	import { TrendingUp } from 'lucide-svelte';
	import { Badge } from '../ui/badge';
	import { humanReadableValue } from '$lib/utils/formatters';

	const { profit } = $props();
</script>

<Badge variant={profit && profit > 10000 ? 'default' : 'secondary'} class="font-mono">
	<TrendingUp class="mr-1 h-3 w-3" />
	{profit ? humanReadableValue(profit) : '-'}
</Badge>
