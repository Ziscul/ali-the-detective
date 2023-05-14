import 'dotenv/config';
import Client from './util/BaseClient';

Promise.resolve(Client).then(() => new Client());

// TODO: add slash in daily.ts
