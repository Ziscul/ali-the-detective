import BaseClient from '../../util/BaseClient';
import { ApplicationCommandType, CommandInteraction, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, Message, InteractionCollector, ButtonInteraction, CacheType } from 'discord.js';

export default {
	name: 'compile',
	description: 'A safe, simple code compiler evaluation',
	type: ApplicationCommandType.ChatInput,
	run: async (_client: BaseClient, interaction: CommandInteraction, _args: string[]) => {
		/* Types */
		type Embeds = {
			main: EmbedBuilder;
			fail: EmbedBuilder;
		};

		type Collectors = {
			collector1: InteractionCollector<ButtonInteraction<CacheType>>;
		}

		/* Interaction */
		await interaction.deferReply({ ephemeral: false });

		const component = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('code')
				.setLabel('Insert Code')
				.setStyle(2)
				.setEmoji({
					id: '1106795011737133118'
				}),
		),

			embeds: Embeds = {
				main: new EmbedBuilder()
					.setTitle('Compile Code')
					.setDescription('To insert code, click the insert code button below. You can keep inserting code multiple times.')
					.setColor(0x4b9cd3)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
				fail: new EmbedBuilder()
					.setDescription(
						'This interaction is\'nt for you. Try making your own interaction by using the </compile:0> command.',
					)
					.setColor(0xfa5f55),
			},

			msg: Message = await interaction.followUp({ embeds: [embeds.main], components: [component] }),

			collectors: Collectors = {
				collector1: msg.createMessageComponentCollector({
					componentType: ComponentType.Button,
				}),
			};

		collectors.collector1.on('collect', async i => {
			if (i.user.id !== interaction.user.id) {
				await i.followUp({
					embeds: [embeds.fail],
					ephemeral: true,
				});
			}

			if (i.customId === 'code') {
				const modal: ModalBuilder = new ModalBuilder()
					.setCustomId('modal-compile')
					.setTitle('Compile Code'),

					inputLanguage: TextInputBuilder = new TextInputBuilder()
							.setCustomId('language-input')
							.setLabel('Programming Language')
							.setPlaceholder('Enter what language your code is in here')
							.setStyle(TextInputStyle.Short)
							.setMaxLength(20)
							.setRequired(true),

					inputCode: TextInputBuilder = new TextInputBuilder()
						.setCustomId('code-input')
						.setLabel('Code')
						.setPlaceholder('Enter your code to evaluate here')
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(true),

					actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(inputLanguage, inputCode);

				modal.addComponents([actionRow]);
				await i.showModal(modal);
			}
		});
	},
};
