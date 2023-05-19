import { Interaction, Events, ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import BaseClient from '../BaseClient';
import { fromString, getCompilers, Compiler } from 'wandbox-api-updated';

interface ContactEmbeds {
	main: EmbedBuilder;
	request: EmbedBuilder;
}

interface Output {
	program_error: string;
	program_output: string;
}

export default async function interaction(client: BaseClient) {
	client.on(Events.InteractionCreate, async (interaction: Interaction) => {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName),
				args: string[] = [];

			if (!command) return;

			for (const option of interaction.options.data) {
				if (option.type === ApplicationCommandOptionType.Subcommand)
					args.push(option.name.toString());
				else if (option.value) {
					args.push(option.value.toString());
				}
			}

			command.run(client, interaction, args);
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
				let languageInput: string = language;

				await interaction.deferUpdate();

				if (language.toLowerCase().startsWith('node')) languageInput = 'javascript';

				getCompilers(languageInput).then((languageVersions: Compiler[]) => {
					fromString({
						code,
						compiler: languageVersions[0].name,
						save: false
					}).then(async (output: Output) => {
						const { program_error, program_output } = output;
						if (program_error) await interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setTitle('Compiling Error')
									.setDescription(`There was an error in your given code.\n\`${languageVersions[0].name}\``)
									.addFields(
										{ name: 'Compiled Input', value: `\`\`\`${language}\n${code}\n\`\`\``, inline: true },
										{ name: 'Compiling Error', value: `\`\`\`${program_error}\n\`\`\`` }
									)
									.setColor(0xfa5f55)
									.setTimestamp()
									.setFooter({ text: 'Error', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }) }),
							]
						});
						else await interaction.editReply({
							embeds: [
								new EmbedBuilder()
									.setTitle('Compiled Code')
									.setDescription(`Compiled and evaluated successfully. You can press the button again for the bot to run code again.\n\`${languageVersions[0].name}\``)
									.addFields(
										{ name: 'Compiled Input', value: `\`\`\`${language}\n${code}\n\`\`\``, inline: true },
										{ name: 'Compiled Output', value: `\`\`\`${program_output ? language : ''}\n${program_output ? program_output : 'No output was received while evaluating.'}\n\`\`\`` }
									)
									.setColor(0x4b9cd3)
									.setTimestamp()
									.setFooter({ text: 'Compiled', iconURL: interaction.user.displayAvatarURL({ extension: 'png' }) }),
							]
						});
					}).catch(async (error: string) => await interaction.followUp({
						embeds: [
							new EmbedBuilder()
								.setDescription(`${error}. Try pressing the \`Insert Code\` button to try again.`)
								.setColor(0xfa5f55),
						], ephemeral: true
					})
					);
				}).catch(async (error: string) => await interaction.followUp({
					embeds: [
						new EmbedBuilder()
							.setDescription(`${error} View all of the [available languages here](https://github.com/srz-zumix/wandbox-api#cli).\nIn addition, try not to use aliases. (\`py\` > \`python\`)`)
							.setColor(0xfa5f55),
					], ephemeral: true
				}));
			}
		}
	});
}
