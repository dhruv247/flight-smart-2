import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	profilePicture: {
		type: String,
		required: true,
	},
});

const airlineSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	profilePicture: {
		type: String,
		required: true,
	},
});

const conversationSchema = new mongoose.Schema(
	{
		customer: customerSchema,
		airline: airlineSchema,
		pnr: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		strict: true,
	}
);

const Conversation = mongoose.model('Conversation', conversationSchema);

export { Conversation };