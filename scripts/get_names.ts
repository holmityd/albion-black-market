import fs from 'node:fs';
import { AlbionItemInfo } from './types';
import { getJson } from '../src/lib/utils/fetch';
import all from '../src/lib/constants/crafting-data.json';

const uniqueNames = new Set<string>();
for (const item of Object.keys(all)) {
	const itemId = item.split('@')[0];
	uniqueNames.add(itemId);
}

const filePath = './src/lib/constants/base_item_names.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
async function getItemInfo(item: string) {
	return getJson<AlbionItemInfo>(
		'https://gameinfo.albiononline.com/api/gameinfo/items/' + item + '/data'
	);
}

// const itemsArr = Array.from(uniqueNames);
const itemsArr = ['T4_ARTEFACT_2H_BOW_CRYSTAL'];

async function update() {
	for (let i = 0; i < itemsArr.length; i++) {
		console.log(`${i}/${itemsArr.length}`);
		const item = itemsArr[i];
		if (data[item]) continue;
		try {
			const info = await getItemInfo(item);
			data[item] = info.localizedNames['EN-US'];
		} catch {}
	}

	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

	console.log('done');
}

update();
