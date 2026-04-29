import { SlashCommandBuilder } from 'discord.js';
import { openTicket } from '../../lib/tickets.js';

export const data = new SlashCommandBuilder()
  .setName('support')
  .setDescription('Open a support ticket');

export async function execute(interaction) {
  await openTicket(interaction);
}
