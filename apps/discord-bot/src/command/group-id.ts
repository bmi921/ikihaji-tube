import { type CommandInteraction } from 'discord.js';

export const groupIdCommand = async (interaction: CommandInteraction) => {
  if (!interaction.guildId) {
    await interaction.reply('このコマンドはサーバー内でのみ使用できます。');
    return;
  }

  await interaction.reply(`このサーバーのグループIDは ${interaction.guildId} です。`);
};
