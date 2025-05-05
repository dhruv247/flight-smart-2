import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import getUserDetails from '../../../utils/getUserDetails';

const CustomerChatBox = ({ selectedUser }) => {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [socket, setSocket] = useState(null);
	const [user, setUser] = useState(null);

	const messagesEndRef = useRef(null);

	useEffect(() => {
		const fetchUser = async () => {
			const user = await getUserDetails();
			setUser(user);
		};

		fetchUser();
	}, []);

	// Initialize socket connection
	useEffect(() => {
		const newSocket = io('http://localhost:8000');
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	// Join user's room and listen for messages
	useEffect(() => {
		if (socket && user) {
			// Join personal room to receive messages
			socket.emit('join', user._id);

			// Listen for incoming messages
			socket.on('receiveMessage', (message) => {
				if (
					(message.sender === user._id &&
						message.receiver === selectedUser?._id) ||
					(message.receiver === user._id &&
						message.sender === selectedUser?._id)
				) {
					setMessages((prev) => [...prev, message]);
				}
			});
		}

		return () => {
			if (socket) {
				socket.off('receiveMessage');
			}
		};
	}, [socket, user, selectedUser]);

	// Fetch conversation history when selected user changes
	useEffect(() => {
		const fetchMessages = async () => {
			if (!selectedUser) return;

			try {
				setLoading(true);
				const config = {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				};

				const response = await axios.get(
					`http://localhost:8000/api/messages/${user._id}/${selectedUser._id}`,
					config
				);

				setMessages(response.data);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching messages:', error);
				setLoading(false);
			}
		};

		if (user && selectedUser) {
			fetchMessages();
		} else {
			setMessages([]);
		}
	}, [selectedUser, user]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const sendMessage = (e) => {
		e.preventDefault();

		if (!newMessage.trim() || !socket || !selectedUser) return;

		// Send message through socket
		socket.emit('sendMessage', {
			sender: user._id,
			receiver: selectedUser._id,
			text: newMessage.trim(),
		});

		setNewMessage('');
	};

	if (!selectedUser) {
		return (
			<div className="flex-grow-1 d-flex align-items-center justify-content-center bg-white border-start">
				<div className="text-center text-muted">
					<i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
					<p className="mb-0">Select an airline to start chatting</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-grow-1 d-flex flex-column bg-white border-start">
			<div className="p-3 border-bottom shadow-sm">
				<h5 className="mb-0 fw-bold">{selectedUser.airlineName}</h5>
			</div>

			<div className="flex-grow-1 overflow-auto px-3">
				{loading ? (
					<div className="text-center py-4">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Loading messages...</span>
						</div>
					</div>
				) : (
					<div className="py-3">
						{messages.length === 0 ? (
							<div className="text-center text-muted">
								<i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
								<p>No messages yet. Start the conversation!</p>
							</div>
						) : (
							messages.map((msg, index) => (
								<div
									key={index}
									className={`d-flex mb-3 ${
										msg.sender === user._id
											? 'justify-content-end'
											: 'justify-content-start'
									}`}
								>
									<div
										className={`rounded-3 p-2 ${
											msg.sender === user._id
												? 'bg-primary text-white'
												: 'bg-light border'
										}`}
										style={{ maxWidth: '75%', wordBreak: 'break-word' }}
									>
										{msg.text}
									</div>
								</div>
							))
						)}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			<div className="border-top shadow-sm">
				<form onSubmit={sendMessage} className="p-3 m-0">
					<div className="input-group">
						<input
							type="text"
							className="form-control border-end-0"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder="Type a message..."
						/>
						<button type="submit" className="btn btn-primary px-4">
							Send
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CustomerChatBox;
