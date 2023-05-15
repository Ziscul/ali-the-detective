import { Schema, model } from 'mongoose';

export default model(
	'monthly',
	new Schema({
		userID: { type: String, required: true },
		cooldown: { type: Number, default: 0 },
	}),
);
