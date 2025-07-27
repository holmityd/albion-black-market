<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { TrendingUp } from 'lucide-svelte';
	import { AlbionApiService } from '$lib/services/albionApi';
	import type { ProfitItem } from '$lib/types';
	import SearchForm from '$lib/components/SearchForm.svelte';
	import ProfitTable from '$lib/components/ProfitTable.svelte';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import { CITY_LIST, CLIENT_VERSION, ITEM_CATEGORIES } from '$lib/constants';

	// State variables
	let selectedCity = $state(CITY_LIST[0] as string);
	let selectedFile: string = $state(ITEM_CATEGORIES[0].value);
	let profitList: ProfitItem[] = $state([]);
	let sortDescending = $state(true);
	let isLoading = $state(false);
	let error = $state('');

	async function searchProfits() {
		if (!selectedCity || !selectedFile) return;

		isLoading = true;
		error = '';
		profitList = [];

		try {
			profitList = await AlbionApiService.fetchMarketData(selectedCity, selectedFile);
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
				{isLoading}
				onSearch={searchProfits}
				onCityChange={handleCityChange}
				onFileChange={handleFileChange}
			/>

			<ErrorDisplay {error} />
		</CardContent>
	</Card>

	{#if profitList.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Profit Opportunities ({profitList.length} items)</CardTitle>
			</CardHeader>
			<CardContent>
				<ProfitTable items={profitList} />
			</CardContent>
		</Card>
	{/if}
</div>
