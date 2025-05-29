import { Seat } from '../models/seat.model.js';

/**
 * create unique seats for a flight
 * @param {*} flight 
 * @param {*} plane 
 * @returns 
 * @description
 * 1. Check if flight and plane are provided
 * 2. If not, throw an error
 * 3. Create business class seats
 * 4. Create economy class seats
 * 5. Save seats to db
 * 6. Return true if seats are created successfully, false otherwise
 */
const createSeats = async (flight, plane) => {
	if (!flight || !flight._id || !plane) {
		throw new Error('Invalid flight or plane provided to createSeats');
	}

	try {
		for (let i = 1; i <= plane.businessCapacity; i++) {
			const seat = new Seat({
				seatNumber: i,
				seatType: 'business',
				occupied: false,
				flight: flight._id,
			});

			await seat.save();
		}

		for (
			let i = plane.businessCapacity + 1;
			i <= plane.businessCapacity + plane.economyCapacity;
			i++
		) {
			const seat = new Seat({
				seatNumber: i,
				seatType: 'economy',
				occupied: false,
				flight: flight._id,
			});

			await seat.save();
		}

		return true;
	} catch (error) {
		console.error('Error creating seats:', error.message);
		throw error;
	}
};

export { createSeats };
