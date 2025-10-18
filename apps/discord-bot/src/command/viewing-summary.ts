import type { User, Video } from '@ikihaji-tube/core/model';
import { type CommandInteraction, EmbedBuilder, type GuildMember } from 'discord.js';
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
    async embeds => {
      await interaction.editReply({ embeds });
    },
  );
};

export const viewingSummary = async (
  groupId: string,
  userIdToGuildMember: (userId: string) => Promise<GuildMember | null>,
  reply: (embeds: EmbedBuilder[]) => Promise<void>,
) => {
  const users = await getUsers(groupId);

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

  const embeds =
    videoAndUserRelations.length > 0
      ? (
          await Promise.all(
            videoAndUserRelations.map(async relation => {
              const coViewers = (
                await Promise.all(
                  relation.users.map(user => {
                    // biome-ignore lint/suspicious/noConsoleLog:
                    console.log('Fetching user from Discord:', user.id);
                    return userIdToGuildMember(user.id);
                  }),
                )
              ).filter((member): member is GuildMember => member !== null);

              if (coViewers.length < 2) {
                return null;
              }

              const usersJoined = coViewers.map(member => member.displayName).join(' と ');
              return new EmbedBuilder()
                .setTitle('複数人が視聴した動画があります！')
                .setDescription(
                  `${usersJoined} はこの動画を視聴しました\n[${relation.video.title}](https://www.youtube.com/watch?v=${relation.video.id})`,
                )
                .setImage(`${relation.video.thumbnailUrl}`)
                .setFooter({ text: 'Videos viewed by multiple users' })
                .setTimestamp()
                .setColor(0xc37d9b);
            }),
          )
        ).filter((embed): embed is EmbedBuilder => embed !== null)
      : [];

  if (embeds.length > 0) {
    await reply(embeds);
  } else {
    await reply([
      new EmbedBuilder()
        .setTitle('複数人が視聴した動画はありません')
        .setDescription('まずは動画を視聴してみましょう！')
        .setFooter({ text: 'Videos viewed by multiple users' })
        .setTimestamp()
        .setColor(0xc37d9b),
    ]);
  }
};
