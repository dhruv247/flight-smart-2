import React, { useState, useEffect } from 'react';
import Loading from '../../../../components/Loading';
import { flightService } from '../../../../services/flight.service';
import Pagination from '../../../../components/Pagination';
import FlightCard from './FlightCard';
import { useAirports } from '../../../../hooks/useAirports';

const ViewFlights = () => {
	const [flights, setFlights] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchParams, setSearchParams] = useState({
		page: 0,
		size: 10,
	});
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		const fetchFlights = async () => {
			try {
				const response = await flightService.getAllFlightsForAirline(
					searchParams.page,
					searchParams.size
				);
				setFlights(response.flights);
				setTotalPages(response.totalPages);
			} catch (error) {
				console.error('Error fetching flights:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchFlights();
	}, [searchParams]);

	const handlePageChange = (newPage) => {
		setSearchParams((prev) => ({ ...prev, page: newPage }));
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className="container mt-4">
			<div>
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
					<div className="col-12 d-flex justify-content-center align-items-center mt-2">
						<div className="border rounded p-2 d-flex justify-content-center align-items-center gap-4">
							<p className="fw-bold">B: Business</p>
							<p className="fw-bold">E: Economy</p>
						</div>
					</div>
				</div>
			</div>
			{flights.map((flight) => (
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
