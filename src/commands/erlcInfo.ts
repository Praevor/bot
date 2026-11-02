import { callERLCapi } from "../util/callERLCapi.js";
import { getServerKey } from "../util/getServerKey.js";
import { Command } from "./index.js";

export default {
    data: {
        name: "erlc-info",
        description: "Get in game info"
    },
    async execute(interaction) {
        if (!interaction.guildId) {
            await interaction.reply({content: "You can only use this in a server", flags: "Ephemeral"});
            return;
        }
        
        const key = await getServerKey(interaction.guildId);
        
        if (!key.ok) {
            await interaction.reply({content: key.error, flags: "Ephemeral"});
            return;
        }
        
        const neededThings = ["Players", "Queue"]
        const params = new URLSearchParams()
        params.append("Player", "true");
        neededThings.forEach((n) => params.append(n, "true"));
            
        const res = await callERLCapi("/v2/server", key.data, "GET", undefined, params);
        
        if (!res.ok) {
            await interaction.reply({content: res.error, flags: "Ephemeral"});
            return;
        }
        
        await interaction.reply(JSON.stringify(res.data.body))
    }
} satisfies Command
