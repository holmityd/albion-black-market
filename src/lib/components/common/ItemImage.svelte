<script lang="ts">
	const { item, quality = 1 }: { item: string; quality?: 1 | 2 | 3 | 4 | 5 } = $props();
	const priceUrl = `https://albiononlinetools.com/economy/item.php?itemPrice=${item}&server=europe#price_search`;
	const imgSrc = `https://render.albiononline.com/v1/item/${item}?quality=${quality}`;
</script>

<a href={priceUrl} target="_blank" rel="noopener noreferrer">
	<div class="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-muted">
		<img
			loading="lazy"
			src={imgSrc}
			alt={item}
			class="h-full w-full translate-x-[1px] translate-y-[1px] object-cover"
		/>
	</div>
</a>
