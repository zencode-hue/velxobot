import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// Load commands
const commandFolders = ['customer', 'staff', 'admin'];
for (const folder of commandFolders) {
  const files = readdirSync(join(__dirname, 'src/commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = await import(pathToFileURL(join(__dirname, 'src/commands', folder, file)).href);
    client.commands.set(mod.data.name, mod);
  }
}

// Load events
const eventFiles = readdirSync(join(__dirname, 'src/events')).filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
  const event = await import(pathToFileURL(join(__dirname, 'src/events', file)).href);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
