import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useGetUserDetails from '../../hooks/useGetUserDetails';
import { messageService } from '../../services/message.service';
import { imageService } from '../../services/image.service';
import Loading from '../Loading';

const PORT = import.meta.env.VITE_PORT;

/**
 * Chat Box
 */
const ChatBox = ({ selectedConversation, emptyStateText }) => {
	const { user } = useGetUserDetails();
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState({});
	const [isConnected, setIsConnected] = useState(false);
	const [lastError, setLastError] = useState(null);
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);
	const messagesEndRef = useRef(null);

	// Get messages for the selected conversation
	const conversationMessages = selectedConversation
		? messages[selectedConversation._id] || []
		: [];
	
	// console.log(conversationMessages)

	// Initialize socket connection
	useEffect(() => {
		if (!user) return;

		const newSocket = io(`http://localhost:${PORT}`, {
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
		});

		newSocket.on('connect', () => {
			setIsConnected(true);
			newSocket.emit('join', user._id);
		});

		newSocket.on('disconnect', () => {
			setIsConnected(false);
		});

		newSocket.on('connect_error', (error) => {
			setLastError('Connection error - please refresh');
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [user]);

	// Listen for incoming messages
	useEffect(() => {
		if (!socket || !user) return;

		const handleReceiveMessage = (message) => {
			setMessages((prev) => {
				const conversationMessages = prev[message.conversation] || [];
				const messageExists = conversationMessages.some(
					(msg) => msg._id === message._id
				);

				if (messageExists) return prev;

				return {
					...prev,
					[message.conversation]: [...conversationMessages, message],
				};
			});
		};

		socket.on('receiveMessage', handleReceiveMessage);

		return () => {
			socket.off('receiveMessage', handleReceiveMessage);
		};
	}, [socket, user, selectedConversation]);

	// Fetch messages when active conversation changes
	useEffect(() => {
		if (!user || !selectedConversation) return;

		const fetchMessages = async () => {
			try {
				setLoading(true);
				const response = await messageService.getMessages(
					selectedConversation._id
				);
				setMessages((prev) => ({
					...prev,
					[selectedConversation._id]: response.data,
				}));
			} catch (error) {
				setLastError('Failed to load messages');
			} finally {
				setLoading(false);
			}
		};

		fetchMessages();
	}, [selectedConversation, user]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [conversationMessages]);

	// Send message
	const sendMessage = useCallback(
		(text, conversationId, imageUrl = null) => {
			if (!socket || (!text.trim() && !imageUrl) || !conversationId || !user) {
				return;
			}

			// Get receiver ID directly from selectedConversation
			const receiverId =
				user.userType === 'airline'
					? selectedConversation.customer._id
					: selectedConversation.airline._id;

			const messageData = {
				sender: user._id,
				receiver: receiverId,
				conversation: conversationId,
				messageType: imageUrl ? 'image' : 'text',
			};

			if (imageUrl) {
				messageData.imageUrl = imageUrl;
				messageData.text = text.trim() || '';
			} else {
				messageData.text = text.trim();
			}

			socket.emit('sendMessage', messageData);

			// Optimisically add message to the UI (to reduce lag)
			setMessages((prev) => {
				const conversationMessages = prev[conversationId] || [];
				return {
					...prev,
					[conversationId]: [
						...conversationMessages,
						{
							...messageData,
							_id: Date.now().toString(), // Temporary ID
							createdAt: new Date().toISOString(),
						},
					],
				};
			});
		},
		[socket, user, selectedConversation]
	);

	// Send image message
	const sendImageMessage = useCallback(
		async (file, text, conversationId) => {
			if (!file || !conversationId || !user) return;

			try {
				const formData = new FormData();
				formData.append('image', file);

				const response = await imageService.uploadImage(formData);

				if (response.data && response.data.url) {
					sendMessage(text, conversationId, response.data.url);
					return true;
				}
				return false;
			} catch (error) {
				console.error('Error uploading image:', error);
				return false;
			}
		},
		[user, sendMessage]
	);

	// Handle send message
	const handleSendMessage = (e) => {
		e.preventDefault();

		if (selectedImage) {
			handleSendImageMessage();
			return;
		}

		if (!newMessage.trim() || !selectedConversation || !isConnected) return;

		// Send message through context
		sendMessage(newMessage.trim(), selectedConversation._id);
		setNewMessage('');
	};

	// Handle image selection
	const handleImageSelection = (e) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedImage(e.target.files[0]);
		}
	};

	// Handle send image message
	const handleSendImageMessage = async () => {
		if (!selectedImage || !selectedConversation || !isConnected) return;

		setIsUploading(true);
		try {
			const success = await sendImageMessage(
				selectedImage,
				newMessage.trim(),
				selectedConversation._id
			);

			if (success) {
				setSelectedImage(null);
				setNewMessage('');
				if (fileInputRef.current) {
					fileInputRef.current.value = '';
				}
			}
		} finally {
			setIsUploading(false);
		}
	};

	// Cancel image selection
	const cancelImageSelection = () => {
		setSelectedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Filter out duplicate messages (to prevent spamming by sending same message within short periods) before rendering
	const filteredMessages = conversationMessages.filter(
		(message, index, self) => {
			return (
				index ===
				self.findIndex(
					(m) =>
						m.text === message.text &&
						m.sender === message.sender &&
						m.receiver === message.receiver &&
						(!m.createdAt ||
							!message.createdAt ||
							Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) <
								3000)
				)
			);
		}
	);

	// Display message content based on message type
	const renderMessageContent = (message) => {
		if (message.messageType === 'image') {
			return (
				<div>
					<img
						src={message.imageUrl}
						alt="Message attachment"
						className="img-fluid rounded mb-2"
						style={{ maxWidth: '100%', maxHeight: '300px' }}
					/>
					{message.text && <div>{message.text}</div>}
				</div>
			);
		}
		return message.text;
	};

	if (!selectedConversation) {
		return (
			<div className="flex-grow-1 d-flex align-items-center justify-content-center bg-white border-start">
				<div className="text-center text-muted">
					<i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
					<p className="mb-0">
						{emptyStateText || 'Select a conversation to start chatting'}
					</p>
				</div>
			</div>
		);
	}

	const otherUser =
		user.userType === 'airline'
			? selectedConversation.customer
			: selectedConversation.airline;

	return (
		<div className="flex-grow-1 d-flex flex-column bg-white border-start">
			<div className="p-3 border-bottom shadow-sm">
				<div className="d-flex justify-content-between align-items-center">
					<div>
						<h5 className="mb-0 fw-bold">{otherUser.username}</h5>
						<small className="text-muted">
							PNR: {selectedConversation.pnr}
						</small>
					</div>
					{!isConnected && (
						<span className="badge bg-warning">Connection Issue</span>
					)}
				</div>
			</div>

			<div className="flex-grow-1 overflow-auto px-3">
				{loading ? (
					<Loading />
				) : (
					<div className="py-3">
						{!loading && filteredMessages.length === 0 ? (
							<div className="text-center text-muted">
								<i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
								<p>No messages yet. Start the conversation!</p>
							</div>
						) : (
							filteredMessages.map((msg, index) => (
								<div
									key={msg._id || `temp-${index}`}
									className={`d-flex mb-3 ${
										msg.sender === user?._id
											? 'justify-content-end'
											: 'justify-content-start'
									}`}
								>
									<div
										className={`rounded-3 p-2 ${
											msg.sender === user?._id
												? 'bg-primary text-white'
												: 'bg-light border'
										}`}
										style={{
											maxWidth: '75%',
											wordBreak: 'break-word',
										}}
									>
										{renderMessageContent(msg)}
										<div
											className={`small ${
												msg.sender === user?._id
													? 'text-white-50 text-end'
													: 'text-muted'
											} mt-1`}
										>
											{msg.createdAt &&
												new Date(msg.createdAt).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
										</div>
									</div>
								</div>
							))
						)}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			<div className="border-top shadow-sm">
				{selectedImage && (
					<div className="p-2 border-bottom">
						<div className="d-flex align-items-center">
							<div className="image-preview me-2">
								<img
									src={URL.createObjectURL(selectedImage)}
									alt="Selected"
									style={{ maxHeight: '60px', maxWidth: '100px' }}
									className="rounded"
								/>
							</div>
							<div className="flex-grow-1">
								<small className="d-block text-truncate">
									{selectedImage.name}
								</small>
								<small className="text-muted">
									{(selectedImage.size / 1024).toFixed(1)} KB
								</small>
							</div>
							<button
								className="btn btn-sm btn-outline-danger ms-2"
								onClick={cancelImageSelection}
								disabled={isUploading}
							>
								<i className="bi bi-x"></i>
							</button>
						</div>
					</div>
				)}
				<form onSubmit={handleSendMessage} className="p-3 m-0">
					<div className="input-group">
						<input
							type="text"
							className="form-control"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder={
								isUploading
									? 'Uploading image...'
									: isConnected
									? selectedImage
										? 'Add a caption (optional)...'
										: 'Type a message...'
									: 'Reconnecting...'
							}
							disabled={!isConnected || isUploading}
						/>
						<button
							type="button"
							className="btn btn-outline-secondary"
							onClick={() => fileInputRef.current.click()}
							disabled={!isConnected || isUploading}
						>
							<i className="bi bi-image"></i>
						</button>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleImageSelection}
							style={{ display: 'none' }}
							accept="image/*"
						/>
						<button
							type="submit"
							className="btn btn-primary px-4"
							disabled={
								(!newMessage.trim() && !selectedImage) ||
								!isConnected ||
								isUploading
							}
						>
							{isUploading ? (
								<>
									<span
										className="spinner-border spinner-border-sm me-1"
										role="status"
										aria-hidden="true"
									></span>
									Sending...
								</>
							) : (
								<>Send</>
							)}
						</button>
					</div>
					{!isConnected && (
						<div className="small text-danger mt-1">
							Connection lost. Messages will be delivered when you reconnect.
						</div>
					)}
				</form>
			</div>
		</div>
	);
};

export default ChatBox;
