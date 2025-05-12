import {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import getUserDetails from '../utils/getUserDetails';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [socket, setSocket] = useState(null);
	const [allConversations, setAllConversations] = useState({});
	const [unreadMessages, setUnreadMessages] = useState({});
	const [activeChat, setActiveChat] = useState(null);
	const [isConnected, setIsConnected] = useState(false);
	const [lastError, setLastError] = useState(null);

	// Initialize user data
	useEffect(() => {
		const fetchUser = async () => {
			try {
				const userData = await getUserDetails();
				setUser(userData);
			} catch (error) {
				setLastError('Failed to load user details');
			}
		};

		fetchUser();
	}, []);

	// Fetch all available conversations for this user when they log in
	useEffect(() => {
		if (!user) return;

		const fetchAllConversations = async () => {
			try {
				// Fetch conversation list based on user type
				const endpoint =
					user.userType === 'airline'
						? 'http://localhost:8000/api/messages/get-customers-for-airline'
						: 'http://localhost:8000/api/messages/get-airlines-for-customer';

				const response = await axios.get(endpoint, {
					withCredentials: true,
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});

				// For each contact, fetch conversation history
				const conversationPromises = response.data.map((contact) =>
					fetchConversationHistory(user._id, contact._id)
				);

				const conversations = await Promise.all(conversationPromises);

				// Organize conversations by user ID
				const conversationsMap = {};
				response.data.forEach((contact, index) => {
					conversationsMap[contact._id] = conversations[index];
				});

				setAllConversations(conversationsMap);
			} catch (error) {
				setLastError('Failed to load conversations');
			}
		};

		fetchAllConversations();
	}, [user]);

	// Initialize socket connection
	useEffect(() => {
		if (!user) return;

		const newSocket = io('http://localhost:8000', {
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
		});

		newSocket.on('connect', () => {
			setIsConnected(true);
			// Join user's room when socket connects
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
			// Add message to the appropriate conversation
			const otherUserId =
				message.sender === user._id ? message.receiver : message.sender;

			setAllConversations((prev) => {
				const conversationMessages = prev[otherUserId] || [];

				// Check if message already exists to prevent duplicates
				const messageExists = conversationMessages.some(
					(msg) => msg._id === message._id
				);

				if (messageExists) {
					return prev;
				}

				return {
					...prev,
					[otherUserId]: [...conversationMessages, message],
				};
			});

			// Mark message as unread if it's not from the active chat and not from current user
			if (activeChat !== otherUserId && message.sender !== user._id) {
				setUnreadMessages((prev) => ({
					...prev,
					[otherUserId]: (prev[otherUserId] || 0) + 1,
				}));
			}
		};

		socket.on('receiveMessage', handleReceiveMessage);

		return () => {
			socket.off('receiveMessage', handleReceiveMessage);
		};
	}, [socket, user, activeChat]);

	// Fetch conversation when active chat changes
	useEffect(() => {
		if (!user || !activeChat) return;

		fetchConversationForActiveChat();
	}, [activeChat, user]);

	// Helper function to fetch conversation history
	const fetchConversationHistory = async (userId, otherUserId) => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user?.token}`,
				},
			};

			const response = await axios.get(
				`http://localhost:8000/api/messages/get-conversation/${userId}/${otherUserId}`,
				config
			);

			return response.data;
		} catch (error) {
			return [];
		}
	};

	// Function to fetch conversation for active chat
	const fetchConversationForActiveChat = useCallback(async () => {
		if (!user || !activeChat) return;

		try {
			const messages = await fetchConversationHistory(user._id, activeChat);

			setAllConversations((prev) => ({
				...prev,
				[activeChat]: messages,
			}));

			// Clear unread messages when chat becomes active
			setUnreadMessages((prev) => ({
				...prev,
				[activeChat]: 0,
			}));
		} catch (error) {
			setLastError('Failed to load messages');
		}
	}, [user, activeChat]);

	const sendMessage = useCallback(
		(text, receiverId, imageUrl = null) => {
			if (!socket || (!text.trim() && !imageUrl) || !receiverId || !user) {
				return;
			}

			const messageData = {
				sender: user._id,
				receiver: receiverId,
				messageType: imageUrl ? 'image' : 'text',
			};

			// Add image URL if it's an image message
			if (imageUrl) {
				messageData.imageUrl = imageUrl;
				messageData.text = text.trim() || ''; // Optional caption with image
			} else {
				messageData.text = text.trim();
			}

			// Send message through socket
			socket.emit('sendMessage', messageData);
		},
		[socket, user]
	);

	const sendImageMessage = useCallback(
		async (file, text, receiverId) => {
			if (!file || !receiverId || !user) return;

			try {
				// Create FormData for image upload
				const formData = new FormData();
				formData.append('image', file);

				// Upload image to AWS S3
				const response = await axios.post(
					'http://localhost:8000/api/images/upload-image',
					formData,
					{
						headers: { 'Content-Type': 'multipart/form-data' },
						withCredentials: true,
					}
				);

				if (response.data && response.data.url) {
					// Send message with image URL
					sendMessage(text, receiverId, response.data.url);
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

	const setActiveChatUser = useCallback((userId) => {
		setActiveChat(userId);

		// Clear unread messages when chat becomes active
		setUnreadMessages((prev) => ({
			...prev,
			[userId]: 0,
		}));
	}, []);

	// Force refresh active conversation
	const refreshActiveConversation = useCallback(() => {
		if (activeChat) {
			fetchConversationForActiveChat();
		}
	}, [activeChat, fetchConversationForActiveChat]);

	return (
		<ChatContext.Provider
			value={{
				user,
				socket,
				activeChat,
				setActiveChat: setActiveChatUser,
				allConversations,
				unreadMessages,
				sendMessage,
				sendImageMessage,
				getConversation: (userId) => allConversations[userId] || [],
				isConnected,
				lastError,
				refreshActiveConversation,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;
