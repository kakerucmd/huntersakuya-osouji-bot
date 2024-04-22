const fs = require('node:fs');
const path = require('node:path');
const { token } = require('./config.json');

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

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

setInterval(() => {
  client.user.setActivity(`お掃除上方修正しろ！！| ${client.guilds.cache.size} servers ${client.ws.ping}ms`);
}, 60000);

//個人鯖用
client.on("guildMemberAdd", member => {
	if (member.user.bot) return;
	if (member.guild.id !== "your_guildid") return;
	member.guild.channels.cache.get("your_channelid").send(`${member.user}さん、${member.guild.name}へようこそ！`);
  });
  
client.on("guildMemberAdd", member => {
	if (member.guild.id !== "your_guildid") return;
	member.guild.channels.cache.get("your_channelid").send(`${member.user}さん、${member.guild.name}へようこそ！\n your_channellinkで認証することで、会話に参加できます`);
  });

const days = ['日', '月', '火', '水', '木', '金', '土'];
client.on('ready', () => {
	  let channel = client.channels.cache.get('your_channellink');
	  setInterval(() => {
		  let date = new Date();
		  let day = days[date.getDay()];
		  let newName = `${date.getMonth()+1}/${date.getDate()} - ${day}`;
		  channel.setName(newName)
			  .catch(console.error);
	  }, 600000); // 5分ごとに更新
  });

client.login(token);
