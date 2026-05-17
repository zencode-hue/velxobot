const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { METRAMART_GOLD, METRAMART_RED, METRAMART_GREEN, BOT_FOOTER, SHOP_ICON } = require('../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duty')
    .setDescription('⚙️  Manage staff duty shifts and performance trackers')
    .addSubcommand(sub =>
      sub.setName('start').setDescription('🟢  Start your active support duty shift')
    )
    .addSubcommand(sub =>
      sub.setName('stop').setDescription('🔴  Stop your active support duty shift and log session time')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const staffRoleId = process.env.STAFF_ROLE_ID;

    // Guard command access to staff only
    if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: '⚠️  **Access Denied**: Only support staff members can use shift duty tracking.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:3000';
      const bypassKey = process.env.INTERNAL_BYPASS_KEY || 'metramart-ai-secret-2024';

      const res = await fetch(`${websiteUrl}/api/bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-AI-Bypass': bypassKey,
        },
        body: JSON.stringify({
          action: 'duty_log',
          userId: interaction.user.id,
          userTag: interaction.user.tag,
          type: subcommand,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Database update failed.' }));
        return interaction.editReply({
          content: `❌ **Shift Update Failed**: ${errorData.error || 'An error occurred.'}`,
        });
      }

      if (subcommand === 'start') {
        const embed = new EmbedBuilder()
          .setTitle('🟢 Shift Started')
          .setDescription(` Moderator ${interaction.user} is now **ON DUTY** and ready to handle customer tickets!`)
          .setColor(METRAMART_GREEN)
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
          .setTimestamp();

        // Broadcast ON DUTY message to staff channel
        const staffChId = process.env.LOG_CHANNEL_ID;
        const staffCh = interaction.guild.channels.cache.get(staffChId);
        if (staffCh) {
          await staffCh.send({ embeds: [embed] });
        }

        return interaction.editReply({
          content: '🟢 **Shift successfully started! Your active duty log has initiated.**',
        });
      }

      if (subcommand === 'stop') {
        const data = await res.json();
        
        // Format Duration
        const totalSecs = Math.floor(data.durationMs / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const readableDuration = `${hours}h ${mins}m`;

        const embed = new EmbedBuilder()
          .setTitle('🔴 Shift Completed')
          .setDescription(` Moderator ${interaction.user} has successfully clocked **OFF DUTY**.\n\n` +
            `⏱️ **Shift Duration**: \`${readableDuration}\`\n` +
            `📅 **Shift Ended**: \`${new Date(data.stopTime).toLocaleTimeString()}\``
          )
          .setColor(METRAMART_RED)
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
          .setTimestamp();

        // Broadcast OFF DUTY report to staff channel
        const staffChId = process.env.LOG_CHANNEL_ID;
        const staffCh = interaction.guild.channels.cache.get(staffChId);
        if (staffCh) {
          await staffCh.send({ embeds: [embed] });
        }

        return interaction.editReply({
          content: `🔴 **Shift clocked off successfully! Total session duration: \`${readableDuration}\`.**`,
        });
      }
    } catch (err) {
      console.error('[Duty Command] Error:', err);
      return interaction.editReply({
        content: '❌ **Shift Update Failed**: Storefront database connection timed out.',
      });
    }
  },
};
