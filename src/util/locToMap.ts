import sharp from 'sharp';

const MAP_URL = 'https://api.erlc.gg/maps/fall_postals.png';
const MAP_SIZE = 5355;
let mapCache: Buffer | undefined;

async function getMap(): Promise<Buffer> {
	if (mapCache) return mapCache;
	const res = await fetch(MAP_URL);
	if (!res.ok) throw new Error(`Failed to fetch map: ${res.status}`);
	mapCache = Buffer.from(await res.arrayBuffer());
	return mapCache;
}

export async function locToMap(x: number, z: number): Promise<Buffer> {
	const OUT = 1600;
	const k = OUT / MAP_SIZE;

	const px = x * k;
	const py = z * k;

	const svg = `<svg width="${OUT}" height="${OUT}" xmlns="http://www.w3.org/2000/svg"><circle cx="${px}" cy="${py}" r="6" fill="red" stroke="white" stroke-width="2"/></svg>`;

	return sharp(await getMap())
		.resize(OUT, OUT)
		.composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
		.png()
		.toBuffer();
}
