import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPendingStock } from '../../lib/api.js';
import { errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('pending-stock')
  .setDescription('[Staff] List all PENDING_STOCK orders');

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_STAFF_ROLE_ID) && !hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  try {
    const orders = await getPendingStock();
    if (!orders?.length) return interaction.editReply({ content: '✅ No pending stock orders.' });

    const embed = new EmbedBuilder()
      .setTitle('📦 Pending Stock Orders')
      .setColor(0xff6d00)
      .setDescription(orders.map(o => `• **${o.displayId ?? o.id}** — ${o.productName} — ${o.customerEmail}`).join('\n'));

    interaction.editReply({ embeds: [embed] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fetch pending stock orders.')] });
  }
}
