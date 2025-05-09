import React, { useState } from 'react';
import { useCities } from '../../../hooks/useCities';
import getUserDetails from '../../../utils/getUserDetails';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';

const FlightSearchForm = ({
	onSubmit,
	initialTripType = 'oneWay',
	initialValues = {},
	isReadOnly = false,
	showReturnDate = true,
}) => {
	const navigate = useNavigate();
	const { cities, isLoading } = useCities();
	const [tripType, setTripType] = useState(initialTripType);
	const [formData, setFormData] = useState({
		flightFrom: initialValues.flightFrom || '',
		flightTo: initialValues.flightTo || '',
		departureDate: initialValues.departureDate || '',
		returnDate: initialValues.returnDate || '',
		passengers: initialValues.passengers || '',
		travelClass: initialValues.travelClass || '',
		...initialValues,
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
			await getUserDetails();
			// If logged in, proceed with search
			onSubmit({ ...formData, tripType });
		} catch (error) {
			// If not logged in, show modal
			const loginModal = new Modal(
				document.getElementById('loginRequiredModal')
			);
			loginModal.show();
		}
	};

	const handleLoginRedirect = () => {
		const loginModal = Modal.getInstance(
			document.getElementById('loginRequiredModal')
		);
		loginModal.hide();
		navigate('/login');
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
				<div className="d-flex flex-column flex-md-row justify-content-between gap-2">
					{/* To / From Input Fields */}
					<div className="d-flex gap-2 flex-grow-1">
						<input
							type="search"
							name="flightFrom"
							id="flightFrom"
							className="form-control p-4"
							placeholder="From"
							list="cityList"
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
							placeholder="To"
							list="cityList"
							autoComplete="off"
							required
							value={formData.flightTo}
							onChange={handleChange}
							readOnly={isReadOnly}
						/>
						<datalist id="cityList">
							{!isLoading &&
								cities.map((city, index) => (
									<option key={index} value={city} />
								))}
						</datalist>
					</div>

					{/* Date Selection */}
					<div className="d-flex gap-2">
						<input
							type="date"
							name="departureDate"
							id="departureDate"
							className="form-control p-4"
							required
							value={formData.departureDate}
							onChange={handleChange}
							readOnly={isReadOnly}
						/>
						{showReturnDate && (
							<input
								type="date"
								name="returnDate"
								id="returnDate"
								className={`form-control p-4 ${
									tripType === 'roundTrip' ? '' : 'd-none'
								}`}
								value={formData.returnDate}
								onChange={handleChange}
								readOnly={isReadOnly}
								required={tripType === 'roundTrip'}
							/>
						)}
					</div>

					{/* No of Travellers / Travel Class */}
					<div className="d-flex gap-2">
						<select
							className="form-select"
							id="passengers"
							name="passengers"
							required
							value={formData.passengers}
							onChange={handleChange}
							disabled={isReadOnly}
						>
							<option value="" disabled>
								Passengers
							</option>
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
							<option value="" disabled>
								Class
							</option>
							<option value="1">Economy</option>
							<option value="2">Business</option>
						</select>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						className="btn btn-primary p-4"
						disabled={isReadOnly && !isReturnFlightForm}
					>
						{isReturnFlightForm ? 'Search Return Flights' : 'Search'}
					</button>
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