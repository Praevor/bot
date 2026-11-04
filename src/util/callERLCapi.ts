import { Result } from '../types/Result.js';

export async function callERLCapi(
	path: string,
	key: string,
	method: 'GET' | 'POST',
	body?: object,
	searchParams?: URLSearchParams,
): Promise<Result<{ status: string; body: object }>> {
	const auth = process.env.AUTH;
	if (!auth) throw new Error('No AUTH key in env');

	const url = new URL(path, 'https://api.erlc.gg');

	if (searchParams) {
		for (const [name, param] of searchParams.entries()) {
			url.searchParams.append(name, param);
		}
	}

	let res: Response | undefined;

	try {
		res = await fetch(url, {
			method,
			headers: {
				'server-key': key,
				Authorization: auth,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
	} catch {
		return { ok: false, error: 'Error while sending request' };
	}

	const json = (await res.json()) as any;

	if (!res.ok) {
		if (!json.code) return { ok: false, error: 'ERLC api returned an error without a code' };
		json.code = String(json.code);
		if (json.code === '3002') return { ok: false, error: 'Server offline' };
		if (res.status === 403) return { ok: false, error: 'Forbitten, you might need to authorize preavor with /auth' };

		switch (json.code.split('')[0]) {
			case '0':
				return { ok: false, error: `Unknown error, status code: ${res.status}` };
			case '1':
				return { ok: false, error: 'Internal error' };
			case '2':
				return { ok: false, error: 'Authentication error, update ERLC api key' };
			case '3':
				return { ok: false, error: 'Invalid request body' };
			case '4':
				return { ok: false, error: 'Rate limited' };
			case '9':
				return { ok: false, error: 'Internal error' };
			default:
				return { ok: false, error: `Unknown error, status code: ${res.status}` };
		}
	}

	return { ok: true, data: { status: res.status, body: json } };
}
