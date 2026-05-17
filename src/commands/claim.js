const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { METRAMART_GOLD, METRAMART_RED, SHOP_URL, BOT_FOOTER, SHOP_ICON } = require('../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('🎫  Claim and instantly receive your purchased product accounts')
    .addStringOption(option =>
      option
        .setName('email')
        .setDescription('The email address you used during checkout')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('order_id')
        .setDescription('Your purchase Order ID (e.g. clx...)')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Defer the reply since payment check and decryption requires database/web network queries
    await interaction.deferReply({ ephemeral: true });

    const email = interaction.options.getString('email');
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
          action: 'claim_order',
          email,
          orderId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Verification failed. Database offline.' }));
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('❌  Claim Verification Failed')
              .setDescription(`> **Error**: ${errorData.error || 'An unexpected error occurred.'}`)
              .setColor(METRAMART_RED)
              .setTimestamp()
              .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON }),
          ],
        });
      }

      const data = await res.json();

      // Attempt to send the credentials via Direct Messages (DM) for supreme privacy
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle('🎉  Your Purchase is Ready!')
          .setDescription(`Thank you for shopping at **MetraMart**! Your order **${orderId}** has been successfully claimed and verified.`)
          .setColor(METRAMART_GOLD)
          .addFields(
            { name: '📦 Product', value: `\`${data.productTitle}\``, inline: true },
            { name: '✨ Variant', value: `\`${data.variantName}\``, inline: true },
            { name: '🔑 Credentials / Access Instructions', value: `\`\`\`text\n${data.credentials}\n\`\`\``, inline: false }
          )
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
          .setTimestamp();

        await interaction.user.send({ embeds: [dmEmbed] });

        // Add Customer VIP role to member if configured in the guild
        try {
          const roleId = process.env.CUSTOMER_ROLE_ID || '1387773245943713903'; // Fallback or read from guild
          const role = interaction.guild.roles.cache.get(roleId);
          if (role) {
            await interaction.member.roles.add(role);
          }
        } catch (roleErr) {
          console.warn('[Claim] Could not grant role to customer:', roleErr.message);
        }

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('🎉  Claim Successful!')
              .setDescription(`### order successfully verified.\nYour product accounts have been delivered directly to your **DMs**!\n\n*(Check your Discord Direct Messages. If you didn't receive them, please make sure your direct messages are open for this server.)*`)
              .setColor(METRAMART_GOLD)
              .setTimestamp()
              .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON }),
          ],
        });
      } catch (dmErr) {
        console.error('[Claim] DM dispatch failed:', dmErr);
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('⚠️  DMs Blocked!')
              .setDescription(`### Order verified, but we couldn't DM your credentials.\n\n**Please follow these steps:**\n1. Enable **Direct Messages** from server members in your Privacy settings.\n2. Re-run \`/claim\` again to receive your credentials securely.`)
              .setColor(METRAMART_RED)
              .setTimestamp()
              .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON }),
          ],
        });
      }
    } catch (err) {
      console.error('[Claim Command] error:', err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('❌  Network Error')
            .setDescription('> Could not connect to the MetraMart storefront server. Please try again in a few moments.')
            .setColor(METRAMART_RED)
            .setTimestamp()
            .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON }),
        ],
      });
    }
  },
};
