import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import axios from 'axios';
import Modal from '../common/Modal';

const ChooseBookingModal = ({ isOpen, onClose }) => {
	const [bookings, setBookings] = useState([]);
	const [bookingsIds, setBookingsIds] = useState([]);
	const [selectedBookingId, setSelectedBookingId] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const { startNewConversation } = useChat();

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const allCustomerBookings = await axios.get(
					'http://localhost:8000/api/bookings/get-all-bookings-for-customer',
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

				const bookings = allCustomerBookings.data.bookings.filter(
					(b) =>
						!conversations.data.conversations.some(
							(conversation) => conversation.bookingId === b._id
						)
				);

				setBookings(bookings);

				const bookingIds = bookings.map((booking) => booking._id);

				setBookingsIds(bookingIds);

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

	// console.log(bookingsIds);

	const handleStartConversation = async (e) => {
		e.preventDefault();

		const selectedBooking = bookings.find((b) => b._id === selectedBookingId);

		try {
			const conversation = await startNewConversation(
				selectedBooking.tickets[0].departureFlight.airline._id,
				selectedBooking._id
			);
			if (conversation) {
				onClose();
			}
		} catch (error) {
			setError('Failed to start conversation');
		}
	};

	const modalContent = loading ? (
		<div className="text-center p-3">
			<div className="spinner-border text-primary" role="status">
				<span className="visually-hidden">Loading...</span>
			</div>
		</div>
	) : error ? (
		<div className="alert alert-danger">{error}</div>
	) : bookingsIds.length === 0 ? (
		<div className="text-center text-muted p-3">No bookings available</div>
	) : (
		<form onSubmit={handleStartConversation} className="text-center">
			<select
				className="form-select"
				name=""
				id=""
				onChange={(e) => setSelectedBookingId(e.target.value)}
			>
				<option value="">Select a booking</option>
				{bookingsIds.map((bookingId) => (
					<option key={bookingId} value={bookingId}>
						{bookingId}
					</option>
				))}
			</select>
			<button className="btn btn-primary mt-3" type="submit">
				Start Conversation
			</button>
		</form>
	);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Choose a Booking">
			{modalContent}
		</Modal>
	);
};

export default ChooseBookingModal;
