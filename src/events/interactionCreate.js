import { closeTicket } from '../lib/tickets.js';
import { errorEmbed } from '../lib/embeds.js';

export const name = 'interactionCreate';
export const once = false;

export async function execute(interaction, client) {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`Command error [${interaction.commandName}]:`, err);
      const reply = { embeds: [errorEmbed('Something went wrong.')], ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        interaction.editReply(reply);
      } else {
        interaction.reply(reply);
      }
    }
  }

  // Button interactions
  if (interaction.isButton()) {
    if (interaction.customId === 'close_ticket') {
      await closeTicket(interaction);
    }
  }
}
