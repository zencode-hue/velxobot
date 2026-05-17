const { MessageFlags } = require('discord.js');
const { buildPanelEmbed, buildPanelComponents } = require('../commands/panel');

module.exports = {
  customId: 'menu_ticket_dropdown',

  async execute(interaction) {
    const embed = buildPanelEmbed();
    const [selectRow, buttonRow] = buildPanelComponents();

    return interaction.reply({
      embeds: [embed],
      components: [selectRow, buttonRow],
      flags: MessageFlags.Ephemeral
    });
  },
};
