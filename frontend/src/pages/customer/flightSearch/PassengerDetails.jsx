import React, { useState, useEffect } from 'react';
import useGetUserDetails from '../../../hooks/useGetUserDetails';
import { useFlightContext } from '../../../hooks/useFlightContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SeatMap from './SeatMap';
import { Modal } from 'bootstrap';
import { showErrorToast, showSuccessToast } from '../../../utils/toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loading from '../../../components/Loading';
import PassengerDetailsCard from './PassengerDetailsCard';
import { imageService } from '../../../services/image.service';
import { ticketService } from '../../../services/ticket.service';
import { bookingService } from '../../../services/booking.service';
import { flightService } from '../../../services/flight.service';

const PassengerDetails = () => {
	const navigate = useNavigate();
	const { currentBooking, clearFlightData, flightSearchData } =
		useFlightContext();

	const [bookingDetails, setBookingDetails] = useState(null);
	const { user, isLoading: userLoading } = useGetUserDetails();
	const [passengerDetails, setPassengerDetails] = useState([]);
	const [error, setError] = useState(null);
	const [currentPassengerIndex, setCurrentPassengerIndex] = useState(null);
	const [currentFlightType, setCurrentFlightType] = useState('departure'); // 'departure' or 'return'
	const [loading, setLoading] = useState(true);
	const [isCreatingBooking, setIsCreatingBooking] = useState(false);
	const [adultPassenger, setAdultPassenger] = useState(
		flightSearchData.adultPassengers
	);
	const [childrenPassenger, setChildrenPassenger] = useState(
		flightSearchData.childPassengers
	);
	const [infantPassenger, setInfantPassenger] = useState(
		flightSearchData.infantPassengers
	);

	// Today's date for DatePicker max date
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const minDate = new Date(1900, 0, 1); // January 1, 1900

	/**
	 * Format date to YYYY-MM-DD string format
	 * @param {Date} date - Date object to format
	 * @returns {string} Formatted date string
	 */
	const formatDate = (date) => {
		if (!date) return '';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	/**
	 * Calculate age from date of birth
	 * @param {string|Date} dateOfBirth - Date of birth
	 * @returns {number} Age in years
	 */
	const calculateAge = (dateOfBirth) => {
		if (!dateOfBirth) return 0;
		const today = new Date();
		const birthDate =
			typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
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
				if (userLoading) {
					return; // Wait for user loading to complete
				}
				if (!user) {
					setError('Please log in to continue with booking');
					return;
				}
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
					dateOfBirth: null,
					departureFlightSeatNumber: null,
					returnFlightSeatNumber: null,
				});
				setPassengerDetails(initialPassengerDetails);
			} catch (error) {
				setError(error.message);
			} finally {
				setLoading(false);
			}
		};

		fetchUserDetails();
		fetchBookingDetails();
	}, [currentBooking, user, userLoading]);

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
	 * Handle date of birth change from DatePicker
	 * @param {Date} date - Selected date
	 * @param {number} index - Passenger index
	 */
	const handleDateChange = (date, index) => {
		handlePassengerChange(index, 'dateOfBirth', date);
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
		if (!user || !bookingDetails) return;

		setIsCreatingBooking(true);

		const userDetails = {
			_id: user._id,
			email: user.email,
			username: user.username,
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

					const imageURLResponse = await imageService.uploadImage(
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
						dateOfBirth: formatDate(passenger.dateOfBirth), // Format date for API
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

					const response = await ticketService.createTicket(
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

				await bookingService.createBooking(
					booking,
					{
						withCredentials: true,
					}
				);

				showSuccessToast('Booking created successfully!');

				// Update flight prices
				await flightService.updateFlightPrice(bookingDetails.departureFlightId);
				if (bookingDetails.returnFlightId) {
					await flightService.updateFlightPrice(bookingDetails.returnFlightId);
				}

				clearFlightData();
				navigate('/customer/dashboard/bookings');
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
			passenger.nameOfFlyer &&
			passenger.nameOfFlyer.trim() !== '' &&
			passenger.departureFlightSeatNumber &&
			passenger.dateOfBirth;
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
		return <Loading />;
	}

	return (
		<div>
			<div
				className="card shadow-lg border-0"
				style={{ background: '#f8f9fa' }}
			>
				<div
					className="card-header bg-primary text-white d-flex align-items-center"
					style={{
						borderTopLeftRadius: '0.5rem',
						borderTopRightRadius: '0.5rem',
					}}
				>
					<i className="bi bi-person-lines-fill me-2 fs-4"></i>
					<div className="d-flex flex-column gap-1">
						<h4 className="mb-0">Passenger Details</h4>
						<p className="mb-0">
							At least one adult (18 or older) must be present in the booking
						</p>
					</div>
				</div>
				<div className="card-body p-4">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleCreateTicket();
						}}
					>
						{passengerDetails.map((passenger, index) => {
							// Determine passenger type based on index
							let passengerType = 'adult';
							if (index >= adultPassenger) {
								if (index < adultPassenger + childrenPassenger) {
									passengerType = 'child';
								} else {
									passengerType = 'infant';
								}
							}

							return (
								<PassengerDetailsCard
									key={index}
									passenger={passenger}
									index={index}
									isRoundTrip={isRoundTrip}
									onPassengerChange={handlePassengerChange}
									onDateChange={handleDateChange}
									openSeatMapModal={openSeatMapModal}
									yesterday={yesterday}
									minDate={minDate}
									today={today}
									passengerType={passengerType}
								/>
							);
						})}
						<div className="text-center mt-4">
							<button
								type="submit"
								className="btn btn-primary btn-lg px-5 shadow-sm"
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
									'Confirm Booking'
								)}
							</button>
						</div>
					</form>
				</div>
			</div>

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

export default PassengerDetails;
