const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { METRAMART_GOLD, BOT_FOOTER, SHOP_ICON, SHOP_URL, SHOP_DEALS, SHOP_SUPPORT } = require('../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('menu')
    .setDescription('📋  Display the main MetraMart navigation and shortcuts menu'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🛒  Welcome to MetraMart!')
      .setDescription(
        `Welcome to **MetraMart** — your premium destination for high-quality, instant-delivery digital products!\n\n` +
        `Use the buttons below to easily navigate our services, claim your purchased accounts, check active warranties, or open a support ticket with our 24/7 staff team.`
      )
      .setColor(METRAMART_GOLD)
      .setThumbnail(SHOP_ICON)
      .addFields(
        { name: '🌐  Storefront', value: `[metramart.xyz](${SHOP_URL})`, inline: true },
        { name: '🔥  Latest Deals', value: `[Browse Special Offers](${SHOP_DEALS})`, inline: true },
        { name: '🎟️  Help Center', value: `[Open a Ticket](${SHOP_SUPPORT})`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('menu_ticket_dropdown').setLabel('Open Support Dropdown').setStyle(ButtonStyle.Primary).setEmoji('📩'),
      new ButtonBuilder().setLabel('Visit Storefront').setURL(SHOP_URL).setStyle(ButtonStyle.Link).setEmoji('🛒'),
      new ButtonBuilder().setLabel('Active Deals').setURL(SHOP_DEALS).setStyle(ButtonStyle.Link).setEmoji('🔥')
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  },
};
