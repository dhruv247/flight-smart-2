import { useEffect, useState } from 'react';
import ChooseBookingModal from './ChooseBookingModal';
import Loading from '../Loading';
import { conversationService } from '../../services/conversation.service';

/**
 * UserList component
 * @param {function} onSelectConversation - The function to handle conversation selection
 * @param {object} selectedConversation - The selected conversation object
 * @param {string} userType - (customer or airline)
 * @returns {JSX.Element} - The UserList component
 */
const UserList = ({ onSelectConversation, selectedConversation, userType }) => {
	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [searchQuery, setSearchQuery] = useState('');

	const [isChooseBookingModalOpen, setIsChooseBookingModalOpen] =
		useState(false);

	// Fetch conversations when the component mounts
	useEffect(() => {
		const fetchConversations = async () => {
			setLoading(true);
			try {
				const response = await conversationService.getConversations();
				setConversations(response.data.conversations);
			} catch (error) {
				setError('Failed to load conversations');
			} finally {
				setLoading(false);
			}
		};

		fetchConversations();
	}, []);

	// Get the other user in the conversation
	const getOtherUser = (conversation) => {
		if (!conversation) return null;
		return userType === 'airline'
			? conversation.customer
			: conversation.airline;
	};

	// Filter conversations based on search query
	const filteredConversations = conversations?.filter((conversation) => {
		const otherUser = getOtherUser(conversation);
		if (!otherUser) return false;

		const searchLower = searchQuery.toLowerCase();
		return (
			otherUser.username.toLowerCase().includes(searchLower) ||
			conversation.pnr.toLowerCase().includes(searchLower)
		);
	});

	return (
		<div className="h-100" style={{ width: '280px' }}>
			<div className="d-flex flex-column h-100 bg-white border-end">
				<div className="p-3 border-bottom d-flex justify-content-between align-items-center">
					<h5 className="mb-0 fw-bold">Conversations</h5>
					{/* Add a button to open the choose booking modal */}
					{userType === 'customer' && (
						<button
							className="btn btn-primary"
							onClick={() => setIsChooseBookingModalOpen(true)}
						>
							<i className="bi bi-plus"></i>
						</button>
					)}
				</div>

				{/* Add a search input to filter conversations */}
				<div className="d-flex justify-content-between align-items-center p-2">
					<input
						type="text"
						className="form-control"
						placeholder="Search by name or PNR"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{/* Add a loading indicator */}
				{loading && <Loading />}

				{/* Display the conversations */}
				<div className="overflow-auto flex-grow-1">
					{error && (
						<div className="alert alert-danger m-2 py-2" role="alert">
							{error}
						</div>
					)}

					<div className="list-group list-group-flush">
						{filteredConversations &&
							filteredConversations.map((conversation) => {
								const otherUser = getOtherUser(conversation);
								if (!otherUser) return null;

								return (
									<button
										key={conversation._id}
										className={`list-group-item list-group-item-action py-3 border-bottom position-relative ${
											selectedConversation &&
											selectedConversation._id === conversation._id
												? 'active'
												: ''
										}`}
										onClick={() => onSelectConversation(conversation)}
									>
										<div className="d-flex align-items-center">
											<img
												src={otherUser.profilePicture}
												alt="Profile"
												className="rounded-circle me-2"
												style={{ width: '30px', height: '30px' }}
											/>
											<div className="flex-grow-1">
												<div className="d-flex justify-content-between align-items-center">
													<span>{otherUser.username}</span>
												</div>
												<small className="text-muted">
													PNR: {conversation.pnr}
												</small>
											</div>
										</div>
									</button>
								);
							})}

						{!loading && (!conversations || conversations.length === 0) && (
							<div className="text-center text-muted p-3">
								No conversations available
							</div>
						)}
					</div>
				</div>
			</div>
			<ChooseBookingModal
				isOpen={isChooseBookingModalOpen}
				onClose={() => setIsChooseBookingModalOpen(false)}
			/>
		</div>
	);
};

export default UserList;
