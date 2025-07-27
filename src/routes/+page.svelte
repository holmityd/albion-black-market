<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { TrendingUp, Loader2 } from 'lucide-svelte';
	import { AlbionApiService } from '$lib/services/albionApi';
	import type { ProfitItem } from '$lib/types';
	import SearchForm from '$lib/components/SearchForm.svelte';
	import ProfitTable from '$lib/components/ProfitTable.svelte';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import { CITY_LIST, CLIENT_VERSION, ITEM_CATEGORIES, SERVER_LIST } from '$lib/constants';

	// State variables
	let selectedCity = $state(CITY_LIST[0] as string);
	let selectedFile: string = $state(ITEM_CATEGORIES[0].value);
	let selectedServer: string = $state(SERVER_LIST[0].value);
	let highlightTime: number = $state(24);
	let hideOldData: boolean = $state(false);
	let profitList: ProfitItem[] = $state([]);
	let isLoading = $state(false);
	let error = $state('');

	async function searchProfits() {
		if (!selectedCity || !selectedFile || !selectedServer) return;

		isLoading = true;
		error = '';
		profitList = [];

		try {
			profitList = await AlbionApiService.fetchMarketData(
				selectedCity,
				selectedFile,
				selectedServer
			);
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			isLoading = false;
		}
	}

	function handleCityChange(city: string) {
		selectedCity = city;
	}

	function handleFileChange(file: string) {
		selectedFile = file;
	}

	function handleServerChange(server: string) {
		selectedServer = server;
	}

	function handleHighlightTimeChange(time: number) {
		highlightTime = time;
	}

	function handleHideOldDataChange(hide: boolean) {
		hideOldData = hide;
	}
</script>

<div class="container mx-auto space-y-6 p-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<TrendingUp class="h-6 w-6" />
				Albion Black Market Tool v{CLIENT_VERSION}
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<SearchForm
				bind:selectedCity
				bind:selectedFile
				bind:selectedServer
				bind:highlightTime
				bind:hideOldData
				{isLoading}
				onSearch={searchProfits}
				onCityChange={handleCityChange}
				onFileChange={handleFileChange}
				onServerChange={handleServerChange}
				onHighlightTimeChange={handleHighlightTimeChange}
				onHideOldDataChange={handleHideOldDataChange}
			/>

			<ErrorDisplay {error} />
		</CardContent>
	</Card>

	<!-- Loading Indicator -->
	{#if isLoading}
		<Card>
			<CardContent class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4 text-muted-foreground">
					<Loader2 class="h-8 w-8 animate-spin" />
					<div class="text-lg font-medium">Fetching market data...</div>
					<div class="text-sm">This may take a few moments</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Results Table -->
	{#if profitList.length > 0 && !isLoading}
		<Card>
			<CardHeader>
				<CardTitle>Profit Opportunities ({profitList.length} items)</CardTitle>
			</CardHeader>
			<CardContent>
				<ProfitTable items={profitList} {highlightTime} {hideOldData} />
			</CardContent>
		</Card>
	{/if}
</div>
