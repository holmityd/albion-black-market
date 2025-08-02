const ids: string[] = [
	'HEAD_PLATE_SET1',
	'HEAD_PLATE_SET2',
	'HEAD_PLATE_SET3',
	'HEAD_PLATE_UNDEAD',
	'HEAD_PLATE_ROYAL',
	'HEAD_PLATE_HELL',
	'HEAD_PLATE_KEEPER',
	'HEAD_PLATE_FEY',
	'HEAD_PLATE_AVALON'
];
const result: string[] = [];
for (const id of ids) {
	for (let i = 4; i <= 8; i++) {
		result.push(`T${i}_${id}${i - 4 ? `@${i - 4}` : ''}`);
	}
}
console.log(result);
