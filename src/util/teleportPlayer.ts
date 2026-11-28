import { Result } from '../types/Result.js';
import { callERLCapi } from './callERLCapi.js';
import { getServerKey } from './getServerKey.js';

/**
 *
 * @param guildId the discord guild id
 * @param username the roblox username of the target
 * @param userId the roblox id of the targer
 * @param location object of the X and Z cords
 * @returns nothing if success
 */
export async function teleportPlayer(
	guildId: string,
	username: string,
	userId: string,
	location: { X: string; Z: string },
): Promise<Result<undefined>> {
	const apiKey = await getServerKey(guildId);
	if (!apiKey.ok) return apiKey;

	const res = await callERLCapi('/v2/server/teleport', apiKey.data, 'POST', {
		Player: [username, userId].join(':'),
		LocationX: location.X,
		LocationZ: location.Z,
	});
	if (!res.ok) return res;
	return { ok: true, data: undefined };
}
