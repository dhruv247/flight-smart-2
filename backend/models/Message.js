const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		text: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		strict: true,
	 }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
