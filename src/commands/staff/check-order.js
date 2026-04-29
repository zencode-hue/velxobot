import { SlashCommandBuilder } from 'discord.js';
import { getOrder } from '../../lib/api.js';
import { orderEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('check-order')
  .setDescription('[Staff] Get full order details')
  .addStringOption(o => o.setName('order-id').setDescription('Order ID (VLX-XXXXXX)').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_STAFF_ROLE_ID) && !hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const orderId = interaction.options.getString('order-id').toUpperCase();

  try {
    const order = await getOrder(orderId);
    if (!order?.id) return interaction.editReply({ embeds: [errorEmbed('Order not found.')] });
    interaction.editReply({ embeds: [orderEmbed(order)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fetch order.')] });
  }
}
