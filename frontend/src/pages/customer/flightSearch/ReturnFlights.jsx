import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFlightContext } from '../../../context/FlightContext';
import FlightCard from './FlightCard';
import Navbar from '../../../components/navbars/HomeNavbar';
import FlightSorting from './FlightSorting';
import { showErrorToast } from '../../../utils/toast';

const ReturnFlights = () => {
	// For the list of searched flights
	const [returnFlightsList, setReturnFlightsList] = useState([]);
	const { flightSearchData } = useFlightContext();
	const [isLoading, setIsLoading] = useState(true);

	// Automatically search for return flights on component mount
	useEffect(() => {
		if (flightSearchData.returnDate) {
			searchReturnFlights();
		}
	}, []);

	const searchReturnFlights = async () => {
		try {
			setIsLoading(true);
			const response = await axios.post(
				'http://localhost:8000/api/flights/search-flights',
				{
					flightFrom: flightSearchData.flightTo,
					flightTo: flightSearchData.flightFrom,
					departureDate: flightSearchData.returnDate,
					returnDate: null,
					travelClass: flightSearchData.travelClass,
					passengers: flightSearchData.passengers,
				}
			);
			setReturnFlightsList(response.data.departureFlights);
			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);
			console.error('Error searching flights:', error);

			if (error.response) {
				const { message } = error.response.data;

				// Handle specific error cases
				if (error.response.status === 400) {
					if (message === 'All fields are required') {
						showErrorToast('Please fill in all required fields');
					} else if (message === 'Cannot search for flights in the past') {
						showErrorToast(
							'Please select a future date for your return flight'
						);
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
					showErrorToast(
						'An error occurred while searching for return flights'
					);
				}
			} else {
				showErrorToast('Network error. Please try again later');
			}
		}
	};

	const handleSort = (value) => {
		setReturnFlightsList((prevFlights) => {
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
			<div className="my-4">
				<h3>Select Your Return Flight</h3>
				<p>
					Your departure flight has been selected. Now choose your return
					flight.
				</p>
			</div>

			{/* Display Flight Section */}
			<div
				id="displayFlightsSection"
				className="container d-flex flex-column mt-5"
			>
				<FlightSorting onSort={handleSort} />

				{isLoading ? (
					<div className="text-center my-5">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<p className="mt-2">Searching for return flights...</p>
					</div>
				) : returnFlightsList.length === 0 ? (
					<div className="alert alert-info my-4" role="alert">
						No return flights found for this route on the selected date.
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
						{returnFlightsList.map((flight, index) => (
							<FlightCard
								key={index}
								flight={flight}
								travelClass={flightSearchData.travelClass}
								passengers={flightSearchData.passengers}
								tripType="roundTrip"
								isReturnFlight={true}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ReturnFlights;
