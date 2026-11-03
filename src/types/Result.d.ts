export type Result<T> = { ok: true; data: t } | { ok: false; error: string };
