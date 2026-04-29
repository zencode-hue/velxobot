import { SlashCommandBuilder } from 'discord.js';
import { getDeals } from '../../lib/api.js';
import { dealsEmbed, errorEmbed } from '../../lib/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('deals')
  .setDescription("Show today's Deal Vault");

export async function execute(interaction) {
  await interaction.deferReply();
  try {
    const deals = await getDeals();
    if (!deals?.length) return interaction.editReply({ embeds: [errorEmbed('No deals active right now.')] });
    interaction.editReply({ embeds: [dealsEmbed(deals)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to load deals.')] });
  }
}
