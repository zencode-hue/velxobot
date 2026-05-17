const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  AttachmentBuilder, MessageFlags,
} = require('discord.js');
const {
  METRAMART_GOLD, METRAMART_GREEN, METRAMART_RED,
  SHOP_ICON, SHOP_URL, BOT_FOOTER,
} = require('../constants');
const { errorEmbed, buildTranscript } = require('../utils');

// Handles: ticket_close, ticket_claim, ticket_adduser, ticket_confirm_close, ticket_cancel_close
module.exports = {
  customId: 'ticket_',

  async execute(interaction, client) {
    const id = interaction.customId;

    // ── Close button ──────────────────────────────────────────────────────────
    if (id.startsWith('ticket_close')) {
      const creatorId = id.split(':')[1] || '';
      const confirm = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ticket_confirm_close:${creatorId}`).setLabel('Confirm Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('ticket_cancel_close').setLabel('Cancel').setStyle(ButtonStyle.Secondary).setEmoji('✖️'),
      );
      const embed = new EmbedBuilder()
        .setTitle('🔒  Close Ticket?')
        .setDescription('Are you sure you want to close this ticket? A transcript will be saved.')
        .setColor(METRAMART_GOLD)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      return interaction.reply({ embeds: [embed], components: [confirm], flags: MessageFlags.Ephemeral });
    }

    // ── Confirm close ─────────────────────────────────────────────────────────
    if (id.startsWith('ticket_confirm_close')) {
      const creatorId = id.split(':')[1] || '';
      await interaction.deferUpdate();
      const channel = interaction.channel;
      const guild   = interaction.guild;

      const closing = new EmbedBuilder()
        .setTitle('🔒  Ticket Closing')
        .setDescription(`Closed by ${interaction.user}\nSaving transcript and deleting in **5 seconds**...`)
        .setColor(METRAMART_RED)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await channel.send({ embeds: [closing] });

      // Transcript
      const transcriptCh = guild.channels.cache.get(process.env.TRANSCRIPT_CHANNEL_ID);
      if (transcriptCh) {
        const text = await buildTranscript(channel);
        const file = new AttachmentBuilder(Buffer.from(text, 'utf8'), { name: `transcript-${channel.name}.txt` });
        const tEmbed = new EmbedBuilder()
          .setTitle(`📄  Transcript — #${channel.name}`)
          .setDescription(`Closed by ${interaction.user}`)
          .setColor(METRAMART_GOLD).setTimestamp()
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
        await transcriptCh.send({ embeds: [tEmbed], files: [file] });
      }

      // Send interactive Review Embed to the Ticket Creator via DM
      if (creatorId) {
        try {
          const creator = await guild.members.fetch(creatorId).catch(() => null);
          if (creator) {
            const reviewRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`review_rating:1:${creatorId}`).setLabel('⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId(`review_rating:2:${creatorId}`).setLabel('⭐⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId(`review_rating:3:${creatorId}`).setLabel('⭐⭐⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId(`review_rating:4:${creatorId}`).setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Secondary),
              new ButtonBuilder().setCustomId(`review_rating:5:${creatorId}`).setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Secondary)
            );

            const reviewEmbed = new EmbedBuilder()
              .setTitle('⭐⭐⭐⭐⭐  How was your MetraMart Support?')
              .setDescription('Your ticket has been closed. We would love to hear your feedback!\nPlease select a star rating below to rate your support agent:')
              .setColor(METRAMART_GOLD)
              .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });

            await creator.send({ embeds: [reviewEmbed], components: [reviewRow] });
          }
        } catch (dmErr) {
          console.warn('[Review] DM dispatch failed for ticket creator:', dmErr.message);
        }
      }

      await new Promise(r => setTimeout(r, 5000));
      await channel.delete(`Ticket closed by ${interaction.user.tag}`).catch(() => {});
      return;
    }

    // ── Cancel close ──────────────────────────────────────────────────────────
    if (id === 'ticket_cancel_close') {
      return interaction.reply({ content: 'Cancelled.', flags: MessageFlags.Ephemeral });
    }

    // ── Claim button ──────────────────────────────────────────────────────────
    if (id === 'ticket_claim') {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({ embeds: [errorEmbed('No Permission', 'Only staff can claim tickets.')], flags: MessageFlags.Ephemeral });
      }
      const embed = new EmbedBuilder()
        .setDescription(`✋  Ticket claimed by ${interaction.user}`)
        .setColor(METRAMART_GREEN)
        .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON });
      await interaction.reply({ embeds: [embed] });

      // Disable claim button on original message
      const msg = interaction.message;
      const rows = msg.components.map(row => {
        const updated = row.components.map(btn => {
          if (btn.customId === 'ticket_claim') {
            return ButtonBuilder.from(btn).setDisabled(true).setLabel(`Claimed by ${interaction.user.displayName}`);
          }
          return ButtonBuilder.from(btn);
        });
        return new ActionRowBuilder().addComponents(updated);
      });
      await msg.edit({ components: rows }).catch(() => {});
      return;
    }

    // ── Add user button ───────────────────────────────────────────────────────
    if (id === 'ticket_adduser') {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({ embeds: [errorEmbed('No Permission')], flags: MessageFlags.Ephemeral });
      }
      const modal = new ModalBuilder().setCustomId('ticket_adduser_modal').setTitle('➕  Add User to Ticket');
      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId('user_id').setLabel('User ID')
            .setStyle(TextInputStyle.Short).setPlaceholder('Right-click a user → Copy ID').setRequired(true).setMaxLength(20)
        )
      );
      return interaction.showModal(modal);
    }
  },
};
