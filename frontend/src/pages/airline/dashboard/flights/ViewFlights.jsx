import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewFlights = () => {
	const [flights, setFlights] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const pageSize = 10;

	useEffect(() => {
		const fetchFlights = async () => {
			try {
				const response = await axios.get(
					`http://localhost:8000/api/flights/getAllFlightsForAirline?page=${currentPage}&size=${pageSize}`,
					{ withCredentials: true }
				);
				setFlights(response.data.flights);
			} catch (error) {
				console.error('Error fetching flights:', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchFlights();
	}, [currentPage]);

	const formatTime = (time) => {
		const hours = Math.floor(time / 100);
		const minutes = time % 100;
		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}`;
	};

	if (isLoading) {
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status"></div>
			</div>
		);
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
					<div className="col-12 col-md-2">
						<p className="fw-bold">Base Price</p>
					</div>
					<div className="col-12 col-md-2">
						<p className="fw-bold">Current Price</p>
					</div>
					<div className="col-12 col-md-2">
						<p className="fw-bold">Booked Seats</p>
					</div>
				</div>
			</div>
			{flights.map((flight) => (
				<div
					key={flight._id}
					className="row border border-subtle rounded m-0 mb-3 py-2 align-items-center bg-white"
				>
					<div className="col-12 col-md-1">
						<p>{flight.flightNo}</p>
					</div>
					<div className="col-12 col-md-1">
						<p>{flight.planeDetails.planeName}</p>
					</div>
					<div className="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
						<div className="align-items-center">
							<p>{flight.departurePlace}</p>
							<p>{formatTime(flight.departureTime)}</p>
							<p>{flight.departureDate}</p>
						</div>
						<p>-</p>
						<div className="align-items-center">
							<p>{flight.arrivalPlace}</p>
							<p>{formatTime(flight.arrivalTime)}</p>
							<p>{flight.arrivalDate}</p>
						</div>
					</div>
					<div className="col-12 col-md-1">
						<p>
							{Math.floor(flight.duration / 60)}:
							{(flight.duration % 60).toString().padStart(2, '0')}
						</p>
					</div>
					<div className="col-12 col-md-2">
						<div className="d-flex flex-row flex-md-column justify-content-center align-items-center gap-3">
							<p>Business: ₹{flight.businessBasePrice}</p>
							<p>Economy: ₹{flight.economyBasePrice}</p>
						</div>
					</div>
					<div className="col-12 col-md-2">
						<div className="d-flex flex-row flex-md-column justify-content-center align-items-center gap-3">
							<p>Business: ₹{flight.businessCurrentPrice}</p>
							<p>Economy: ₹{flight.economyCurrentPrice}</p>
						</div>
					</div>
					<div className="col-12 col-md-2">
						<div className="d-flex flex-row flex-md-column justify-content-center align-items-center gap-3">
							<p>Business: {flight.businessBookedCount}</p>
							<p>Economy: {flight.economyBookedCount}</p>
						</div>
					</div>
				</div>
			))}
			<div className="d-flex justify-content-center gap-3">
				<button
					onClick={() => setCurrentPage((prev) => prev - 1)}
					disabled={currentPage === 0}
				className="btn btn-primary"
			>
				Previous
			</button>
			<button
				onClick={() => setCurrentPage((prev) => prev + 1)}
				className="btn btn-primary"
				>
					Next
				</button>
			</div>
		</div>
	);
};

export default ViewFlights;
