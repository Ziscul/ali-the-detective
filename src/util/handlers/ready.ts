import { CommandInteraction, Events } from 'discord.js';
import { readdirSync } from 'fs';
import BaseClient from '../BaseClient';

interface CommandOptions {
	name: string;
	description: string;
	type: number;
	run: (interaction: CommandInteraction) => Promise<void>;
}

const commands: CommandOptions[] = [];

export default async function ready(client: BaseClient) {

	readdirSync('./src/commands/utility').forEach(async (value: string) => {
		const command: CommandOptions = (await import(`${process.cwd()}/src/commands/utility/${value}`)).default;

		commands.push(command);
		client.commands.set(command.name, { directory: 'utility', id: '', ...command });
	});

	readdirSync('./src/commands/economy').forEach(async (value: string) => {
		const command: CommandOptions = (await import(`${process.cwd()}/src/commands/economy/${value}`)).default;

		commands.push(command);
		client.commands.set(command.name, { directory: 'economy', id: '', ...command });
	});

	client.once(Events.ClientReady, async () =>
		await client?.application?.commands?.set(commands).then(async () => {
			(await client.application?.commands.fetch())?.toJSON().map((cmd) => {
				(client.commands.get(cmd.name) as any).id = cmd.id;
			});

			console.log('Commands Loaded');
		}),
	);
}
