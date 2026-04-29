import { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const openTickets = new Map(); // userId -> threadId

export async function openTicket(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;

  if (openTickets.has(user.id)) {
    const existing = guild.channels.cache.get(openTickets.get(user.id));
    if (existing) {
      return interaction.reply({ content: `You already have an open ticket: ${existing}`, ephemeral: true });
    }
    openTickets.delete(user.id);
  }

  const supportChannel = guild.channels.cache.get(process.env.DISCORD_SUPPORT_CHANNEL_ID);
  if (!supportChannel) {
    return interaction.reply({ content: '❌ Support channel not configured.', ephemeral: true });
  }

  const thread = await supportChannel.threads.create({
    name: `ticket-${user.username}-${Date.now().toString(36)}`,
    type: ChannelType.PrivateThread,
    reason: `Support ticket for ${user.tag}`,
  });

  await thread.members.add(user.id);

  const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;
  const embed = new EmbedBuilder()
    .setTitle('🎫 Support Ticket')
    .setColor(0x7c4dff)
    .setDescription(`Hello ${user}, a staff member will be with you shortly.\n\nPlease describe your issue and include your **Order ID** (format: VLX-XXXXXX) if applicable.`)
    .setFooter({ text: 'Velxo Shop Support • velxo.shop/support' });

  const closeBtn = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger),
  );

  await thread.send({ content: `<@&${staffRoleId}>`, embeds: [embed], components: [closeBtn] });

  openTickets.set(user.id, thread.id);
  return interaction.reply({ content: `✅ Ticket opened: ${thread}`, ephemeral: true });
}

export async function closeTicket(interaction) {
  const thread = interaction.channel;
  if (!thread.isThread()) {
    return interaction.reply({ content: '❌ This command can only be used inside a ticket thread.', ephemeral: true });
  }

  await interaction.reply({ content: '🔒 Closing ticket...' });

  // Remove user from openTickets map
  for (const [userId, threadId] of openTickets.entries()) {
    if (threadId === thread.id) openTickets.delete(userId);
  }

  await thread.setArchived(true, 'Ticket closed');
}
