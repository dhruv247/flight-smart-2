import React, { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';
import { useAirports } from '../../../../hooks/useAirports';
import useGetUserDetails from '../../../../hooks/useGetUserDetails';
import Loading from '../../../../components/Loading';
import { flightService } from '../../../../services/flight.service';
import { planeService } from '../../../../services/plane.service';

const AddFlight = () => {
	const { airports, isLoading: isLoadingAirports } = useAirports();
	const { user: airlineDetails, isLoading: isLoadingUser } =
		useGetUserDetails();
	const [planes, setPlanes] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [flightDetails, setFlightDetails] = useState({
		flightNo: '',
		planeName: '',
		departureAirportName: '',
		departureDate: '',
		departureTime: '',
		arrivalAirportName: '',
		arrivalDate: '',
		arrivalTime: '',
		economyBasePrice: '',
		businessBasePrice: '',
	});

	useEffect(() => {
		const fetchPlanes = async () => {
			try {
				const response = await planeService.getAllPlanes();
				setPlanes(response.planes);
			} catch (error) {
				console.error('Error fetching planes:', error);
				showErrorToast('Failed to fetch planes');
			}
		};

		fetchPlanes();
	}, []);

	const handleFlightDetailsChange = (e) => {
		const { name, value } = e.target;
		setFlightDetails((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleFlightNumberChange = (e) => {
		const { value } = e.target;
		// Only allow digits and limit to 4 characters
		const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
		setFlightDetails((prevData) => ({
			...prevData,
			flightNo: digitsOnly,
		}));
	};

	const formatTimeForSubmission = (timeStr) => {
		// Convert from HH:MM to HHMM format
		return timeStr.replace(':', '');
	};

	const handleAddFlight = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			// Add airline initials to flight number
			const airlinePrefix = airlineDetails.username
				.substring(0, 2)
				.toUpperCase();
			const fullFlightNo = `${airlinePrefix}${flightDetails.flightNo}`;

			// Format times for submission
			const formattedDepartureTime = formatTimeForSubmission(
				flightDetails.departureTime
			);

			const formattedArrivalTime = formatTimeForSubmission(
				flightDetails.arrivalTime
			);

			const response = await flightService.createFlight({
				...flightDetails,
				flightNo: fullFlightNo,
				departureTime: formattedDepartureTime,
				arrivalTime: formattedArrivalTime,
			});

			if (response.status === 201) {
				showSuccessToast('Flight added successfully!');
				// Reset form fields
				setFlightDetails({
					flightNo: '',
					planeName: '',
					departureAirportName: '',
					departureDate: '',
					departureTime: '',
					arrivalAirportName: '',
					arrivalDate: '',
					arrivalTime: '',
					economyBasePrice: '',
					businessBasePrice: '',
				});
			} else {
				showErrorToast(response.data.message);
			}
		} catch (error) {
			console.log(error.message);
			showErrorToast(error.response?.data?.message || error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mt-5">
			{isSubmitting && <Loading />}
			{!isSubmitting && (
				<form onSubmit={handleAddFlight}>
					<div className="row">
						<div className="col-md-4"></div>
						<div className="col-md-4 col-12">
							<div className="mb-4">
								<div className="input-group">
									<div className="input-group">
										<span className="input-group-text">
											{airlineDetails?.username.substring(0, 2).toUpperCase()}
										</span>
										<input
											type="text"
											className="form-control"
											name="flightNo"
											placeholder="Enter 4 digit flight number"
											value={flightDetails.flightNo}
											onChange={handleFlightNumberChange}
											maxLength={4}
										/>
									</div>
								</div>
							</div>
							<div className="mb-4">
								<div className="input-group">
									<select
										className="form-control"
										name="planeName"
										value={flightDetails.planeName}
										onChange={handleFlightDetailsChange}
										required
									>
										<option value="">Select a Plane</option>
										{planes.map((plane) => (
											<option key={plane._id} value={plane.planeName}>
												{plane.planeName} (Economy: {plane.economyCapacity},
												Business: {plane.businessCapacity})
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="mb-4">
								<div className="input-group">
									<select
										className="form-control"
										name="departureAirportName"
										value={flightDetails.departureAirportName}
										onChange={handleFlightDetailsChange}
										required
									>
										<option value="">Select Departure Airport</option>
										{!isLoadingAirports &&
											airports.map((airport) => (
												<option key={airport.code} value={airport.name}>
													{airport.name} ({airport.code}) - {airport.city}
												</option>
											))}
									</select>
								</div>
							</div>
							<div className="mb-4">
								<label className="form-label d-block">Departure Date</label>
								<div className="input-group">
									<input
										type="date"
										className="form-control"
										name="departureDate"
										value={flightDetails.departureDate}
										onChange={handleFlightDetailsChange}
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<label className="form-label d-block">Departure Time</label>
								<div className="input-group">
									<input
										type="time"
										className="form-control"
										name="departureTime"
										value={flightDetails.departureTime}
										onChange={handleFlightDetailsChange}
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<div className="input-group">
									<select
										className="form-control"
										name="arrivalAirportName"
										value={flightDetails.arrivalAirportName}
										onChange={handleFlightDetailsChange}
										required
									>
										<option value="">Select Arrival Airport</option>
										{!isLoadingAirports &&
											airports.map((airport) => (
												<option key={airport.code} value={airport.name}>
													{airport.name} ({airport.code}) - {airport.city}
												</option>
											))}
									</select>
								</div>
							</div>
							<div className="mb-4">
								<label className="form-label d-block">Arrival Date</label>
								<div className="input-group">
									<input
										type="date"
										className="form-control"
										name="arrivalDate"
										value={flightDetails.arrivalDate}
										onChange={handleFlightDetailsChange}
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<label className="form-label d-block">Arrival Time</label>
								<div className="input-group">
									<input
										type="time"
										className="form-control"
										name="arrivalTime"
										value={flightDetails.arrivalTime}
										onChange={handleFlightDetailsChange}
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<div className="input-group">
									<input
										type="number"
										className="form-control"
										name="economyBasePrice"
										placeholder="Enter Economy Base Price"
										value={flightDetails.economyBasePrice}
										onChange={handleFlightDetailsChange}
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<div className="input-group">
									<input
										type="number"
										className="form-control"
										name="businessBasePrice"
										placeholder="Enter Business Base Price"
										value={flightDetails.businessBasePrice}
										onChange={handleFlightDetailsChange}
										required
									/>
								</div>
							</div>
							<div className="mb-4">
								<div>
									<button type="submit" className="btn btn-primary">
										Add Flight
									</button>
								</div>
							</div>
						</div>
						<div className="col-md-4"></div>
					</div>
				</form>
			)}
		</div>
	);
};

export default AddFlight;