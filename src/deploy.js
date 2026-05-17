const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  if (!token || !clientId) {
    console.warn('[MetraMart] Skipping slash commands deployment: token or client ID is missing.');
    return;
  }

  const commands = [];
  const cmdPath  = path.join(__dirname, 'commands');

  if (fs.existsSync(cmdPath)) {
    for (const file of fs.readdirSync(cmdPath).filter(f => f.endsWith('.js'))) {
      const cmd = require(path.join(cmdPath, file));
      if (cmd.data) commands.push(cmd.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`[MetraMart] Deploying ${commands.length} slash commands dynamically...`);
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log('[MetraMart] Commands deployed successfully.');
  } catch (err) {
    console.error('[MetraMart] Deploy error:', err);
  }
}

module.exports = { deployCommands };

// Self-run only if called directly via CLI
if (require.main === module) {
  require('dotenv').config();
  deployCommands();
}
