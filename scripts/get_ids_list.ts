const ids: string[] = [
	'RANDOM_DUNGEON_SOLO_TOKEN_1',
	'RANDOM_DUNGEON_TOKEN_1',
	'RANDOM_DUNGEON_ELITE_TOKEN_D1'
];
const result: string[] = [];
for (const id of ids) {
	for (let i = 4; i <= 8; i++) {
		result.push(`T${i}_${id}${i - 4 ? `@${i - 4}` : ''}`);
	}
}
console.log(result);
