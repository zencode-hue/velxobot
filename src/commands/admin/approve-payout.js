import { SlashCommandBuilder } from 'discord.js';
import { updatePayout } from '../../lib/api.js';
import { successEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('approve-payout')
  .setDescription('[Admin] Approve a partner payout request')
  .addStringOption(o => o.setName('payout-id').setDescription('Payout ID').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const payoutId = interaction.options.getString('payout-id');

  try {
    await updatePayout(payoutId, { status: 'APPROVED' });
    interaction.editReply({ embeds: [successEmbed(`Payout ${payoutId} approved.`)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to approve payout.')] });
  }
}
