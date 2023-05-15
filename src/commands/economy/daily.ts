import { ApplicationCommandType, CommandInteraction, EmbedBuilder } from 'discord.js';
import BaseClient from '../../util/BaseClient';
import balance from '../../schema/balance';
import daily from '../../schema/daily';

interface Profile {
	wallet: number;
	bank: number;
}

interface Embeds {
	fail: (hours: number) => EmbedBuilder;
	main: EmbedBuilder;
}

interface Cooldown {
	cooldown: number;
}

export default {
	name: 'daily',
	description: 'Get a bundle of money each 24 hours, streaks add up more!',
	type: ApplicationCommandType.ChatInput,
	async run(client: BaseClient, interaction: CommandInteraction, args: string[]) {
		await balance.findOneAndUpdate({ userID: interaction.user.id }, { $setOnInsert: { userID: interaction.user.id }, $set: {} }, { new: true, upsert: true }) as Profile;
		const { cooldown } = await daily.findOneAndUpdate({ userID: interaction.user.id }, { $setOnInsert: { userID: interaction.user.id }, $set: {} }, { new: true, upsert: true }) as Cooldown;

		const embeds: Embeds = {
			fail: (hours) =>
				new EmbedBuilder().setDescription(
					`You've already claimed your daily today, try again in <t:${Math.floor(hours / 1000)}:R>.`
				).setColor(0xfa5f55),
			main: new EmbedBuilder()
				.setTitle(`${interaction.user.username}'s Daily`)
				.setDescription('`✪ 500` was added to your wallet. Use `/balance` to see how rich you are!')
				.setColor(0xfAA61A)
				.setFooter({
					text: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
				})
				.setTimestamp(),
		};

		if (86400000 - (Date.now() - cooldown) > 0) {
			await interaction.reply({ embeds: [embeds.fail(86400000 + cooldown)], ephemeral: true });
		} else {
			await balance.updateOne({ userID: interaction.user.id }, { $inc: { wallet: 500 } });
			await daily.updateOne({ userID: interaction.user.id }, { cooldown: Date.now() });
			await interaction.reply({ embeds: [embeds.main] });
		}
	},
};
