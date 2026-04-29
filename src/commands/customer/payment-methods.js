import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('payment-methods')
  .setDescription('View all accepted payment methods');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('💳 Payment Methods — Velxo Shop')
    .setColor(0x7c4dff)
    .addFields(
      { name: '🔒 Crypto (NOWPayments)', value: 'BTC, ETH, USDT, and 100+ coins. Instant confirmation.' },
      { name: '🎁 Binance Gift Card', value: 'Purchase a USDT gift card on Eneba and redeem it on our site. Not available in US/CA/MX.' },
      { name: '💰 Wallet Balance', value: 'Pre-loaded store credit. Top up from your dashboard.' },
      { name: '💬 Discord Manual', value: 'Pay manually via Discord DM with a staff member.' },
    )
    .setFooter({ text: 'Velxo Shop • velxo.shop' });

  interaction.reply({ embeds: [embed] });
}
