const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { METRAMART_GOLD, BOT_FOOTER, SHOP_ICON } = require('../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📊  View real-time MetraMart Bot status and metrics'),

  async execute(interaction, client) {
    const uptimeMs = client.uptime || 0;
    const days = Math.floor(uptimeMs / 86400000);
    const hours = Math.floor((uptimeMs % 86400000) / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    const seconds = Math.floor((uptimeMs % 60000) / 1000);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const guildCount = client.guilds.cache.size;
    const latency = client.ws.ping || 5;

    // Estimate active ticket channels in the current guild
    const activeTickets = interaction.guild
      ? interaction.guild.channels.cache.filter(
          c => c.name && (c.name.startsWith('support-') || c.name.startsWith('order-') || c.name.startsWith('application-'))
        ).size
      : 0;

    const embed = new EmbedBuilder()
      .setTitle('📊  MetraMart Bot Live System Analytics')
      .setDescription('Here are the current operational metrics for the MetraMart Discord client.')
      .setColor(METRAMART_GOLD)
      .addFields(
        { name: '🟢  Gateway Status', value: '```ONLINE```', inline: true },
        { name: '⚡  API Latency', value: `\`\`\`${latency} ms\`\`\``, inline: true },
        { name: '⏱️  System Uptime', value: `\`\`\`${uptimeStr}\`\`\``, inline: false },
        { name: '📁  Servers Served', value: `\`\`\`${guildCount} Guilds\`\`\``, inline: true },
        { name: '📩  Active Tickets', value: `\`\`\`${activeTickets} Opened\`\`\``, inline: true }
      )
      .setThumbnail(SHOP_ICON)
      .setTimestamp()
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    return interaction.reply({ embeds: [embed] });
  },
};
