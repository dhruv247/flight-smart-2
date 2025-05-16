import { Conversation } from '../models/conversation.model.js';
import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';

const startConversation = async (req, res) => {
	try {
		const customerId = req.user._id;

		const { airlineId, bookingId } = req.body;

		if (!airlineId || !bookingId) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const booking = await Booking.findById(bookingId);

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		const customerObject = await User.findById(customerId);
		const airlineObject = await User.findById(airlineId);

		if (!customerObject) {
			return res.status(404).json({ message: 'Customer not found' });
		}

		if (!airlineObject) {
			return res.status(404).json({ message: 'Airline not found' });
		}

		const customer = {
			_id: customerObject._id,
			username: customerObject.username,
			email: customerObject.email,
			profilePicture: customerObject.profilePicture,
		};

		const airline = {
			_id: airlineObject._id,
			username: airlineObject.username,
			email: airlineObject.email,
			profilePicture: airlineObject.profilePicture,
		};

		// check if conversation already exists
		const existingConversation = await Conversation.findOne({
			customer,
			airline,
			bookingId,
		});

		if (existingConversation) {
			return res.status(200).json({
				message: 'Conversation already exists',
				conversation: existingConversation,
			});
		}

		if (booking.userDetails._id.toString() !== customerId) {
			return res
				.status(403)
				.json({ message: 'Customer is not the booking owner!' });
		}

		if (
			booking.tickets[0].departureFlight.airline._id.toString() === airlineId ||
			booking.tickets[0].returnFlight.airline._id.toString() === airlineId
		) {
			const conversation = await Conversation.create({
				customer,
				airline,
				bookingId,
			});

			return res.status(201).json({
				message: 'Conversation created successfully',
				conversation,
			});
		} else {
			return res.status(403).json({ message: 'Airline is not authorized!' });
		}
	} catch (error) {
		return res.status(500).json({ message: 'Error creating conversation' });
	}
};

const getConversationsForCustomer = async (req, res) => {
	try {
		const user = req.user._id;

		const conversations = await Conversation.find({
			'customer._id': user,
		});

		return res.status(200).json({
			conversations,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error getting conversations for customer!' });
	}
};

const getConversationsForAirline = async (req, res) => {
	try {
		const user = req.user._id;

		const conversations = await Conversation.find({
			'airline._id': user,
		});

		return res.status(200).json({
			conversations,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error getting conversations for airline!' });
	}
};

export {
	startConversation,
	getConversationsForCustomer,
	getConversationsForAirline,
};
