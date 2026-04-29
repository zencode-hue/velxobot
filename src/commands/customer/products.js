import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getProducts } from '../../lib/api.js';
import { errorEmbed } from '../../lib/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('products')
  .setDescription('Browse available products');

export async function execute(interaction) {
  await interaction.deferReply();
  try {
    const products = await getProducts();
    if (!products?.length) return interaction.editReply({ embeds: [errorEmbed('No products found.')] });

    // Group by category
    const grouped = {};
    for (const p of products) {
      const cat = p.category ?? 'OTHER';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    }

    const embed = new EmbedBuilder()
      .setTitle('🛒 Velxo Shop — Products')
      .setColor(0x7c4dff)
      .setURL('https://velxo.shop/products')
      .setFooter({ text: 'Velxo Shop • velxo.shop/products' });

    for (const [cat, items] of Object.entries(grouped)) {
      const lines = items.slice(0, 5).map(p => {
        const price = p.variants?.length
          ? `from $${Math.min(...p.variants.map(v => v.price)).toFixed(2)}`
          : `$${p.price?.toFixed(2) ?? 'N/A'}`;
        return `• **${p.name}** — ${price}`;
      });
      embed.addFields({ name: cat, value: lines.join('\n') });
    }

    interaction.editReply({ embeds: [embed] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to load products.')] });
  }
}
