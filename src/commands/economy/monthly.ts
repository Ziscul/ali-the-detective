import { ApplicationCommandType, CommandInteraction, EmbedBuilder } from 'discord.js';
import BaseClient from '../../util/BaseClient';
import balance from '../../schema/balance';
import monthly from '../../schema/monthly';

interface Profile {
	wallet: number;
	bank: number;
}

interface Cooldown {
	cooldown: number;
}

export default {
	name: 'monthly',
	description: 'Get rewards of money every month, with a chance of bonus rewards!',
	type: ApplicationCommandType.ChatInput,
	run: async (client: BaseClient, interaction: CommandInteraction) => {
		await balance.findOneAndUpdate({ userID: interaction.user.id }, { $setOnInsert: { userID: interaction.user.id }, $set: {} }, { new: true, upsert: true }) as Profile;
		const { cooldown } = await monthly.findOneAndUpdate({ userID: interaction.user.id }, { $setOnInsert: { userID: interaction.user.id }, $set: {} }, { new: true, upsert: true }) as Cooldown;

		if (2592000000 - (Date.now() - cooldown) > 0) {
			await interaction.reply({
				embeds: [
					new EmbedBuilder().setDescription(`You've already claimed your monthly reward this month, try again in <t:${Math.floor((2592000000 + cooldown) / 1000)}:R>.`)
						.setColor(0xfa5f55)
				], ephemeral: true,
			});
		} else {
			await balance.updateOne({ userID: interaction.user.id }, { $inc: { wallet: 5000 } });
			await monthly.updateOne({ userID: interaction.user.id }, { cooldown: Date.now() });
			await interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`${interaction.user.username}'s Monthly Reward`)
						.setDescription('`✪ 5000` was added to your wallet. Use </balance:' + (client.commands.get('balance') as { id: string }).id + '> to see how rich you are!')
						.setColor(0xfAA61A)
						.setFooter({
							text: interaction.user.username,
							iconURL: interaction.user.displayAvatarURL({ extension: 'png' }),
						})
						.setTimestamp()
				],
			});
		}
	},
};
