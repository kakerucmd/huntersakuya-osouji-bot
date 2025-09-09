const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');
const { bannedUsers } = require('./banned.json');

const { Client, Events, Collection, GatewayIntentBits, Partials, MessageFlags } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions
    ], 
    partials: [Partials.Channel,Partials.Reaction,Partials.Message] 
});

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
	if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

	if (bannedUsers.includes(interaction.user.id)) {
        return interaction.reply({ content: 'あなたのアカウントはこのBotからBANされているため、機能を使用することができません。', flags: MessageFlags.Ephemeral });
    }

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
			return interaction.reply({ content: `\`/${command.data.name}\`コマンドはクールタイム中です。<t:${expiredTimestamp}:R>に再使用できます。`, flags: MessageFlags.Ephemeral });
		}
	}

	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'エラーが発生しました。', flags: MessageFlags.Ephemeral });
		}
	}
});

const joinTimestamps = new Collection();

global.client = client;
global.joinTimestamps = joinTimestamps;

client.login(token);