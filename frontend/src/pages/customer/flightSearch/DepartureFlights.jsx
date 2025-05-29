import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useFlightContext } from '../../../hooks/useFlightContext';
import FlightCard from './FlightCard';
import Navbar from '../../../components/navbars/HomeNavbar';
import FlightSearchForm from './FlightSearchForm';
import FlightSorting from './FlightSorting';
import { showErrorToast } from '../../../utils/toast';
import Loading from '../../../components/Loading';
import { Link } from 'react-router-dom';
import Pagination from '../../../components/Pagination';
import { flightService } from '../../../services/flight.service';

/**
 * Departure Flights - used to search for departure flights
 */
const DepartureFlights = () => {
	// For the list of searched flights
	const [responseMessage, setResponseMessage] = useState(null);
	const [departureFlightsList, setDepartureFlightsList] = useState([]);
	const { flightSearchData, setFlightSearchData } = useFlightContext();
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [sortOption, setSortOption] = useState('bestFlight');
	const pageSize = 10;

	/**
	 * Load the flights (hits search) when the page loades
	 */
	useEffect(() => {
		if (flightSearchData) {
			handleSearch(flightSearchData);
		}
	}, [currentPage]);

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
			setSortOption('bestFlight');
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

			// const queryString = new URLSearchParams({
			// 		flightFrom: formData.flightFrom,
			// 		flightTo: formData.flightTo,
			// 		departureDate: formatDate(formData.departureDate),
			// 		returnDate:
			// 			formData.tripType === 'roundTrip'
			// 				? formatDate(formData.returnDate)
			// 				: null,
			// 		travelClass: formData.travelClass,
			// 		passengers: formData.adultPassengers + formData.childPassengers + formData.infantPassengers,
			// 		page: currentPage,
			// 		size: pageSize,
			// 	}).toString()

			const params = {
  				flightFrom: formData.flightFrom,
  				flightTo: formData.flightTo,
  				departureDate: formatDate(formData.departureDate),
  				travelClass: formData.travelClass,
  				passengers: formData.adultPassengers + formData.childPassengers + formData.infantPassengers,
  				page: currentPage,
  				size: pageSize,
			};
			
			if (formData.tripType === 'roundTrip' && formData.returnDate) {
  				params.returnDate = formatDate(formData.returnDate);
			}
			
			const queryString = new URLSearchParams(params).toString();
			
			const response = await flightService.searchFlightsForCustomer(queryString);

			// const response = await flightService.searchFlights(
			// 	{
			// 		flightFrom: formData.flightFrom,
			// 		flightTo: formData.flightTo,
			// 		departureDate: formatDate(formData.departureDate),
			// 		returnDate:
			// 			formData.tripType === 'roundTrip'
			// 				? formatDate(formData.returnDate)
			// 				: null,
			// 		travelClass: formData.travelClass,
			// 		passengers: formData.adultPassengers + formData.childPassengers + formData.infantPassengers,
			// 		page: currentPage,
			// 		size: pageSize,
			// 	},
				
			// 	{ withCredentials: true }
			// );
			setResponseMessage(response.data.message);
			setDepartureFlightsList(response.data.departureFlights);
			setTotalPages(response.data.totalPages);
			setIsLoading(false);
		} catch (error) {
			setIsLoading(false);

			showErrorToast(error.response.data.message);

			// console.error('Error searching flights:', error);

			// if (error.response) {
			// 	const { message, details } = error.response.data;

			// 	// Handle specific error cases
			// 	if (error.response.status === 400) {
			// 		if (message === 'All fields are required') {
			// 			showErrorToast('Please fill in all required fields');
			// 		} else if (message === 'Cannot search for flights in the past') {
			// 			showErrorToast('Please select a future date for your flight');
			// 		} else if (
			// 			message === 'Cannot search for return flights in the past'
			// 		) {
			// 			showErrorToast(
			// 				'Please select a future date for your return flight'
			// 			);
			// 		} else if (
			// 			message === 'Return date cannot be before departure date'
			// 		) {
			// 			showErrorToast('Return date must be after departure date');
			// 		} else if (message === 'Passenger count must be between 1 and 5') {
			// 			showErrorToast('Please select between 1 and 5 passengers');
			// 		} else if (
			// 			message === 'Departure airport not found' ||
			// 			message === 'Arrival airport not found'
			// 		) {
			// 			showErrorToast('Please select valid airports from the list');
			// 		} else if (
			// 			message === 'Departure and arrival airports must be different'
			// 		) {
			// 			showErrorToast(
			// 				'Please select different airports for departure and arrival'
			// 			);
			// 		} else {
			// 			showErrorToast(message);
			// 		}
			// 	} else {
			// 		showErrorToast('An error occurred while searching for flights');
			// 	}
			// } else {
			// 	showErrorToast('Network error. Please try again later');
			// }
		}
	};

	/**
	 * // Helper function to get a default return date (1 day after departure) for redundancy
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
		setSortOption(value);
		setDepartureFlightsList((prevFlights) => {
			const sortedFlights = [...prevFlights];
			if (value === 'bestFlight' && flightSearchData.travelClass === '1') {
				sortedFlights.sort(
					(a, b) =>
						a.economyCurrentPrice +
						a.duration -
						(b.economyCurrentPrice + b.duration)
				);
			} else if (
				value === 'bestFlight' &&
				flightSearchData.travelClass === '2'
			) {
				sortedFlights.sort(
					(a, b) =>
						a.businessCurrentPrice +
						a.duration -
						(b.businessCurrentPrice + b.duration)
				);
			} else if (value === 'price' && flightSearchData.travelClass === '1') {
				sortedFlights.sort(
					(a, b) => a.economyCurrentPrice - b.economyCurrentPrice
				);
			} else if (value === 'price' && flightSearchData.travelClass === '2') {
				sortedFlights.sort(
					(a, b) => a.businessCurrentPrice - b.businessCurrentPrice
				);
			} else if (value === 'duration') {
				sortedFlights.sort((a, b) => a.duration - b.duration);
			}
			return sortedFlights;
		});
	};

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage);
	};

	return (
		<div className="bg-light min-vh-100 text-center">
			<Navbar />
			<div className="d-flex justify-content-start container mt-5">
				<Link to="/">
					<button className="btn btn-primary px-3 py-2">
						<i className="bi bi-arrow-left"></i> Go Back
					</button>
				</Link>
			</div>
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
				<FlightSorting onSort={handleSort} selectedOption={sortOption} />
				{isLoading ? (
					<Loading />
				) : responseMessage ===
				  'No departure flights available for this round trip' ? (
					<div className="alert alert-info my-4" role="alert">
						No departure flights available for this round trip. Please try
						different departure dates or destinations.
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
					<>
						<div id="sampleFlights" className=''>
							<div className="row border border-subtle rounded m-0 mb-3 py-2 align-items-center bg-white fw-bold">
								<div className="col-12 col-md-1">
									<p className="mb-0">Flight No</p>
								</div>
								<div className="col-12 col-md-1">
									<p className="mb-0">Airline</p>
								</div>
								<div className="col-12 col-md-1">
									<p className="mb-0">Plane</p>
								</div>
								<div className="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
									<div className="align-items-center">
										<p className="mb-0">Departure</p>
									</div>
									<p className="mb-0"></p>
									<div className="align-items-center">
										<p className="mb-0">Arrival</p>
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
									passengers={flightSearchData.adultPassengers + flightSearchData.childPassengers + flightSearchData.infantPassengers}
									tripType={flightSearchData.tripType}
									isReturnFlight={false}
								/>
							))}
						</div>
						<Pagination
							searchParams={{ page: currentPage }}
							handlePageChange={handlePageChange}
							totalPages={totalPages}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default DepartureFlights;
