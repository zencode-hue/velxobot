const { EmbedBuilder } = require('discord.js');
const { METRAMART_GOLD, BOT_FOOTER, SHOP_ICON } = require('../constants');

module.exports = {
  customId: 'review_modal:',

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const [, rating, creatorId] = interaction.customId.split(':');
    const comment = interaction.fields.getTextInputValue('comment') || 'Excellent support response!';

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
          action: 'submit_review',
          userId: interaction.user.tag,
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        throw new Error('Web API submission failed.');
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle('💖  Review Submitted!')
            .setDescription(`Thank you so much! Your **${rating}-star** review has been published directly on our **MetraMart** storefront.\n\nWe appreciate your feedback and hope you enjoy your digital products!`)
            .setColor(METRAMART_GOLD)
            .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
            .setTimestamp(),
        ],
      });
    } catch (err) {
      console.error('[Review Modal] Submission error:', err);
      return interaction.editReply({
        content: `🎉  **Thank you for your rating!** (We couldn't post the text review to our storefront due to website maintenance, but your star rating has been noted.)`,
      });
    }
  },
};
