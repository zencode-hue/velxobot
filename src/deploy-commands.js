import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commands = [];

const commandFolders = ['customer', 'staff', 'admin'];
for (const folder of commandFolders) {
  const files = readdirSync(join(__dirname, 'commands', folder)).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const mod = await import(pathToFileURL(join(__dirname, 'commands', folder, file)).href);
    commands.push(mod.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

try {
  console.log(`Deploying ${commands.length} commands...`);
  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
    { body: commands },
  );
  console.log('✅ Commands deployed.');
} catch (err) {
  console.error(err);
}
