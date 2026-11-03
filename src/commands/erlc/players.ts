import { APIEmbed } from "discord.js";
import { callERLCapi } from "../../util/callERLCapi.js";
import { getServerKey } from "../../util/getServerKey.js";
import { Command } from "../index.js";

export default {
    data: {
        name: "erlc-players",
        description: "Get all ERLC players"
    },
    async execute(interaction) {
        if (!interaction.guildId) {
            await interaction.reply({content: "You can only use this in a server"});
            return;
        }
        
        const apiKey = await getServerKey(interaction.guildId);
        
        if (!apiKey.ok) {
            await interaction.reply({content: apiKey.error, flags: "Ephemeral"});
            return;
        }
        
        const params = new URLSearchParams();
        params.append("Players", "true");
        
        const res = await callERLCapi("/v2/server", apiKey.data, "GET", undefined, params);
        
        if (!res.ok) {
            await interaction.reply({content: res.error, flags: "Ephemeral"});
            return;
        };
        
        const players = res.data.body.Players as {
            Team: string,
            Player: string,
            Callsign?: string,
            Location: {
                LocationX: number,
                LocationZ: number,
                PostalCode: string,
                StreetName: string,
                BuildingNumber: string
            },
            Permissions: string,
            WantedStars: number
        }[];
        
        
        const embed: APIEmbed = {
            title: "ERLC Players",
            fields: players.map((p) => {
                const [username, id] = p.Player.split(":");
                return {
                name: username,
                value: `[Roblox profile](https://roblox.com/users/${id}) \n${p.Team} ${p.Callsign ? `(${p.Callsign})` : ""} \nWanted Stars ${p.WantedStars}`
            }
            })
        };
        
        await interaction.reply({embeds: [embed]});
    }
} satisfies Command
