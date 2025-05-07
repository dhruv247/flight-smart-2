// for now implementing very basic booking card design. pick better card design from flyeasy after updating booking and ticket schema to embed tickets into bookings and then difining routes for getting flights by id and getting tickets by id and userID

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TicketsModal from './TicketsModal';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';

const formatHHMM = (time) => {
	if (typeof time !== 'number' && typeof time !== 'string') return '';
	const str = time.toString().padStart(4, '0');
	const hours = str.slice(0, 2);
	const minutes = str.slice(2, 4);
	return `${hours}:${minutes}`;
};

const BookingCard = ({ booking }) => {
	const bookingState = booking.confirmed ? 'Confirmed' : 'Cancelled';
	// const [tickets, setTickets] = useState([]);
	// const [departureFlight, setDepartureFlight] = useState(null);
	// const [returnFlight, setReturnFlight] = useState(null);
	// const [loading, setLoading] = useState(true);
	const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);

	// useEffect(() => {
	// 	const getTicketsFromDB = async () => {
	// 		try {
	// 			const ticketIds = booking.tickets;
	// 			const ticketPromises = ticketIds.map(async (ticketId) => {
	// 				const response = await axios.get(
	// 					`http://localhost:8000/api/tickets/getTicketById/${ticketId}`,
	// 					{
	// 						withCredentials: true,
	// 					}
	// 				);
	// 				return response.data.ticket;
	// 			});

	// 			const fetchedTickets = await Promise.all(ticketPromises);
	// 			setTickets(fetchedTickets);

	// 			if (fetchedTickets && fetchedTickets.length > 0) {
	// 				const firstTicket = fetchedTickets[0];
	// 				if (firstTicket.departureFlightId) {
	// 					const departureFlightResponse = await axios.get(
	// 						`http://localhost:8000/api/flights/getFlightById/${firstTicket.departureFlightId}`,
	// 						{
	// 							withCredentials: true,
	// 						}
	// 					);
	// 					setDepartureFlight(departureFlightResponse.data.flight);

	// 					if (firstTicket.returnFlightId) {
	// 						const returnFlightResponse = await axios.get(
	// 							`http://localhost:8000/api/flights/getFlightById/${firstTicket.returnFlightId}`,
	// 							{
	// 								withCredentials: true,
	// 							}
	// 						);
	// 						setReturnFlight(returnFlightResponse.data.flight);
	// 					}
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error('Error fetching tickets:', error);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};
	// 	getTicketsFromDB();
	// }, [booking.tickets]);

	const handleCancelBooking = async () => {
		try {
			const response = await axios.patch(
				`http://localhost:8000/api/bookings/cancelBooking/${booking._id}`,
				{},
				{
					withCredentials: true,
				}
			);

			if (response.status === 200) {
				showSuccessToast('Booking cancelled successfully');
				const departureFlightResponse = await axios.patch(
					`http://localhost:8000/api/flights/updateFlightPrice/${booking.tickets[0].departureFlight._id}`,
					{},
					{
						withCredentials: true,
					}
				);
				if (booking.tickets[0].returnFlight) {
					const returnFlightResponse = await axios.patch(
						`http://localhost:8000/api/flights/updateFlightPrice/${booking.tickets[0].returnFlight._id}`,
						{},
						{
							withCredentials: true,
						}
					);
				}
			}
			window.location.reload();
		} catch (error) {
			console.error('Error cancelling booking:', error);
			showErrorToast('Failed to cancel booking. Please try again.');
		}
	};

	// if (loading) {
	// 	return (
	// 		<div className="d-flex flex-column">
	// 			<div className="row border border rounded m-0 py-2 my-2 align-items-center">
	// 				<div className="col-12 col-md-3 d-flex justify-content-center align-items-center">
	// 					<div className="d-flex flex-column align-items-center gap-2">
	// 						<p className="fw-bold">Id: {booking._id}</p>
	// 					</div>
	// 				</div>
	// 				<div className="col-12 col-md-3 d-flex justify-content-center align-items-center">
	// 					<div className="spinner-border" role="status">
	// 						<span className="visually-hidden">Loading...</span>
	// 					</div>
	// 				</div>
	// 				<div className="col-12 col-md-6 d-flex justify-content-around align-items-center gap-2">
	// 					<button className="btn btn-success px-3 py-2" disabled>
	// 						Tickets
	// 					</button>
	// 					<button className="btn btn-danger px-3 py-2" disabled>
	// 						Cancel
	// 					</button>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	);
	// }

	if (!booking.tickets || booking.tickets.length === 0) {
		return (
			<div className="d-flex flex-column">
				<div className="row border border rounded m-0 py-2 my-2 align-items-center">
					<div className="col-12">
						<p>No tickets found for this booking</p>
					</div>
				</div>
			</div>
		);
	}

	const isRoundTrip = booking.tickets[0]?.returnFlight !== null;

	if (isRoundTrip) {
		return (
			<div className="d-flex flex-column">
				<div className="row border border rounded m-0 py-2 my-2 align-items-center">
					<div className="col-12 col-md-4 d-flex justify-content-center align-items-center">
						<div className="d-flex flex-column align-items-center gap-2">
							<p className="fw-bold">Id: {booking._id}</p>
						</div>
					</div>

					<div className="col-12 col-md-4 d-flex flex-column gap-3">
						<div className="d-flex justify-content-between align-items-center">
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].departureFlight?.departurePlace}</p>
								<p>{booking.tickets[0].departureFlight?.departureDate}</p>
								<p>
									{formatHHMM(
										booking.tickets[0].departureFlight?.departureTime
									)}
								</p>
							</div>
							<div className="d-flex flex-column align-items-center">
								<p>-</p>
							</div>
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].departureFlight?.arrivalPlace}</p>
								<p>{booking.tickets[0].departureFlight?.arrivalDate}</p>
								<p>
									{formatHHMM(booking.tickets[0].departureFlight?.arrivalTime)}
								</p>
							</div>
						</div>
						<div className="d-flex justify-content-between align-items-center">
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].returnFlight?.departurePlace}</p>
								<p>{booking.tickets[0].returnFlight?.departureDate}</p>
								<p>
									{formatHHMM(booking.tickets[0].returnFlight?.departureTime)}
								</p>
							</div>
							<div className="d-flex flex-column align-items-center">
								<p>-</p>
							</div>
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].returnFlight?.arrivalPlace}</p>
								<p>{booking.tickets[0].returnFlight?.arrivalDate}</p>
								<p>
									{formatHHMM(booking.tickets[0].returnFlight?.arrivalTime)}
								</p>
							</div>
						</div>
					</div>

					<div className="col-6 col-md-2 d-flex justify-content-center align-items-center ">
						<button
							className="btn btn-success px-3 py-2"
							onClick={() => setIsTicketsModalOpen(true)}
						>
							Tickets
						</button>
					</div>
					<div className="col-6 col-md-2 d-flex justify-content-center align-items-center">
						{bookingState === 'Confirmed' ? (
							<button
								className="btn btn-danger px-3 py-2"
								onClick={handleCancelBooking}
							>
								Cancel
							</button>
						) : (
							<h6 className="text-danger fw-bold text-xl">Cancelled</h6>
						)}
					</div>
				</div>
				<TicketsModal
					isOpen={isTicketsModalOpen}
					onClose={() => setIsTicketsModalOpen(false)}
					booking={booking}
					tickets={booking.tickets}
					departureFlight={booking.tickets[0].departureFlight}
					returnFlight={booking.tickets[0].returnFlight}
				/>
			</div>
		);
	}

	return (
		<div className="d-flex flex-column">
			<div className="row border border rounded m-0 py-2 my-2 align-items-center">
				<div className="col-12 col-md-4 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="fw-bold">Id: {booking._id}</p>
					</div>
				</div>
				<div className="col-12 col-md-4 d-flex justify-content-between align-items-center">
					<div className="d-flex flex-column align-items-center">
						<p>{booking.tickets[0].departureFlight?.departurePlace}</p>
						<p>{booking.tickets[0].departureFlight?.departureDate}</p>
						<p>
							{formatHHMM(booking.tickets[0].departureFlight?.departureTime)}
						</p>
					</div>
					<div className="d-flex flex-column align-items-center">
						<p>-</p>
					</div>
					<div className="d-flex flex-column align-items-center">
						<p>{booking.tickets[0].departureFlight?.arrivalPlace}</p>
						<p>{booking.tickets[0].departureFlight?.arrivalDate}</p>
						<p>{formatHHMM(booking.tickets[0].departureFlight?.arrivalTime)}</p>
					</div>
				</div>

				<div className="col-6 col-md-2 d-flex justify-content-center align-items-center ">
					<button
						className="btn btn-success px-3 py-2"
						onClick={() => setIsTicketsModalOpen(true)}
					>
						Tickets
					</button>
				</div>
				<div className="col-6 col-md-2 d-flex justify-content-center align-items-center">
					{bookingState === 'Confirmed' ? (
						<button
							className="btn btn-danger px-3 py-2"
							onClick={handleCancelBooking}
						>
							Cancel
						</button>
					) : (
						<h6 className="text-danger fw-bold text-xl">Cancelled</h6>
					)}
				</div>
			</div>
			<TicketsModal
				isOpen={isTicketsModalOpen}
				onClose={() => setIsTicketsModalOpen(false)}
				booking={booking}
				tickets={booking.tickets}
				departureFlight={booking.tickets[0].departureFlight}
				returnFlight={booking.tickets[0].returnFlight}
			/>
		</div>
	);
};

export default BookingCard;
