const Ticket = require('../../models/Ticket');

exports.popularDestinations = async (req, res) => {
	try {
		const popularDestinations = await Ticket.aggregate([
			// First, unwind both departure and return flights
			{
				$facet: {
					departureFlights: [
						{ $match: { 'departureFlight._id': { $exists: true } } },
						{
							$group: {
								_id: '$departureFlight.arrivalPlace',
								count: { $sum: 1 },
							},
						},
					],
					returnFlights: [
						{ $match: { 'returnFlight._id': { $exists: true } } },
						{
							$group: { _id: '$returnFlight.arrivalPlace', count: { $sum: 1 } },
						},
					],
				},
			},
			// Combine both arrays and merge counts for same destinations
			{
				$project: {
					allDestinations: {
						$concatArrays: ['$departureFlights', '$returnFlights'],
					},
				},
			},
			{ $unwind: '$allDestinations' },
			{
				$group: {
					_id: '$allDestinations._id',
					count: { $sum: '$allDestinations.count' },
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
