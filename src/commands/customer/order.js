import { SlashCommandBuilder } from 'discord.js';
import { getOrder } from '../../lib/api.js';
import { orderEmbed, errorEmbed } from '../../lib/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('order')
  .setDescription('Look up an order by ID')
  .addStringOption(o => o.setName('order-id').setDescription('Order ID (e.g. VLX-A3F9C2)').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const orderId = interaction.options.getString('order-id').toUpperCase();

  if (!/^VLX-[A-Z0-9]{6}$/.test(orderId)) {
    return interaction.editReply({ embeds: [errorEmbed('Invalid order ID format. Use VLX-XXXXXX')] });
  }

  try {
    const order = await getOrder(orderId);
    if (!order?.id) return interaction.editReply({ embeds: [errorEmbed('Order not found.')] });
    interaction.editReply({ embeds: [orderEmbed(order)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fetch order. Try again later.')] });
  }
}
