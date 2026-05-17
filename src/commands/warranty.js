const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { METRAMART_GOLD, METRAMART_RED, METRAMART_GREEN, BOT_FOOTER, SHOP_ICON } = require('../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warranty')
    .setDescription('🛡️  Check the active warranty status of your purchase')
    .addStringOption(option =>
      option
        .setName('order_id')
        .setDescription('Your purchase Order ID (e.g. clx...)')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const orderId = interaction.options.getString('order_id').trim();

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
          action: 'check_warranty',
          orderId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Order verification failed.' }));
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('❌ Warranty Check Failed')
              .setDescription(`> **Error**: ${errorData.error || 'No matching order was found.'}`)
              .setColor(METRAMART_RED)
              .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
              .setTimestamp(),
          ],
        });
      }

      const data = await res.json();

      const embed = new EmbedBuilder()
        .setTitle(`🛡️ Warranty Report: \`${orderId}\``)
        .setDescription(`Active warranty verification for product order **${orderId}**:`)
        .setColor(data.isActive ? METRAMART_GREEN : METRAMART_RED)
        .addFields(
          { name: '📦 Product Item', value: `\`${data.productTitle}\``, inline: false },
          { name: '⏱️ Purchase Date', value: `\`${new Date(data.createdAt).toLocaleDateString()}\``, inline: true },
          { name: '🛡️ Expiration Date', value: `\`${new Date(data.expirationDate).toLocaleDateString()}\``, inline: true },
          {
            name: '📊 Status',
            value: data.isActive
              ? `✅ **Active Warranty** — **${data.remainingDays} days remaining**`
              : `❌ **Expired Warranty** — Eligible replacements period has passed`,
            inline: false,
          }
        )
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('[Warranty Command] Error:', err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌ Connection Error')
            .setDescription('> Could not connect to the MetraMart storefront server. Please check back shortly.')
            .setColor(METRAMART_RED)
            .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
            .setTimestamp(),
        ],
      });
    }
  },
};
