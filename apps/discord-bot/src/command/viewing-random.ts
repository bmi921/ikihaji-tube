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
    async message => {
      if (message instanceof EmbedBuilder) {
        await interaction.editReply({ embeds: [message] });
      } else {
        await interaction.editReply(message);
      }
    },
  );
};

// 埋め込み形式で表示するバージョン
// export const viewingRandom = async (
//   groupId: string,
//   userIdToGuildMember: (userId: string) => Promise<GuildMember | null>,
//   reply: (embeds: EmbedBuilder[]) => Promise<void>,
// ) => {
//   const users = await getUsers(groupId);

//   const embedsResult =
//     users.length > 0
//       ? await Promise.all(
//           users.map(async user => {
//             const randomVideo = user.viewingHistory[Math.floor(Math.random() * user.viewingHistory.length)];
//             if (!randomVideo) {
//               return null;
//             }

//             // biome-ignore lint/suspicious/noConsoleLog:
//             console.log('Fetching user from Discord:', user.id);
//             const viewedUser = await userIdToGuildMember(user.id);
//             if (!viewedUser) {
//               return null;
//             }

//             return new EmbedBuilder()
//               .setTitle(`${viewedUser.displayName} がこの動画を視聴しました`)
// .setThumbnail(`${viewedUser.user.displayAvatarURL()}`)
//               .setDescription(`[${randomVideo.title}](https://www.youtube.com/watch?v=${randomVideo.id})`)
//               .setImage(`${randomVideo.thumbnailUrl}`)
//               .setFooter({ text: 'Random selection of videos viewed by each user individually' })
//               .setTimestamp()
//               .setColor(0xc37d9b);
//           }),
//         )
//       : [];

//   const embeds = embedsResult.filter((embed): embed is EmbedBuilder => embed !== null);

//   if (embeds.length > 0) {
//     await reply(embeds);
//   } else {
//     await reply([
//       new EmbedBuilder()
//         .setTitle('視聴履歴がありません')
//         .setDescription('まずは動画を視聴してみましょう！')
//         .setFooter({ text: 'Random selection of videos viewed by each user individually' })
//         .setTimestamp()
//         .setColor(0xc37d9b),
//     ]);
//   }
// };

export const viewingRandom = async (
  groupId: string,
  userIdToGuildMember: (userId: string) => Promise<GuildMember | null>,
  reply: (message: string | EmbedBuilder) => Promise<void>,
) => {
  const users = await getUsers(groupId);

  // biome-ignore lint/suspicious/noConsoleLog:
  console.log(`Guild ${groupId} has ${users.length} members with viewing history.`);

  const randomUser = users[Math.floor(Math.random() * users.length)];
  if (!randomUser) {
    await reply(
      new EmbedBuilder()
        .setTitle('視聴履歴がありません')
        .setDescription('まずは動画を視聴してみましょう！')
        .setColor(0xc37d9b),
    );
    return;
  }

  const randomVideo = randomUser.viewingHistory[Math.floor(Math.random() * randomUser.viewingHistory.length)];
  if (!randomVideo) {
    // biome-ignore lint/suspicious/noConsoleLog:
    console.log(`User ${randomUser.id} has no viewing history.`);
    await reply(
      new EmbedBuilder()
        .setTitle('視聴履歴がありません')
        .setDescription('まずは動画を視聴してみましょう！')
        .setColor(0xc37d9b),
    );
    return;
  }

  const randomGuildMember = await userIdToGuildMember(randomUser.id);
  if (randomGuildMember) {
    // biome-ignore lint/suspicious/noConsoleLog:
    console.log('Selected Video:', randomUser.id, randomVideo, randomGuildMember.displayName);
  } else {
    // biome-ignore lint/suspicious/noConsoleLog:
    console.log('no users:', randomUser.id);
  }

  if (randomVideo && randomUser && randomGuildMember) {
    await reply(
      `<@${randomGuildMember.id}>はこの動画を視聴しました！\nhttps://www.youtube.com/watch?v=${randomVideo.id}`,
    );
    return;
  }
};
