const Ticket = require('../../models/Ticket');

exports.popularDestinations = async (req, res) => {
	try {
		const popularDestinations = await Ticket.aggregate([
			// First, unwind both departure and return flights
			{
				$facet: {
					departureFlights: [
						{ $match: { departureFlightId: { $exists: true } } },
						{ $group: { _id: '$departureFlightId' } },
					],
					returnFlights: [
						{ $match: { returnFlightId: { $exists: true } } },
						{ $group: { _id: '$returnFlightId' } },
					],
				},
			},
			// Combine both arrays
			{
				$project: {
					allFlightIds: {
						$concatArrays: ['$departureFlights._id', '$returnFlights._id'],
					},
				},
			},
			// Unwind the combined array
			{ $unwind: '$allFlightIds' },
			// Lookup to get flight details
			{
				$lookup: {
					from: 'flights',
					localField: 'allFlightIds',
					foreignField: '_id',
					as: 'flightDetails',
				},
			},
			// Unwind flight details
			{ $unwind: '$flightDetails' },
			// Group by arrival place and count
			{
				$group: {
					_id: '$flightDetails.arrivalPlace',
					count: { $sum: 1 },
				},
			},
			// Sort by count in descending order
			{ $sort: { count: -1 } },
			// Limit to top 4
			{ $limit: 4 },
			// Lookup city details
			{
				$lookup: {
					from: 'cities',
					localField: '_id',
					foreignField: 'name',
					as: 'cityDetails',
				},
			},
			// Unwind city details
			{ $unwind: '$cityDetails' },
			// Project only the city details
			{
				$project: {
					_id: '$cityDetails._id',
					name: '$cityDetails.name',
					image: '$cityDetails.image',
				},
			},
		]);

		res.status(200).json(popularDestinations);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
