const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { METRAMART_GOLD, BOT_FOOTER, SHOP_ICON } = require('../constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq')
    .setDescription('❓  Browse MetraMart support FAQs')
    .addStringOption(option =>
      option
        .setName('topic')
        .setDescription('Select the FAQ topic')
        .setRequired(true)
        .addChoices(
          { name: 'How to Claim Orders', value: 'claim' },
          { name: 'Warranty & Replacements', value: 'warranty' },
          { name: 'Cryptocurrency Checkout', value: 'crypto' },
          { name: 'Join the Staff Team', value: 'staff' }
        )
    ),

  async execute(interaction) {
    const topic = interaction.options.getString('topic');

    const embed = new EmbedBuilder()
      .setColor(METRAMART_GOLD)
      .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
      .setTimestamp();

    if (topic === 'claim') {
      embed
        .setTitle('🎫  How do I Claim my purchased Accounts?')
        .setDescription(
          `Claiming your purchased digital credentials at **MetraMart** is fully automated:\n\n` +
          `1. Use our custom Discord command: \`/claim [your_email] [your_order_id]\`.\n` +
          `2. The bot will automatically verify your order status in our database and DM your decrypted account details instantly!\n\n` +
          `*Note: Ensure your Discord privacy settings allow Direct Messages (DMs) from server members before running `/claim`!*`
        );
    } else if (topic === 'warranty') {
      embed
        .setTitle('🛡️  What is MetraMart\'s Warranty Policy?')
        .setDescription(
          `All products sold on **MetraMart** come with a standard **30-day replacement warranty**:\n\n` +
          `• If an account stops working within 30 days of purchase, you are eligible for an automated or manual replacement.\n` +
          `• You can check your remaining active warranty days at any time by running \`/warranty [your_order_id]\`!\n` +
          `• To request a replacement, simply open a support ticket via our support channel dropdown selection.`
        );
    } else if (topic === 'crypto') {
      embed
        .setTitle('🪙  How can I pay using Cryptocurrency?')
        .setDescription(
          `We support a variety of popular cryptocurrencies for a completely secure, private checkout experience:\n\n` +
          `• Supported Cryptos: **Bitcoin (BTC)**, **Ethereum (ETH)**, **Litecoin (LTC)**, and **USDT (TRC20/ERC20)**.\n` +
          `• To pay, simply select the Cryptocurrency option during checkout on our storefront [metramart.xyz](https://metramart.xyz).\n` +
          `• Invoices are automatically verified within 1–2 blockchain confirmations, after which you can claim your products.`
        );
    } else if (topic === 'staff') {
      embed
        .setTitle('📋  How can I join the MetraMart Staff Team?')
        .setDescription(
          `We are always looking for passionate support agents and moderators to join us:\n\n` +
          `1. Go to our support center channel in this Discord server.\n` +
          `2. Select **Staff Application** from our ticket category dropdown panel.\n` +
          `3. Fill out the application questionnaire, and our administrative team will review your application within 24–48 hours!`
        );
    }

    return interaction.reply({ embeds: [embed] });
  },
};
