import mongoose from 'mongoose';
import { Seat } from '../models/seat.model.js';

/**
 * Gets all the seats for a flight using flight id
 * @param {*} req
 * @param {*} res
 * @returns
 */
const getSeatsForFlight = async (req, res) => {
	try {

		// destructure req params
		const flightId = req.params.id;

		// get seats for flight
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

		// validate seats
		if (!seats || seats.length === 0) {
			return res.status(404).json({
				message: 'No seats found for this flight',
			});
		}

		// return success message
		return res.status(200).json({
			data: seats,
		});
	} catch (error) {
		// return error message
		return res.status(500).json({
			message: error.message,
		});
	}
};

export { getSeatsForFlight };