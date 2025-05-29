import React, { useState, useEffect } from 'react';
import BookingCard from './BookingCard';
import axios from 'axios';
import Loading from '../Loading';
import { useAirports } from '../../hooks/useAirports';
import Pagination from '../Pagination';
import Select from 'react-select';
import { bookingService } from '../../services/booking.service';

/**
 * Bookings Dashboard
 */
const BookingsDashboard = ({ type }) => {
	const [bookingsList, setBookingsList] = useState([]);
	const { airports, isLoading: airportsLoading } = useAirports();
	const [searchParams, setSearchParams] = useState({
		bookingId: '',
		pnr: '',
		flightFrom: null,
		flightTo: null,
		roundTrip: null,
		confirmed: null,
		seatType: '',
		status: null,
		page: 0,
		size: 5,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalPages, setTotalPages] = useState(0);

	// Transform cities data for react-select
	// const cityOptions =
	// 	airports?.map((airport) => ({
	// 		value: airport.city,
	// 		label: airport.city,
	// 	})) || [];

	// // Transform cities data for react-select and remove duplicates
	// const cityOptions = React.useMemo(() => {
	// 	const uniqueCities = [...new Set(airports.map((airport) => airport.city))];
	// 	return uniqueCities.map((city) => ({
	// 		value: city,
	// 		label: city,
	// 	}));
	// }, [airports]);

	/**
	 * Get bookings from the database
	 */
	useEffect(() => {
		const getBookingsFromDB = async () => {
			try {
				const queryParams = new URLSearchParams();

				// add search params to query params
				Object.entries(searchParams).forEach(([key, value]) => {
					if (
						value !== '' &&
						value !== false &&
						value !== null &&
						!(key === 'flightFrom' && value === null) &&
						!(key === 'flightTo' && value === null)
					) {
						if (key === 'flightFrom' || key === 'flightTo') {
							queryParams.append(key, value.value);
						} else {
							queryParams.append(key, value);
						}
					}
				});


				let bookings;

				if (type === 'customer') {
					bookings = await bookingService.searchBookingsForCustomer(queryParams);
				} else {
					bookings = await bookingService.searchBookingsForAirlines(queryParams);
				}				

				setBookingsList(bookings.data.booking);

				// set total pages
				setTotalPages(Math.ceil(bookings.data.total / searchParams.size));
				setLoading(false);
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		getBookingsFromDB();
	}, [searchParams]);

	/**
	 * Handle change in the search params
	 * @param {Object} e - The event object
	 */
	const handleChange = (e) => {
		const { name, value } = e.target;
		setSearchParams({ ...searchParams, [name]: value, page: 0 });
	};

	// /**
	//  * Handle change in the select options
	//  * @param {Object} selectedOption - The selected option
	//  * @param {Object} name - The name of the select option
	//  */
	// const handleSelectChange = (selectedOption, { name }) => {
	// 	setSearchParams((prev) => ({
	// 		...prev,
	// 		[name]: selectedOption,
	// 		page: 0,
	// 	}));
	// };

	/**
	 * Handle change in the page number
	 * @param {number} newPage - The new page number
	 */
	const handlePageChange = (newPage) => {
		setSearchParams({ ...searchParams, page: newPage });
	};

	if (loading) return <Loading />;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="">
			<div className="text-center mb-5">
				{type === 'customer' && (
					<h1 className="my-3">My Bookings</h1>
				)}
				{type === 'airline' && (
					<h1 className="my-3">Search Bookings</h1>
				)}
				<form action="" className="border rounded p-2">
					<div className="row">
						<div className="col-md-6 col-12 my-2">
							<p className="text-start fw-bold">PNR</p>
							<input
								className="form-control"
								type="text"
								name="pnr"
								placeholder="Enter PNR"
								onChange={handleChange}
							/>
						</div>
						{/* <div className="col-md-4 col-12 my-2">
							<p className="text-start fw-bold">Flight From</p>
							<Select
								name="flightFrom"
								value={searchParams.flightFrom}
								onChange={(option) =>
									handleSelectChange(option, { name: 'flightFrom' })
								}
								options={cityOptions}
								placeholder="Select Flight From"
								isSearchable
								isClearable
								className="flex-grow-1 text-start"
								// styles={{
								// 	control: (base) => ({
								// 		...base,
								// 		minHeight: '39px',
								// 		height: '39px',
								// 	}),
								// }}
							/>
						</div> */}
						{/* <div className="col-md-4 col-12 my-2">
							<p className="text-start fw-bold">Flight To</p>
							<Select
								name="flightTo"
								value={searchParams.flightTo}
								onChange={(option) =>
									handleSelectChange(option, { name: 'flightTo' })
								}
								options={cityOptions}
								placeholder="Select Flight To"
								isSearchable
								isClearable
								className="flex-grow-1 text-start"
								// styles={{
								// 	control: (base) => ({
								// 		...base,
								// 		minHeight: '39px',
								// 		height: '39px',
								// 	}),
								// }}
							/>
						</div> */}
						<div className="col-md-6 col-12 my-2">
							<p className="text-start fw-bold">Trip Status</p>
							<select
								name="status"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Select Trip Status
								</option>
								<option value="future">Upcoming</option>
								<option value="past">Past</option>
							</select>
						</div>
					</div>
					{/* <div className="row mt-3">
						<div className="col-md-3 col-6">
							<p className="text-start fw-bold">Trip Type</p>
							<select
								name="roundTrip"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Select Trip Type
								</option>
								<option value="false">One Way</option>
								<option value="true">Round</option>
							</select>
						</div>
						<div className="col-md-3 col-6">
							<p className="text-start fw-bold">Seat Type</p>
							<select
								name="seatType"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Select Seat Type
								</option>
								<option value="economy">Economy</option>
								<option value="business">Business</option>
							</select>
						</div>
						<div className="col-md-3 col-6">
							<p className="text-start fw-bold">Trip Date</p>
							<select
								name="status"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Select Trip Date
								</option>
								<option value="future">Upcoming</option>
								<option value="past">Past</option>
							</select>
						</div>
						<div className="col-md-3 col-6">
							<p className="text-start fw-bold">Booking Status</p>
							<select
								name="confirmed"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Select Booking Status
								</option>
								<option value="true">Confirmed</option>
								<option value="false">Cancelled</option>
							</select>
						</div>
					</div> */}
				</form>
			</div>
			<div className="row border border-subtle rounded m-0 mb-1 py-2 align-items-center bg-light fw-bold">
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<p className="mb-0">PNR</p>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<p className="mb-0">Trip Type</p>
				</div>
				<div className="col-12 col-md-4 d-flex justify-content-between align-items-center">
					<p className="mb-0">Departure</p>
					<p className="mb-0">Arrival</p>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<p className="mb-0">Travel Class</p>
				</div>
				<div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<p className="mb-0">No. of Tickets</p>
				</div>
			</div>
			{bookingsList.length === 0 ? (
				<div className="text-center my-5 p-4">
					<i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
					<p className="text-muted fs-5">No bookings found</p>
					<p className="text-muted small">Try adjusting your search filters</p>
				</div>
			) : (
				<>
					{bookingsList.map((booking) => {
						return (
							<BookingCard key={booking._id} booking={booking} type={type} />
						);
					})}

					<Pagination
						searchParams={searchParams}
						handlePageChange={handlePageChange}
						totalPages={totalPages}
					/>
				</>
			)}
		</div>
	);
};

export default BookingsDashboard;
