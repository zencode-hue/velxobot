import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { sendDiscordPush } from '../../lib/api.js';
import { errorEmbed } from '../../lib/embeds.js';
import { hasRole } from '../../lib/roles.js';

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('[Admin] Push an announcement to Discord')
  .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true));

export async function execute(interaction) {
  if (!hasRole(interaction, process.env.DISCORD_ADMIN_ROLE_ID)) {
    return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  const message = interaction.options.getString('message');

  try {
    // Post to announcements channel
    const channel = interaction.guild.channels.cache.find(c => c.name === 'announcements');
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle('📢 Velxo Shop Announcement')
        .setDescription(message)
        .setColor(0x7c4dff)
        .setTimestamp()
        .setFooter({ text: 'Velxo Shop • velxo.shop' });
      await channel.send({ embeds: [embed] });
    }

    // Also push via site API
    await sendDiscordPush({ message });
    interaction.editReply({ content: '✅ Announcement sent.' });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to send announcement.')] });
  }
}
