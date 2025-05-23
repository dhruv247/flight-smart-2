import React, { useState, useEffect } from 'react';
import { useAirports } from '../../../hooks/useAirports';
import useGetUserDetails from '../../../hooks/useGetUserDetails';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { showErrorToast } from '../../../utils/toast';

const FlightSearchForm = ({
	onSubmit,
	initialTripType = 'oneWay',
	initialValues = {},
	isReadOnly = false,
	showReturnDate = true,
	initialFlightTo = '',
}) => {
	const navigate = useNavigate();
	const { airports, isLoading: airportsLoading } = useAirports();
	const [tripType, setTripType] = useState(initialTripType);
	const { user, isLoading: userLoading } = useGetUserDetails();
	const [formData, setFormData] = useState({
		flightFrom: initialValues.flightFrom
			? { value: initialValues.flightFrom, label: initialValues.flightFrom }
			: null,
		flightTo: initialValues.flightTo
			? { value: initialValues.flightTo, label: initialValues.flightTo }
			: initialFlightTo
			? { value: initialFlightTo, label: initialFlightTo }
			: null,
		departureDate: initialValues.departureDate
			? new Date(initialValues.departureDate)
			: null,
		returnDate: initialValues.returnDate
			? new Date(initialValues.returnDate)
			: null,
		adultPassengers: initialValues.adultPassengers || 1,
		childPassengers: initialValues.childPassengers || 0,
		infantPassengers: initialValues.infantPassengers || 0,
		travelClass: initialValues.travelClass || '1',
		tripType: initialTripType,
	});

	const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);

	useEffect(() => {
		setFormData((prev) => {
			if (initialFlightTo) {
				return {
					...prev,
					flightTo: { value: initialFlightTo, label: initialFlightTo },
				};
			}
			return prev;
		});
	}, [initialFlightTo]);

	useEffect(() => {
		setFormData((prev) => ({
			...prev,
			adultPassengers: prev.adultPassengers,
			childPassengers: prev.childPassengers,
			infantPassengers: prev.infantPassengers,
		}));
	}, [formData.adultPassengers, formData.childPassengers, formData.infantPassengers]);

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

	const handleSelectChange = (selectedOption, { name }) => {
		setFormData((prev) => ({
			...prev,
			[name]: selectedOption,
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
			if (formData.flightFrom?.value === formData.flightTo?.value) {
				throw new Error('Departure and arrival cities cannot be the same');
			}

			const formattedData = {
				...formData,
				flightFrom: formData.flightFrom?.value || '',
				flightTo: formData.flightTo?.value || '',
				departureDate: formData.departureDate
					? formatDate(formData.departureDate)
					: '',
				returnDate: formData.returnDate ? formatDate(formData.returnDate) : '',
			};
			// If logged in, proceed with search
			onSubmit({ ...formattedData, tripType, adultPassengers: formData.adultPassengers, childPassengers: formData.childPassengers, infantPassengers: formData.infantPassengers });
		} catch (error) {
			if (error.message === 'Departure and arrival cities cannot be the same') {
				showErrorToast(error.message);
			}
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
	const maxDate = new Date(2026, 11, 31); // December 31, 2026

	// Transform cities data for react-select and remove duplicates
	const cityOptions = React.useMemo(() => {
		const uniqueCities = [...new Set(airports.map((airport) => airport.city))];
		return uniqueCities.map((city) => ({
			value: city,
			label: city,
		}));
	}, [airports]);

	// Filter options for To dropdown based on From selection
	const toOptions = React.useMemo(() => {
		return cityOptions.filter(
			(option) =>
				!formData.flightFrom || option.value !== formData.flightFrom.value
		);
	}, [cityOptions, formData.flightFrom]);

	// Filter options for From dropdown based on To selection
	const fromOptions = React.useMemo(() => {
		return cityOptions.filter(
			(option) => !formData.flightTo || option.value !== formData.flightTo.value
		);
	}, [cityOptions, formData.flightTo]);

	return (
		<div className="container text-center mt-5">
			<form
				id="flightSearchForm"
				onSubmit={handleSubmit}
				className="border rounded-3 p-4 bg-white"
			>
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
					<div className="col-md-5 my-2">
						<div className="d-flex gap-2">
							<div className="flex-grow-1 border rounded-3 p-2">
								<p className="text-start mb-1 fw-semibold">From</p>
								<Select
									name="flightFrom"
									value={formData.flightFrom}
									onChange={(option) =>
										handleSelectChange(option, { name: 'flightFrom' })
									}
									options={fromOptions}
									placeholder="Enter Departure City"
									isSearchable
									isClearable
									isDisabled={isReadOnly}
									required
									className="flex-grow-1 text-start"
								/>
							</div>

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

							<div className="flex-grow-1 border rounded-3 p-2">
								<p className="text-start mb-1 fw-semibold">To</p>
								<Select
									name="flightTo"
									value={formData.flightTo}
									onChange={(option) =>
										handleSelectChange(option, { name: 'flightTo' })
									}
									options={toOptions}
									placeholder="Enter Arrival City"
									isSearchable
									isClearable
									isDisabled={isReadOnly}
									required
									className="flex-grow-1 text-start custom-flightTo"
								/>
							</div>
						</div>
					</div>

					{/* Date Selection one way and round trip */}
					{tripType === 'oneWay' && (
						<div className="col-md-3 col-12 my-2">
							<div className="d-flex gap-2">
								<div className="flex-grow-1 border rounded-3 p-2 text-start">
									<p className="text-start mb-1 fw-semibold">Departure Date</p>
									<DatePicker
										selected={formData.departureDate}
										onChange={(date) => handleDateChange(date, 'departureDate')}
										className="form-control custom-datepicker"
										placeholderText="Select Departure Date"
										dateFormat="yyyy-MM-dd"
										minDate={today}
										maxDate={maxDate}
										required
										disabled={isReadOnly}
									/>
								</div>
							</div>
						</div>
					)}
					{showReturnDate && tripType === 'roundTrip' && (
						<div className="col-md-3 col-12 my-2">
							<div className="d-flex gap-2">
								<div className="flex-grow-1 border rounded-3 p-2 text-start">
									<p className="text-start mb-1 fw-semibold">Departure Date</p>
									<DatePicker
										selected={formData.departureDate}
										onChange={(date) => handleDateChange(date, 'departureDate')}
										className="form-control"
										placeholderText="Select Departure Date"
										dateFormat="yyyy-MM-dd"
										minDate={today}
										maxDate={maxDate}
										required
										disabled={isReadOnly}
									/>
								</div>

								<div className="flex-grow-1 border rounded-3 p-2">
									<p className="text-start mb-1 fw-semibold">Return Date</p>
									<DatePicker
										selected={formData.returnDate}
										onChange={(date) => handleDateChange(date, 'returnDate')}
										className="form-control"
										placeholderText="Select Return Date"
										dateFormat="yyyy-MM-dd"
										minDate={
											formData.departureDate ? formData.departureDate : today
										}
										maxDate={maxDate}
										required
										disabled={isReadOnly}
									/>
								</div>
							</div>
						</div>
					)}
					{/* No of Travellers / Travel Class */}
					<div className="col-md-3 col-12 my-2">
						<div className="d-flex gap-2">
							<div
								className="flex-grow-1 border rounded-3 p-2"
								style={{ position: 'relative' }}
							>
								<p className="text-start mb-1 fw-semibold">Passengers</p>
								<div className="dropdown">
									<button
										type="button"
										className="form-control text-start"
										onClick={() => setPassengerDropdownOpen((open) => !open)}
										disabled={isReadOnly}
										style={{ position: 'relative' }}
									>
										{formData.adultPassengers + formData.childPassengers + formData.infantPassengers}
										<span className="ms-2">&#9662;</span>
									</button>
									{passengerDropdownOpen && (
										<div
											className="position-absolute bg-white border rounded shadow p-3"
											style={{ zIndex: 1000, minWidth: 250, left: 0 }}
										>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<div>
													<div>Adults</div>
													<div
														className="text-muted"
														style={{ fontSize: '0.85em' }}
													>
														(12+ Years)
													</div>
												</div>
												<div>
													<button
														type="button"
														className="btn btn-outline-secondary btn-sm"
														onClick={() => setFormData((p) => ({ ...p, adultPassengers: Math.max(1, p.adultPassengers - 1) }))}
														disabled={formData.adultPassengers <= 1}
													>
														-
													</button>
													<span className="mx-2">{formData.adultPassengers}</span>
													<button
														type="button"
														className="btn btn-outline-secondary btn-sm"
														onClick={() => setFormData((p) => ({ ...p, adultPassengers: p.adultPassengers + 1 }))}
														disabled={formData.adultPassengers + formData.childPassengers + formData.infantPassengers >= 9}
													>
														+
													</button>
												</div>
											</div>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<div>
													<div>Children</div>
													<div
														className="text-muted"
														style={{ fontSize: '0.85em' }}
													>
														(2-12 Years)
													</div>
												</div>
												<div>
													<button
														type="button"
														className="btn btn-outline-secondary btn-sm"
														onClick={() =>
															setFormData((p) => ({ ...p, childPassengers: Math.max(0, p.childPassengers - 1) }))
														}
														disabled={formData.childPassengers <= 0}
													>
														-
													</button>
													<span className="mx-2">{formData.childPassengers}</span>
													<button
														type="button"
														className="btn btn-outline-secondary btn-sm"
														onClick={() =>
															setFormData((p) => ({ ...p, childPassengers: p.childPassengers + 1 }))
														}
														disabled={formData.adultPassengers + formData.childPassengers + formData.infantPassengers >= 9}
													>
														+
													</button>
												</div>
											</div>
											<div className="d-flex justify-content-between align-items-center mb-2">
												<div>
													<div>Infant</div>
													<div
														className="text-muted"
														style={{ fontSize: '0.85em' }}
													>
														(0-2 Years)
													</div>
												</div>
												<div>
													<button
														type="button"
														className="btn btn-outline-secondary btn-sm"
														onClick={() =>
															setFormData((p) => ({ ...p, infantPassengers: Math.max(0, p.infantPassengers - 1) }))
														}
														disabled={formData.infantPassengers <= 0}
													>
														-
													</button>
													<span className="mx-2">{formData.infantPassengers}</span>
													<button
														type="button"
														className="btn btn-outline-secondary btn-sm"
														onClick={() =>
															setFormData((p) => ({ ...p, infantPassengers: p.infantPassengers + 1 }))
														}
														disabled={formData.adultPassengers + formData.childPassengers + formData.infantPassengers >= 9}
													>
														+
													</button>
												</div>
											</div>
											<button
												type="button"
												className="btn btn-primary w-100 mt-2"
												onClick={() => setPassengerDropdownOpen(false)}
											>
												Done
											</button>
										</div>
									)}
								</div>
							</div>
							<div className="flex-grow-1 border rounded-3 p-2">
								<p className="text-start mb-1 fw-semibold">Class</p>
								<select
									className="form-select"
									id="travelClass"
									name="travelClass"
									required
									value={formData.travelClass}
									onChange={handleChange}
									disabled={isReadOnly}
								>
									<option value="1">Economy</option>
									<option value="2">Business</option>
								</select>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<div className="col-md-1 col-12 d-flex justify-content-center align-items-center">
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