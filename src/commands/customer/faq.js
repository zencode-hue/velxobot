import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('faq')
  .setDescription('Frequently asked questions');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('❓ Velxo Shop — FAQ')
    .setColor(0x7c4dff)
    .addFields(
      { name: '⚡ How fast is delivery?', value: 'Instant — credentials are sent to your email seconds after payment.' },
      { name: '💳 What payment methods are accepted?', value: 'Crypto (100+ coins), Binance Gift Card, Wallet Balance, Discord Manual.' },
      { name: '🔄 What if my product doesn\'t work?', value: 'Contact support within 24 hours with your Order ID. We guarantee a replacement.' },
      { name: '💰 Can I get a refund?', value: 'All sales are final for digital products. We offer replacements, not cash refunds.' },
      { name: '📦 What is PENDING_STOCK?', value: 'Payment received but stock is temporarily unavailable. Staff will fulfill manually, usually within hours.' },
      { name: '🤝 How does the affiliate program work?', value: 'Earn 10% store credit for every referral. Apply from your dashboard at velxo.shop/dashboard.' },
      { name: '🏦 What is a Binance Gift Card?', value: 'A USDT gift card purchased on Eneba and redeemed on our site. Use /how-to-pay for a step-by-step guide.' },
    )
    .setFooter({ text: 'Velxo Shop • support@velxo.shop' });

  interaction.reply({ embeds: [embed] });
}
