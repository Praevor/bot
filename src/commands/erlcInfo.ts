import { APIEmbed } from "discord.js";
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
        
        const neededThings = ["Queue"]
        const params = new URLSearchParams()
        params.append("Player", "true");
        neededThings.forEach((n) => params.append(n, "true"));
            
        const res = await callERLCapi("/v2/server", key.data, "GET", undefined, params);
        
        if (!res.ok) {
            await interaction.reply({content: res.error, flags: "Ephemeral"});
            return;
        }
        
        const server = res.data.body;
        
        const embed: APIEmbed = {
            title: server.Name,
            fields: [
                {
                    name: "Players",
                    value: `${server.CurrentPlayers}/${server.MaxPlayers}`,
                    inline: true
                },
                {
                    name: "Join Code",
                    value: server.JoinKey,
                    inline: true
                },
                {
                    name: "Queue",
                    value: String(server.Queue?.length),
                    inline: true
                }
            ],
            footer: {text: "ERLC server status"},
            author: {name: "Praevor", icon_url: "https://avatars.githubusercontent.com/u/350970298"}
        }
        
        await interaction.reply({embeds: [embed]})
    }
} satisfies Command
