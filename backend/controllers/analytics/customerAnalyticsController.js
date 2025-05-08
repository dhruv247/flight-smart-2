const Ticket = require('../../models/Ticket');

/**
 * Get's the popular destinations for a customer
 * @param {*} req
 * @param {*} res
 * @description
 * Group the tickets by departure and return flights
 * unwind both departure and return flights
 * Then, group by arrival place
 * Then, sort by count in descending order
 * Then, lookup city details (doin this because images are not stored in the ticket model)
 * Then, unwind city details
 * Then, project only the city details
 */
exports.popularDestinations = async (req, res) => {
	try {
		const popularDestinations = await Ticket.aggregate([
			
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
			
			{ $sort: { count: -1 } },
			
			{ $limit: 4 },
			
			{
				$lookup: {
					from: 'cities',
					localField: '_id',
					foreignField: 'name',
					as: 'cityDetails',
				},
			},
			
			{ $unwind: '$cityDetails' },
			
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