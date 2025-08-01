import { getJson } from '../src/lib/utils/fetch';
import { ALL_ITEMS_DATA } from '../src/lib/constants';
import CATEGORY_TREE from '../src/lib/constants/category_tree.json';
import fs from 'node:fs';

import type { AlbionItemInfo } from './types';

async function getItemInfo(item: string) {
	return getJson<AlbionItemInfo>(
		'https://gameinfo.albiononline.com/api/gameinfo/items/' + item + '/data'
	);
}

(async () => {
	console.log('start');

	// Read existing data if file exists
	let crafting_data: Record<string, unknown> = {};
	const filePath = './src/lib/constants/crafting-data.json';

	// Array to collect 404 errors
	const notFoundItems: string[] = [];

	try {
		if (fs.existsSync(filePath)) {
			const existingData = fs.readFileSync(filePath, 'utf8');
			crafting_data = JSON.parse(existingData);
			console.log(`Loaded existing data with ${Object.keys(crafting_data).length} items`);
		} else {
			console.log('No existing file found, starting fresh');
		}
	} catch (error) {
		console.error('Error reading existing file:', error);
		console.log('Starting with empty data');
	}

	let processed = 0;
	let skipped = 0;

	const itemsSet: Set<string> = new Set();
	for (const item of CATEGORY_TREE['mainhand']['bow']) {
		itemsSet.add(item.split('@')[0]);
	}

	const itemsArray = Array.from(itemsSet);

	for (let i = 0; i < itemsSet.size; i++) {
		const item = itemsArray[i];

		// Skip if item already exists
		if (crafting_data[item]) {
			console.log(`⏭️  Skipping ${i + 1}/${itemsSet.size}: ${item} (already exists)`);
			skipped++;
			continue;
		}

		try {
			console.log(`🔄 Processing ${i + 1}/${itemsSet.size}: ${item}`);
			const info = await getItemInfo(item);

			crafting_data[item] = info.craftingRequirements?.craftResourceList.flatMap((i) => [
				i.uniqueName,
				i.count
			]);

			info.enchantments?.enchantments.forEach((enchantment) => {
				crafting_data[`${item}@${enchantment.enchantmentLevel}`] =
					enchantment.craftingRequirements.craftResourceList.flatMap((i) => [
						i.uniqueName,
						i.count
					]);
			});
			processed++;
			console.log(`✅ Completed: ${item}`);

			// Save progress every 10 items
			if (processed % 10 === 0) {
				fs.writeFileSync(filePath, JSON.stringify(crafting_data, null, 2));
				console.log(`💾 Progress saved (${processed} processed, ${skipped} skipped)`);
			}
		} catch (error: any) {
			// Check if it's a 404 error
			if (error?.status === 404) {
				notFoundItems.push(item);
				console.error(`❌ 404 Not Found: ${item}`);
			} else {
				console.error(`❌ Failed: ${item}`, error);
			}
		}
	}

	// Final save
	fs.writeFileSync(filePath, JSON.stringify(crafting_data, null, 2));

	// Save the list of 404 items to a separate file
	if (notFoundItems.length > 0) {
		fs.writeFileSync('./404-items.json', JSON.stringify(notFoundItems, null, 2));
		console.log(`\n📋 404 Not Found Items (${notFoundItems.length}):`);
		notFoundItems.forEach((item) => console.log(`   - ${item}`));
		console.log(`\n💾 404 items list saved to: ./404-items.json`);
	}

	console.log(
		`🎉 Complete! Processed: ${processed}, Skipped: ${skipped}, 404 Errors: ${notFoundItems.length}, Total: ${Object.keys(crafting_data).length}`
	);
})();
