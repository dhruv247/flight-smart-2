import React, { useState } from 'react';
import { useAirports } from '../../../hooks/useAirports';
import useGetUserDetails from '../../../hooks/useGetUserDetails';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FlightSearchForm = ({
	onSubmit,
	initialTripType = 'oneWay',
	initialValues = {},
	isReadOnly = false,
	showReturnDate = true,
}) => {
	const navigate = useNavigate();
	const { airports, isLoading: airportsLoading } = useAirports();
	const [tripType, setTripType] = useState(initialTripType);
	const { user, isLoading: userLoading } = useGetUserDetails();
	const [formData, setFormData] = useState({
		flightFrom: initialValues.flightFrom || '',
		flightTo: initialValues.flightTo || '',
		departureDate: initialValues.departureDate
			? new Date(initialValues.departureDate)
			: null,
		returnDate: initialValues.returnDate
			? new Date(initialValues.returnDate)
			: null,
		passengers: initialValues.passengers || 1,
		travelClass: initialValues.travelClass || 1,
		tripType: initialTripType,
	});

	// Determine if this is the return flight search form
	const isReturnFlightForm =
		isReadOnly && tripType === 'roundTrip' && showReturnDate;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleDateChange = (date, name) => {
		setFormData((prev) => ({
			...prev,
			[name]: date,
		}));
	};

	const handleTripTypeChange = (e) => {
		const newTripType = e.target.value;
		setTripType(newTripType);
		setFormData((prev) => ({
			...prev,
			tripType: newTripType,
		}));
	};

	const swapLocations = () => {
		setFormData((prev) => ({
			...prev,
			flightFrom: prev.flightTo,
			flightTo: prev.flightFrom,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Check if user is logged in
			if (!user && !userLoading) {
				throw new Error('User not logged in');
			}
			// Format dates to YYYY-MM-DD format before submitting
			const formattedData = {
				...formData,
				departureDate: formData.departureDate
					? formatDate(formData.departureDate)
					: '',
				returnDate: formData.returnDate ? formatDate(formData.returnDate) : '',
			};
			// If logged in, proceed with search
			onSubmit({ ...formattedData, tripType });
		} catch (error) {
			// If not logged in, show modal
			const loginModal = new Modal(
				document.getElementById('loginRequiredModal')
			);
			loginModal.show();
		}
	};

	// Format date to YYYY-MM-DD
	const formatDate = (date) => {
		if (!date) return '';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const handleLoginRedirect = () => {
		const loginModal = Modal.getInstance(
			document.getElementById('loginRequiredModal')
		);
		loginModal.hide();
		navigate('/login');
	};

	// Get today's date for min date
	const today = new Date();

	// Helper function to add days to a date
	const addDays = (date, days) => {
		if (!date) return null;
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	};

	return (
		<div className="container text-center mt-5">
			<form id="flightSearchForm" onSubmit={handleSubmit}>
				{/* Trip Type Radio Buttons */}
				<div id="tripType" className="mb-3 d-flex justify-content-center gap-4">
					<div className="form-check">
						<input
							type="radio"
							className="form-check-input"
							name="tripType"
							id="oneWay"
							value="oneWay"
							checked={tripType === 'oneWay'}
							onChange={handleTripTypeChange}
							disabled={isReadOnly}
							required
						/>
						<label
							className="form-check-label ms-1"
							htmlFor="oneWay"
							style={{ fontSize: '1rem', color: '#555' }}
						>
							One Way
						</label>
					</div>
					<div className="form-check">
						<input
							type="radio"
							className="form-check-input"
							name="tripType"
							id="roundTrip"
							value="roundTrip"
							checked={tripType === 'roundTrip'}
							onChange={handleTripTypeChange}
							disabled={isReadOnly}
							required
						/>
						<label
							className="form-check-label ms-1"
							htmlFor="roundTrip"
							style={{ fontSize: '1rem', color: '#555' }}
						>
							Round Trip
						</label>
					</div>
				</div>

				{/* Flight Details Input Fields */}
				<div className="row">
					{/* To / From Input Fields */}
					<div className="col-md-5 col-12 d-flex gap-2 flex-grow-1">
						<input
							type="search"
							name="flightFrom"
							id="flightFrom"
							className="form-control p-4"
							placeholder="From (Airport)"
							list="airportList"
							autoComplete="off"
							required
							value={formData.flightFrom}
							onChange={handleChange}
							readOnly={isReadOnly}
						/>

						<button
							type="button"
							className="btn btn-outline-secondary btn-sm align-self-center"
							onClick={swapLocations}
							disabled={isReadOnly}
							style={{ lineHeight: 1, height: '25px' }}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								fill="currentColor"
								className="bi bi-arrow-left-right"
								viewBox="0 0 16 16"
							>
								<path
									fillRule="evenodd"
									d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5zm14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5z"
								/>
							</svg>
						</button>

						<input
							type="search"
							name="flightTo"
							id="flightTo"
							className="form-control p-4"
							placeholder="To (Airport)"
							list="airportList"
							autoComplete="off"
							required
							value={formData.flightTo}
							onChange={handleChange}
							readOnly={isReadOnly}
						/>

						<datalist id="airportList">
							{!airportsLoading &&
								airports.map((airport, index) => (
									<option key={index} value={airport.name}>
										{airport.name} ({airport.code}) - {airport.city}
									</option>
								))}
						</datalist>
					</div>

					{/* Date Selection */}
					<div className="col-md-3 col-12 d-flex gap-2">
						<div className="form-control p-0">
							<DatePicker
								selected={formData.departureDate}
								onChange={(date) => handleDateChange(date, 'departureDate')}
								className="form-control p-4 border-0"
								placeholderText="Departure Date"
								dateFormat="yyyy-MM-dd"
								minDate={today}
								required
								disabled={isReadOnly}
							/>
						</div>
						{showReturnDate && tripType === 'roundTrip' && (
							<div className="form-control p-0">
								<DatePicker
									selected={formData.returnDate}
									onChange={(date) => handleDateChange(date, 'returnDate')}
									className="form-control p-4 border-0"
									placeholderText="Return Date"
									dateFormat="yyyy-MM-dd"
									minDate={
										formData.departureDate
											? addDays(formData.departureDate, 1)
											: addDays(today, 1)
									}
									required
									disabled={isReadOnly}
								/>
							</div>
						)}
					</div>

					{/* No of Travellers / Travel Class */}
					<div className="col-md-3 col-12 d-flex gap-2">
						<select
							className="form-select"
							id="passengers"
							name="passengers"
							required
							value={formData.passengers}
							onChange={handleChange}
							disabled={isReadOnly}
						>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
						</select>
						<select
							className="form-select"
							id="travelClass"
							name="travelClass"
							required
							value={formData.travelClass}
							onChange={handleChange}
							disabled={isReadOnly}
						>
							{/* <option value="" disabled>
								Class
							</option> */}
							<option value="1">Economy</option>
							<option value="2">Business</option>
						</select>
					</div>

					<div className="col-md-1 col-12 d-flex justify-content-center">
						{/* Submit Button */}
						<button
							type="submit"
							className="btn btn-primary p-4"
							disabled={isReadOnly && !isReturnFlightForm}
						>
							{isReturnFlightForm ? 'Search Return Flights' : 'Search'}
						</button>
					</div>
				</div>
			</form>

			{/* Login Required Modal */}
			<div
				className="modal fade"
				id="loginRequiredModal"
				tabIndex="-1"
				aria-labelledby="loginRequiredModalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="loginRequiredModalLabel">
								Login Required
							</h5>
							<button
								type="button"
								className="btn-close"
								data-bs-dismiss="modal"
								aria-label="Close"
							></button>
						</div>
						<div className="modal-body">
							<p>
								You need to be logged in to search for flights. Would you like
								to login now?
							</p>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-secondary"
								data-bs-dismiss="modal"
							>
								Cancel
							</button>
							<button
								type="button"
								className="btn btn-primary"
								onClick={handleLoginRedirect}
							>
								Login
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FlightSearchForm;