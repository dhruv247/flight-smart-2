import React, { useState } from 'react';
import axios from 'axios';
import TicketsModal from './TicketsModal';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { Link } from 'react-router-dom';
import formatDateTime from '../../utils/dateTime';

// /**
//  * Calculate time difference in hours between now and departure time
//  * @param {string} departureDateTime - The departure date and time
//  * @returns {number} - Time difference in hours
//  */
// const getTimeDifferenceInHours = (departureDateTime) => {
// 	const departure = new Date(departureDateTime);
// 	const now = new Date();
// 	const diffInMs = departure - now;
// 	return diffInMs / (1000 * 60 * 60); // Convert to hours
// };

/**
 * Booking Card - to disply each individual booking
 */
const BookingCard = ({ booking, type }) => {
	const bookingState = booking.confirmed ? 'Confirmed' : 'Cancelled';
	const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);

	// const handleCancelBooking = async () => {
	// 	try {
	// 		setIsCancelling(true);
	// 		const response = await axios.patch(
	// 			`http://localhost:8000/api/bookings/cancel-booking/${booking._id}`,
	// 			{},
	// 			{
	// 				withCredentials: true,
	// 			}
	// 		);

	// 		if (response.status === 200) {
	// 			showSuccessToast('Booking cancelled successfully');
	// 			const departureFlightResponse = await axios.patch(
	// 				`http://localhost:8000/api/flights/update-flight-price/${booking.tickets[0].departureFlight._id}`,
	// 				{},
	// 				{
	// 					withCredentials: true,
	// 				}
	// 			);
	// 			if (booking.tickets[0].returnFlight) {
	// 				const returnFlightResponse = await axios.patch(
	// 					`http://localhost:8000/api/flights/update-flight-price/${booking.tickets[0].returnFlight._id}`,
	// 					{},
	// 					{
	// 						withCredentials: true,
	// 					}
	// 				);
	// 			}
	// 		}
	// 		window.location.reload();
	// 	} catch (error) {
	// 		console.error('Error cancelling booking:', error);
	// 		showErrorToast('Failed to cancel booking. Please try again.');
	// 		setIsCancelling(false);
	// 	}
	// };

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
				<div
					className="row border border rounded m-0 py-2 my-2 align-items-center booking-card"
					onClick={() => setIsTicketsModalOpen(true)}
				>
					<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
						<div className="d-flex flex-column align-items-center gap-2">
							<p className="fw-bold">{booking.pnr}</p>
						</div>
					</div>
					<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
						<div className="d-flex flex-column align-items-center gap-2">
							<p className="">
								{booking.tickets[0].roundTrip ? 'Round' : 'One Way'}
							</p>
						</div>
					</div>
					<div className="col-12 col-md-4 d-flex flex-column gap-3">
						<div className="d-flex justify-content-between align-items-center">
							<div className="d-flex flex-column align-items-center">
								<p>
									{booking.tickets[0].departureFlight?.departureAirport.city}
								</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].departureFlight?.departureDateTime
										).date
									}
								</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].departureFlight?.departureDateTime
										).time
									}
								</p>
							</div>
							<div className="d-flex flex-column align-items-center">
								<i className="bi bi-arrow-right"></i>
							</div>
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].departureFlight?.arrivalAirport.city}</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].departureFlight?.arrivalDateTime
										).date
									}
								</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].departureFlight?.arrivalDateTime
										).time
									}
								</p>
							</div>
						</div>
						<div className="d-flex justify-content-between align-items-center">
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].returnFlight?.departureAirport.city}</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].returnFlight?.departureDateTime
										).date
									}
								</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].returnFlight?.departureDateTime
										).time
									}
								</p>
							</div>
							<div className="d-flex flex-column align-items-center">
								<i className="bi bi-arrow-right"></i>
							</div>
							<div className="d-flex flex-column align-items-center">
								<p>{booking.tickets[0].returnFlight?.arrivalAirport.city}</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].returnFlight?.arrivalDateTime
										).date
									}
								</p>
								<p>
									{
										formatDateTime(
											booking.tickets[0].returnFlight?.arrivalDateTime
										).time
									}
								</p>
							</div>
						</div>
					</div>
					<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="">
							{booking.tickets[0].seatType.charAt(0).toUpperCase() +
								booking.tickets[0].seatType.slice(1)}
						</p>
					</div>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="">{booking.tickets.length}</p>
					</div>
				</div>

					{/* {type === 'customer' && (
						<>
							<div className="col-4 col-md-2 d-flex justify-content-center align-items-center ">
								<button
									className="btn btn-success px-3 py-2"
									onClick={() => setIsTicketsModalOpen(true)}
								>
									View Tickets
								</button>
							</div>
							<div className="col-4 col-md-2 d-flex justify-content-center align-items-center ">
								<a
									href="/customer/dashboard/help"
									target="_blank"
									rel="noopener noreferrer"
								>
									<button className="btn btn-primary px-3 py-2">
										Get Help
									</button>
								</a>
							</div>
							<div className="col-4 col-md-2 d-flex justify-content-center align-items-center">
								{bookingState === 'Confirmed' ? (
									new Date(
										booking.tickets[0].departureFlight.departureDateTime
									) <= new Date() ? (
										<h6 className="text-success fw-bold text-xl">Completed</h6>
									) : getTimeDifferenceInHours(
											booking.tickets[0].departureFlight.departureDateTime
									  ) <= 24 ? (
										<button
											className="btn btn-danger px-3 py-2"
											disabled={true}
										>
											Cancel Booking
										</button>
									) : (
										<button
											className="btn btn-danger px-3 py-2"
											onClick={handleCancelBooking}
											disabled={isCancelling}
										>
											{isCancelling ? (
												<>
													<span
														className="spinner-border spinner-border-sm me-2"
														role="status"
														aria-hidden="true"
													></span>
													Cancelling...
												</>
											) : (
												'Cancel Booking'
											)}
										</button>
									)
								) : (
									<h6 className="text-danger fw-bold text-xl">Cancelled</h6>
								)}
							</div>
						</>
					)}
					{type === 'airline' && (
						<div className="col-12 col-md-4 d-flex justify-content-center align-items-center ">
							<button
								className="btn btn-success px-5 py-2"
								onClick={() => setIsTicketsModalOpen(true)}
							>
								View Tickets
							</button>
						</div>
					)} */}
				</div>
				<TicketsModal
					isOpen={isTicketsModalOpen}
					onClose={() => setIsTicketsModalOpen(false)}
					booking={booking}
				/>
			</div>
		);
	}

	return (
		<div className="d-flex flex-column">
			<div
				className="row border border rounded m-0 py-2 my-2 align-items-center booking-card"
				onClick={() => setIsTicketsModalOpen(true)}
			>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="fw-bold">{booking.pnr}</p>
					</div>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="">
							{booking.tickets[0].roundTrip ? 'Round Trip' : 'One Way'}
						</p>
					</div>
				</div>
				<div className="col-12 col-md-4 d-flex justify-content-between align-items-center">
					<div className="d-flex flex-column align-items-center">
						<p>{booking.tickets[0].departureFlight?.departureAirport.city}</p>
						<p>
							{
								formatDateTime(
									booking.tickets[0].departureFlight?.departureDateTime
								).date
							}
						</p>
						<p>
							{
								formatDateTime(
									booking.tickets[0].departureFlight?.departureDateTime
								).time
							}
						</p>
					</div>
					<div className="d-flex flex-column align-items-center">
						<i className="bi bi-arrow-right"></i>
					</div>
					<div className="d-flex flex-column align-items-center">
						<p>{booking.tickets[0].departureFlight?.arrivalAirport.city}</p>
						<p>
							{
								formatDateTime(
									booking.tickets[0].departureFlight?.arrivalDateTime
								).date
							}
						</p>
						<p>
							{
								formatDateTime(
									booking.tickets[0].departureFlight?.arrivalDateTime
								).time
							}
						</p>
					</div>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="">
							{booking.tickets[0].seatType.charAt(0).toUpperCase() +
								booking.tickets[0].seatType.slice(1)}
						</p>
					</div>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<div className="d-flex flex-column align-items-center gap-2">
						<p className="">{booking.tickets.length}</p>
					</div>
				</div>

				{/* {type === 'customer' && (
					<>
						<div className="col-4 col-md-2 d-flex justify-content-center align-items-center">
							<button
								className="btn btn-success px-3 py-2"
								onClick={() => setIsTicketsModalOpen(true)}
							>
								View Tickets
							</button>
						</div>
						<div className="col-4 col-md-2 d-flex justify-content-center align-items-center ">
							<a
								href="/customer/dashboard/help"
								target="_blank"
								rel="noopener noreferrer"
							>
								<button className="btn btn-primary px-3 py-2">Get Help</button>
							</a>
						</div>
						<div className="col-4 col-md-2 d-flex justify-content-center align-items-center">
							{bookingState === 'Confirmed' ? (
								new Date(
									booking.tickets[0].departureFlight.departureDateTime
								) <= new Date() ? (
									<h6 className="text-success fw-bold text-xl">Completed</h6>
								) : getTimeDifferenceInHours(
										booking.tickets[0].departureFlight.departureDateTime
								  ) <= 24 ? (
									<button className="btn btn-danger px-3 py-2" disabled={true}>
										Cancel Booking
									</button>
								) : (
									<button
										className="btn btn-danger px-3 py-2"
										onClick={handleCancelBooking}
										disabled={isCancelling}
									>
										{isCancelling ? (
											<>
												<span
													className="spinner-border spinner-border-sm me-2"
													role="status"
													aria-hidden="true"
												></span>
												Cancelling...
											</>
										) : (
											'Cancel Booking'
										)}
									</button>
								)
							) : (
								<h6 className="text-danger fw-bold text-xl">Cancelled</h6>
							)}
						</div>
					</>
				)}
				{type === 'airline' && (
					<div className="col-12 col-md-4 d-flex justify-content-center align-items-center ">
						<button
							className="btn btn-success px-5 py-2"
							onClick={() => setIsTicketsModalOpen(true)}
						>
							View Tickets
						</button>
					</div>
				)} */}
			</div>
			<TicketsModal
				isOpen={isTicketsModalOpen}
				onClose={() => setIsTicketsModalOpen(false)}
				booking={booking}
			/>
		</div>
	);
};

export default BookingCard;
