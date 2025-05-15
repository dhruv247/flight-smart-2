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
		pingTimeout: 60000,
	});

	const activeUsers = new Map();

	io.on('connection', (socket) => {
		let currentUserId = null;

		socket.on('join', (userId) => {
			if (!userId) return;

			currentUserId = userId;
			socket.join(userId);

			if (!activeUsers.has(userId)) {
				activeUsers.set(userId, new Set());
			}
			activeUsers.get(userId).add(socket.id);
		});

		socket.on(
			'sendMessage',
			async ({ sender, receiver, text, messageType, imageUrl }) => {
				try {
					const messageData = { sender, receiver };

					if (messageType === 'image') {
						messageData.messageType = 'image';
						messageData.imageUrl = imageUrl;
						messageData.text = text || '';
					} else {
						messageData.messageType = 'text';
						messageData.text = text;
					}

					const message = await Message.create(messageData);

					io.to(sender).emit('receiveMessage', message);

					if (activeUsers.has(receiver)) {
						io.to(receiver).emit('receiveMessage', message);
					}
				} catch (error) {
					console.error('Error sending message:', error);
				}
			}
		);

		socket.on('disconnect', () => {
			if (currentUserId && activeUsers.has(currentUserId)) {
				const userSockets = activeUsers.get(currentUserId);
				userSockets.delete(socket.id);

				if (userSockets.size === 0) {
					activeUsers.delete(currentUserId);
				}
			}
		});
	});

	return io;
};

export { setupSocket };
