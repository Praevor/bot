import { db } from '../db/index.js';
import { moderationsTable } from '../db/schema.js';
import { Player } from '../types/Player.js';
import { Result } from '../types/Result.js';
import { callERLCapi } from './callERLCapi.js';
import { getServer } from './getServer.js';
import { getServerKey } from './getServerKey.js';

export async function newLog(
	serverId: string,
	moderatorId: string,
	robloxUsername: string,
	punishmentType: 'WARNING' | 'KICK' | 'BAN',
	moderatorRole: 'USER' | 'MODERATOR' | 'MANAGER' | 'ADMIN',
	reason: string,
): Promise<Result<string>> {
	if (moderatorRole === 'USER') return { ok: false, error: "You don't have permissions to use this" };
	if (punishmentType === 'BAN' && moderatorRole === 'MODERATOR')
		return { ok: false, error: "You don't have permissions to ban someone" };

	const robloxRes = await fetch('https://users.roblox.com/v1/usernames/users', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			usernames: [robloxUsername],
			excludeBannedUsers: false,
		}),
	});
	if (!robloxRes.ok) return { ok: false, error: `Error while contacting Roblox api: ${robloxRes.status}` };

	const robloxJson = (await robloxRes.json()) as any;

	if (robloxJson.data.lenght === 0) return { ok: false, error: 'Roblox user not found' };

	const robloxId = robloxJson.data[0].id as string;

	const server = await getServer(serverId);
	const key = await getServerKey(serverId);
	if (!server || !key.ok) return { ok: false, error: 'Server not found' };

	await db.insert(moderationsTable).values({
		serverId,
		robloxUsername,
		robloxId,
		punishmentType,
		moderatorId,
		reason,
	});

	const params = new URLSearchParams();
	params.append('Players', 'true');

	const erlcPlayers = await callERLCapi('/v2/server', key.data, 'GET', undefined, params);
	if (!erlcPlayers.ok) return { ok: false, error: erlcPlayers.error };
	const players = erlcPlayers.data.body as Player[];

	const player = players.find((p) => p.Player.split(':')[0] === robloxUsername);
	if (!player) {
		if (punishmentType === 'BAN') {
			const res = await callERLCapi('/v2/server/command', key.data, 'POST', { command: `:ban ${robloxId}` });
			if (!res.ok) return { ok: false, error: `Logged but got error while banning: ${res.error}` };
			return { ok: true, data: 'Player not found in game but banned and logged' };
		}

		return { ok: true, data: 'Logged but player not found in game' };
	}

	const res = await callERLCapi('/v2/server/command', key.data, 'POST', {
		command: `:pm ${robloxUsername} You have received a ${punishmentType.toLowerCase()} for the reason ${reason}`,
	});
	if (!res.ok) return { ok: false, error: `Logged but got error while PMing: ${res.error}` };
	if (punishmentType !== 'KICK') return { ok: true, data: 'Sucessfuly logged' };

	await new Promise<void>((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds before kicking

	await callERLCapi('/v2/server/command', key.data, 'POST', { command: `:kick ${robloxUsername}` });
	return { ok: true, data: 'Successfuly logged' };
}
