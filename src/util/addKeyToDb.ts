import Cryptr from 'cryptr';
import { Result } from '../types/Result.js';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { callERLCapi } from './callERLCapi.js';

export const cryptr = new Cryptr(process.env.SECRET!);

export async function addKeyToDb(key: string, serverId: string): Promise<Result<string>> {
	const [server] = await db.select().from(serversTable).where(eq(serversTable.id, serverId)).limit(1);

	if (!server) return { ok: false, error: 'No server found' };

	let ok: boolean;
	try {
		ok = (await callERLCapi('/v2/server', key, 'GET')).ok;
	} catch {
		return { ok: false, error: 'Error while making request to ERLC api' };
	}

	if (!ok) return { ok: false, error: 'Invalid API key' };

	const encryptedKey = cryptr.encrypt(key);

	await db.update(serversTable).set({ key: encryptedKey }).where(eq(serversTable.id, serverId));

	return { ok: true, data: 'Added api key! \n-# The key in encrypted in the DB' };
}
