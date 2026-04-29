import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getAnalytics } from '../../lib/api.js';
import { errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('revenue')
  .setDescription('[Admin] Revenue breakdown')
  .addStringOption(o =>
    o.setName('period')
      .setDescription('Period to view')
      .addChoices(
        { name: 'Today', value: 'today' },
        { name: 'This Week', value: 'week' },
        { name: 'This Month', value: 'month' },
      )
  );

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const period = interaction.options.getString('period') ?? 'today';

  try {
    const data = await getAnalytics(period);
    const embed = new EmbedBuilder()
      .setTitle(`💰 Revenue — ${period.charAt(0).toUpperCase() + period.slice(1)}`)
      .setColor(0x2196f3)
      .addFields(
        { name: 'Revenue', value: `$${data.revenue?.toFixed(2) ?? '0.00'}`, inline: true },
        { name: 'Orders', value: String(data.orders ?? 0), inline: true },
        { name: 'Avg Order', value: `$${data.avgOrder?.toFixed(2) ?? '0.00'}`, inline: true },
      );
    interaction.editReply({ embeds: [embed] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fetch revenue data.')] });
  }
}
