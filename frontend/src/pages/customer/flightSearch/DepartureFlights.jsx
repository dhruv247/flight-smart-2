import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFlightContext } from '../../../hooks/useFlightContext';
import FlightCard from './FlightCard';
import Navbar from '../../../components/navbars/HomeNavbar';
import FlightSearchForm from './FlightSearchForm';
import FlightSorting from './FlightSorting';
import { showErrorToast } from '../../../utils/toast';
import Loading from '../../../components/Loading';

const DepartureFlights = () => {
	// For the list of searched flights
	const [responseMessage, setResponseMessage] = useState(null);
	const [departureFlightsList, setDepartureFlightsList] = useState([]);
	const { flightSearchData, setFlightSearchData } = useFlightContext();
	const [isLoading, setIsLoading] = useState(true);

	/**
	 * Load the flights when the page loades
	 */
	useEffect(() => {
		if (flightSearchData) {
			handleSearch(flightSearchData);
		}
	}, []);

	/**
	 * Handles the flight search functionality on the departureFlight page
	 * @param {*} formData
	 * 1. update the flightSearchDetails variable in the context
	 * 2. send an api request to the backend for getting the list of flights
	 * 3. Set the list of returned flights to
	 */
	const handleSearch = async (formData) => {
		try {
			setIsLoading(true);

			// Ensure proper date formatting
			const formatDate = (date) => {
				if (!date) return null;

				// If already a string in YYYY-MM-DD format, use it directly
				if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
					return date;
				}

				// Otherwise convert Date object to YYYY-MM-DD string
				const dateObj = new Date(date);
				const year = dateObj.getFullYear();
				const month = String(dateObj.getMonth() + 1).padStart(2, '0');
				const day = String(dateObj.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			};

			const updatedFormData = {
				...formData,
				// If it's a round trip but no return date is set,
				// default it to a date one day after departure (to prevent errors)
				returnDate:
					formData.tripType === 'roundTrip' && !formData.returnDate
						? getDefaultReturnDate(formData.departureDate)
						: formData.returnDate,
			};

			setFlightSearchData(updatedFormData);

			const response = await axios.post(
				'http://localhost:8000/api/flights/search-flights',
				{
					flightFrom: formData.flightFrom,
					flightTo: formData.flightTo,
					departureDate: formatDate(formData.departureDate),
					returnDate:
						formData.tripType === 'roundTrip'
							? formatDate(formData.returnDate)
							: null,
					travelClass: formData.travelClass,
					passengers: formData.passengers,
				},
				{ withCredentials: true }
			);
			setResponseMessage(response.data.message);
			setDepartureFlightsList(response.data.departureFlights);
			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			console.error('Error searching flights:', error);

			if (error.response) {
				const { message, details } = error.response.data;

				// Handle specific error cases
				if (error.response.status === 400) {
					if (message === 'All fields are required') {
						showErrorToast('Please fill in all required fields');
					} else if (message === 'Cannot search for flights in the past') {
						showErrorToast('Please select a future date for your flight');
					} else if (
						message === 'Cannot search for return flights in the past'
					) {
						showErrorToast(
							'Please select a future date for your return flight'
						);
					} else if (
						message === 'Return date cannot be before departure date'
					) {
						showErrorToast('Return date must be after departure date');
					} else if (message === 'Passenger count must be between 1 and 5') {
						showErrorToast('Please select between 1 and 5 passengers');
					} else if (
						message === 'Departure airport not found' ||
						message === 'Arrival airport not found'
					) {
						showErrorToast('Please select valid airports from the list');
					} else if (
						message === 'Departure and arrival airports must be different'
					) {
						showErrorToast(
							'Please select different airports for departure and arrival'
						);
					} else {
						showErrorToast(message);
					}
				} else {
					showErrorToast('An error occurred while searching for flights');
				}
			} else {
				showErrorToast('Network error. Please try again later');
			}
		}
	};

	/**
	 * // Helper function to get a default return date (1 day after departure)
	 * @param {*} departureDate
	 * @returns
	 */
	const getDefaultReturnDate = (departureDate) => {
		if (!departureDate) {
			return '';
		}
		const date = new Date(departureDate);
		date.setDate(date.getDate() + 1);
		return date.toISOString().split('T')[0];
	};

	/**
	 * Resets the list of departure flights with a sorted version
	 * @param {*} value
	 * 1. The current implementation only uses economy price because business is just 2.5 times economy
	 * 2. Add a separate sort for considering business class in the future
	 */
	const handleSort = (value) => {
		setDepartureFlightsList((prevFlights) => {
			const sortedFlights = [...prevFlights];
			if (value === 'price') {
				sortedFlights.sort(
					(a, b) => a.economyCurrentPrice - b.economyCurrentPrice
				);
			} else if (value === 'duration') {
				sortedFlights.sort((a, b) => a.duration - b.duration);
			}
			return sortedFlights;
		});
	};

	return (
		<div className="bg-light vh-100 text-center">
			<Navbar />
			<FlightSearchForm
				onSubmit={handleSearch}
				initialValues={flightSearchData}
				initialTripType={flightSearchData.tripType}
			/>
			{/* Display Flight Section */}
			<div
				id="displayFlightsSection"
				className="container d-flex flex-column mt-5"
			>
				<FlightSorting onSort={handleSort} />
				{isLoading ? (
					<Loading />
				) : responseMessage === 'No departure flights available for this round trip' ? (
					<div className="alert alert-info my-4" role="alert">
						No departure flights available for this round trip. Please try different
						departure dates or destinations.
					</div>
				) : responseMessage === 'No return flights available for this route' ? (
					<div className="alert alert-info my-4" role="alert">
						No return flights available for this route. Please try different
						return dates or destinations.
					</div>
				) : departureFlightsList.length === 0 ? (
					<div className="alert alert-info my-4" role="alert">
						No departure flights found for this route. Please try different
						departure dates or destinations.
					</div>
				) : (
					<div id="sampleFlights">
						<div className="row border border-subtle rounded m-0 mb-3 py-2 align-items-center bg-white fw-bold">
							<div className="col-12 col-md-1">
								<p className="mb-0">Flight No</p>
							</div>
							<div className="col-12 col-md-1">
								<p className="mb-0">Airline</p>
							</div>
							<div className="col-12 col-md-1">
								<p className="mb-0">Aircraft</p>
							</div>
							<div className="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
								<div className="align-items-center">
									<p className="mb-0">From</p>
								</div>
								<p className="mb-0"></p>
								<div className="align-items-center">
									<p className="mb-0">To</p>
								</div>
							</div>
							<div className="col-12 col-md-2">
								<p className="mb-0">Duration</p>
							</div>
							<div className="col-12 col-md-2">
								<p className="mb-0">Price</p>
							</div>
						</div>
						{departureFlightsList.map((flight, index) => (
							<FlightCard
								key={index}
								flight={flight}
								travelClass={flightSearchData.travelClass}
								passengers={flightSearchData.passengers}
								tripType={flightSearchData.tripType}
								isReturnFlight={false}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DepartureFlights;
