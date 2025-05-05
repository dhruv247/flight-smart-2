const Seat = require('../../models/Seat');
const mongoose = require('mongoose');

/**
 * Gets all the seats for a flight using flight id
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getSeats = async (req, res) => {
	try {
		const flightId = req.params.id;

		const seats = await Seat.aggregate([
			{
				$match: {
					flight: new mongoose.Types.ObjectId(flightId),
				},
			},
			{
				$sort: {
					seatNumber: 1,
				},
			},
		]);

		if (!seats || seats.length === 0) {
			return res.status(404).json({
				success: false,
				message: 'No seats found for this flight',
			});
		}

		res.status(200).json({
			data: seats,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Error fetching seats',
			error: error.message,
		});
	}
};
