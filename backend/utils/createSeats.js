const Seat = require('../models/Seat');

/**
 * create unique seats for a flight
 * @param {*} flight
 * @param {*} plane 
 * @returns
 * @description
 * 1. Create's business class and economy class seats for a flight
 */
const createSeats = async (flight, plane) => {
	if (!flight || !flight._id || !plane) {
		throw new Error('Invalid flight or plane provided to createSeats');
	}

	try {
		// Create business class seats
		for (let i = 1; i <= plane.businessCapacity; i++) {
			const seat = new Seat({
				seatNumber: i,
				seatType: 'business',
				occupied: false,
				flight: flight._id,
			});

			await seat.save();
		}

		// Create economy class seats
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

module.exports = createSeats;
