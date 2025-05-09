import { Server } from 'socket.io';
import { Message } from '../models/message.model.js';

/**
 * Setup socket
 * @param {object} server - The server object
 * @returns {object} - The socket object
 * @description
 * 1. Create a new socket server
 * 2. On connection, join the user's room
 * 3. On send message, create a new message
 * 4. Emit the message to the sender and receiver
 * 5. On disconnect, log the user out
 */
const setupSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: '*',
		},
	});

	io.on('connection', (socket) => {
		socket.on('join', (userId) => {
			socket.join(userId);
			console.log('User joined:', userId);
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
			console.log('User disconnected:', socket.id);
		});
	});

	return io;
};

export { setupSocket };