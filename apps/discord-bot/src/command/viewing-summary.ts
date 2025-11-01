import type { User, Video } from '@ikihaji-tube/core/model';
import type { CommandInteraction, GuildMember } from 'discord.js';
import { getUsers } from '#discord-bot/util/get-users';

type VideoAndUserRelation = {
  video: Video;
  users: User[];
};

export const viewingSummaryCommand = async (interaction: CommandInteraction) => {
  if (!interaction.guild) {
    await interaction.reply('`/viewing_summary` はサーバー内でのみ使用できます。');
    return;
  }

  await interaction.deferReply();

  await viewingSummary(
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
    // stringまたはEmbedBuilderを受け取るreply関数
    async message => {
      if (message) {
        await interaction.editReply(message);
      } else {
        await interaction.editReply(message);
      }
    },
  );
};

export const viewingSummary = async (
  groupId: string,
  userIdToGuildMember: (userId: string) => Promise<GuildMember | null>,
  // reply: (message: string | EmbedBuilder) => Promise<void>,
  reply: (message: string) => Promise<void>,
) => {
  const users = await getUsers(groupId);

  // 1. 複数人が視聴した動画（2人以上）のリストを全て作成
  const videoAndUserRelations = users
    .reduce<VideoAndUserRelation[]>((acc, user) => {
      user.viewingHistory.forEach(video => {
        const videoAndUserRelation = acc.find(relation => relation.video.id === video.id);
        if (videoAndUserRelation) {
          videoAndUserRelation.users.push(user);
        } else {
          acc.push({ video, users: [user] });
        }
      });

      return acc;
    }, [])
    .filter(relation => relation.users.length >= 2);

  if (videoAndUserRelations.length === 0) {
    await reply('複数人が視聴した動画はありません');
    return;
  }

  // 3. 複数人が視聴した動画のリストからランダムで1つ選択
  const randomIndex = Math.floor(Math.random() * videoAndUserRelations.length);
  const randomRelation = videoAndUserRelations[randomIndex];

  if (!randomRelation) {
    await reply('視聴履歴が見つかりませんでした');
    return;
  }

  // 4. 視聴したユーザーのGuildMember情報を取得し、メンションを作成
  const coViewers = (
    await Promise.all(
      randomRelation.users.map(user => {
        // biome-ignore lint/suspicious/noConsoleLog:
        console.log('Fetching user from Discord:', user.id);
        return userIdToGuildMember(user.id);
      }),
    )
  ).filter((member): member is GuildMember => member !== null);

  // 5. メンション形式の文字列を作成
  if (coViewers.length >= 2) {
    const mentions = coViewers.map(member => `<@${member.id}>`).join(' と ');
    const videoUrl = `https://www.youtube.com/watch?v=${randomRelation.video.id}`;

    // 文字列で返信
    await reply(`${mentions} はこの動画を一緒に視聴しました！\n${videoUrl}`);

    // (補足: もしユーザー取得に失敗し、coViewersが2未満になってしまった場合は、
    // ここで返信せず処理を終えるか、エラーログを出すなどの対応が考えられますが、
    // 成功パターンに絞って処理を完了します)
  } else {
    // ユーザー情報が取得できなかった場合も、念のため「視聴履歴なし」のEmbedで代替
    await reply('視聴ユーザーが見つかりませんでした');
  }
};
