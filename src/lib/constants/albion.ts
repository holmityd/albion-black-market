export const CLIENT_VERSION = '0.4';
export const DATA_ROUTE = 'https://www.albion-online-data.com/api/v2/stats/prices/';
export const TAX = 0.06;

export const CITY_LIST = [
	'Lymhurst', 'Bridgewatch', 'Fortsterling', 'Caerleon', 'Martlock', 'Thetford'
];

export const FILE_LIST = [
	'accessories.txt', 'armor1.txt', 'armor2.txt', 'armor3.txt', 'armor4.txt',
	'armor5.txt', 'armor6.txt', 'magic1.txt', 'magic2.txt', 'magic3.txt',
	'magic4.txt', 'melee1.txt', 'melee2.txt', 'melee3.txt', 'melee4.txt',
	'melee5.txt', 'off-hand1.txt', 'off-hand2.txt', 'ranged1.txt',
	'ranged2.txt', 'custom.txt'
];

export const QUALITY_LIST = ['normal', 'good', 'outstanding', 'excellent', 'masterpiece'];

export const ID_TO_NAME: Record<string, string> = {
	"T2_BAG": "Novice's Bag",
	"T3_BAG": "Journeyman's Bag",
	"T4_BAG": "Adept's Bag",
	"T5_BAG": "Expert's Bag",
	"T6_BAG": "Master's Bag",
	"T7_BAG": "Grandmaster's Bag",
	"T8_BAG": "Elder's Bag",
	"T4_CAPE": "Adept's Cape",
	"T5_CAPE": "Expert's Cape",
	"T6_CAPE": "Master's Cape",
	"T7_CAPE": "Grandmaster's Cape",
	"T8_CAPE": "Elder's Cape",
	"T2_ARMOR_CLOTH_SET1": "Novice's Scholar Robe",
	"T3_ARMOR_CLOTH_SET1": "Journeyman's Scholar Robe",
	"T4_ARMOR_CLOTH_SET1": "Adept's Scholar Robe",
	"T5_ARMOR_CLOTH_SET1": "Expert's Scholar Robe",
	"T6_ARMOR_CLOTH_SET1": "Master's Scholar Robe",
	"T7_ARMOR_CLOTH_SET1": "Grandmaster's Scholar Robe",
	"T8_ARMOR_CLOTH_SET1": "Elder's Scholar Robe"
};

export const ITEM_LISTS: Record<string, string[]> = {
	'armor1.txt': [
		'T2_ARMOR_CLOTH_SET1', 'T3_ARMOR_CLOTH_SET1', 'T4_ARMOR_CLOTH_SET1',
		'T4_ARMOR_CLOTH_SET1@1', 'T4_ARMOR_CLOTH_SET1@2', 'T4_ARMOR_CLOTH_SET1@3',
		'T5_ARMOR_CLOTH_SET1', 'T5_ARMOR_CLOTH_SET1@1', 'T5_ARMOR_CLOTH_SET1@2',
		'T5_ARMOR_CLOTH_SET1@3', 'T6_ARMOR_CLOTH_SET1', 'T6_ARMOR_CLOTH_SET1@1'
	],
	'accessories.txt': [
		'T2_BAG', 'T3_BAG', 'T4_BAG', 'T4_BAG@1', 'T4_BAG@2', 'T4_BAG@3',
		'T5_BAG', 'T5_BAG@1', 'T5_BAG@2', 'T5_BAG@3', 'T6_BAG', 'T6_BAG@1',
		'T4_CAPE', 'T4_CAPE@1', 'T4_CAPE@2', 'T4_CAPE@3', 'T5_CAPE', 'T5_CAPE@1'
	]
};