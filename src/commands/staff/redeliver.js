import { SlashCommandBuilder } from 'discord.js';
import { redeliverOrder } from '../../lib/api.js';
import { successEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('redeliver')
  .setDescription('[Staff] Redeliver credentials for a PAID order')
  .addStringOption(o => o.setName('order-id').setDescription('Order ID (VLX-XXXXXX)').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_STAFF_ROLE_ID) && !hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('No permission.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const orderId = interaction.options.getString('order-id').toUpperCase();

  try {
    await redeliverOrder(orderId);
    interaction.editReply({ embeds: [successEmbed(`Credentials redelivered for ${orderId}.`)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to redeliver order.')] });
  }
}
