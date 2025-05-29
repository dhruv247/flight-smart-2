import { Flight } from '../models/flight.model.js';
import { Plane } from '../models/plane.model.js';
import { Airport } from '../models/airport.model.js';
import { User } from '../models/user.model.js';
import { createSeats } from '../utils/seatUtils.js';

/**
 * Generates a random date
 */
const generateRandomDate = () => {
	const startDate = new Date(); // Current Day
	startDate.setHours(0, 0, 0, 0); // Set to start of day to ensure we don't miss today
	const endDate = new Date('2025-06-02');
	const randomDate = new Date(
		startDate.getTime() +
			Math.random() * (endDate.getTime() - startDate.getTime())
	);
	return randomDate;
};

/**
 * Generates a random time between 6 AM and 10 PM
 */
const generateRandomTime = (date) => {
	const startHour = 6;
	const endHour = 22;
	const hours = Math.floor(Math.random() * (endHour - startHour)) + startHour;
	const minutes = Math.floor(Math.random() * 4) * 15; // Rounds to nearest 15 minutes
	date.setHours(hours, minutes, 0, 0);
	return date;
};

/**
 * This function creates sample flights and seeds the db with them
 */
const seedFlights = async () => {
	try {
		const planes = await Plane.find({});
		const airlines = await User.find({ userType: 'airline' });
		const airports = await Airport.find({});

		// Validate required data exists
		if (planes.length === 0 || airlines.length === 0 || airports.length === 0) {
			throw new Error(
				'No planes, airlines, or airports found in the database. Please seed planes, airports, and airlines first.'
			);
		}

		// Get existing flight numbers to avoid duplicates
		const existingFlights = await Flight.find({});
		const existingFlightNumbers = new Set(
			existingFlights.map((flight) => flight.flightNo)
		);

		const flights = [];
		const numberOfFlights = 500; // Generate 500 random flights

		for (let i = 0; i < numberOfFlights; i++) {
			const plane = planes[Math.floor(Math.random() * planes.length)];
			const airline = airlines[Math.floor(Math.random() * airlines.length)];

			if (!plane || !airline) {
				console.error('Missing plane or airline data');
				continue;
			}

			// Generate random (different) departure and arrival airports
			let departureAirport, arrivalAirport;
			do {
				departureAirport =
					airports[Math.floor(Math.random() * airports.length)];
				arrivalAirport = airports[Math.floor(Math.random() * airports.length)];
			} while (
				departureAirport._id.toString() === arrivalAirport._id.toString()
			);

			// Generate valid dates and times
			const departureDateTime = generateRandomDate();
			generateRandomTime(departureDateTime);

			// Calculate arrival time ensuring duration is between 1 and 4 hours
			const durationMinutes = Math.floor(Math.random() * 180) + 60; // Random duration between 1-4 hours
			const arrivalDateTime = new Date(
				departureDateTime.getTime() + durationMinutes * 60000
			);

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
				airline: {
					_id: airline._id.toString(),
					airlineName: airline.username,
				},
				plane: {
					_id: plane._id.toString(),
					planeName: plane.planeName,
					economyCapacity: plane.economyCapacity,
					businessCapacity: plane.businessCapacity,
				},
				departureAirport: {
					_id: departureAirport._id.toString(),
					airportName: departureAirport.airportName,
					airportCode: departureAirport.airportCode,
					city: departureAirport.city,
					state: departureAirport.state,
					country: departureAirport.country,
					image: departureAirport.image,
				},
				departureDateTime,
				arrivalAirport: {
					_id: arrivalAirport._id.toString(),
					airportName: arrivalAirport.airportName,
					airportCode: arrivalAirport.airportCode,
					city: arrivalAirport.city,
					state: arrivalAirport.state,
					country: arrivalAirport.country,
					image: arrivalAirport.image,
				},
				arrivalDateTime,
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

export { seedFlights };