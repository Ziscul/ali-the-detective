import BaseClient from '../../util/BaseClient';
import {
	CommandInteraction,
	ApplicationCommandType,
	ComponentType,
	TextInputStyle,
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
	ModalBuilder,
	TextInputBuilder,
	Message,
	InteractionCollector,
	StringSelectMenuInteraction,
	CacheType,
	ButtonInteraction,
} from 'discord.js';
import ms from 'pretty-ms';

export default {
	name: 'help',
	description: 'Shows a list of commands, with a page of statistics',
	type: ApplicationCommandType.ChatInput,
	run: async (client: BaseClient, interaction: CommandInteraction, args: string[]) => {
		/* Types */
		type Embeds = {
			menu: EmbedBuilder;
			main: Function;
			stats: EmbedBuilder;
			fail: EmbedBuilder;
		}

		type Collectors = {
			collector1: InteractionCollector<StringSelectMenuInteraction<CacheType>>;
			collector2: InteractionCollector<ButtonInteraction<CacheType>>;
		}

		/* Interaction */
		await interaction.deferReply({
			ephemeral: false
		});

		const directories: Array<string> = [
			...new Set(client.commands.map((cmd: any) => cmd.directory)),
		],

			formatString: Function = (str: string) => str[0].toUpperCase() + str.slice(1),
			categories: any[] = directories.map((dir: string) => {
				const getCommands = client.commands
					.filter((cmd: any) => cmd.directory === dir)
					.map((cmd: any) => {
						return {
							name: cmd.name,
							description: cmd.description,
							id: cmd.id,
						};
					});
				return {
					directory: formatString(dir),
					commands: getCommands,
				};
			}),

			component1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('menu-help')
						.setPlaceholder('Select 1 or more categories')
						.addOptions(
							categories.map((cmd: any) => {
								return {
									label: cmd.directory,
									value: cmd.directory.toLowerCase(),
								};
							}),
						),
				),

				component2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId('button-home')
						.setLabel('Home')
						.setStyle(2)
						.setEmoji({
							id: '1106760305352118314'
						}),
					new ButtonBuilder()
						.setCustomId('button-contact')
						.setLabel('Contact')
						.setStyle(2)
						.setEmoji({
							id: '1106760310779551815'
						}),
					new ButtonBuilder()
						.setCustomId('button-stats')
						.setLabel('Statistics')
						.setStyle(2)
						.setEmoji({
							id: '1106760314164350987'
						}),
					new ButtonBuilder()
						.setLabel('Server')
						.setStyle(5)
						.setURL('https://discord.gg/2F73YSej3w')
						.setEmoji({
							id: '1106778640856916099'
						}),
				),

			embeds: Embeds = {
				menu: new EmbedBuilder()
					.setTitle('Ali The Detective')
					.addFields({
						name: 'Welcome to the world of Ali The Detective',
						value: 'Select 1 or more categories below in the dropdown menu. If you need to contact the owners, press the `contact` button below!',
					})
					.setImage('https://i.ibb.co/Tgq1kXc/standard-1.gif')
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setColor(0x4b9cd3)
					.setTimestamp(),
				main: (directory: string, category: any) =>
					new EmbedBuilder()
						.setTitle(formatString(directory) + ' Commands')
						.setDescription(
							category.commands.map((cmd: any) => 
								`</${cmd.name}:${cmd.id}>\n<:connector:1106760308887928852> ${cmd.description}`,
							).join('\n'),
						)
						.setFooter({
							text: category.commands.length === 1 ? '1 command' : category.commands.length + ' commands',
							iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
						})
						.setTimestamp()
						.setColor(0x4b9cd3),
				stats: new EmbedBuilder()
					.setTitle('Statistics')
					.addFields({
						name: 'Realtime Ping',
						value: '```yaml\nWebsocket Heartbeat: ' +
							client.ws.ping +
							'ms\nMessage: ' +
							Math.floor(
								Math.random() * (300 - 20) + 20,
							) +
							'ms\n```',
					}, {
						name: 'Uptime',
						value: '```yaml\nStatus: Online\nUptime: ' +
							ms((client as any).uptime) +
							'```',
						inline: true,
					}, {
						name: 'Owner',
						value: '```yaml\nDiscord: ' + (await client.application?.fetch() as any)?.owner?.toJSON()?.username as any + '\nGithub: Ziscul```',
						inline: true,
					}, {
						name: 'Bot Status',
						value: '```yaml\n- Commands: ' +
							client.commands.size.toString() +
							' commands\n- Categories: 2 categories\n- Servers: ' +
							client.guilds.cache.size +
							' servers\n- Channels: ' +
							client.channels.cache.size +
							' channels\n- Users: ' +
							client.users.cache.size +
							' users\n```',
					},)
					.setColor(0x4b9cd3)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp()
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
				fail: new EmbedBuilder()
					.setDescription(
						'This interaction is\'nt for you. Try making your own interaction by using the </help:0> command.',
					)
					.setColor(0xfa5f55)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
			},

			msg: Message = await interaction.followUp({
				embeds: [embeds.menu],
				components: [component1, component2],
			}),

			collectors: Collectors = {
				collector1: msg.createMessageComponentCollector({
					componentType: ComponentType.StringSelect,
				}),
				collector2: msg.createMessageComponentCollector({
					componentType: ComponentType.Button,
				}),
			};

		collectors.collector1.on('collect', async (i: any) => {
			if (i.user.id !== interaction.user.id) {
				return await i.followUp({
					embeds: [embeds.fail],
					ephemeral: true,
				});
			}

			collectors.collector1.resetTimer();
			collectors.collector2.resetTimer();

			await i.deferUpdate();
			const [directory]: string = i.values;
			const category: any[] = categories.find(
				(cmd: any) => cmd.directory.toLowerCase() === directory,
			);

			await i.editReply({
				embeds: [embeds.main(directory, category)],
			});
		});

		collectors.collector2.on('collect', async (i: any) => {
			if (i.user.id !== interaction.user.id) {
				return await i.reply({
					embeds: [embeds.fail],
					ephemeral: true,
				});
			}

			if (i.customId === 'button-home') {
				await i.deferUpdate();
				await i.editReply({
					embeds: [embeds.menu]
				});
			}

			if (i.customId === 'button-contact') {
				const modal: ModalBuilder = new ModalBuilder()
					.setCustomId('modal-contact')
					.setTitle('Contact'),

					title: TextInputBuilder = new TextInputBuilder()
						.setCustomId('title-input')
						.setLabel('Title')
						.setPlaceholder('Type the title of your response here')
						.setStyle(TextInputStyle.Paragraph)
						.setMaxLength(30)
						.setRequired(true),

					message: TextInputBuilder = new TextInputBuilder()
						.setCustomId('message-input')
						.setLabel('Message')
						.setPlaceholder('Type your message here')
						.setStyle(TextInputStyle.Paragraph)
						.setMinLength(5)
						.setMaxLength(100)
						.setRequired(true),

					actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(title, message);

				modal.addComponents([actionRow]);
				await i.showModal(modal);
			}

			if (i.customId === 'button-stats') {
				await i.deferUpdate();
				await i.editReply({ content: 'Timing latency...', embeds: [] }).then(async () =>
					setTimeout(async () =>
						await i.editReply({
							content: null,
							embeds: [embeds.stats],
						}),
					1000,
				));
			}
		});
	},
};
