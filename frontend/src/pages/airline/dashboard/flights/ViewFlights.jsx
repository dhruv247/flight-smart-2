import React, { useState, useEffect } from 'react';
import Loading from '../../../../components/Loading';
import Pagination from '../../../../components/Pagination';
import FlightCard from './FlightCard';
import { useAirports } from '../../../../hooks/useAirports';
import axios from 'axios';
import DatePicker from 'react-datepicker';

const ViewFlights = () => {
	const [flightsList, setFlightsList] = useState([]);
	const { airports, isLoading: airportsLoading } = useAirports();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalPages, setTotalPages] = useState(0);
	const [searchParams, setSearchParams] = useState({
		flightNo: '',
		departureAirportName: '',
		arrivalAirportName: '',
		departureDate: '',
		page: 0,
		size: 5,
	});

	useEffect(() => {
		const fetchFlights = async () => {
			try {
				const queryParams = new URLSearchParams();

				// add search params to query params
				Object.entries(searchParams).forEach(([key, value]) => {
					if (value !== '' && value !== false && value !== null) {
						queryParams.append(key, value);
					}
				});

				const response = await axios.get(
					`http://localhost:8000/api/flights/search-flights-for-airline?${queryParams.toString()}`,
					{
						withCredentials: true,
					}
				);
				setFlightsList(response.data.flights);
				setTotalPages(Math.ceil(response.data.total / searchParams.size));
				setLoading(false);
			} catch (error) {
				setError(error);
				setLoading(false);
			}
		};
		fetchFlights();
	}, [searchParams]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setSearchParams({ ...searchParams, [name]: value, page: 0 });
	};

	const handlePageChange = (newPage) => {
		setSearchParams({ ...searchParams, page: newPage });
	};

	const handleDateChange = (date, name) => {
		setSearchParams({ ...searchParams, [name]: formatDate(date), page: 0 });
	};

	// Format date to YYYY-MM-DD
	const formatDate = (date) => {
		if (!date) return '';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	if (loading) return <Loading />;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			<div className="text-center border rounded p-2 mb-5">
				<h3 className="my-3">Search Flights</h3>
				<form action="" className="">
					<div className="row">
						<div className="col-md-3 col-12">
							<input
								className="form-control"
								type="text"
								name="flightNo"
								placeholder="Flight No"
								onChange={handleChange}
							/>
						</div>
						<div className="col-md-3 col-12">
							<input
								className="form-control"
								type="search"
								name="departureAirportName"
								placeholder="Departure Airport Name"
								list="airportList"
								onChange={handleChange}
							/>
						</div>
						<div className="col-md-3 col-12">
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

						<div className="col-md-3 col-12">
							<div className="form-control p-0">
								<DatePicker
									selected={searchParams.departureDate}
									onChange={(date) => handleDateChange(date, 'departureDate')}
									className="form-control border-0"
									placeholderText="Departure Date"
									dateFormat="yyyy-MM-dd"
								/>
							</div>
						</div>
					</div>
				</form>
			</div>

			<div className="row border border-subtle rounded m-0 mb-3 py-2 align-items-center bg-light">
				<div className="col-12 col-md-1">
					<p className="fw-bold">Flight No</p>
				</div>
				<div className="col-12 col-md-1">
					<p className="fw-bold">Plane</p>
				</div>
				<div className="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
					<div className="align-items-center">
						<p className="fw-bold">Departure</p>
					</div>
					<p>-</p>
					<div className="align-items-center">
						<p className="fw-bold">Arrival</p>
					</div>
				</div>
				<div className="col-12 col-md-1">
					<p className="fw-bold">Duration</p>
				</div>
				<div className="col-12 col-md-3 d-flex justify-content-around align-items-center">
					<div className="d-flex justify-content-center align-items-center">
						<p className="fw-bold">Base Price</p>
					</div>
					<div className="d-flex justify-content-center align-items-center">
						<p className="fw-bold">Current Price</p>
					</div>
				</div>
				<div className="col-12 col-md-3 d-flex justify-content-around align-items-center">
					<div className="d-flex justify-content-center align-items-center">
						<p className="fw-bold">Capacity</p>
					</div>
					<div className="d-flex justify-content-center align-items-center">
						<p className="fw-bold">Vacant Seats</p>
					</div>
				</div>
			</div>

			{flightsList.map((flight) => (
				<FlightCard key={flight._id} flight={flight} />
			))}

			<Pagination
				searchParams={searchParams}
				handlePageChange={handlePageChange}
				totalPages={totalPages}
			/>
		</div>
	);
};

export default ViewFlights;
