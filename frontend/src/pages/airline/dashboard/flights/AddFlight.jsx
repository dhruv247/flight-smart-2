import React, { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '../../../../utils/toast';
import { useAirports } from '../../../../hooks/useAirports';
import useGetUserDetails from '../../../../hooks/useGetUserDetails';
import Loading from '../../../../components/Loading';
import { flightService } from '../../../../services/flight.service';
import { planeService } from '../../../../services/plane.service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setHours, setMinutes, addDays } from 'date-fns';

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
		departureDateTime: '',
		arrivalAirportName: '',
		arrivalDateTime: '',
		economyBasePrice: '',
		businessBasePrice: '',
	});

	// New state for separate date and time
	const [departureDate, setDepartureDate] = useState(null);
	const [departureTime, setDepartureTime] = useState('');
	const [arrivalDate, setArrivalDate] = useState(null);
	const [arrivalTime, setArrivalTime] = useState('');

	const airportOptions = airports?.map((airport) => ({
		value: airport.airportName,
		label: airport.airportName + ' (' + airport.code + ') - ' + airport.city,
	}));

	const now = new Date();
	const tomorrow = addDays(now, 1);

	// Combine date and time into Date object
	const combineDateAndTime = (date, time) => {
		if (!date || !time) return '';
		const [hours, minutes] = time.split(':');
		const combined = setHours(setMinutes(new Date(date), minutes), hours);
		return combined;
	};

	// Update flightDetails when date or time changes
	useEffect(() => {
		const depDateTime = combineDateAndTime(departureDate, departureTime);
		setFlightDetails((prev) => ({
			...prev,
			departureDateTime: depDateTime,
		}));
	}, [departureDate, departureTime]);

	useEffect(() => {
		const arrDateTime = combineDateAndTime(arrivalDate, arrivalTime);
		setFlightDetails((prev) => ({
			...prev,
			arrivalDateTime: arrDateTime,
		}));
	}, [arrivalDate, arrivalTime]);

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

	const handleAddFlight = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);

		try {
			// Add airline initials to flight number
			const airlinePrefix = airlineDetails.username
				.substring(0, 2)
				.toUpperCase();
			const fullFlightNo = `${airlinePrefix}${flightDetails.flightNo}`;

			const response = await flightService.createFlight({
				...flightDetails,
				flightNo: fullFlightNo,
			});

			if (response.status === 201) {
				showSuccessToast('Flight added successfully!');
				// Reset form fields
				setFlightDetails({
					flightNo: '',
					planeName: '',
					departureAirportName: '',
					departureDateTime: '',
					arrivalAirportName: '',
					arrivalDateTime: '',
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
				<form onSubmit={handleAddFlight} className="border rounded p-3">
					<h3 className="text-center mb-3">Flight Details</h3>
					<div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-3">
						<div className="border rounded p-2">
							<p className="text-start">Flight Number</p>
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
						<div className="border rounded p-2">
							<p className="text-start">Plane</p>

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
					<h3 className="text-center mb-3">Departure Details</h3>
					<div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-3">
						<div className="border rounded p-2">
							<p className="text-start">Departure Airport</p>

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
						<div className="border rounded p-2">
							<p className="text-start">Departure Date</p>

							<DatePicker
								selected={departureDate}
								onChange={setDepartureDate}
								minDate={tomorrow}
								dateFormat="yyyy-MM-dd"
								placeholderText="Select Departure Date"
								className="form-control"
								required
							/>
						</div>
						<div className="border rounded p-2">
							<p className="text-start">Departure Time</p>

							<input
								type="time"
								className="form-control"
								value={departureTime}
								onChange={(e) => setDepartureTime(e.target.value)}
								required
							/>
						</div>
					</div>
					<h3 className="text-center mb-3">Arrival Details</h3>
					<div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-3">
						<div className="border rounded p-2">
							<p className="text-start">Arrival Airport</p>

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
						<div className="border rounded p-2">
							<p className="text-start">Arrival Date</p>

							<DatePicker
								selected={arrivalDate}
								onChange={setArrivalDate}
								minDate={departureDate || tomorrow}
								dateFormat="yyyy-MM-dd"
								placeholderText="Select Arrival Date"
								className="form-control"
								required
							/>
						</div>
						<div className="border rounded p-2">
							<p className="text-start">Arrival Time</p>

							<input
								type="time"
								className="form-control"
								value={arrivalTime}
								onChange={(e) => setArrivalTime(e.target.value)}
								required
							/>
						</div>
					</div>
					<h3 className="text-center mb-3">Price Details</h3>
					<div className="d-flex flex-column flex-md-row justify-content-center gap-3 mb-3">
						<div className="border rounded p-2">
							<p className="text-start">Economy Base Price</p>

							<input
								type="number"
								className="form-control"
								name="economyBasePrice"
								placeholder="Enter Economy Base Price"
								value={flightDetails.economyBasePrice}
								onChange={handleFlightDetailsChange}
								required
								min={0}
								max={10000}
							/>
						</div>
						<div className="border rounded p-2">
							<p className="text-start">Business Base Price</p>

							<input
								type="number"
								className="form-control"
								name="businessBasePrice"
								placeholder="Enter Business Base Price"
								value={flightDetails.businessBasePrice}
								onChange={handleFlightDetailsChange}
								required
								min={0}
								max={30000}
							/>
						</div>
					</div>
					<div>
						<button type="submit" className="btn btn-primary px-5 py-3">
							Add Flight
						</button>
					</div>
				</form>
			)}
		</div>
	);
};

export default AddFlight;
