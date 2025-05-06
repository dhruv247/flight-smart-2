// Import models
const Flight = require('../models/Flight');
const Plane = require('../models/Plane');
const City = require('../models/City');
const User = require('../models/User');
const createSeats = require('../utils/createSeats');

/**
 * Validates if a string is a valid date in YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDate = (dateStr) => {
	const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
	if (!dateRegex.test(dateStr)) return false;

	const [year, month, day] = dateStr.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
};

/**
 * Validates if a string is a valid time in 24-hour format (0000-2359)
 * @param {string} timeStr - Time string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidTime = (timeStr) => {
	const timeRegex = /^([01][0-9]|2[0-3])[0-5][0-9]$/;
	return timeRegex.test(timeStr);
};

/**
 * Generates a random date between today and 2025-05-11
 * @returns {string} - Date in YYYY-MM-DD format
 */
const generateRandomDate = () => {
	const startDate = new Date(); // Current Day
	startDate.setHours(0, 0, 0, 0); // Set to start of day to ensure we don't miss today
	const endDate = new Date('2025-05-11');
	const randomDate = new Date(
		startDate.getTime() +
			Math.random() * (endDate.getTime() - startDate.getTime())
	);
	return randomDate.toISOString().split('T')[0];
};

/**
 * Generates a random time between 6 AM (600) and 10 PM (2200)
 * @returns {number} - Time in HHMM format
 */
const generateRandomTime = () => {
	const startHour = 6;
	const endHour = 22;
	const hours = Math.floor(Math.random() * (endHour - startHour)) + startHour;
	const minutes = Math.floor(Math.random() * 4) * 15; // Rounds to nearest 15 minutes
	return hours * 100 + minutes;
};

/**
 * This function creates sample flights and seeds the db with them
 */
const seedFlights = async () => {
	try {
		const planes = await Plane.find({});
		const airlines = await User.find({ userType: 'airline' });
		const cityDocuments = await City.find({});
		const cities = cityDocuments.map((city) => city.name);

		// Validate required data exists
		if (planes.length === 0 || airlines.length === 0 || cities.length === 0) {
			throw new Error(
				'No planes or airlines or cities found in the database. Please seed planes, cities, and airlines first.'
			);
		}

		// Get existing flight numbers to avoid duplicates
		const existingFlights = await Flight.find({});
		const existingFlightNumbers = new Set(
			existingFlights.map((flight) => flight.flightNo)
		);

		const flights = [];
		const numberOfFlights = 50; // Generate 5 random flights

		for (let i = 0; i < numberOfFlights; i++) {
			const plane = planes[Math.floor(Math.random() * planes.length)];
			const airline = airlines[Math.floor(Math.random() * airlines.length)];

			if (!plane || !airline) {
				console.error('Missing plane or airline data');
				continue;
			}

			// Generate random (different) departure and arrival cities
			let departureCity, arrivalCity;
			do {
				departureCity = cities[Math.floor(Math.random() * cities.length)];
				arrivalCity = cities[Math.floor(Math.random() * cities.length)];
			} while (departureCity === arrivalCity);

			// Generate valid dates and times
			const departureDate = generateRandomDate();
			const departureTime = generateRandomTime();

			// Calculate arrival time ensuring duration is between 1 and 4 hours
			const durationMinutes = Math.floor(Math.random() * 180) + 60; // Random duration between 1-4 hours

			// Calculate arrival time properly
			const departureHours = Math.floor(departureTime / 100);
			const departureMins = departureTime % 100;

			let arrivalHours = departureHours + Math.floor(durationMinutes / 60);
			let arrivalMins = departureMins + (durationMinutes % 60);

			// Handle minute overflow
			if (arrivalMins >= 60) {
				arrivalHours += Math.floor(arrivalMins / 60);
				arrivalMins = arrivalMins % 60;
			}

			// Handle hour overflow
			if (arrivalHours >= 24) {
				arrivalHours = arrivalHours % 24;
			}

			const calculatedArrivalTime = arrivalHours * 100 + arrivalMins;

			// If arrival time is next day, adjust the date
			const arrivalDate = new Date(departureDate);
			if (calculatedArrivalTime < departureTime) {
				arrivalDate.setDate(arrivalDate.getDate() + 1);
			}
			const formattedArrivalDate = arrivalDate.toISOString().split('T')[0];

			// Generate flight number and check for duplicates
			let flightNo;
			do {
				flightNo = `${airline.username.substring(0, 2).toUpperCase()}${
					Math.floor(Math.random() * 9000) + 1000
				}`;
			} while (existingFlightNumbers.has(flightNo));

			// Generate prices within valid ranges
			const economyBasePrice = Math.floor(Math.random() * 9000) + 1000; // Between 1000 and 10000
			const businessBasePrice = 3 * economyBasePrice;

			const flight = new Flight({
				flightNo: flightNo,
				airlineDetails: {
					_id: airline._id.toString(),
					airlineName: airline.username,
				},
				planeDetails: {
					_id: plane._id.toString(),
					planeName: plane.planeName,
					economyCapacity: plane.economyCapacity,
					businessCapacity: plane.businessCapacity,
				},
				departurePlace: departureCity,
				departureDate: departureDate,
				departureTime: departureTime,
				arrivalPlace: arrivalCity,
				arrivalDate: formattedArrivalDate,
				arrivalTime: calculatedArrivalTime,
				duration: durationMinutes,
				economyBasePrice: economyBasePrice,
				businessBasePrice: businessBasePrice,
				economyCurrentPrice: economyBasePrice,
				businessCurrentPrice: businessBasePrice,
				economyBookedCount: 0,
				businessBookedCount: 0,
				changed: false,
			});

			const savedFlight = await flight.save();

			// Create seats for the flight using plane's capacity
			await createSeats(savedFlight, plane);

			flights.push(savedFlight);
			existingFlightNumbers.add(flightNo);
		}

		console.log(`Successfully seeded ${flights.length} new flights`);
	} catch (error) {
		console.error('Error seeding flights:', error);
	}
};

module.exports = seedFlights;