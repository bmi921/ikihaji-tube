import { treaty } from '@elysiajs/eden';
import type { App } from '@ikihaji-tube/api';
import { getBaseUrl } from '@ikihaji-tube/core/util';
import { ChannelType, type Client, type CommandInteraction } from 'discord.js';

export const registerCommand = async (interaction: CommandInteraction, client: Client) => {
  if (interaction.channel === null || interaction.channel.type !== ChannelType.GuildText) {
    await interaction.reply('`/register` はテキストチャンネルでのみ使用できます。');
    return;
  }

  const webhooks = await interaction.channel.fetchWebhooks();
  const webhook =
    webhooks.find(webhook => client.user && webhook.owner?.id === client.user.id) ??
    (await interaction.channel.createWebhook({
      name: 'IkihajiTube',
      avatar: 'https://avatars.githubusercontent.com/u/186720720',
      reason: 'Webhook to send viewing summary to the channel.',
    }));

  const groupId = interaction.guildId;
  if (!groupId) {
    await interaction.reply('サーバーIDが取得できませんでした。');
    return;
  }

  const clientRPC = treaty<App>(getBaseUrl({ app: 'api' }).toString());
  // biome-ignore lint/suspicious/noConsoleLog:
  console.log(getBaseUrl({ app: 'api' }).toString());

  const { error } = await clientRPC.api.groups({ groupId }).webhook.post({ url: webhook.url });

  if (error) {
    // biome-ignore lint/suspicious/noConsoleLog:
    console.error(error);
    await interaction.reply('Webhookの登録に失敗しました。');
    return;
  }

  await interaction.reply(`${interaction.channel} で ${webhook.name} が定期実行するように設定しました。`);
};
