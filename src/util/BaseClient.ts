import { Client, Collection, ActivityType, GatewayIntentBits, Partials } from 'discord.js';
import { connect, set } from 'mongoose';

export default class BaseClient extends Client {
	commands = new Collection();

	constructor() {
		super({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildPresences], partials: [Partials.Channel, Partials.Reaction, Partials.User] });

		void set('strictQuery', false), void connect(process.env.mongoKey!), void this.login(process.env.token!).then(async () => {
			this.user?.setPresence({ activities: [{ name: 'for /help', type: ActivityType.Watching }], status: 'idle' }), ['interaction', 'ready'].map(async file => (await import(`./handlers/${file}.ts`)).default(this));
		});
	}
}
