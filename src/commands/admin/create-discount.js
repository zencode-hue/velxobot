import { SlashCommandBuilder } from 'discord.js';
import { createDiscount } from '../../lib/api.js';
import { successEmbed, errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('create-discount')
  .setDescription('[Admin] Create a discount code')
  .addStringOption(o => o.setName('code').setDescription('Discount code').setRequired(true))
  .addStringOption(o =>
    o.setName('type').setDescription('Type').setRequired(true)
      .addChoices({ name: 'Percentage', value: 'PERCENTAGE' }, { name: 'Fixed', value: 'FIXED' })
  )
  .addNumberOption(o => o.setName('value').setDescription('Discount value (% or $)').setRequired(true))
  .addIntegerOption(o => o.setName('limit').setDescription('Usage limit').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const code = interaction.options.getString('code').toUpperCase();
  const type = interaction.options.getString('type');
  const value = interaction.options.getNumber('value');
  const limit = interaction.options.getInteger('limit');

  try {
    await createDiscount({ code, type, value, usageLimit: limit });
    interaction.editReply({ embeds: [successEmbed(`Discount code **${code}** created (${type === 'PERCENTAGE' ? value + '%' : '$' + value} off, limit: ${limit}).`)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to create discount code.')] });
  }
}
