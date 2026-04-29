import { SlashCommandBuilder } from 'discord.js';
import { trackOrder } from '../../lib/api.js';
import { orderEmbed, errorEmbed } from '../../lib/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('track')
  .setDescription('Track an order (guest customers)')
  .addStringOption(o => o.setName('order-id').setDescription('Order ID (VLX-XXXXXX)').setRequired(true))
  .addStringOption(o => o.setName('email').setDescription('Email used at checkout').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const orderId = interaction.options.getString('order-id').toUpperCase();
  const email = interaction.options.getString('email');

  try {
    const order = await trackOrder(orderId, email);
    if (!order?.id) return interaction.editReply({ embeds: [errorEmbed('Order not found. Check your order ID and email.')] });
    interaction.editReply({ embeds: [orderEmbed(order)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to track order.')] });
  }
}
