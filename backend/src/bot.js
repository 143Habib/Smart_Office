import { Client, GatewayIntentBits } from 'discord.js';
import { ROOM_ALIASES } from './config.js';
import { formatAlerts, formatRoom, formatSavings, formatStatus, formatUsage } from './formatters.js';

function normalizeCommand(content) {
  const [command, ...args] = content.trim().split(/\s+/);
  return { command: command.toLowerCase(), args };
}

function helpText() {
  return [
    'Boss mode is ready. Try these commands:',
    '`!status` - full office summary',
    '`!room drawing` / `!room work1` / `!room work2` - room details',
    '`!usage` - total watts, kWh and estimated cost',
    '`!alerts` - current alert list',
    '`!save` - quick savings estimate',
    '`!help` - this menu'
  ].join('\n');
}

export async function startDiscordBot(store) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.log('[discord] DISCORD_BOT_TOKEN is empty; bot is disabled. Dashboard/backend still run normally.');
    return null;
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
  });

  client.once('ready', () => {
    console.log(`[discord] Logged in as ${client.user.tag}`);
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!')) return;
    const { command, args } = normalizeCommand(message.content);
    const snapshot = store.getSnapshot();

    try {
      if (command === '!help') {
        await message.reply(helpText());
        return;
      }

      if (command === '!status') {
        await message.reply(formatStatus(snapshot));
        return;
      }

      if (command === '!room') {
        const alias = args.join(' ').toLowerCase();
        const roomId = ROOM_ALIASES[alias] || alias;
        await message.reply(formatRoom(snapshot, roomId));
        return;
      }

      if (command === '!usage') {
        await message.reply(formatUsage(snapshot));
        return;
      }

      if (command === '!alerts') {
        await message.reply(formatAlerts(snapshot));
        return;
      }

      if (command === '!save') {
        await message.reply(formatSavings(snapshot));
        return;
      }

      await message.reply(`I do not know that command yet.\n${helpText()}`);
    } catch (error) {
      console.error('[discord] command failed', error);
      await message.reply('Something went wrong while reading the live office data. Please try again.');
    }
  });

  store.on('alert:new', async (alert) => {
    const channelId = process.env.DISCORD_ALERT_CHANNEL_ID;
    if (!channelId) return;
    try {
      const channel = await client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        await channel.send(`⚠️ Hey! ${alert.message} Did someone forget to leave?`);
      }
    } catch (error) {
      console.error('[discord] could not send proactive alert', error.message);
    }
  });

  await client.login(token);
  return client;
}
