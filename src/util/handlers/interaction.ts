import { Interaction, Events, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import BaseClient from '../BaseClient';
const { fromString, getCompilers } = require('wandbox-api-updated');

interface ContactEmbeds {
	main: EmbedBuilder;
	request: EmbedBuilder;
}

interface CompileEmbeds {
	output: (programOutput: string, languageVersion: string) => EmbedBuilder;
	outputError: (programError: string, languageVersion: string) => EmbedBuilder;
	error: (message: string) => EmbedBuilder;
	compileError: (message: string) => EmbedBuilder;
}

interface Output {
	program_error: string;
	program_output: string;
}

interface LanguageVersion {
	name: string;
}

export default async function interaction(client: BaseClient) {
	client.on(Events.InteractionCreate, async (interaction: Interaction) => {
		if (interaction.isChatInputCommand()) {
			const command: any = client.commands.get(interaction.commandName),
				args: any[] = [];

			if (!command) return;

			for (const option of interaction.options.data) {
				if (option.type === ApplicationCommandOptionType.Subcommand) {
					option.name
						? args.push(option.name)
						: option.options?.forEach(
							async (value: any) => {
								if (value.value) {
									args.push(value.value);
								}
							},
						);
				} else if (option.value) {
					args.push(option.value);
				}
			}

			await command.run(client, interaction, args);
		}

		if (interaction.isModalSubmit()) {
			if (interaction.customId === 'modal-contact') {
				const message: string = interaction.fields.getTextInputValue('message-input'),
					title: string = interaction.fields.getTextInputValue('title-input'),
					embeds: ContactEmbeds = {
						main: new EmbedBuilder().setTitle('Successfully Sent').setDescription('Your message has been successfully sent to the owner.').setColor(0x4b9cd3).setTimestamp().setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ extension: 'png' }), }),
						request: new EmbedBuilder().setTitle('New Message').setDescription(`**Title**: ${title}\n**Message**: ${message}`).setTimestamp().setColor(0x4b9cd3).setFooter({ text: interaction.user.tag, iconURL: interaction.user.displayAvatarURL({ extension: 'png' }), }),
					};

				await interaction.deferReply({ ephemeral: true });
				await interaction.editReply({ embeds: [embeds.main] });
				client.users.cache.get('1094120827601047653')?.send({ embeds: [embeds.request] });
			}

			if (interaction.customId === 'modal-compile') {
				const [language, code] = ['language-input', 'code-input'].map(f => interaction.fields.getTextInputValue(f));
				const embeds: CompileEmbeds = {
					output: (o, l) => new EmbedBuilder().setTitle('Compiled Code').setDescription(`Compiled and evaluated successfully. You can press the button again for the bot to run code again.\n\`\`\`${l}\`\`\``)
						.addFields({ name: 'Compiled Input', value: `\`\`\`${language}\n${code}\n\`\`\``, inline: true },
							{ name: 'Compiled Output', value: `\`\`\`${o ? language : ''}\n${o ? o : 'No output was received while evaluating.'}\n\`\`\`` })
						.setColor(0x4b9cd3).setTimestamp().setFooter({ text: 'Compilied', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }) }),
					outputError: (e: string, l: string) => new EmbedBuilder().setTitle('Compiling Error').setDescription(`There was an error in your given code.\n\`\`\`${l}\`\`\``)
						.addFields({ name: 'Compiled Input', value: `\`\`\`${language}\n${code}\n\`\`\``, inline: true },
							{ name: 'Compiling Error', value: `\`\`\`${e}\n\`\`\`` })
						.setColor(0xfa5f55).setTimestamp().setFooter({ text: 'Error', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }) }),
					error: (m: string) => new EmbedBuilder().setDescription(`${m} View all of the [availabe languages here](https://github.com/srz-zumix/wandbox-api#cli).\nIn addition, try not to use aliases. (\`py\` > \`python\`)`)
						.setColor(0xfa5f55),
					compileError: (m: string) => new EmbedBuilder().setDescription(`${m}. Try pressing the \`Insert Code\` button to try again.`).setColor(0xfa5f55),
				};

				let languageInput: string = language;

				await interaction.deferUpdate();

				if (language.toLowerCase().startsWith('node')) languageInput = 'javascript';

				getCompilers(languageInput).then((languageVersion: LanguageVersion) => {
					fromString({ code, compiler: languageVersion.name }).then(async (output: Output) => {
						const { program_error, program_output } = output;
						if (program_error) await interaction.editReply({ embeds: [embeds.outputError(program_error, languageVersion.name)] });
						else await interaction.editReply({ embeds: [embeds.output(program_output, languageVersion.name)] });
					}).catch(async (error: string) => await interaction.followUp({ embeds: [embeds.compileError(error)], ephemeral: true }));
				}).catch(async (error: string) => await interaction.followUp({ embeds: [embeds.error(error)], ephemeral: true }));
			}
		}
	});
}
