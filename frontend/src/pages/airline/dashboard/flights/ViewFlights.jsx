import React, { useState, useEffect } from 'react';
import Loading from '../../../../components/Loading';
import Pagination from '../../../../components/Pagination';
import FlightCard from './FlightCard';
import { useAirports } from '../../../../hooks/useAirports';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';

const ViewFlights = () => {
	const [flightsList, setFlightsList] = useState([]);
	const { airports, isLoading: airportsLoading } = useAirports();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalPages, setTotalPages] = useState(0);
	const [searchParams, setSearchParams] = useState({
		flightNo: '',
		flightFrom: null,
		flightTo: null,
		departureDate: '',
		page: 0,
		size: 5,
	});

	// Transform cities data for react-select
	const cityOptions =
		airports?.map((airport) => ({
			value: airport.city,
			label: airport.city,
		})) || [];

	useEffect(() => {
		const fetchFlights = async () => {
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

	const handleSelectChange = (selectedOption, { name }) => {
		setSearchParams((prev) => ({
			...prev,
			[name]: selectedOption,
			page: 0,
		}));
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
			<div className="text-center mt-5 mb-5">
				<h1 className="my-3">Search Flights</h1>
				<form action="" className="border rounded p-2">
					<div className="row">
						<div className="col-md-3 col-12 my-2">
							<p className="text-start fw-bold">Flight No</p>
							<input
								className="form-control"
								type="text"
								name="flightNo"
								placeholder="Enter Flight No"
								onChange={handleChange}
							/>
						</div>
						<div className="col-md-3 col-12 my-2">
							{/* <input
								className="form-control"
								type="search"
								name="flightFrom"
								placeholder="Flight From"
								list="airportList"
								onChange={handleChange}
							/> */}
							<p className="text-start fw-bold">Flight From</p>
							<Select
								name="flightFrom"
								value={searchParams.flightFrom}
								onChange={(option) =>
									handleSelectChange(option, { name: 'flightFrom' })
								}
								options={cityOptions}
								placeholder="Enter Flight From"
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
						</div>
						<div className="col-md-3 col-12 my-2">
							{/* <input
								className="form-control"
								type="search"
								name="flightTo"
								placeholder="Flight To"
								list="airportList"
								onChange={handleChange}
							/> */}
							<p className="text-start fw-bold">Flight To</p>
							<Select
								name="flightTo"
								value={searchParams.flightTo}
								onChange={(option) =>
									handleSelectChange(option, { name: 'flightTo' })
								}
								options={cityOptions}
								placeholder="Enter Flight To"
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
						</div>
						{/* <datalist id="airportList">
							{!citiesLoading &&
								cities.map((city, index) => (
									<option key={index} value={city.city}>
										{city.city}
									</option>
								))}
						</datalist> */}

						<div className="col-md-3 col-12 my-2 text-start">
							<p className="text-start fw-bold">Departure Date</p>
							<div>
								<DatePicker
									selected={searchParams.departureDate}
									onChange={(date) => handleDateChange(date, 'departureDate')}
									className="form-control custom-datepicker"
									placeholderText="Select Departure Date"
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
