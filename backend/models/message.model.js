import mongoose from 'mongoose';

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
			required: function () {
				return !this.imageUrl; // Text is required if no image is provided
			},
		},
		messageType: {
			type: String,
			enum: ['text', 'image'],
			default: 'text',
		},
		imageUrl: {
			type: String,
			required: function () {
				return this.messageType === 'image';
			},
		},
		conversation: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		}
	},
	{
		timestamps: true,
		strict: true,
	}
);

const Message = mongoose.model('Message', messageSchema);

export { Message };