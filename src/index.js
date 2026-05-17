require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
client.interactions = new Collection();

// Resolve base dir — works whether files are in src/ or flat root
const baseDir = __dirname;

// Helper to safely load from a subfolder, falling back to flat files with prefix
function loadDir(subdir, callback) {
  const full = path.join(baseDir, subdir);
  if (fs.existsSync(full)) {
    for (const file of fs.readdirSync(full).filter(f => f.endsWith('.js'))) {
      callback(require(path.join(full, file)));
    }
  } else {
    // Flat layout: files named like "commands/announce.js" don't exist,
    // but Wispbyte may have extracted them as e.g. "commandsannounce.js" — 
    // so we scan all .js files and match by known names
    const prefix = subdir === 'commands'
      ? ['announce','deliver','market','panel','remind','ticket']
      : ['announce_modal','deliver_category','deliver_modal','market_modal',
         'remind_modal','ticket_adduser_modal','ticket_buttons','ticket_dropdown','ticket_modal'];
    for (const name of prefix) {
      const f = path.join(baseDir, `${name}.js`);
      if (fs.existsSync(f)) callback(require(f));
    }
  }
}

loadDir('commands', cmd => {
  if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
});

loadDir('interactions', handler => {
  if (handler.customId && handler.execute) client.interactions.set(handler.customId, handler);
});

client.once('ready', () => {
  console.log(`[MetraMart] Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'metramart.xyz | Premium Digital Products', type: 3 }],
    status: 'online',
  });
});

client.on('interactionCreate', async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd) await cmd.execute(interaction, client);
    } else if (interaction.isStringSelectMenu() || interaction.isButton() || interaction.isModalSubmit()) {
      // Try exact match first, then prefix match
      const handler =
        client.interactions.get(interaction.customId) ||
        [...client.interactions.values()].find(h => typeof h.customId === 'string' && interaction.customId.startsWith(h.customId));
      if (handler) await handler.execute(interaction, client);
    }
  } catch (err) {
    console.error('[MetraMart] Interaction error:', err);
    const msg = { content: '❌ Something went wrong.', flags: MessageFlags.Ephemeral };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

// Prefix command: .panel and AI Auto-Responder for Tickets
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // ─── Anti-Scam Link & Phishing Domain Scanner ───
  const content = message.content.toLowerCase();
  const scamblacklist = [
    'metramart.ru', 'metramart.net', 'metramart-shop', 'free-nitro', 
    'discord-gift', 'steam-community-free', 'gift-nitro', 'metramart.org'
  ];

  const containsScam = scamblacklist.some(term => content.includes(term));
  if (containsScam) {
    try {
      await message.delete();
      
      const warnMsg = await message.channel.send(`⚠️  ${message.author}, **unauthorized copycat domains or phishing links are strictly prohibited** to preserve community safety!`);
      setTimeout(() => warnMsg.delete().catch(() => {}), 10000);

      // Log the action to staff channel
      const logChId = process.env.LOG_CHANNEL_ID;
      const logCh = message.guild?.channels.cache.get(logChId);
      if (logCh) {
        const { EmbedBuilder } = require('discord.js');
        const { METRAMART_RED, BOT_FOOTER, SHOP_ICON } = require('./constants');
        const logEmbed = new EmbedBuilder()
          .setTitle('🚨  Anti-Scam Flag Triggered')
          .setDescription(`A message containing a blacklisted domain or phishing signature was blocked.`)
          .setColor(METRAMART_RED)
          .addFields(
            { name: '👤 Sender', value: `${message.author} (\`${message.author.tag}\`)`, inline: true },
            { name: '📌 Channel', value: `${message.channel}`, inline: true },
            { name: '📝 Content Blocked', value: `\`\`\`text\n${message.content}\n\`\`\``, inline: false }
          )
          .setFooter({ text: BOT_FOOTER, iconURL: SHOP_ICON })
          .setTimestamp();
        await logCh.send({ embeds: [logEmbed] });
      }
      return; // Stop execution
    } catch (e) {
      console.warn('[Anti-Scam] Failed to process message action:', e.message);
    }
  }

  // 1. Prefix command handler (.panel)
  if (message.content.toLowerCase() === '.panel') {
    const panelPath = fs.existsSync(path.join(baseDir, 'commands/panel.js'))
      ? path.join(baseDir, 'commands/panel.js')
      : path.join(baseDir, 'panel.js');
    const { panelCommand } = require(panelPath);
    await panelCommand(message, client);
    return;
  }

  // 2. AI Support Agent for Ticket Channels
  const channel = message.channel;
  const name = channel.name || '';
  const isTicket = name.startsWith('support-') || name.startsWith('order-') || name.startsWith('application-');
  
  if (isTicket && channel.parentId === process.env.TICKET_CATEGORY_ID) {
    try {
      const messages = await channel.messages.fetch({ limit: 30 });
      const hasAiReplied = messages.some(m => m.author.id === client.user.id && m.content.includes('⚡ **METRA AI SUPPORT RESPONSE**'));
      
      if (!hasAiReplied) {
        await channel.sendTyping();
        
        const { generateAIResponse } = require('./ai');
        const { METRAMART_GOLD, SHOP_ICON, BOT_FOOTER } = require('./constants');
        
        const categoryName = name.split('-')[0];
        const aiAnswer = await generateAIResponse(message.content, message.author.displayName, categoryName);
        
        const embed = new EmbedBuilder()
          .setTitle('⚡  Metra AI Ticket Assistant')
          .setDescription(aiAnswer)
          .setColor(METRAMART_GOLD)
          .setThumbnail(SHOP_ICON)
          .setTimestamp()
          .setFooter({ text: `${BOT_FOOTER} | Automated Assistant`, iconURL: SHOP_ICON });

        await channel.send({
          content: `⚡ **METRA AI SUPPORT RESPONSE** for ${message.author}:`,
          embeds: [embed],
        });
      }
    } catch (err) {
      console.error('[AI Agent] Message handler error:', err);
    }
  }
});

// 3. Status Heartbeat (Railway-ready SaaS reporting)
async function sendHeartbeat() {
  const serverUrl = process.env.WEBSITE_URL || process.env.METRAMART_WEB_URL || 'http://localhost:3000';
  const apiKey = process.env.INTERNAL_BYPASS_KEY || 'metramart-ai-secret-2024';
  
  try {
    const activeTickets = client.channels.cache.filter(
      c => c.name && (c.name.startsWith('support-') || c.name.startsWith('order-') || c.name.startsWith('application-'))
    ).size;
    const guildCount = client.guilds.cache.size;
    
    const res = await fetch(`${serverUrl}/api/bot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-AI-Bypass': apiKey,
      },
      body: JSON.stringify({
        status: 'ONLINE',
        latency: client.ws.ping || 5,
        guilds: guildCount,
        tickets: activeTickets,
        uptime: client.uptime || 0,
      }),
    });
    if (!res.ok) {
      console.warn(`[Heartbeat] SaaS reporting failed with status ${res.status}`);
    }
  } catch (err) {
    // Suppress active logs unless in verbose mode to avoid console pollution
  }
}

// ─── Dynamic Cross-Hosting Configuration Bridge ───
async function initializeSettings() {
  const websiteUrl = process.env.WEBSITE_URL || process.env.METRAMART_WEB_URL || 'http://localhost:3000';
  const bypassKey = process.env.INTERNAL_BYPASS_KEY || 'metramart-ai-secret-2024';

  console.log(`[MetraMart] Connecting to storefront at ${websiteUrl} to sync dynamic configurations...`);
  try {
    const res = await fetch(`${websiteUrl}/api/bot`, {
      method: 'GET',
      headers: {
        'X-Internal-AI-Bypass': bypassKey
      }
    });

    if (res.ok) {
      const config = await res.json();
      console.log('[MetraMart] Dynamic settings successfully synced from storefront!');
      if (config.bot_discord_token) process.env.DISCORD_TOKEN = config.bot_discord_token;
      if (config.bot_client_id) process.env.CLIENT_ID = config.bot_client_id;
      if (config.bot_staff_role_id) process.env.STAFF_ROLE_ID = config.bot_staff_role_id;
      if (config.bot_log_channel_id) process.env.LOG_CHANNEL_ID = config.bot_log_channel_id;
      if (config.bot_transcript_channel_id) process.env.TRANSCRIPT_CHANNEL_ID = config.bot_transcript_channel_id;
      if (config.bot_ticket_category_id) process.env.TICKET_CATEGORY_ID = config.bot_ticket_category_id;
    } else {
      console.warn(`[MetraMart] Storefront configuration bridge returned status ${res.status}. Using local environment variables.`);
    }
  } catch (err) {
    console.warn('[MetraMart] Storefront unreachable. Using local environment variables:', err.message);
  }
}

// ─── 4. Bootstrapped Startup ───
(async () => {
  await initializeSettings();

  // Fire initial heartbeat on ready and register interval
  client.once('ready', () => {
    sendHeartbeat();
    setInterval(sendHeartbeat, 60000);
  });

  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error('❌ [MetraMart] Startup Error: DISCORD_TOKEN is missing. Set it in your website botdashboard page or local environment.');
    process.exit(1);
  }

  await client.login(token).catch(err => {
    console.error('❌ [MetraMart] Failed to login to Discord:', err.message);
  });
})();
