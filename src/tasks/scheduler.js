import cron from 'node-cron';
import { getDeals, getPendingStock, getLowStock, getPayouts } from '../lib/api.js';
import { dealsEmbed } from '../lib/embeds.js';
import { EmbedBuilder } from 'discord.js';

export function startScheduler(client) {
  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
  if (!guild) return console.warn('Scheduler: Guild not found');

  const getChannel = (id) => guild.channels.cache.get(id);

  // Daily deals at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    try {
      const deals = await getDeals();
      const ch = getChannel(process.env.DISCORD_DEALS_CHANNEL_ID);
      if (ch && deals?.length) await ch.send({ embeds: [dealsEmbed(deals)] });
    } catch (e) { console.error('Scheduler [deals]:', e); }
  }, { timezone: 'UTC' });

  // Check pending stock every 15 min — alert staff
  cron.schedule('*/15 * * * *', async () => {
    try {
      const orders = await getPendingStock();
      if (!orders?.length) return;
      const ch = getChannel(process.env.DISCORD_PENDING_STOCK_CHANNEL_ID);
      if (!ch) return;
      const embed = new EmbedBuilder()
        .setTitle('📦 Pending Stock Alert')
        .setColor(0xff6d00)
        .setDescription(`${orders.length} order(s) awaiting stock fulfillment.`)
        .addFields(orders.slice(0, 5).map(o => ({
          name: o.displayId ?? o.id,
          value: `${o.productName} — ${o.customerEmail}`,
          inline: true,
        })));
      await ch.send({ content: `<@&${process.env.DISCORD_STAFF_ROLE_ID}>`, embeds: [embed] });
    } catch (e) { console.error('Scheduler [pending-stock]:', e); }
  });

  // Low stock check every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const products = await getLowStock();
      if (!products?.length) return;
      const ch = getChannel(process.env.DISCORD_ALERTS_CHANNEL_ID);
      if (!ch) return;
      const embed = new EmbedBuilder()
        .setTitle('⚠️ Low Stock Alert')
        .setColor(0xffd600)
        .setDescription(products.map(p => `• **${p.name}** — ${p.stock} left`).join('\n'));
      await ch.send({ content: `<@&${process.env.DISCORD_ADMIN_ROLE_ID}>`, embeds: [embed] });
    } catch (e) { console.error('Scheduler [low-stock]:', e); }
  });

  // Payout requests check every hour
  cron.schedule('30 * * * *', async () => {
    try {
      const payouts = await getPayouts();
      const pending = payouts?.filter(p => p.status === 'PENDING');
      if (!pending?.length) return;
      const ch = getChannel(process.env.DISCORD_PAYOUTS_CHANNEL_ID);
      if (!ch) return;
      const embed = new EmbedBuilder()
        .setTitle('💰 Pending Payout Requests')
        .setColor(0x2196f3)
        .setDescription(pending.map(p => `• **${p.partnerName}** — $${p.amount?.toFixed(2)}`).join('\n'));
      await ch.send({ content: `<@&${process.env.DISCORD_ADMIN_ROLE_ID}>`, embeds: [embed] });
    } catch (e) { console.error('Scheduler [payouts]:', e); }
  });

  console.log('⏰ Scheduler started');
}
