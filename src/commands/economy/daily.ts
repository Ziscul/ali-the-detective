import { ApplicationCommandType, CommandInteraction, EmbedBuilder } from 'discord.js';
import BaseClient from '../../util/BaseClient';
import balance from '../../schema/balance';
import daily from '../../schema/daily';

interface Profile {
	wallet: number;
	bank: number;
}

interface Cooldown {
	cooldown: number;
}

export default {
	name: 'daily',
	description: 'Get rewards of money everyday, with a chance of bonus rewards!',
	type: ApplicationCommandType.ChatInput,
	run: async (client: BaseClient, interaction: CommandInteraction, args: string[]) => {
		await balance.findOneAndUpdate({ userID: interaction.user.id }, { $setOnInsert: { userID: interaction.user.id }, $set: {} }, { new: true, upsert: true }) as Profile;
		const { cooldown } = await daily.findOneAndUpdate({ userID: interaction.user.id }, { $setOnInsert: { userID: interaction.user.id }, $set: {} }, { new: true, upsert: true }) as Cooldown;

		if (86400000 - (Date.now() - cooldown) > 0) {
			await interaction.reply({ embeds: [
				new EmbedBuilder()
					.setDescription(`You've already claimed your daily today, try again in <t:${Math.floor((86400000 + cooldown) / 1000)}:R>.`)
					.setColor(0xfa5f55),
				], ephemeral: true,
			});
		} else {
			await balance.updateOne({ userID: interaction.user.id }, { $inc: { wallet: 500 } });
			await daily.updateOne({ userID: interaction.user.id }, { cooldown: Date.now() });
			await interaction.reply({ embeds: [
				new EmbedBuilder()
					.setTitle(`${interaction.user.username}'s Daily Reward`)
					.setDescription('`✪ 500` was added to your wallet. Use `/balance` to see how rich you are!')
					.setColor(0xfAA61A)
					.setFooter({
						text: interaction.user.username,
						iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
					})
					.setTimestamp(),
				],
			});
		}
	},
};
