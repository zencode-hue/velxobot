import { getAIResponse } from '../lib/ai.js';
import { EmbedBuilder } from 'discord.js';

// Per-user conversation history (in-memory, resets on restart)
const conversations = new Map();

export const name = 'messageCreate';
export const once = false;

export async function execute(message) {
  // Ignore bots and messages not mentioning the bot
  if (message.author.bot) return;
  if (!message.mentions.has(message.client.user)) return;

  const userId = message.author.id;
  if (!conversations.has(userId)) conversations.set(userId, []);
  const history = conversations.get(userId);

  const userText = message.content.replace(/<@!?\d+>/g, '').trim();
  if (!userText) return;

  try {
    await message.channel.sendTyping();
    const response = await getAIResponse(userText, history);

    // Update history
    history.push({ role: 'user', content: userText });
    history.push({ role: 'assistant', content: response });
    if (history.length > 20) history.splice(0, 2); // keep last 10 exchanges

    const embed = new EmbedBuilder()
      .setDescription(response)
      .setColor(0x7c4dff)
      .setFooter({ text: 'VelxoBot • velxo.shop' });

    message.reply({ embeds: [embed] });
  } catch (err) {
    console.error('AI response error:', err);
    message.reply('Sorry, I ran into an issue. Please try again or use `/support` to open a ticket.');
  }
}
