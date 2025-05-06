const Message = require('../../models/Message');
const User = require('../../models/User');
const mongoose = require('mongoose');
const Ticket = require('../../models/Ticket');
const Flight = require('../../models/Flight'); 

/**
 * Get conversation between two users
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get conversation between two users
 * 
 */
exports.getConversation = async (req, res) => {
	try {
		const { userId, receiverId } = req.params;

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
				$sort: { timestamp: 1 },
			},
		]);

		res.json(messages);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

/**
 * Get's airlines from the tickets of a customer
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get airlines from the tickets of a customer
 */
exports.getAirlines = async (req, res) => {
	try {
		
		const customer = await User.findById(req.user._id);

		if (!customer) {
			return res.status(404).json({ message: 'Customer not found' });
		}

		// get all tickets of the customer
		const tickets = await Ticket.find({ 'userDetails._id': customer._id });

		// get all flight ids from the tickets
		const flightIds = tickets.reduce((acc, ticket) => {
			acc.push(ticket.departureFlightId);
			if (ticket.returnFlightId) {
				acc.push(ticket.returnFlightId);
			}
			return acc;
		}, []);

		// get all flights from the flight ids
		const flights = await Flight.find({ _id: { $in: flightIds } });

		// get all airline ids from the flights
		const airlineIds = [
			...new Set(flights.map((flight) => flight.airlineDetails._id)),
		];

		// get all airlines from the airline ids
		const airlines = await User.find({ _id: { $in: airlineIds } });

		res.status(200).json(airlines);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

/**
 * Get's customers from the flights of an airline
 * @param {*} req
 * @param {*} res
 * @description
 * 1. Get customers from the flights of an airline
 */
exports.getCustomers = async (req, res) => {
	try {
		// Get airline from token (already done)
		const airline = await User.findById(req.user._id);

		if (!airline) {
			return res.status(404).json({ message: 'Airline not found' });
		}

		// Get all flights for this airline
		const flights = await Flight.find({ 'airlineDetails._id': airline._id });
		const flightIds = flights.map((flight) => flight._id);

		// Get all tickets that use these flights
		const tickets = await Ticket.find({
			$or: [
				{ departureFlightId: { $in: flightIds } },
				{ returnFlightId: { $in: flightIds } },
			],
		});

		// Get unique customer IDs from tickets
		const customerIds = [
			...new Set(tickets.map((ticket) => ticket.userDetails._id)),
		];

		// Get customer details
		const customers = await User.find({
			_id: { $in: customerIds },
			userType: 'customer',
		}).select('-password'); // Exclude password from response

		res.status(200).json(customers);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};