const { EmbedBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const Keyv = require('keyv');
const verify = new Keyv('sqlite://db.sqlite');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	  async execute(interaction) {
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
      
          const botMember = interaction.guild.members.cache.get(global.client.user.id);
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
            label = `${num1} + ${num2} = ?`;
          } else if (operation === 1) {
            // 引き算の場合、num1 >= num2 となるように調整
            if (num2 > num1) {
              let temp = num1;
              num1 = num2;
              num2 = temp;
            }
            answer = num1 - num2;
            label = `${num1} - ${num2} = ?`;
          } else if (operation === 2) {
            // 掛け算の場合
            answer = num1 * num2;
            label = `${num1} × ${num2} = ?`;
          } else {
            // 割り算の場合、num1 >= num2 となるように調整し、num1 が num2 の倍数となるように調整
            num2 = Math.floor(Math.random() * 10 + 1);
            num1 = num2 * Math.floor(Math.random() * 10 + 1);
            answer = num1 / num2;
            label = `${num1} ÷ ${num2} = ?`;
          }
      
          const modalId = 'calcAuth' + interaction.user.id + Date.now();
          const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle(label);
      
          const problemInput = new TextInputBuilder()
            .setCustomId('problemInput')
            .setLabel('答えを半角数字で入力してください')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('答えを半角数字でここに入力');
      
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
	},
};