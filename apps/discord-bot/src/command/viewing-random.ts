import { type CommandInteraction, EmbedBuilder, type GuildMember } from 'discord.js';
import { getUsers } from '#discord-bot/util/get-users';

export const viewingRandomCommand = async (interaction: CommandInteraction) => {
  if (!interaction.guild) {
    await interaction.reply('`/viewing_random` はサーバー内でのみ使用できます。');
    return;
  }

  await interaction.deferReply();

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
    async embeds => {
      await interaction.editReply({ embeds });
    },
  );
};

export const viewingRandom = async (
  groupId: string,
  userIdToGuildMember: (userId: string) => Promise<GuildMember | null>,
  reply: (embeds: EmbedBuilder[]) => Promise<void>,
) => {
  const users = await getUsers(groupId);

  const embedsResult =
    users.length > 0
      ? await Promise.all(
          users.map(async user => {
            const randomVideo = user.viewingHistory[Math.floor(Math.random() * user.viewingHistory.length)];
            if (!randomVideo) {
              return null;
            }

            // biome-ignore lint/suspicious/noConsoleLog:
            console.log('Fetching user from Discord:', user.id);
            const viewedUser = await userIdToGuildMember(user.id);
            if (!viewedUser) {
              return null;
            }

            return new EmbedBuilder()
              .setTitle(`${viewedUser.displayName} がこの動画を視聴しました`)
              .setThumbnail(`${viewedUser.user.displayAvatarURL()}`)
              .setDescription(`[${randomVideo.title}](https://www.youtube.com/watch?v=${randomVideo.id})`)
              .setImage(`${randomVideo.thumbnailUrl}`)
              .setFooter({ text: 'Random selection of videos viewed by each user individually' })
              .setTimestamp()
              .setColor(0xc37d9b);
          }),
        )
      : [];

  const embeds = embedsResult.filter((embed): embed is EmbedBuilder => embed !== null);

  if (embeds.length > 0) {
    await reply(embeds);
  } else {
    await reply([
      new EmbedBuilder()
        .setTitle('視聴履歴がありません')
        .setDescription('まずは動画を視聴してみましょう！')
        .setFooter({ text: 'Random selection of videos viewed by each user individually' })
        .setTimestamp()
        .setColor(0xc37d9b),
    ]);
  }
};
