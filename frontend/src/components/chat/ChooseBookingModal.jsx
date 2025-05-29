import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { bookingService } from '../../services/booking.service';
import { conversationService } from '../../services/conversation.service';

/**
 * Choose Booking Modal
 */
const ChooseBookingModal = ({ isOpen, onClose }) => {
	const [bookings, setBookings] = useState([]);
	const [bookingsPNRs, setBookingsPNRs] = useState([]);
	const [selectedBookingPNR, setSelectedBookingPNR] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	/**
	 * Fetch bookings from the database
	 */
	useEffect(() => {
		const fetchBookings = async () => {
			try {
				const allCustomerBookings =
					await bookingService.getAllBookingsForCustomer();

				const conversations =
					await conversationService.getConversations();

				const bookings = allCustomerBookings.data.bookings.filter(
					(b) =>
						!conversations.data.conversations.some(
							(conversation) => conversation.pnr === b.pnr
						)
				);

				setBookings(bookings);

				const bookingPNRs = bookings.map((booking) => booking.pnr);

				setBookingsPNRs(bookingPNRs);

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

	/**
	 * Handle start conversation
	 * @param {Object} e - The event object
	 */
	const handleStartConversation = async (e) => {
		e.preventDefault();

		const selectedBooking = bookings.find((b) => b.pnr === selectedBookingPNR);

		try {
			const response = await conversationService.startConversation(
				selectedBooking.tickets[0].departureFlight.airline._id,
				selectedBooking.pnr
			);
			if (response.data.conversation) {
				onClose();
				window.location.reload();
			}
		} catch (error) {
			setError('Failed to start conversation');
		}
	};

	// Modal content
	const modalContent = loading ? (
		<div className="text-center p-3">
			<div className="spinner-border text-primary" role="status">
				<span className="visually-hidden">Loading...</span>
			</div>
		</div>
	) : error ? (
		<div className="alert alert-danger">{error}</div>
	) : bookingsPNRs.length === 0 ? (
		<div className="text-center text-muted p-3">No bookings available</div>
	) : (
		<form onSubmit={handleStartConversation} className="text-center">
			<select
				className="form-select"
				name=""
				id=""
				onChange={(e) => setSelectedBookingPNR(e.target.value)}
			>
				<option value="">Select a booking</option>
				{bookings.map((booking) => (
					<option key={booking.pnr} value={booking.pnr}>
						{booking.pnr}:{' '}
						{booking.tickets[0].departureFlight.departureAirport.city} to{' '}
						{booking.tickets[0].departureFlight.arrivalAirport.city} (
						{booking.tickets[0].departureFlight.airline.airlineName})
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
