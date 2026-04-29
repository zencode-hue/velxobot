import { startScheduler } from '../tasks/scheduler.js';

export const name = 'ready';
export const once = true;

export function execute(client) {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setActivity('velxo.shop | /help', { type: 3 }); // WATCHING
  startScheduler(client);
}
