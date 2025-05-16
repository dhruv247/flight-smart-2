import { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import ChooseBookingModal from './ChooseBookingModal';

const UserList = ({ onSelectConversation, selectedConversation, userType }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const { user, conversations, unreadMessages, setActiveConversation } =
		useChat();
	const [isChooseBookingModalOpen, setIsChooseBookingModalOpen] =
		useState(false);

	useEffect(() => {
		console.log('Conversations:', conversations);
		setLoading(false);
	}, [conversations]);

	const handleSelectConversation = (conversation) => {
		onSelectConversation(conversation);
		setActiveConversation(conversation._id);
	};

	const getOtherUser = (conversation) => {
		if (!conversation) return null;
		return user.userType === 'airline'
			? conversation.customer
			: conversation.airline;
	};

	return (
		<div className="h-100" style={{ width: '280px' }}>
			<div className="d-flex flex-column h-100 bg-white border-end">
				<div className="p-3 border-bottom d-flex justify-content-between align-items-center">
					<h5 className="mb-0 fw-bold">Conversations</h5>
					{userType === 'customer' && (
						<button
							className="btn btn-primary"
							onClick={() => setIsChooseBookingModalOpen(true)}
						>
							<i className="bi bi-plus"></i>
						</button>
					)}
				</div>

				<div className="overflow-auto flex-grow-1">
					{loading && (
						<div className="text-center p-3">
							<div
								className="spinner-border spinner-border-sm text-primary"
								role="status"
							>
								<span className="visually-hidden">
									Loading conversations...
								</span>
							</div>
						</div>
					)}

					{error && (
						<div className="alert alert-danger m-2 py-2" role="alert">
							{error}
						</div>
					)}

					<div className="list-group list-group-flush">
						{conversations &&
							conversations.map((conversation) => {
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
										onClick={() => handleSelectConversation(conversation)}
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
													{unreadMessages[conversation._id] > 0 && (
														<span className="badge rounded-pill bg-danger">
															{unreadMessages[conversation._id]}
														</span>
													)}
												</div>
												<small className="text-muted">
													Booking #{conversation.bookingId}
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
