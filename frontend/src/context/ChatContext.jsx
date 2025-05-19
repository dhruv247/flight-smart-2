import {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import useGetUserDetails from '../hooks/useGetUserDetails';
import messageService from '../services/message.service';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
	const { user, isLoading } = useGetUserDetails();
	const [socket, setSocket] = useState(null);
	const [conversations, setConversations] = useState([]);
	const [activeConversation, setActiveConversation] = useState(null);
	const [messages, setMessages] = useState({});
	const [unreadMessages, setUnreadMessages] = useState({});
	const [isConnected, setIsConnected] = useState(false);
	const [lastError, setLastError] = useState(null);

	// Fetch all conversations when user logs in
	useEffect(() => {
		if (!user) return;

		const fetchConversations = async () => {
			try {
				const data =
					user.userType === 'airline'
						? await messageService.getAirlineConversations()
						: await messageService.getConversations();
				setConversations(data);
			} catch (error) {
				setLastError('Failed to load conversations');
			}
		};

		fetchConversations();
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

			// Mark as unread if not the active conversation
			if (
				activeConversation !== message.conversation &&
				message.sender !== user._id
			) {
				setUnreadMessages((prev) => ({
					...prev,
					[message.conversation]: (prev[message.conversation] || 0) + 1,
				}));
			}
		};

		socket.on('receiveMessage', handleReceiveMessage);

		return () => {
			socket.off('receiveMessage', handleReceiveMessage);
		};
	}, [socket, user, activeConversation]);

	// Fetch messages when active conversation changes
	useEffect(() => {
		if (!user || !activeConversation) return;

		const fetchMessages = async () => {
			try {
				const data = await messageService.getMessages(activeConversation);
				setMessages((prev) => ({
					...prev,
					[activeConversation]: data,
				}));
				// Clear unread messages
				setUnreadMessages((prev) => ({
					...prev,
					[activeConversation]: 0,
				}));
			} catch (error) {
				setLastError('Failed to load messages');
			}
		};

		fetchMessages();
	}, [activeConversation, user]);

	const sendMessage = useCallback(
		(text, conversationId, imageUrl = null) => {
			if (!socket || (!text.trim() && !imageUrl) || !conversationId || !user) {
				return;
			}

			const conversation = conversations.find((c) => c._id === conversationId);
			if (!conversation) return;

			// Get receiver ID from the embedded customer/airline object
			const receiverId =
				user.userType === 'airline'
					? conversation.customer._id
					: conversation.airline._id;

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
		},
		[socket, user, conversations]
	);

	const sendImageMessage = useCallback(
		async (file, text, conversationId) => {
			if (!file || !conversationId || !user) return;

			try {
				const formData = new FormData();
				formData.append('image', file);

				const response = await axios.post(
					'http://localhost:8000/api/images/upload-image',
					formData,
					{
						headers: { 'Content-Type': 'multipart/form-data' },
						withCredentials: true,
					}
				);

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

	const startNewConversation = async (airlineId, bookingId) => {
		try {
			const response = await messageService.startConversation(
				airlineId,
				bookingId
			);
			setConversations((prev) => [...prev, response.conversation]);
			return response.conversation;
		} catch (error) {
			setLastError('Failed to start conversation');
			return null;
		}
	};

	return (
		<ChatContext.Provider
			value={{
				user,
				socket,
				conversations,
				activeConversation,
				setActiveConversation,
				messages,
				unreadMessages,
				sendMessage,
				sendImageMessage,
				startNewConversation,
				isConnected,
				lastError,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;