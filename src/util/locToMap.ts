import sharp from "sharp";

const MAP_URL = "https://api.erlc.gg/maps/fall_postals.png";
const MAP_SIZE = 5355;
const SCALE = 1;


async function getMap(): Promise<Buffer> {
    const res = await fetch(MAP_URL);
    if (!res.ok) throw new Error(`Failed to fetch map: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
}

export async function getMapWithMark(x: number, z: number): Promise<Buffer> {
  const k = 1600 / MAP_SIZE;

    const px = (MAP_SIZE / 2 + x * SCALE) * k;
    const py = (MAP_SIZE / 2 + z * SCALE) * k;

    const svg = `
    <svg width="1600" height="1600" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${px}" cy="${py}" r="10" fill="red" stroke="white" stroke-width="3"/>
        </svg>`;

  return sharp(await getMap())
    .resize(1600, 1600)
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();
}
