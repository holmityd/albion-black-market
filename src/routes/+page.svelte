<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { TrendingUp } from 'lucide-svelte';
	import { AlbionApiService } from '$lib/services/albionApi';
	import { CLIENT_VERSION, CITY_LIST, FILE_LIST } from '$lib/constants/albion';
	import type { ProfitItem } from '$lib/types/albion';
	import SearchForm from '$lib/components/SearchForm.svelte';
	import ProfitTable from '$lib/components/ProfitTable.svelte';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';

	// State variables
	let selectedCity = $state(CITY_LIST[0]);
	let selectedFile = $state(FILE_LIST[0]);
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

	function toggleSort() {
		sortDescending = !sortDescending;
		profitList = [...profitList].sort((a, b) => 
			sortDescending ? b.profit - a.profit : a.profit - b.profit
		);
	}

	function handleCityChange(city: string) {
		selectedCity = city;
	}

	function handleFileChange(file: string) {
		selectedFile = file;
	}
</script>

<div class="container mx-auto p-6 space-y-6">
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
				hasResults={profitList.length > 0}
				{sortDescending}
				onSearch={searchProfits}
				onToggleSort={toggleSort}
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