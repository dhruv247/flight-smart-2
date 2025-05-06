const express = require('express');
const { connectDB } = require('./connect'); // Required to make a connection to DB
const cors = require('cors');
const cookieParser = require('cookie-parser');
const createAdminUser = require('./seeds/adminSeed'); // creates an admin manually
// const seedFlights = require('./seeds/flightsSeed'); // creates sample flights in large numbers
const { setupSocket } = require('./socket');

const http = require('http');

const app = express();

// Socket.io setup
const server = http.createServer(app);
const io = setupSocket(server);

/**
 * Built in Middleware
 */
app.use(express.json()); // req.body is parsed into a js object
app.use(
	cors({
		origin: true,
		credentials: true,
	})
);
app.use(cookieParser());

/**
 * Custom Middleware
 */
app.use('/api/user/auth', require('./Routes/auth/userAuthRoutes')); // auth routes for users (admin, customer)
app.use('/api/airline/auth', require('./Routes/auth/airlineAuthRoutes')); // auth routes for airlines
// verification routes for admin to verify airlines
app.use(
	'/api/admin/airline',
	require('./Routes/auth/adminAirlineVerificationRoutes')
);
app.use('/api/flights', require('./Routes/flights/flightsRoutes')); // routes for flights
app.use('/api/tickets', require('./Routes/tickets/ticketsRoutes')); // routes for tickets
app.use('/api/bookings', require('./Routes/bookings/bookingsRoutes')); // routes for bookings
app.use('/api/planes', require('./Routes/planes/planesRoutes')); // routes for planes
app.use('/api/seats', require('./Routes/seats/seatsRoutes')); // routes for seats
app.use('/api/cities', require('./Routes/cities/citiesRoutes')); // routes for cities
app.use('/api/images', require('./Routes/images/imagesRoutes')); // routes for image uploads
app.use(
	'/api/analytics/customer',
	require('./Routes/analytics/customerAnalyticsRoutes')
); // routes for customer analytics
app.use(
	'/api/analytics/airline',
	require('./Routes/analytics/airlineAnalyticsRoutes')
); // routes for airline analytics
app.use(
	'/api/analytics/admin',
	require('./Routes/analytics/adminAnalyticsRoutes')
); // routes for admin analytics
app.use('/api/messages', require('./Routes/messages/messagesRoutes'));

// createAdminUser(); // calling the function create an admin

// seedFlights(); // seed Flight model in db with sample flights

/**
 * Server Connection
 */
const PORT = 8000;
server.listen(PORT, () => {
	console.log('Server Started at PORT', PORT);
	connectDB(); // calling the function to connect to the DB
});