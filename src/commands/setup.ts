import { LabelBuilder, ModalBuilder, PermissionFlagsBits, RoleSelectMenuBuilder } from "discord.js";
import { Command } from "./index.js";

export default {
    data: {
        name: "setup",
        description: "Set up or edit the server"
    },
    async execute(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({content: "Only administrators can use this command", flags: "Ephemeral"});
            return;
        }
        
        const modal = new ModalBuilder()
            .setCustomId("setupModal")
            .setTitle("Setup");
            
        const managerRoleInput = new RoleSelectMenuBuilder()
            .setCustomId("managerRole")
            .setPlaceholder("Select the manager role")
            .setMinValues(1)
            .setMaxValues(1);
            
        const roleLabel = new LabelBuilder()
            .setLabel("Manager role")
            .setDescription("The role that can change the server's settings")
            .setRoleSelectMenuComponent(managerRoleInput);
            
        modal.addLabelComponents(roleLabel);
        
        await interaction.showModal(modal);
    }
} satisfies Command
