import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { setupSocket } from './utils/socket.js';
import { connectDB } from './utils/connectDB.js';
import { createAdminUser } from './seeds/adminSeed.js';
import { seedFlights } from './seeds/flightsSeed.js';
import { router as analyticsRoutes } from './routes/analytics.routes.js';
import { router as authRoutes } from './routes/auth.routes.js';
import { router as bookingRoutes } from './routes/booking.routes.js';
import { router as cityRoutes } from './routes/city.routes.js';
import { router as flightRoutes } from './routes/flight.routes.js';
import { router as imageRoutes } from './routes/image.routes.js';
import { router as messageRoutes } from './routes/message.routes.js';
import { router as planeRoutes } from './routes/plane.routes.js';
import { router as seatRoutes } from './routes/seat.routes.js';
import { router as ticketRoutes } from './routes/ticket.routes.js';

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

app.use(express.json());
app.use(
	cors({
		origin: true,
		credentials: true,
	})
);
app.use(cookieParser());

app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/planes', planeRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/tickets', ticketRoutes);

// seeding the database with an admin user
// createAdminUser();

// seeding the database with sample flights
// seedFlights();

const PORT = 8000;
server.listen(PORT, () => {
	console.log('Server Started at PORT', PORT);

	// connecting to the database
	connectDB();
});