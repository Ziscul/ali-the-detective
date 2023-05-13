import { Events } from 'discord.js';
import { readdirSync } from 'fs';
import BaseClient from '../BaseClient';

const commands: any[] = [];

type CommandOptions = {
	default: {
		name: string;
		description: string;
		type: number;
		run: Function;
	};
}

export default async function ready(client: BaseClient) {
	readdirSync('./src/commands/utility').forEach(async (value: string) => {
		const command: CommandOptions = require(`${process.cwd()}/src/commands/utility/${value}`);

		commands.push(command.default);
		client.commands.set(command.default.name, { directory: 'utility', id: '', ...command.default });
	});

	readdirSync('./src/commands/economy').forEach(async (value: string) => {
		const command: CommandOptions = require(`${process.cwd()}/src/commands/economy/${value}`);

		commands.push(command.default);
		client.commands.set(command.default.name, { directory: 'economy', id: '', ...command.default });
	});

	client.once(Events.ClientReady, async () =>
		await client?.application?.commands?.set(commands).then(async () => {
			(await client.application?.commands.fetch())?.toJSON().map((cmd) => {
				(client.commands.get(cmd.name) as any).id = cmd.id;
			});

			console.log('Online.');
		}),
	);
}