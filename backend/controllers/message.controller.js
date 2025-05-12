import mongoose from 'mongoose';
import { Message } from '../models/message.model.js';
import { User } from '../models/user.model.js';
import { Ticket } from '../models/ticket.model.js';
import { Flight } from '../models/flight.model.js';

/**
 * Get conversation between two users
 * @param {*} req
 * @param {*} res
 */
const getConversation = async (req, res) => {
	try {
		// destructure req params
		const { userId, receiverId } = req.params;

		// validate userId and receiverId
		if (!userId || !receiverId) {
			return res
				.status(400)
				.json({ message: 'User ID and receiver ID are required' });
		}

		// get messages between two users
		const messages = await Message.aggregate([
			{
				$match: {
					$or: [
						{
							sender: new mongoose.Types.ObjectId(userId),
							receiver: new mongoose.Types.ObjectId(receiverId),
						},
						{
							sender: new mongoose.Types.ObjectId(receiverId),
							receiver: new mongoose.Types.ObjectId(userId),
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

/**
 * Get's airlines from the tickets of a customer
 * @param {*} req
 * @param {*} res
 */
const getAirlinesForCustomer = async (req, res) => {
	try {
		// destructure req user
		const customer = await User.findById(req.user._id);

		// validate customer
		if (!customer) {
			return res.status(404).json({ message: 'Customer not found' });
		}

		// get all tickets of the customer
		const tickets = await Ticket.find({ 'userDetails._id': customer._id });

		// get all flight ids from the tickets
		const flightIds = tickets.reduce((acc, ticket) => {
			if (ticket.departureFlight && ticket.departureFlight._id) {
				acc.push(ticket.departureFlight._id);
			}
			if (ticket.returnFlight && ticket.returnFlight._id) {
				acc.push(ticket.returnFlight._id);
			}
			return acc;
		}, []);

		// get all flights from the flight ids
		const flights = await Flight.find({ _id: { $in: flightIds } });

		// get all airline ids from the flights
		const airlineIds = [
			...new Set(flights.map((flight) => flight.airline._id)),
		];

		// get all airlines from the airline ids
		const airlines = await User.find({ _id: { $in: airlineIds } });

		// return airlines
		res.status(200).json(airlines);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

/**
 * Get's customers from the flights of an airline
 * @param {*} req
 * @param {*} res
 */
const getCustomersForAirline = async (req, res) => {
	try {
		// destructure req user
		const airline = await User.findById(req.user._id);

		// validate airline
		if (!airline) {
			return res.status(404).json({ message: 'Airline not found' });
		}

		// get all flights for this airline
		const flights = await Flight.find({ 'airline._id': airline._id });
		const flightIds = flights.map((flight) => flight._id);

		// get all tickets that use these flights
		const tickets = await Ticket.find({
			$or: [
				{ 'departureFlight._id': { $in: flightIds } },
				{ 'returnFlight._id': { $in: flightIds } },
			],
		});

		// get unique customer IDs from tickets
		const customerIds = [
			...new Set(tickets.map((ticket) => ticket.userDetails._id)),
		];

		// get customer details
		const customers = await User.find({
			_id: { $in: customerIds },
			userType: 'customer',
		}).select('-password'); // Exclude password from response

		// return customers
		return res.status(200).json(customers);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

export { getConversation, getAirlinesForCustomer, getCustomersForAirline };