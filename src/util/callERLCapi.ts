import { Result } from "../types/Result.js";

export async function callERLCapi(path: string, key: string, method: "GET" | "POST", body?: object, searchParams?: URLSearchParams): Promise<Result<{status: string, body: object}>> {
    const url = new URL(path, "https://api.erlc.gg");
    
    if (searchParams) {
        for (const [name, param] of searchParams.entries()) {
            url.searchParams.append(name, param);
        }
    }
    
    let res: Response | undefined;
    
    try {
        res = await fetch(url, {
            method,
            body: JSON.stringify(body)
        });
    } catch {
        return {ok: false, error: "Error while sending request"}
    }
    
    const json = await res.json() as any;
    
    if (!res.ok) {
        if (!json.code) return {ok: false, error: "ERLC api returned an error without a code"};
        json.code = String(json.code);
        if (json.code == "3002") return {ok: false, error: "Server offline"}
        
        switch (json.code.split()[0]) {
            case "0":
                return {ok: false, error: "Unknown error"}
            case "1":
                return {ok: false, error: "Internal error"}
            case "2":
                return {ok: false, error: "Authentication error, update ERLC api key"}
            case "3":
                return {ok: false, error: "Invalid request body"}
            case "4":
                return {ok: false, error: "Rate limited"}
            case "9":
                return {ok: false, error: "Internal error"}
            default:
                return {ok: false, error: "Unknown error"}
        }
    }
    
    return {ok: true, data: {status: res.status, body: json}}
}
