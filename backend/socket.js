const { Server } = require('socket.io');
const Message = require('./models/Message');

const setupSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: '*',
		},
	});

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
				// console.error('Error sending message:', error);
			}
		});

		socket.on('disconnect', () => {
			// console.log('User disconnected:', socket.id);
		});
	});

	return io;
};

module.exports = { setupSocket };
