import { SlashCommandBuilder } from 'discord.js';
import { getDeals } from '../../lib/api.js';
import { dealsEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('deals-push')
  .setDescription("[Admin] Manually push today's deals to the deals channel");

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  try {
    const deals = await getDeals();
    if (!deals?.length) return interaction.editReply({ content: 'No active deals to push.' });

    const channel = interaction.guild.channels.cache.get(process.env.DISCORD_DEALS_CHANNEL_ID);
    if (!channel) return interaction.editReply({ embeds: [errorEmbed('Deals channel not configured.')] });

    await channel.send({ embeds: [dealsEmbed(deals)] });
    interaction.editReply({ content: '✅ Deals pushed.' });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to push deals.')] });
  }
}
