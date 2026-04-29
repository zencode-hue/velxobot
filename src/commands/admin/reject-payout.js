import { SlashCommandBuilder } from 'discord.js';
import { updatePayout } from '../../lib/api.js';
import { successEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('reject-payout')
  .setDescription('[Admin] Reject a partner payout request')
  .addStringOption(o => o.setName('payout-id').setDescription('Payout ID').setRequired(true))
  .addStringOption(o => o.setName('reason').setDescription('Reason for rejection').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const payoutId = interaction.options.getString('payout-id');
  const reason = interaction.options.getString('reason');

  try {
    await updatePayout(payoutId, { status: 'REJECTED', reason });
    interaction.editReply({ embeds: [successEmbed(`Payout ${payoutId} rejected.`)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to reject payout.')] });
  }
}
