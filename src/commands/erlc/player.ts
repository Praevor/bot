import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { Command } from "../index.js";
import { getServerKey } from "../../util/getServerKey.js";
import { callERLCapi } from "../../util/callERLCapi.js";
import { Player } from "../../types/Player.js";

export default {
    data: {
        name: "erlc-player",
        description: "Get an ERLC player",
        options: [
            {
                name: "username",
                description: "The username of the player you want to get",
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    },
    async execute(interaction) {
        const username = (interaction as ChatInputCommandInteraction).options.getString('username', true);
        
        if (!interaction.guildId) {
            await interaction.reply({content: "This can be only ran in a server", flags: "Ephemeral"});
            return;
        }
        
        const key = await getServerKey(interaction.guildId);
        
        if (!key.ok) {
            await interaction.reply({content: key.error, flags: "Ephemeral"});
            return;
        }
        
        const params = new URLSearchParams();
        params.append("Players", "true");
        
        const res = await callERLCapi("/v2/server", key.data, "GET", undefined, params);
        if (!res.ok) {
            await interaction.reply({content: res.error, flags: "Ephemeral"});
            return;
        }
        
        const players = res.data.body.Players as Player[];
        
        const player = players.find((p) => p.Player.split(":")[0] === username);
        if (!player) {
            await interaction.reply({content: "Player not found in game", flags: "Ephemeral"});
            return;
        }
        
        await interaction.reply(JSON.stringify(player));
    }
} satisfies Command
