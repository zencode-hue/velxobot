import { SlashCommandBuilder } from 'discord.js';
import { getProducts } from '../../lib/api.js';
import { productEmbed, errorEmbed } from '../../lib/embeds.js';

export const data = new SlashCommandBuilder()
  .setName('price')
  .setDescription('Search for a product price')
  .addStringOption(o => o.setName('product').setDescription('Product name to search').setRequired(true));

export async function execute(interaction) {
  await interaction.deferReply();
  const query = interaction.options.getString('product').toLowerCase();

  try {
    const products = await getProducts();
    const match = products?.find(p => p.name?.toLowerCase().includes(query));
    if (!match) return interaction.editReply({ embeds: [errorEmbed(`No product found matching "${query}".`)] });
    interaction.editReply({ embeds: [productEmbed(match)] });
  } catch (e) {
    interaction.editReply({ embeds: [errorEmbed('Failed to search products.')] });
  }
}
