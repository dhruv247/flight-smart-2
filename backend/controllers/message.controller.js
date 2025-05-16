import mongoose from 'mongoose';
import { Message } from '../models/message.model.js';

/**
 * Get conversation between two users
 * @param {*} req
 * @param {*} res
 */
const getMessages = async (req, res) => {
	try {
		const user = req.user;

		// destructure req params
		const { conversationId } = req.params;

		// get messages between two users
		const messages = await Message.aggregate([
			{
				$match: {
					conversation: new mongoose.Types.ObjectId(conversationId),
					$or: [
						{
							sender: new mongoose.Types.ObjectId(user._id),
						},
						{
							receiver: new mongoose.Types.ObjectId(user._id),
						},
					],
				},
			},
			{
				$sort: { createdAt: 1 },
			},
		]);

		// return messages
		return res.status(200).json(messages);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export { getMessages };
