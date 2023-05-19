import { Client, Collection, ActivityType, GatewayIntentBits, Partials } from 'discord.js';
import { connect, set } from 'mongoose';
import { Command } from '../../global';

export default class BaseClient extends Client {
	commands: Collection<string, Command>;

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildPresences], partials: [Partials.Channel, Partials.Reaction, Partials.User] });

		this.commands = new Collection<string, Command>();

		set('strictQuery', false);
		connect(process.env.mongoKey ?? '');

		this.login(process.env.token).then(async () => {
			this.user?.setPresence({ activities: [{ name: 'for /help', type: ActivityType.Watching }], status: 'idle' });

			for (const file of ['interaction', 'ready']) {
				(await import(`./handlers/${file}.ts`)).default(this);
			}
		});
	}
}
