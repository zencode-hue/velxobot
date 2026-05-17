const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'review_rating:',

  async execute(interaction) {
    const [, rating, creatorId] = interaction.customId.split(':');

    const modal = new ModalBuilder()
      .setCustomId(`review_modal:${rating}:${creatorId}`)
      .setTitle(`✨ Rate MetraMart Support: ${rating} Star`);

    const commentInput = new TextInputBuilder()
      .setCustomId('comment')
      .setLabel('Tell us about your experience (optional)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Your feedback helps us improve our customer support and digital goods delivery...')
      .setRequired(false)
      .setMaxLength(500);

    modal.addComponents(new ActionRowBuilder().addComponents(commentInput));

    await interaction.showModal(modal);
  },
};
