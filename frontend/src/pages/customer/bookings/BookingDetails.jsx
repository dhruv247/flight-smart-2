import React, { useState, useEffect } from 'react';
import getUserDetails from '../../../utils/getUserDetails';
import { useFlightContext } from '../../../context/FlightContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SeatMap from './SeatMap';
import { Modal } from 'bootstrap';
import { showErrorToast, showSuccessToast } from '../../../utils/toast';

const BookingDetails = () => {
	const navigate = useNavigate();
	const { currentBooking, setCurrentBooking } = useFlightContext();

	const [bookingDetails, setBookingDetails] = useState(null);
	const [currentUserDetails, setCurrentUserDetails] = useState(null);
	const [passengerDetails, setPassengerDetails] = useState([]);
	const [error, setError] = useState(null);
	const [currentPassengerIndex, setCurrentPassengerIndex] = useState(null);
	const [currentFlightType, setCurrentFlightType] = useState('departure'); // 'departure' or 'return'
	const [loading, setLoading] = useState(true);
	const [isCreatingBooking, setIsCreatingBooking] = useState(false);

	/**
	 * Calculate age from date of birth
	 * @param {string} dateOfBirth - Date of birth in YYYY-MM-DD format
	 * @returns {number} Age in years
	 */
	const calculateAge = (dateOfBirth) => {
		if (!dateOfBirth) return 0;
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	};

	/**
	 * Check if at least one adult (18 or older) is present in the booking
	 * @returns {boolean} True if at least one adult is present
	 */
	const hasAdultPresent = () => {
		return passengerDetails.some(
			(passenger) => calculateAge(passenger.dateOfBirth) >= 18
		);
	};

	useEffect(() => {
		/**
		 * Get current users details for creation of tickets and bookings
		 */
		const fetchUserDetails = async () => {
			try {
				const userDetailsFromToken = await getUserDetails();
				setCurrentUserDetails(userDetailsFromToken);
			} catch (error) {
				console.error('Error in fetchUserDetails:', error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		/**
		 * Fetch booking details from context
		 */
		const fetchBookingDetails = () => {
			try {
				if (!currentBooking) {
					throw new Error('No booking details found!');
				}
				setBookingDetails(currentBooking);

				// Initialize passenger details with fields for both departure and return flights
				const initialPassengerDetails = Array(currentBooking.passengers).fill({
					nameOfFlyer: '',
					dateOfBirth: '',
					departureFlightSeatNumber: null,
					returnFlightSeatNumber: null,
				});
				setPassengerDetails(initialPassengerDetails);
			} catch (error) {
				// console.error('Error fetching booking details:', error);
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchUserDetails();
		fetchBookingDetails();
	}, [currentBooking]);

	/**
	 * Used to change the departure and return seat and other details for passengers
	 * @param {*} index
	 * @param {*} field
	 * @param {*} value
	 */
	const handlePassengerChange = (index, field, value) => {
		setPassengerDetails((prev) => {
			const newDetails = [...prev];
			newDetails[index] = {
				...newDetails[index],
				[field]: value,
			};
			return newDetails;
		});
	};

	/**
	 * Calls the handlePassengerChange functtion to change seat numbers
	 * @param {*} index
	 * @param {*} seatNumber
	 */
	const handleSeatSelect = (index, seatNumber) => {
		const fieldName =
			currentFlightType === 'departure'
				? 'departureFlightSeatNumber'
				: 'returnFlightSeatNumber';

		handlePassengerChange(index, fieldName, seatNumber);
	};

	/**
	 * Opens modal for a passenger using index
	 * @param {*} index
	 * @param {*} flightType
	 */
	const openSeatMapModal = (index, flightType) => {
		setCurrentPassengerIndex(index);
		setCurrentFlightType(flightType);

		const modalId =
			flightType === 'departure'
				? 'departureSeatMapModal'
				: 'returnSeatMapModal';
		const modalElement = document.getElementById(modalId);

		if (modalElement) {
			const modal = new Modal(modalElement);
			modal.show();
		}
	};

	const handleCreateTicket = async () => {
		if (!currentUserDetails || !bookingDetails) return;

		setIsCreatingBooking(true);

		const userDetails = {
			_id: currentUserDetails._id,
			email: currentUserDetails.email,
			username: currentUserDetails.username,
		};

		try {
			// Validate passenger details before submission
			const isRoundTrip = !!bookingDetails?.returnFlightId;
			for (const passenger of passengerDetails) {
				if (
					!passenger.nameOfFlyer ||
					!passenger.dateOfBirth ||
					!passenger.departureFlightSeatNumber
				) {
					throw new Error('Please complete all required passenger details');
				}

				if (isRoundTrip && !passenger.returnFlightSeatNumber) {
					throw new Error(
						'Return flight seat selection is required for round trips'
					);
				}
			}

			// Check if at least one adult is present
			if (!hasAdultPresent()) {
				throw new Error(
					'At least one adult (18 or older) must be present in the booking'
				);
			}

			const createdTickets = [];

			const adultPresent = passengerDetails.some(
				(passenger) => calculateAge(passenger.dateOfBirth) >= 18
			);

			for (const passenger of passengerDetails) {
				let documentImageUrl = '';

				if (passenger.documentImage) {
					const formData = new FormData();
					formData.append('image', passenger.documentImage);

					const imageURLResponse = await axios.post(
						'http://localhost:8000/api/images/upload-image',
						formData,
						{
							headers: {
								'Content-Type': 'multipart/form-data',
							},
						}
					);

					if (!imageURLResponse.data.url) {
						throw new Error(
							imageURLResponse.data.message || 'Failed to upload document image'
						);
					}

					documentImageUrl = imageURLResponse.data.url;
				}

				const identificationDocument = {
					documentName: passenger.documentName,
					documentImage: documentImageUrl,
				};

				try {
					const ticket = {
						// userDetails,
						departureFlightId: bookingDetails.departureFlightId,
						returnFlightId: bookingDetails.returnFlightId || null,
						nameOfFlyer: passenger.nameOfFlyer,
						dateOfBirth: passenger.dateOfBirth,
						seatType: bookingDetails.seatType,
						// ticketPrice: bookingDetails.ticketPrice,
						departureFlightSeatNumber: parseInt(
							passenger.departureFlightSeatNumber
						),
						returnFlightSeatNumber: passenger.returnFlightSeatNumber
							? parseInt(passenger.returnFlightSeatNumber)
							: null,
						// roundTrip: !!bookingDetails.returnFlightId,
					};

					const response = await axios.post(
						'http://localhost:8000/api/tickets/create-ticket',
						ticket,
						{
							withCredentials: true,
						}
					);

					createdTickets.push(response.data.ticketId);
				} catch (error) {
					showErrorToast(
						error.response?.data?.message || 'Error creating ticket'
					);
					throw error;
				}
			}

			try {
				const booking = {
					tickets: createdTickets,
				};

				await axios.post(
					'http://localhost:8000/api/bookings/create-booking',
					booking,
					{
						withCredentials: true,
					}
				);

				showSuccessToast('Booking created successfully!');

				// Update flight prices
				await axios.patch(
					`http://localhost:8000/api/flights/update-flight-price/${bookingDetails.departureFlightId}`
				);
				if (bookingDetails.returnFlightId) {
					await axios.patch(
						`http://localhost:8000/api/flights/update-flight-price/${bookingDetails.returnFlightId}`
					);
				}

				setCurrentBooking(null);
				navigate('/customer/dashboard');
			} catch (error) {
				showErrorToast(
					error.response?.data?.message || 'Error creating booking'
				);
				throw error;
			}
		} catch (error) {
			console.error('Error creating tickets and booking:', error);
			showErrorToast(
				error.response?.data?.message ||
					error.message ||
					'Error creating tickets and booking'
			);
		} finally {
			setIsCreatingBooking(false);
		}
	};

	const isRoundTrip = !!bookingDetails?.returnFlightId;

	/**
	 * Ensuring all the fields required to submit the form are there
	 */
	const canSubmitForm = passengerDetails.every((passenger) => {
		const hasRequiredFields =
			passenger.nameOfFlyer && passenger.departureFlightSeatNumber;
		const hasReturnSeat = !isRoundTrip || passenger.returnFlightSeatNumber;

		return hasRequiredFields && hasReturnSeat;
	});

	const getBlockedSeats = (flightType, currentIndex) => {
		// Collect seats selected by other passengers
		return passengerDetails
			.map((passenger, index) => {
				if (index === currentIndex) return null; // Skip current passenger
				return flightType === 'departure'
					? passenger.departureFlightSeatNumber
					: passenger.returnFlightSeatNumber;
			})
			.filter((seatNumber) => seatNumber !== null); // Remove null values
	};

	/**
	 * Error indications
	 */
	if (error) {
		return <div className="container mt-4">Error: {error}</div>;
	}

	/** Loading indication */
	if (loading) {
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading booking details...</p>
			</div>
		);
	}

	return (
		<div className="container mt-3" style={{ maxWidth: 600 }}>
			<h2 className="text-center mb-4">Passenger Details</h2>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleCreateTicket();
				}}
			>
				{passengerDetails.map((passenger, index) => (
					<div key={index} style={{ marginBottom: 32 }}>
						<div style={{ fontWeight: 600, marginBottom: 12 }}>
							Passenger {index + 1}
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
							<label style={{ fontWeight: 500 }}>
								Full Name
								<input
									type="text"
									className="form-control"
									value={passenger.nameOfFlyer}
									onChange={(e) =>
										handlePassengerChange(index, 'nameOfFlyer', e.target.value)
									}
									required
									style={{ marginTop: 4 }}
								/>
							</label>
							<label style={{ fontWeight: 500 }}>
								Date of Birth
								<input
									type="date"
									className="form-control"
									value={passenger.dateOfBirth}
									onChange={(e) =>
										handlePassengerChange(index, 'dateOfBirth', e.target.value)
									}
									required
									style={{ marginTop: 4 }}
								/>
							</label>
							<label style={{ fontWeight: 500 }}>
								Departure Flight Seat
								<div
									style={{
										display: 'flex',
										gap: 8,
										alignItems: 'center',
										marginTop: 4,
									}}
								>
									<input
										type="text"
										className="form-control"
										value={passenger.departureFlightSeatNumber || ''}
										readOnly
										placeholder="No seat selected"
										style={{ width: 120 }}
									/>
									<button
										type="button"
										className="btn btn-outline-primary btn-sm"
										onClick={() => openSeatMapModal(index, 'departure')}
									>
										Select Seat
									</button>
								</div>
							</label>
							{isRoundTrip && (
								<label style={{ fontWeight: 500 }}>
									Return Flight Seat
									<div
										style={{
											display: 'flex',
											gap: 8,
											alignItems: 'center',
											marginTop: 4,
										}}
									>
										<input
											type="text"
											className="form-control"
											value={passenger.returnFlightSeatNumber || ''}
											readOnly
											placeholder="No seat selected"
											style={{ width: 120 }}
										/>
										<button
											type="button"
											className="btn btn-outline-primary btn-sm"
											onClick={() => openSeatMapModal(index, 'return')}
										>
											Select Seat
										</button>
									</div>
								</label>
							)}
						</div>
					</div>
				))}

				<div className="text-center mt-4">
					<button
						type="submit"
						className="btn btn-primary"
						disabled={!canSubmitForm || isCreatingBooking}
						style={{ minWidth: 140 }}
					>
						{isCreatingBooking ? (
							<>
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
								Booking...
							</>
						) : (
							'Book Tickets'
						)}
					</button>
				</div>
			</form>

			{/* Departure Flight Seat Map Modal */}
			<div
				className="modal fade"
				id="departureSeatMapModal"
				tabIndex="-1"
				aria-labelledby="departureSeatMapModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="departureSeatMapModalLabel">
								Select Departure Flight Seat
							</h5>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<SeatMap
								flightId={bookingDetails?.departureFlightId}
								seatType={bookingDetails?.seatType}
								onSeatSelect={(seatNumber) =>
									handleSeatSelect(currentPassengerIndex, seatNumber)
								}
								blockedSeats={getBlockedSeats(
									'departure',
									currentPassengerIndex
								)}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Return Flight Seat Map Modal */}
			{isRoundTrip && (
				<div
					className="modal fade"
					id="returnSeatMapModal"
					tabIndex="-1"
					aria-labelledby="returnSeatMapModalLabel"
					aria-hidden="true"
				>
					<div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="returnSeatMapModalLabel">
									Select Return Flight Seat
								</h5>
								<button
									type="button"
									className="btn-close"
									data-bs-dismiss="modal"
									aria-label="Close"
								></button>
							</div>
							<div className="modal-body">
								<SeatMap
									flightId={bookingDetails?.returnFlightId}
									seatType={bookingDetails?.seatType}
									onSeatSelect={(seatNumber) =>
										handleSeatSelect(currentPassengerIndex, seatNumber)
									}
									blockedSeats={getBlockedSeats(
										'return',
										currentPassengerIndex
									)}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BookingDetails;
