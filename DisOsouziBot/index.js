const fs = require('node:fs');
const path = require('node:path');
const Discord = require('discord.js');
const Keyv = require('keyv');
const { token } = require('./config.json');

const { 
    Client, 
    Collection, 
    GatewayIntentBits, 
    EmbedBuilder, 
    Partials, 
    ModalBuilder, 
    ActionRowBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    ButtonBuilder
} = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMessages 
    ], 
    partials: [Partials.Channel] 
});

const prefix = "os#";

const verify = new Keyv('sqlite://db.sqlite');
const setinappdel = new Keyv('sqlite://db.sqlite', { table: 'setinappdel' });
const badwords = new Keyv('sqlite://db.sqlite', { table: 'badwords' });
const notifychannel = new Keyv('sqlite://db.sqlite', { table: 'notifychannel' });
const levelsettings = new Keyv('sqlite://db.sqlite', { table: 'levelsettings' });
const levels = new Keyv('sqlite://db.sqlite', { table: 'levels' });
const messages = new Keyv('sqlite://db.sqlite', { table: 'levelmessages' });
const channels = new Keyv('sqlite://db.sqlite', { table: 'channels' });
const toggleleave = new Keyv('sqlite://db.sqlite', { table: 'toggleleave' });
const leaveChannel = new Keyv('sqlite://db.sqlite', { table: 'leaveChannel' });
const osouzireply = new Keyv('sqlite://db.sqlite', { table: 'osouzireply' });

client.on('ready', () => {
  console.log(`お掃除上方修正しろ！！(${client.user.tag}が起動しました)`);
});

client.login(token);

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

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`${interaction.commandName} が見つかりません。`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
	}
});

setInterval(() => {
  client.user.setActivity(`お掃除上方修正しろ！！| ${client.guilds.cache.size} servers ${client.ws.ping}ms`);
}, 60000);

let lastReplyTime = {};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  let triggerWord;
  if (message.content.includes('お掃除上方修正')) {
      triggerWord = 'お掃除上方修正';
  } else if (message.content.includes('お掃除')) {
      triggerWord = 'お掃除';
  } else if (message.content.includes('上方修正')) {
      triggerWord = '上方修正';
  }

  if (triggerWord) {
      try {
          const isEnabled = await osouzireply.get(message.guild.id);
          if (isEnabled) {
              const now = Date.now();
              const lastReply = lastReplyTime[message.guild.id];
              if (lastReply && now - lastReply < 10000) {
                  await message.channel.sendTyping();
                  setTimeout(async () => {
                      try {
                          await message.reply('お掃除上方修正s(((ry');
                      } catch (error) {
                          await message.channel.send(`お掃除上方修正s(((ry`);
                      }
                  }, 1000);
              } else {
                  const escapedTriggerWord = triggerWord.replace(/@everyone/g, "").replace(/@here/g, "");
                  await message.channel.sendTyping();
                  setTimeout(async () => {
                      try {
                          await message.reply(`${escapedTriggerWord}...？上方修正....お掃除...お掃除上方修正しろ！！！！`);
                      } catch (error) {
                          await message.channel.send(`${escapedTriggerWord}...？上方修正....お掃除...お掃除上方修正しろ！！！！`);
                      }
                  }, 1000);
              }
              lastReplyTime[message.guild.id] = now;
              setTimeout(() => {
                  delete lastReplyTime[message.guild.id];
              }, 10000);
          }
      } catch (error) {
          console.error(`エラーが発生しました: ${error}`);
      }
  }
});

//ロールパネル
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  const roleId = interaction.customId.split('_')[2];
  if (interaction.customId === `get_role_${roleId}`) {
      await interaction.deferReply({ ephemeral: true });

      const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
      if (!guildData) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
          .setDescription('ロールパネルが無効になっています。\nサーバー管理者に連絡し、ロールパネルを再作成してください。')
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const role = interaction.guild.roles.cache.get(guildData.role);
      if (!role) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
          .setDescription('ロールが存在しません')
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (!member) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
          .setDescription('メンバーが存在しません')
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const botMember = interaction.guild.members.cache.get(client.user.id);
      if (botMember.roles.highest.comparePositionTo(role) <= 0) {
        const embed = new EmbedBuilder()
        .setAuthor({ name: '⚠️｜役職の位置エラー' })
        .setDescription('お掃除上方修正しろBotの役職の位置が付与対象の役職よりも低いため、\n役職を付与、解除することができません。\nサーバー管理者に連絡し、お掃除上方修正しろbotの役職の位置を付与対象のロールより上に上げてください。')
        .setColor('#ffcc00');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの削除' })
          .setDescription(`<@&${role.id}>の削除に成功しました`)
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      await member.roles.add(role);
      const embed = new EmbedBuilder()
        .setAuthor({ name: '✅｜ロールの付与' })
        .setDescription(`<@&${role.id}>の付与に成功しました`)
        .setColor('#00ff00');
      return interaction.editReply({ embeds: [embed], ephemeral: true });
  }
});

//ボタン認証
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  const roleId = interaction.customId.split('_')[1];
  if (interaction.customId === `buttonrole_${roleId}`) {
      await interaction.deferReply({ ephemeral: true });

      const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
      if (!guildData) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
          .setDescription('認証パネルが無効になっています。\nサーバー管理者に連絡し、認証パネルを再作成してください。')
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const role = interaction.guild.roles.cache.get(guildData.role);
      if (!role) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
          .setDescription('ロールが存在しません')
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const member = interaction.guild.members.cache.get(interaction.user.id);
      if (!member) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: '❌｜ロールの付与/削除失敗' })
          .setDescription('メンバーが存在しません')
          .setColor('#ff0000');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const botMember = interaction.guild.members.cache.get(client.user.id);
      if (botMember.roles.highest.comparePositionTo(role) <= 0) {
        const embed = new EmbedBuilder()
        .setAuthor({ name: '⚠️｜役職の位置エラー' })
        .setDescription('お掃除上方修正しろBotの役職の位置が付与対象の役職よりも低いため、\n役職を付与、解除することができません。\nサーバー管理者に連絡し、お掃除上方修正しろbotの役職の位置を付与対象のロールより上に上げてください。')
        .setColor('#ffcc00');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (member.roles.cache.has(role.id)) {
        const embed = new EmbedBuilder()
         .setAuthor({ name: '✅｜認証済み' })
         .setDescription('既に認証済みです。')
         .setColor('#00ff00');
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }    

      await member.roles.add(role);
      const embed = new EmbedBuilder()
       .setAuthor({ name: '✅｜認証成功' })
       .setDescription(`認証に成功しました。\nサーバーのルールを守り、\n**${interaction.guild.name}**をご利用ください。`)
       .setColor('#00ff00');
      return interaction.editReply({ embeds: [embed], ephemeral: true });
  }
});

//計算認証
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  const roleId = interaction.customId.split('_')[1];
  if (interaction.customId === `osouzirole_${roleId}`) {

    const guildData = await verify.get(`${interaction.guild.id}_${roleId}`);
    if (!guildData) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: '❌｜認証失敗' })
        .setDescription('計算認証パネルが無効になっています。\nサーバー管理者に連絡し、ロールパネルを再作成してください。')
        .setColor('#ff0000');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const role = interaction.guild.roles.cache.get(guildData.role);
    if (!role) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: '❌｜認証失敗' })
        .setDescription('ロールが存在しません。')
        .setColor('#ff0000');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);
    if (!member) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: '❌｜認証失敗' })
        .setDescription('メンバーが存在しません。')
        .setColor('#ff0000');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (member.roles.cache.has(role.id)) {
      const embed = new EmbedBuilder()
      .setAuthor({ name: '✅｜認証済み' })
        .setDescription('既に認証済みです。')
        .setColor('#00ff00');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }    

    const botMember = interaction.guild.members.cache.get(client.user.id);
    if (botMember.roles.highest.comparePositionTo(role) <= 0) {
      const embed = new EmbedBuilder()
        .setAuthor({ name: '⚠️｜役職の位置エラー' })
        .setDescription('お掃除上方修正しろBotの役職の位置が付与対象の役職よりも低いため、\n役職を付与、解除することができません。\nサーバー管理者に連絡し、お掃除上方修正しろbotの役職の位置を付与対象のロールより上に上げてください。')
        .setColor('#ffcc00');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // 0: 足し算, 1: 引き算, 2: 掛け算, 3: 割り算
    const operation = Math.floor(Math.random() * 4);
    let num1 = Math.floor(Math.random() * 100);
    let num2 = Math.floor(Math.random() * 100);
    let answer;
    let label;

    if (operation === 0) {
      // 足し算の場合
      answer = num1 + num2;
      label = `${num1} + ${num2} = ? (答えを半角数字で入力してください)`;
    } else if (operation === 1) {
      // 引き算の場合、num1 >= num2 となるように調整
      if (num2 > num1) {
        let temp = num1;
        num1 = num2;
        num2 = temp;
      }
      answer = num1 - num2;
      label = `${num1} - ${num2} = ? (答えを半角数字で入力してください)`;
    } else if (operation === 2) {
      // 掛け算の場合
      answer = num1 * num2;
      label = `${num1} × ${num2} = ? (答えを半角数字で入力してください)`;
    } else {
      // 割り算の場合、num1 >= num2 となるように調整し、num1 が num2 の倍数となるように調整
      num2 = Math.floor(Math.random() * 10 + 1);
      num1 = num2 * Math.floor(Math.random() * 10 + 1);
      answer = num1 / num2;
      label = `${num1} ÷ ${num2} = ? (答えを半角数字で入力してください)`;
    }

    const modalId = 'calcAuth' + interaction.user.id + Date.now();
    const modal = new ModalBuilder()
      .setCustomId(modalId)
      .setTitle('計算問題を解く');

    const problemInput = new TextInputBuilder()
      .setCustomId('problemInput')
      .setLabel(label)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('答えをここに入力');

    const actionRow = new ActionRowBuilder().addComponents(problemInput);
    modal.addComponents(actionRow);

    try {
      await interaction.showModal(modal);
    } catch (error) {
      console.error('Failed to show modal:', error);
      const embed = new EmbedBuilder()
        .setAuthor({ name: '❌｜エラー' })
        .setDescription('エラーが発生しました。後ほど再試行してみてください。')
        .setColor('#ff0000');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const filter = (mInteraction) => mInteraction.customId.startsWith(modalId);
    interaction.awaitModalSubmit({ filter, time: 120000 })
      .then(async mInteraction => {
        try {
          const userAnswer = mInteraction.fields.getTextInputValue('problemInput');
          const parsedAnswer = parseInt(userAnswer);
          if (isNaN(parsedAnswer)) {
            const embed = new EmbedBuilder()
              .setAuthor({ name: '❌｜認証失敗' })
              .setDescription('答えは半角数字を入力してください。')
              .setColor('#ff0000');
            await mInteraction.reply({ embeds: [embed], ephemeral: true });
          } else if (parsedAnswer === answer) {
            try {
              await member.roles.add(role);
              const embed = new EmbedBuilder()
                .setAuthor({ name: '✅｜認証成功' })
                .setDescription(`認証に成功しました。\nサーバーのルールを守り、\n**${interaction.guild.name}**をご利用ください。`)
                .setColor('#00ff00');
              await mInteraction.reply({ embeds: [embed], ephemeral: true });
            } catch (error) {
              console.error('Failed to add role:', error);
              const embed = new EmbedBuilder()
                .setAuthor({ name: '❌｜エラー' })
                .setDescription('エラーが発生しました。後ほど再試行してみてください。')
                .setColor('#ff0000');
              await mInteraction.reply({ embeds: [embed], ephemeral: true });
            }
          } else {
            const embed = new EmbedBuilder()
              .setAuthor({ name: '❌｜認証失敗' })
              .setDescription(`認証に失敗しました。\n計算の正解は \`${answer}\` です。`)
              .setColor('#ff0000');
            return mInteraction.reply({ embeds: [embed], ephemeral: true });
          }
        } catch (error) {
          console.error('Failed to process user input:', error);
          const embed = new EmbedBuilder()
            .setAuthor({ name: '❌｜エラー' })
            .setDescription('エラーが発生しました。後ほど再試行してみてください。')
            .setColor('#ff0000');
          await mInteraction.reply({ embeds: [embed], ephemeral: true });
        }
      })
      .catch(error => {
        console.error('Failed to await modal submit',error);
      });  

  }
});

// 不適切な発言の自動削除
client.on('messageCreate', async message => {
  try {
    if (message.author.bot) return;

    const isEnabled = await setinappdel.get(message.guild.id);
    if (!isEnabled) return;

    const badWords = await badwords.get(message.guild.id);
    if (!badWords) return;

    if (badWords.some(word => message.content.includes(word))) {
      var improper = String(message.content);

      const embed = new EmbedBuilder()
        .setTitle('不適切な発言が含まれていたので、お掃除しました。')
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`
        })
        .setThumbnail('https://cdn.discordapp.com/avatars/1175248665972060160/ef2f2557ae2989b7635cd7ead0702240.webp?size=1024&format=webp')
        .setFields(
          {
            name: 'お掃除...？お掃除上方修正しろ！！',
            value:`削除されたメッセージ:||${improper}||`
          },
          {
            name: '不適切なメッセージを送信した人',
            value:`<@${message.author.id}>`
          }
        )
        .setColor('#FF0000')
        .setTimestamp()

    const channelId = await notifychannel.get(message.guild.id);
    if (channelId) {
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        channel.send({ embeds: [embed] });
      }
    }

    message.delete({ timeout: 1000 });
  }
  } catch (error) {
    console.error(`エラーが発生しました: ${error}`);
  }
});

//レベルの保存&通知

//レベルの上限を設定
const MAX_LEVEL = 111;
const EXP_PER_LEVEL = 10; // レベルごとに必要な経験値

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    const isEnabled = await levelsettings.get(message.guild.id);
    if (!isEnabled) return;
    const key = `${message.author.id}-${message.guild.id}`; 
    const level = (await levels.get(key)) || { count: 0, level: 1 };
    const channelId = await channels.get(message.guild.id);
    const customMessage = await messages.get(message.guild.id); // カスタムメッセージを取得
    let levelUp = false;
    if (level.level < MAX_LEVEL) {
      level.count += 1;
      if (level.count >= EXP_PER_LEVEL * level.level) {
        level.count = 0;
        level.level += 1;
        levelUp = true;
      }
    }
    if (channelId && levelUp) {
      const channel = client.channels.cache.get(channelId); 
      if (channel) {
        if (level.level === MAX_LEVEL) {
          channel.send(customMessage ? customMessage.replace('{user.name}', message.author.username).replace('{user}', `<@${message.author.id}>`).replace('{level}', level.level) : `おめでとうございます！<@${message.author.id}>さんのレベルが最大レベル**${level.level}**になりました！`);
        } else {
          channel.send(customMessage ? customMessage.replace('{user.name}', message.author.username).replace('{user}', `<@${message.author.id}>`).replace('{level}', level.level) : `<@${message.author.id}>さんのレベルが${level.level}に上がりました！`);
        }
      }
    }
    levels.set(key, level); 
  } catch (error) {
    console.error(`エラーが発生しました: ${error}`);
  }
});

//即抜け通知
const joinTimestamps = new Map();

client.on('guildMemberAdd', async member => {
    joinTimestamps.set(member.id, Date.now());
});

client.on('guildMemberRemove', async member => {
    const joinTimestamp = joinTimestamps.get(member.id);
    const leaveTimestamp = Date.now();
    const diffMinutes = (leaveTimestamp - joinTimestamp) / 1000 / 60;

    if (diffMinutes <= 10) {
        const isEnabled = await toggleleave.get(member.guild.id);
        if (isEnabled) {
            const channelId = await leaveChannel.get(member.guild.id);
            const channel = member.guild.channels.cache.get(channelId);
            if (channel) {
                channel.send(`${member.user}が即抜けしました`);
            }
        }
    }

    joinTimestamps.delete(member.id);
});

const globalchannels = new Keyv('sqlite://db.sqlite', { table: 'globalchannels' });
const userTokenViolations = new Keyv('sqlite://db.sqlite', { table: 'TokenViolations' });
const userMessageTimestamps = new Map();
const userMessageCounts = new Map();
const globalMessageQueue = [];
const userLastMessageTimes = new Map();

async function sendQueuedMessage() {
  const message = globalMessageQueue.shift();
  if (message) {
    const now = Date.now();
    const lastMessageTime = userLastMessageTimes.get('global') || now;
    const delay = now - lastMessageTime < 1000 ? 1000 - (now - lastMessageTime) : 0;
    setTimeout(async () => {
      userLastMessageTimes.set('global', now + delay);
      const channels = await globalchannels.get('globalchannels');
      const targetChannels = Object.keys(channels).filter(id => id !== message.channel.id);
      targetChannels.forEach(async id => {
        const webhookURL = channels[id];
        if (webhookURL) {
          const webhook = new Discord.WebhookClient({ url: webhookURL });
          try {
            let files = [];
            if (message.attachments.size > 0) {
              message.attachments.each(attachment => {
                files.push({
                  attachment: attachment.url,
                  name: attachment.name
                });
              });
            }
            let content = message.content;
            const mentions = message.mentions.users;
            mentions.each(user => {
              content = content.replace(new RegExp(`<@!?${user.id}>`, 'g'), `＠${user.username}`);
            });
            content = content.replace(/@everyone/g, '＠everyone');
            content = content.replace(/@here/g, '＠here');
            webhook.send({
              content: content,
              files: files,
              username: `${message.author.username} (${message.guild.name}から送信)`,
              avatarURL: message.author.displayAvatarURL()
            }).then(() => {
              message.react('✅');
            }).catch(async error => {
              console.error(`Webhookへのメッセージ送信中にエラーが発生しました: ${error}\nWebhookURL：${webhookURL}`);
              const channels = await globalchannels.get('globalchannels');
              delete channels[id];
              await globalchannels.set('globalchannels', channels);
            });         
            
          } catch (error) {
            console.error(`エラーが発生しました: ${error}`);
          }
        }
      });
      if (globalMessageQueue.length > 0) {
        sendQueuedMessage();
      }
    }, delay);
  }
}

client.on('messageCreate', async message => {
  try {
    if (!message.author.bot) {
      const channels = await globalchannels.get('globalchannels');
      if (channels && channels[message.channel.id]) {

        let userTokenViolationCount = await userTokenViolations.get(message.author.id);
        if (userTokenViolationCount && userTokenViolationCount >= 3) {
          const embed = new EmbedBuilder()
            .setAuthor({ name: '❌｜エラー' })
            .setDescription(`あなたは3回以上Token類似文字列を含むメッセージを送信したため、\nグローバルチャットにメッセージは転送されません。`)
            .setColor('#ff0000');
            message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
          return;
        }
        const now = Date.now();
        userLastMessageTimes.set('global', now);

        const containsToken = /([a-zA-Z0-9-_]{24}\.[a-zA-Z0-9-_]{6}\.[a-zA-Z0-9-_]{27})|mfa\.[a-z0-9_-]{20,}/i.test(message.content);
        if (containsToken) {
          userTokenViolationCount = userTokenViolationCount ? userTokenViolationCount + 1 : 1;
          await userTokenViolations.set(message.author.id, userTokenViolationCount);
          if (userTokenViolationCount < 3) {
            const embed = new EmbedBuilder()
              .setAuthor({ name: '❌｜警告' })
              .setDescription(`Token類似文字列を含むメッセージは送信できません。\n3回以上グローバルチャットにToken類似文字列を送信した場合、\nあなたはグローバルチャットが使用不可能になります。`)
              .setColor('#ff0000');
            message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
            return;
          }
        }
        if (message.content.trim() !== '' || message.attachments.size > 0) {
          const userKey = `${message.author.id}-${message.content}`;
          const lastMessageTimestamp = userMessageTimestamps.get(userKey);
          userMessageTimestamps.set(userKey, now);
          const userCountKey = `${message.author.id}`;
          const messageCount = userMessageCounts.get(userCountKey) || 0;
          userMessageCounts.set(userCountKey, messageCount + 1);
          if (lastMessageTimestamp && (now - lastMessageTimestamp) < 5000) {
            const embed = new EmbedBuilder()
              .setAuthor({ name: '⚠️｜スパム対策' })
              .setDescription(`スパムすることはできません。\nスパムされたメッセージは転送されませんでした。`)
              .setColor('#ffcc00');
              message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
            return;
          }
          if (messageCount >= 4 && (now - lastMessageTimestamp) < 10000) {
            const embed = new EmbedBuilder()
              .setAuthor({ name: '❌｜スパム対策' })
              .setDescription(`スパムが検出されました。\n1分間メッセージの転送が停止されます。`)
              .setColor('#ff0000');
              
            message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
            setTimeout(() => {
              userMessageCounts.delete(userCountKey);
            }, 60000);
            return;
          }
          setTimeout(() => {
            userMessageTimestamps.delete(userKey);
          }, 5000);
          globalMessageQueue.push(message);
          if (globalMessageQueue.length === 1) {
            sendQueuedMessage();
          }
        }
      }
    }
  } catch (error) {
    console.error(`エラーが発生しました: ${error}`);
  }
});

//入退室ログ
client.on("guildMemberAdd", member => {
  if (member.user.bot) return;
  if (member.guild.id !== "your_guildid") return;
  member.guild.channels.cache.get("your_channelid").send(`${member.user}さん、${member.guild.name}へようこそ！`);
});

client.on("guildMemberAdd", member => {
  if (member.guild.id !== "your_guildid") return;
  member.guild.channels.cache.get("your_channelid").send(`${member.user}さん、${member.guild.name}へようこそ！\n(channelurl) で認証することで、会話に参加できます`);
});

//曜日表示
const days = ['日', '月', '火', '水', '木', '金', '土'];
client.on('ready', () => {
    let channel = client.channels.cache.get('your_channelid');
    setInterval(() => {
        let date = new Date();
        let day = days[date.getDay()];
        let newName = `${date.getMonth()+1}/${date.getDate()} - ${day}`;
        channel.setName(newName)
            .catch(console.error);
    }, 600000); // 5分ごとに更新
});

//helpコマンドのボタン処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'osouji_first_button') {
    try {
      const embed = new EmbedBuilder()
          .setTitle('1ページ目')
          .setColor('#0099ff')
          .setDescription('**アプリケーションコマンド(/)**' +
                          '\n\n' +
                          '**/huntersakuya**：お掃除上方修正しろと返信' +
                          '\n\n' +
                          '**/osouji**：お掃除上方修正しろと返信' +
                          '\n\n' +
                          '**/osouji_image**：お掃除上方修正しろの画像を返信' +
                          '\n\n' +
                          '**/ping**：通信速度を測定' +
                          '\n\n' +
                          '**/earthquake**：地震情報を表示' +
                          '\n\n' +
                          '**/avatar**：指定したユーザーのアイコンを表示' +
                          '\n\n' +
                          '**/omikuji**：おみくじをします' +
                          '\n\n' +
                          '**/kaso**：過疎化していますの画像を表示します'+
                          '\n\n' +
                          '**/say**：入力したメッセージをお掃除上方修正しろbotに喋らせます');

      await interaction.update({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
  }

  if (interaction.customId === 'osouji_second_button') {
    try {
      const embed = new EmbedBuilder()
          .setTitle('2ページ目')
          .setColor('#0099ff')
          .setDescription('**アプリケーションコマンド(/)**' +
                          '\n\n' +
                          '**/raitai_enemy_simulator**：擂台予報をするボタンを出します' +
                          '\n\n' +
                          '**/support**：サポートサーバーのリンクを貼ります' +
                          '\n\n' +
                          '**/help**：今表示してるものです' +
                          '\n\n' +
                          '**/level**：現在のレベルを表示します' +
                          '\n\n' +
                          '**/level_ranking**：サーバー内のレベルランキングを表示します' +
                          '\n\n' +
                          '**/shorturl**：短縮URLを生成します' +
                          '\n\n' +
                          '**/5000choyen**：5000兆円ジェネレーターを使用します' +
                          '\n\n' +
                          '**/quiz**：クイズをします。(詳しくはサポートサーバー)' +
                          '\n\n'+
                          '**/roulette：**ルーレットをします。(詳しくはサポートサーバー)');
      await interaction.update({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
  }

  if (interaction.customId === 'osouji_third_button') {
    try {
    const embed = new EmbedBuilder()
        .setTitle('3ページ目')
        .setColor('#0099ff')
        .setDescription('**アプリケーションコマンド(指定の権限が必要)**' +
                        '\n\n'+
                        '**/timeout**：指定したユーザーをTimeoutします(ユーザーをTimeoutする権限が必要)' +
                        '\n\n'+
                        '**/kick**：指定したユーザーをKickします(ユーザーをKickする権限が必要)' +
                        '\n\n' +
                        '**/ban**：指定したユーザーをBanします(ユーザーをBanする権限が必要)' +
                        '\n\n'+
                        '**/createrolepanel**：ロールパネルを作成します(管理者権限が必要)'+
                        '\n\n'+
                        '**/createverifypanel**：指定した形式の認証パネルを作成します(管理者権限が必要)'+
                        '\n\n'+
                        '**/setlevel**：指定したユーザーのレベルを指定します(管理者権限が必要)'+
                        '\n\n' +
                        '**/settogglelevel**：レベル機能を有効化するか設定します(管理者権限が必要)'+
                        '\n\n' +
                        '**/settoggleleave**：即抜けの通知を有効化するか設定します(管理者権限が必要)' +
                        '\n\n' +
                        '**/setinappdel**：不適切な発言の自動削除を設定します(管理者権限が必要)' +
                        '\n\n' +
                        '**/setosoujireply**：「お掃除」などの単語に対して反応する機能を有効にするか設定します(管理者権限が必要)');
    await interaction.update({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
  }

  if (interaction.customId === 'osouji_home_button') {
    try {
    const embed = new EmbedBuilder()
        .setTitle('お掃除上方修正しろbotVer3.0のヘルプ')
        .setColor('#0099ff')
        .setDescription('以下のボタンを押してヘルプを表示');
      await interaction.update({ embeds: [embed] });
    } catch (err) {
      return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
  }

  if (interaction.customId === 'osouji_delete_button') {
    let message;
    try {
      message = await interaction.channel.messages.fetch(interaction.message.id);
    } catch (err) {
      console.error(`Fメッセージの取得に失敗しました: ${err}`);
      return interaction.reply({ content: 'メッセージの取得に失敗しました。', ephemeral: true });
    }

    try {
      await message.delete();
    } catch (err) {
      console.error(`メッセージの削除に失敗しました: ${err}`);
      return interaction.reply({ content: 'メッセージの削除に失敗しました。', ephemeral: true });
    }

    await interaction.reply({ content: 'ヘルプを削除しました。', ephemeral: true });
  }

});

//擂台予報
const cooldowns = new Map();

client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'raitai_enemy_simulator') {
      const now = Date.now();
      const cooldownAmount = 10 * 60 * 1000; // 10分のクールタイム

      if (cooldowns.has(interaction.user.id)) {
        const expirationTime = cooldowns.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const totalSeconds = Math.round((expirationTime - now) / 1000);
          const minutes = Math.floor(totalSeconds / 60) % 60;
          const seconds = totalSeconds % 60;
          return interaction.reply({ content: `クールタイム中です。残り${minutes}分${seconds}秒`, ephemeral: true });
        }
      }

      cooldowns.set(interaction.user.id, now);
      setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);

      let data;
      try {
        data = await fs.promises.readFile('./data.json', 'utf-8');
      } catch (err) {
        console.error(`ファイルの読み取りに失敗しました: ${err}`)
        return interaction.reply({ content: 'エラーが発生しました', ephemeral: true });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (err) {
        console.error(`JSONの解析に失敗しました: ${err}`);
        return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }

      const content = [];
      const selectedElements = [];

      for (let wave = 1; wave <= 4; wave++) {
        const numElements = Math.floor(Math.random() * 3) + 1;
        const waveElements = [];
        for (let i = 0; i < numElements; i++) {
          let randomIndex;
          let randomElement;
          do {
            randomIndex = Math.floor(Math.random() * jsonData.length);
            randomElement = jsonData[randomIndex];
          } while (selectedElements.includes(randomElement));
          selectedElements.push(randomElement);
          waveElements.push(randomElement);
        }
        content.push(`**${wave}wave目**\n${waveElements.map(element => `${element.name} ${element.description}`).join('\n\n')}`);
      }
      const raitai_embed = new EmbedBuilder()
        .setTitle('明日の擂台予報')
        .setDescription(`実行者：<@${interaction.user.id}>\n\n` + content.join('\n\n'))
        .setColor('#0099ff');

      await interaction.reply({
        embeds: [raitai_embed],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId('delete_raitai_embed')
              .setLabel('擂台予報を削除')
              .setStyle('Danger')
              .setEmoji('\u{1F5D1}')
            ),
        ],
      });
    }

    if (interaction.customId === 'delete_raitai_embed') {
      let message;
      try {
        message = await interaction.channel.messages.fetch(interaction.message.id);
      } catch (err) {
        console.error(`メッセージの取得に失敗しました: ${err}`);
        return interaction.reply({ content: 'メッセージの取得に失敗しました。', ephemeral: true });
      }

      if (message) {
        try {
          await message.delete();
        } catch (err) {
          return interaction.reply({ content: 'メッセージは既に削除されています', ephemeral: true });
        }
      } else {
        return interaction.reply({ content: 'メッセージは既に削除されています。', ephemeral: true });
      }

      await interaction.reply({ content: '擂台予報の埋め込みを削除しました。', ephemeral: true });
    }
  } catch (err) {
    console.error(`エラーが発生しました: ${err}`);
    interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
});
