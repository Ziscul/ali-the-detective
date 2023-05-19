import { CommandInteraction } from 'discord.js';
import BaseClient from './src/util/BaseClient';

interface Command {
	name: string;
	description: string;
	type: number;
	options?: object[];
	id: string;
	directory: string;
	run: (client: BaseClient, interaction: CommandInteraction, args?: string[]) => void;
}