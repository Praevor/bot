import { Events } from 'discord.js';
import type { Event } from './index.js';
import { db } from '../db/index.js';
import { serversTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export default {
    name: Events.InteractionCreate,
    async execute(interaction){ 
        if (interaction.isModalSubmit()) {
            const modalId = interaction.customId;
            
            switch (modalId) {
                case "setupModal":  
                    const role = interaction.fields.getSelectedRoles("managerRole")?.first();
                    
                    if (!role) {
                        await interaction.reply({content: "No role given", flags: "Ephemeral"});
                        return;
                    }
                    
                    
                    const [server] = await db
                        .select()
                        .from(serversTable)
                        .where(eq(serversTable.id, Number(interaction.guildId)))
                        .limit(1);
                        
                    if (!server) {
                        await db
                            .insert(serversTable)
                            .values({
                                id: Number(interaction.guildId),
                                managerRoleId: role.id
                            });
                            
                        await interaction.reply({content: "Set up server!", flags: "Ephemeral"});
                        return
                    }
                    
                    await db
                        .update(serversTable)
                        .set({managerRoleId: role.id})
                        .where(eq(serversTable.id, server.id));
                        
                    await interaction.reply({content: "Updated server!", flags: "Ephemeral"})
            }
        }
    }
} satisfies Event<Events.InteractionCreate>;
