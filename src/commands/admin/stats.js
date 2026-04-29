import { SlashCommandBuilder } from 'discord.js';
import { getAnalytics } from '../../lib/api.js';
import { statsEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('stats')
  .setDescription('[Admin] Show shop stats');

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  try {
    const data = await getAnalytics();
    interaction.editReply({ embeds: [statsEmbed(data)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fetch stats.')] });
  }
}
