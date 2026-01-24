import { treaty } from '@elysiajs/eden';
import type { App } from '@ikihaji-tube/api';
import { getBaseUrl } from '@ikihaji-tube/core/util';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { getUsers } from '#discord-bot/util/get-users';
import { filterVideosWithGemini } from '../util/gemini';

export const viewingRandomCommand = async (interaction: CommandInteraction) => {
  if (!interaction.guild) {
    await interaction.reply('`/viewing_random` はサーバー内でのみ使用できます。');
    return;
  }

  await interaction.deferReply();

  const client = treaty<App>(getBaseUrl({ app: 'api' }).toString());
  const { data: prompt } = await client.api.groups({ groupId: interaction.guild.id }).filter.get();

  await viewingRandom(
    interaction.guild.id,
    async userId => {
      try {
        return await interaction.guild!.members.fetch(userId);
      } catch {
        // biome-ignore lint/suspicious/noConsoleLog:
        console.log(`Failed to fetch user ${userId} from guild`);
        return null;
      }
    },
    async message => {
      if (message) {
        await interaction.editReply(message);
      } else {
        await interaction.editReply(message);
      }
    },
    prompt,
  );
};

export const viewingRandom = async (
  groupId: string,
  userIdToGuildMember: (userId: string) => Promise<GuildMember | null>,
  reply: (message: string) => Promise<void>,
  prompt?: string | null,
) => {
  const users = await getUsers(groupId);
  if (users.length === 0) {
    await reply('視聴履歴がありません');
    return;
  }

  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log(`Total users in group ${groupId}: ${users.length}`);

  const allVideos = users.flatMap(user => user.viewingHistory.map(video => ({ video, user })));

  if (allVideos.length === 0) {
    await reply('視聴履歴がありません');
    return;
  }

  // Get up to 10 random videos
  const randomVideos = allVideos.sort(() => 0.5 - Math.random()).slice(0, 10);

  const shareableVideos = await filterVideosWithGemini(
    randomVideos.map(item => item.video),
    prompt,
  );

  if (shareableVideos.length === 0) {
    await reply('共有できる適切な動画が見つかりませんでした。');
    return;
  }

  const randomVideo = shareableVideos[Math.floor(Math.random() * shareableVideos.length)];
  if (!randomVideo) {
    await reply('エラーが発生しました。');
    return;
  }
  const originalContext = randomVideos.find(item => item.video.id === randomVideo.id);

  if (!originalContext) {
    await reply('エラーが発生しました。');
    return;
  }

  const member = await userIdToGuildMember(originalContext.user.id);
  if (!member) {
    await reply('エラーが発生しました。');
    return;
  }

  await reply(`<@${member.id}>はこの動画を視聴しました！\nhttps://www.youtube.com/watch?v=${randomVideo.id}`);

  // TODO: ここで、DBからrandomVideo.idの動画のレコードを視聴履歴テーブルから削除する
  const client = treaty<App>(getBaseUrl({ app: 'api' }).toString());
  await client.api.groups({ groupId })['viewing-history'].delete({
    videoId: randomVideo.id,
    userIds: [originalContext.user.id],
  });
};
