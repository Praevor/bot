import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { serversTable } from "../db/schema.js";
import { Result } from "../types/Result.js";
import { cryptr } from "./addKeyToDb.js";

/**
 * gets the ERLC api key
 * @param id the guild id
 */
export async function getServerKey(id: string): Promise<Result<string>> {
    const [server] = await db
        .select()
        .from(serversTable)
        .where(eq(serversTable.id, id))
        .limit(1);
        
    if (!server) return {ok: false, error: "Server not found"};
    if (!server.key) return {ok: false, error: "Key not set"};
    
    const decryptedKey = cryptr.decrypt(server.key);
    
    return {ok: true, data: decryptedKey}
}
