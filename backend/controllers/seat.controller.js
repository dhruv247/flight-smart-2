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

/**
 * gets the seat from the db (function to renamed in the futrue)
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getSeatStatus = async (req, res) => {
	try {
		const flightId = req.params.id;
		const seatNumber = req.params.seatNumber;

		// get seat status
		const seat = await Seat.findOne({ flight: flightId, seatNumber: seatNumber });

		// validate seat
		if (!seat) {
			return res.status(404).json({
				message: 'Seat not found',
			});
		}

		return res.status(200).json({
			message: 'Seat is available',
			seat: seat,
		});
		
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};

export { getSeatsForFlight, getSeatStatus };