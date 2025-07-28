<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	let { title, children, ...restProps } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger {...restProps}>
			{@render children?.()}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{title}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
