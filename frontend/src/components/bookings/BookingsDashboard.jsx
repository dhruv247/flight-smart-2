import React, { useState, useEffect } from 'react';
import BookingCard from './BookingCard';
import axios from 'axios';
import Loading from '../Loading';
import { useAirports } from '../../hooks/useAirports';
import Pagination from '../Pagination';

const BookingsDashboard = ({ type }) => {
	const [bookingsList, setBookingsList] = useState([]);
	const { airports, isLoading: airportsLoading } = useAirports();
	const [searchParams, setSearchParams] = useState({
		bookingId: '',
		departureAirportName: '',
		arrivalAirportName: '',
		roundTrip: null,
		confirmed: null,
		seatType: '',
		status: null,
		page: 0,
		size: 10,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		const getBookingsFromDB = async () => {
			try {
				const queryParams = new URLSearchParams();
				Object.entries(searchParams).forEach(([key, value]) => {
					if (value !== '' && value !== false && value !== null) {
						queryParams.append(key, value);
					}
				});

				const bookings = await axios.get(
					`http://localhost:8000/api/bookings/search-bookings-for-${type}?${queryParams.toString()}`,
					{
						withCredentials: true,
					}
				);

				setBookingsList(bookings.data.booking);
				// Assuming the API returns total count in the response
				// If not, you'll need to modify the backend to return total count
				setTotalPages(Math.ceil(bookings.data.total / searchParams.size));
				setLoading(false);
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		getBookingsFromDB();
	}, [searchParams]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		const newValue = type === 'checkbox' ? checked : value;
		// Reset page to 0 when search parameters change
		setSearchParams({ ...searchParams, [name]: newValue, page: 0 });
	};

	const handlePageChange = (newPage) => {
		setSearchParams({ ...searchParams, page: newPage });
	};

	if (loading) return <Loading />;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="">
			<div className="text-center border rounded p-2 mb-5">
				<h3 className="my-3">Search Bookings</h3>
				<form action="" className="">
					<div className="row">
						<div className="col-md-4 col-12">
							<input
								className="form-control"
								type="text"
								name="bookingId"
								placeholder="Booking ID"
								onChange={handleChange}
							/>
						</div>
						<div className="col-md-4 col-12">
							<input
								className="form-control"
								type="search"
								name="departureAirportName"
								placeholder="Departure Airport Name"
								list="airportList"
								onChange={handleChange}
							/>
						</div>
						<div className="col-md-4 col-12">
							<input
								className="form-control"
								type="search"
								name="arrivalAirportName"
								placeholder="Arrival Airport Name"
								list="airportList"
								onChange={handleChange}
							/>
						</div>
						<datalist id="airportList">
							{!airportsLoading &&
								airports.map((airport, index) => (
									<option key={index} value={airport.name}>
										{airport.name} ({airport.code}) - {airport.city}
									</option>
								))}
						</datalist>
					</div>
					<div className="row mt-3">
						{/* <div className="form-check col-md-4 col-12">
							<input
								className="form-check-input"
								type="checkbox"
								id="roundTripCheckbox"
								name="roundTrip"
								onChange={handleChange}
							/>
							<label className="form-check-label" htmlFor="roundTripCheckbox">
								Round Trip
							</label>
						</div> */}
						<div className="col-md-3 col-6">
							<select
								name="roundTrip"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Trip Type
								</option>
								<option value="false">One Way</option>
								<option value="true">Round</option>
							</select>
						</div>
						<div className="col-md-3 col-6">
							<select
								name="seatType"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Seat Type
								</option>
								<option value="economy">Economy</option>
								<option value="business">Business</option>
							</select>
						</div>
						<div className="col-md-3 col-6">
							<select
								name="status"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Trip Date
								</option>
								<option value="future">Future</option>
								<option value="past">Past</option>
							</select>
						</div>
						<div className="col-md-3 col-6">
							<select
								name="confirmed"
								className="form-select"
								onChange={handleChange}
							>
								<option value="" selected>
									Booking Status
								</option>
								<option value="true">Active</option>
								<option value="false">Cancelled</option>
							</select>
						</div>
					</div>
				</form>
			</div>
			<div className="row border border-subtle rounded m-0 mb-1 py-2 align-items-center bg-white fw-bold">
				<div className="col-12 col-md-3 d-flex justify-content-center align-items-center">
					<p className="mb-0">Booking ID</p>
				</div>
				<div className="col-12 col-md-1 d-flex justify-content-center align-items-center">
					<p className="mb-0">Trip Type</p>
				</div>
				<div className="col-12 col-md-4 d-flex justify-content-between align-items-center">
					<p className="mb-0">Flight From</p>
					<p className="mb-0">Flight To</p>
				</div>
				{/* <div className="col-12 col-md-2 d-flex justify-content-center align-items-center">
					<p className="mb-0">Flight To</p>
				</div> */}
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
