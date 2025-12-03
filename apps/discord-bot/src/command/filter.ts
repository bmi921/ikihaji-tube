import { treaty } from '@elysiajs/eden';
import type { App } from '@ikihaji-tube/api';
import { getBaseUrl } from '@ikihaji-tube/core/util';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

const _filterCommand = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Set or view the filter prompt for random videos.')
    .addSubcommand(subcommand => subcommand.setName('view').setDescription('View the current filter prompt.'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set the filter prompt.')
        .addStringOption(option =>
          option.setName('prompt').setDescription('The prompt to filter videos.').setRequired(true),
        ),
    )
    .addSubcommand(subcommand => subcommand.setName('clear').setDescription('Clear the filter prompt.')),
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply('This command can only be used in a server.');
      return;
    }

    const client = treaty<App>(getBaseUrl({ app: 'api' }).toString());
    const groupId = interaction.guild.id;

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(getBaseUrl({ app: 'api' }).toString());

    await interaction.deferReply({ ephemeral: true });

    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'view') {
        const { data, error } = await client.api.groups({ groupId }).filter.get();
        if (error) {
          await interaction.editReply('Failed to fetch the filter prompt.a');
          return;
        }
        const prompt = data;
        if (prompt) {
          await interaction.editReply(`Current filter prompt: ${prompt}`);
        } else {
          await interaction.editReply('No filter prompt is set.');
        }
      } else if (subcommand === 'set') {
        const prompt = interaction.options.getString('prompt', true);
        const { error } = await client.api.groups({ groupId }).filter.post({ prompt });
        if (error) {
          await interaction.editReply('Failed to fetch the filter prompt.b');
          return;
        }
        await interaction.editReply('Filter prompt has been set.');
      } else if (subcommand === 'clear') {
        const { error } = await client.api.groups({ groupId }).filter.delete();
        if (error) {
          // throw new Error(error.value);
          await interaction.editReply('Failed to fetch the filter prompt.c');
          return;
        }
        await interaction.editReply('Filter prompt has been cleared.');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      await interaction.editReply(`Error: ${errorMessage}`);
    }
  },
};

export const filterCommandData = _filterCommand.data;
export const filterCommand = _filterCommand.execute;
