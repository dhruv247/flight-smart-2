import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import Loading from '../Loading';

const ChatBox = ({ selectedUser, emptyStateText }) => {
	const [newMessage, setNewMessage] = useState('');
	const [loading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef(null);
	const {
		user,
		sendMessage,
		sendImageMessage,
		getConversation,
		isConnected,
		refreshActiveConversation,
	} = useChat();

	const messagesEndRef = useRef(null);

	// Get messages for the selected conversation
	const messages = selectedUser ? getConversation(selectedUser._id) : [];

	// Periodically refresh active conversation to ensure messages are up to date
	useEffect(() => {
		if (!selectedUser) return;

		// Initial load
		setLoading(true);
		refreshActiveConversation();
		setLoading(false);

		// Set up regular refresh
		const intervalId = setInterval(() => {
			refreshActiveConversation();
		}, 30000); // Refresh every 30 seconds

		return () => clearInterval(intervalId);
	}, [selectedUser, refreshActiveConversation]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSendMessage = (e) => {
		e.preventDefault();

		if (selectedImage) {
			handleSendImageMessage();
			return;
		}

		if (!newMessage.trim() || !selectedUser || !isConnected) return;

		// Send message through context
		sendMessage(newMessage.trim(), selectedUser._id);
		setNewMessage('');
	};

	const handleImageSelection = (e) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedImage(e.target.files[0]);
		}
	};

	const handleSendImageMessage = async () => {
		if (!selectedImage || !selectedUser || !isConnected) return;

		setIsUploading(true);
		try {
			const success = await sendImageMessage(
				selectedImage,
				newMessage.trim(),
				selectedUser._id
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

	const cancelImageSelection = () => {
		setSelectedImage(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	// Filter out duplicate messages before rendering
	const filteredMessages = messages.filter((message, index, self) => {
		// Filter out any message that has the same text, sender, and is within a few seconds of another message
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
	});

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

	if (!selectedUser) {
		return (
			<div className="flex-grow-1 d-flex align-items-center justify-content-center bg-white border-start">
				<div className="text-center text-muted">
					<i className="bi bi-chat-dots fs-1 mb-3 d-block opacity-50"></i>
					<p className="mb-0">
						{emptyStateText || 'Select a user to start chatting'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-grow-1 d-flex flex-column bg-white border-start">
			<div className="p-3 border-bottom shadow-sm">
				<div className="d-flex justify-content-between align-items-center">
					<h5 className="mb-0 fw-bold">{selectedUser.username}</h5>
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
						{filteredMessages.length === 0 ? (
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
