import { ApplicationCommand, CommandInteraction } from 'discord.js';
import { readdirSync } from 'fs';
import BaseClient from '../BaseClient';

interface CommandOptions {
	name: string;
	description: string;
	type: number;
	options?: object[];
	id: string;
	directory: string;
	run: (client: BaseClient, interaction: CommandInteraction, args?: string[]) => Promise<void>;
}

export default async function ready(client: BaseClient) {
	const directories = ['./src/commands/utility', './src/commands/economy'];

	for (const directory of directories) {
		readdirSync(directory).forEach(async (value: string) => {
			const command: CommandOptions = (await import(`${process.cwd()}/${directory}/${value}`)).default;
			command.directory = directory.split('/').pop() || '';
			command.id = '';

			client.commands.set(command.name, { ...command });
		});
	}

	const fetchedCommands = await client.application?.commands.fetch();
	const commands = fetchedCommands?.toJSON() as ApplicationCommand[];

	commands?.forEach((cmd: ApplicationCommand) => {
		const command = client.commands.get(cmd.name);
		if (command) {
			command.id = cmd.id;
		}
	});

	console.log('Commands Loaded');
}
