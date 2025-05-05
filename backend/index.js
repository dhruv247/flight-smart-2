const express = require('express');
const { connectDB } = require('./connect'); // Required to make a connection to DB
const cors = require('cors');
const cookieParser = require('cookie-parser');
const createAdminUser = require('./seeds/adminSeed'); // creates an admin manually
const seedFlights = require('./seeds/flightsSeed'); // creates sample flights in large numbers
const Message = require('./models/Message');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

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


// Socket.io setup (Move this code to a separate file after completing the functionality)
io.on('connection', (socket) => {
	socket.on('join', (userId) => {
		socket.join(userId); // User joins their own room
	});

	socket.on('sendMessage', async ({ sender, receiver, text }) => {
		try {
			const message = await Message.create({ sender, receiver, text });
			io.to(sender).emit('receiveMessage', message);
			io.to(receiver).emit('receiveMessage', message);
		} catch (error) {
			console.error('Error sending message:', error);
		}
	});

	socket.on('disconnect', () => {
		// console.log('User disconnected:', socket.id);
	});
});

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