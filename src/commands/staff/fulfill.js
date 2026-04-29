import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { updateOrder } from '../../lib/api.js';
import { successEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('fulfill')
  .setDescription('[Staff] Mark a PENDING_STOCK order as fulfilled')
  .addStringOption(o => o.setName('order-id').setDescription('Order ID (VLX-XXXXXX)').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_STAFF_ROLE_ID) && !hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('You do not have permission to use this command.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const orderId = interaction.options.getString('order-id').toUpperCase();

  try {
    await updateOrder(orderId, { status: 'PAID' });
    interaction.editReply({ embeds: [successEmbed(`Order ${orderId} marked as PAID. Delivery triggered.`)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to fulfill order.')] });
  }
}
