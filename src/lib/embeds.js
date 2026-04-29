import { EmbedBuilder } from 'discord.js';

const STATUS_COLORS = {
  PAID: 0x00c853,
  PENDING: 0xffd600,
  PENDING_STOCK: 0xff6d00,
  FAILED: 0xd50000,
  REFUNDED: 0x9e9e9e,
};

export function orderEmbed(order) {
  const color = STATUS_COLORS[order.status] ?? 0x7c4dff;
  return new EmbedBuilder()
    .setTitle(`Order ${order.displayId ?? order.id}`)
    .setColor(color)
    .addFields(
      { name: 'Product', value: order.productName ?? 'N/A', inline: true },
      { name: 'Amount', value: `$${order.amount?.toFixed(2) ?? '0.00'}`, inline: true },
      { name: 'Status', value: order.status ?? 'N/A', inline: true },
      { name: 'Payment', value: order.paymentMethod ?? 'N/A', inline: true },
      { name: 'Date', value: order.createdAt ? new Date(order.createdAt).toUTCString() : 'N/A', inline: true },
    )
    .setURL(`https://velxo.shop/invoice/${order.id}`)
    .setFooter({ text: 'Velxo Shop • velxo.shop' });
}

export function productEmbed(product) {
  const variants = product.variants?.map(v => `${v.name}: $${v.price?.toFixed(2)}`).join('\n');
  const price = variants
    ? `From $${Math.min(...product.variants.map(v => v.price)).toFixed(2)}`
    : `$${product.price?.toFixed(2) ?? 'N/A'}`;

  return new EmbedBuilder()
    .setTitle(product.name)
    .setColor(0x7c4dff)
    .setThumbnail(product.image ?? null)
    .addFields(
      { name: 'Price', value: price, inline: true },
      { name: 'Category', value: product.category ?? 'N/A', inline: true },
      { name: 'Stock', value: product.inStock ? '✅ In Stock' : '❌ Out of Stock', inline: true },
      ...(variants ? [{ name: 'Variants', value: variants }] : []),
    )
    .setURL(`https://velxo.shop/products/${product.slug ?? product.id}`)
    .setFooter({ text: 'Velxo Shop • velxo.shop' });
}

export function dealsEmbed(deals) {
  const embed = new EmbedBuilder()
    .setTitle('🔥 DEAL VAULT — Today\'s Deals')
    .setColor(0x00ff88)
    .setDescription(`${deals.length} deals at **20% OFF** — resets at midnight UTC`)
    .setFooter({ text: 'Velxo Shop • Deals reset daily at midnight UTC' });

  deals.slice(0, 7).forEach(d => {
    embed.addFields({
      name: d.productName,
      value: `~~$${d.originalPrice?.toFixed(2)}~~ → **$${d.dealPrice?.toFixed(2)}**`,
      inline: true,
    });
  });
  return embed;
}

export function statsEmbed(data) {
  return new EmbedBuilder()
    .setTitle('📊 Velxo Stats')
    .setColor(0x2196f3)
    .addFields(
      { name: "Today's Revenue", value: `$${data.todayRevenue?.toFixed(2) ?? '0.00'} (${data.todayOrders ?? 0} orders)`, inline: true },
      { name: 'This Week', value: `$${data.weekRevenue?.toFixed(2) ?? '0.00'}`, inline: true },
      { name: 'This Month', value: `$${data.monthRevenue?.toFixed(2) ?? '0.00'}`, inline: true },
      { name: 'Pending Orders', value: String(data.pendingOrders ?? 0), inline: true },
      { name: 'Pending Stock', value: String(data.pendingStock ?? 0), inline: true },
      { name: 'Total Users', value: String(data.totalUsers ?? 0), inline: true },
    )
    .setFooter({ text: 'Velxo Shop • velxo.shop' });
}

export function errorEmbed(message) {
  return new EmbedBuilder().setColor(0xd50000).setDescription(`❌ ${message}`);
}

export function successEmbed(message) {
  return new EmbedBuilder().setColor(0x00c853).setDescription(`✅ ${message}`);
}
