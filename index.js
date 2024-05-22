const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');

const { Client, Events, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessages 
    ], 
    partials: [Partials.Channel] 
});

const joinTimestamps = new Map();

global.joinTimestamps = joinTimestamps;
global.client = client;

client.cooldowns = new Collection();
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`${filePath} に必要な "data" か "execute" がありません。`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`${interaction.commandName} が見つかりません。`);
		return;
	}

	const { cooldowns } = interaction.client;

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const defaultCooldownDuration = 3;
	const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

	if (timestamps.has(interaction.user.id)) {
		const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

		if (now < expirationTime) {
			const expiredTimestamp = Math.round(expirationTime / 1000);
			return interaction.reply({ content: `\`/${command.data.name}\`コマンドはクールタイム中です。<t:${expiredTimestamp}:R>に再使用できます。`, ephemeral: true });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'エラーが発生しました。', ephemeral: true });
		} else {
			await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
		}
	}
});

setInterval(() => {
  client.user.setActivity(`Ver3.2 | ${client.guilds.cache.size} servers ${client.ws.ping}ms`);
}, 60000);

//個人鯖用(雑)
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  client.on('ready', () => {
	  let channel = client.channels.cache.get('channelid');
	  setInterval(() => {
		  let date = new Date();
		  let day = days[date.getDay()];
		  let newName = `${date.getMonth()+1}/${date.getDate()} - ${day}`;
		  channel.setName(newName)
			  .catch(console.error);
	  }, 60000);
  });

  client.on('ready', () => {
    const channelId = 'channelid';
    const fn = () => {
        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            console.log(`${channelId}が存在しません。`);
        } else {
            channel.send('日付が変わりました！');
        }
    };

    let now = new Date();
    let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    let diff = tomorrow - now;

    setTimeout(() => {
        fn();
        setInterval(fn, 1000 * 60 * 60 * 24);
    }, diff);
});

client.login(token);
