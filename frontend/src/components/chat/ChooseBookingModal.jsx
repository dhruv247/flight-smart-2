import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useChat } from '../../context/ChatContext';
import axios from 'axios';

const ChooseBookingModal = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [airlines, setAirlines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const { startNewConversation } = useChat();

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const allCustomerBookings = await axios.get(
					'http://localhost:8000/api/bookings/search-bookings-for-customer',
					{
						withCredentials: true,
					}
        );

				const conversations = await axios.get(
					'http://localhost:8000/api/conversations/get-conversations-for-customer',
					{
						withCredentials: true,
					}
        );

        const allCustomerBookingsIds = allCustomerBookings.data.bookings.map((booking) => booking._id);
        
        const bookings = conversations.data.conversations.filter((conversation) =>
					allCustomerBookingsIds.includes(conversation.bookingId)
				);

				setBookings(bookings);
				setAirlines(conversations.data.conversations);
				setLoading(false);
			} catch (error) {
				setError('Failed to load bookings');
				setLoading(false);
			}
		};

		if (isOpen) {
			fetchBookings();
		}
	}, [isOpen]);

	const handleStartConversation = async (booking) => {
		try {
			const conversation = await startNewConversation(
				booking.tickets[0].departureFlight.airline._id,
				booking._id
			);
			if (conversation) {
				onClose();
			}
		} catch (error) {
			setError('Failed to start conversation');
		}
	};

	return (
		<Modal show={isOpen} onHide={onClose} centered>
			<Modal.Header closeButton>
				<Modal.Title>Choose a Booking</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{loading ? (
					<div className="text-center p-3">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				) : error ? (
					<div className="alert alert-danger">{error}</div>
				) : bookings.length === 0 ? (
					<div className="text-center text-muted p-3">
						No bookings available
					</div>
				) : (
					<ListGroup>
						{bookings.map((booking) => (
							<ListGroup.Item
								key={booking._id}
								className="d-flex justify-content-between align-items-center"
							>
								<div>
									<div className="fw-bold">
										{booking.tickets[0].departureFlight.airline.name}
									</div>
									<small className="text-muted">Booking #{booking._id}</small>
								</div>
								<Button
									variant="primary"
									size="sm"
									onClick={() => handleStartConversation(booking)}
								>
									Start Chat
								</Button>
							</ListGroup.Item>
						))}
					</ListGroup>
				)}
			</Modal.Body>
		</Modal>
	);
};

export default ChooseBookingModal;
