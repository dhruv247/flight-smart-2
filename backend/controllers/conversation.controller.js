import { Conversation } from '../models/conversation.model.js';
import { Booking } from '../models/booking.model.js';
import { User } from '../models/user.model.js';

/**
 * Start a conversation between a customer and an airline
 * @param {*} req
 * @param {*} res
 * @returns
 */
const startConversation = async (req, res) => {
	try {
		const customerId = req.user._id;

		const { airlineId, pnr } = req.body;

		// validate the request body
		if (!airlineId || !pnr) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const booking = await Booking.findOne({ pnr });

		// check if the booking exists
		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		// check if the customer and airline exist
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
			pnr,
		});

		if (existingConversation) {
			return res.status(200).json({
				message: 'Conversation already exists',
				conversation: existingConversation,
			});
		}

		// check if the customer is the booking owner
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
				pnr,
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

/**
 * Get all conversations for a customer or airline
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getConversations = async (req, res) => {
	try {

		let searchQuery = {};
		
		const user = req.user._id;

		if (req.user.userType === 'customer') {
			searchQuery['customer._id'] = user;
		} else {
			searchQuery['airline._id'] = user;
		}

		const conversations = await Conversation.find(searchQuery);

		return res.status(200).json({
			conversations,
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Error getting conversations!' });
	}
};

export {
	startConversation,
	getConversations,
};