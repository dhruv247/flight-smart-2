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

const PassengerDetails = () => {
	const navigate = useNavigate();
	const { currentBooking, setCurrentBooking } = useFlightContext();

	const [bookingDetails, setBookingDetails] = useState(null);
	const { user, isLoading: userLoading } = useGetUserDetails();
	const [passengerDetails, setPassengerDetails] = useState([]);
	const [error, setError] = useState(null);
	const [currentPassengerIndex, setCurrentPassengerIndex] = useState(null);
	const [currentFlightType, setCurrentFlightType] = useState('departure'); // 'departure' or 'return'
	const [loading, setLoading] = useState(true);
	const [isCreatingBooking, setIsCreatingBooking] = useState(false);

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
						<h6>Atleast 1 adult (18+) must be present</h6>
					</div>
				</div>
				<div className="card-body p-4">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleCreateTicket();
						}}
					>
						{passengerDetails.map((passenger, index) => (
							<div key={index} className="mb-4 pb-3 border-bottom">
								<div className="mb-3">
									<span className="badge bg-secondary fs-6">
										Passenger {index + 1}
									</span>
								</div>
								<div className="row g-3">
									<div className="col-12 col-md-6">
										<label className="form-label fw-semibold">Full Name</label>
										<input
											placeholder="Enter full name"
											type="text"
											className="form-control"
											value={passenger.nameOfFlyer}
											onChange={(e) =>
												handlePassengerChange(
													index,
													'nameOfFlyer',
													e.target.value
												)
											}
											required
										/>
									</div>
									<div className="col-12 col-md-6">
										<label className="form-label fw-semibold">
											Date of Birth
										</label>
										<div className="form-control p-0 bg-white">
											<DatePicker
												selected={passenger.dateOfBirth}
												onChange={(date) => handleDateChange(date, index)}
												className="form-control border-0"
												placeholderText="Select Date of Birth"
												dateFormat="yyyy-MM-dd"
												showMonthDropdown
												showYearDropdown
												dropdownMode="select"
												maxDate={yesterday}
												minDate={minDate}
												excludeDateIntervals={[
													{ start: today, end: new Date(2100, 0, 1) },
												]}
												required
												yearDropdownItemNumber={100}
												scrollableYearDropdown
											/>
										</div>
									</div>
								</div>
								<div className="row g-3 mt-2">
									<div className="col-12 col-md-6">
										<label className="form-label fw-semibold">
											Departure Flight Seat
										</label>
										<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
											<input
												type="text"
												className="form-control bg-white"
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
									</div>
									{isRoundTrip && (
										<div className="col-12 col-md-6">
											<label className="form-label fw-semibold">
												Return Flight Seat
											</label>
											<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
												<input
													type="text"
													className="form-control bg-white"
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
										</div>
									)}
								</div>
							</div>
						))}
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
