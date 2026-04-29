import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getLowStock } from '../../lib/api.js';
import { errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('low-stock')
  .setDescription('[Staff] Show products with low inventory');

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_STAFF_ROLE_ID) && !hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  try {
    const products = await getLowStock();
    if (!products?.length) return interaction.editReply({ content: '✅ No low stock products.' });

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Low Stock Products')
      .setColor(0xff6d00)
      .setDescription(products.map(p => `• **${p.name}** — ${p.stock} remaining`).join('\n'));

    interaction.editReply({ embeds: [embed] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fetch stock data.')] });
  }
}
