import { Player } from '@erlcjs/core';
import { drawMap } from '@erlcjs/map';

const MAP_URL = 'https://api.erlc.gg/maps/fall_postals.png';
let mapCache: Buffer | undefined;

async function getMap(): Promise<Buffer> {
	if (mapCache) return mapCache;
	const res = await fetch(MAP_URL);
	if (!res.ok) throw new Error(`Failed to fetch map: ${res.status}`);
	mapCache = Buffer.from(await res.arrayBuffer());
	return mapCache;
}

interface PlayerType {
	id: number;
	team: string;
	location: {
		x: number;
		z: number;
	};
}

export async function locToMap(players: PlayerType[]): Promise<Buffer> {
	const p = players as unknown as Player[];

	const map = await drawMap({
		players: p,
		map: await getMap(),
		showModCalls: false,
	});

	return map;
}
