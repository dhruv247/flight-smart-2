import React, { useEffect, useState } from 'react';
import { useFlightContext } from '../../../hooks/useFlightContext';
import axios from 'axios';
import Loading from '../../../components/Loading';

const FlightDetails = () => {
	const { currentBooking } = useFlightContext();
	const [departureFlight, setDepartureFlight] = useState(null);
	const [returnFlight, setReturnFlight] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const departureFlightId =
		currentBooking?.departureFlightId;
	const returnFlightId = currentBooking?.returnFlightId;

	useEffect(() => {
		const fetchFlight = async (flightId, setter) => {
			if (!flightId) return;
			try {
				setLoading(true);
				const res = await axios.get(
					`http://localhost:8000/api/flights/get-flight-by-id/${flightId}`
				);
				setter(res.data.flight);
			} catch (err) {
				setError('Failed to fetch flight details');
			} finally {
				setLoading(false);
			}
		};
		if (departureFlightId) fetchFlight(departureFlightId, setDepartureFlight);
		if (returnFlightId) fetchFlight(returnFlightId, setReturnFlight);
	}, [departureFlightId, returnFlightId]);

	const formatTime = (time) => {
		const hours = Math.floor(time / 100);
		const minutes = time % 100;
		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}`;
	};

	if (!departureFlightId) {
		return (
			<div className="alert alert-info" role="alert">
				<i className="bi bi-info-circle me-2"></i>
				No flight selected yet.
			</div>
		);
	}

	if (loading) return <Loading />;
	if (error) return <div className="alert alert-danger">{error}</div>;

	return (
		<div className="card shadow-lg border-0" style={{ background: '#f8f9fa' }}>
			<div
				className="card-header bg-primary text-white d-flex align-items-center"
				style={{
					borderTopLeftRadius: '0.5rem',
					borderTopRightRadius: '0.5rem',
				}}
			>
				<i className="bi bi-airplane me-2 fs-4"></i>
				<h5 className="mb-0">Flight Details</h5>
			</div>
			<div className="card-body p-4">
				{/* Departure Flight */}
				{departureFlight && (
					<div className="mb-4">
						<div className="d-flex align-items-center mb-2 text-primary">
							<i className="bi bi-arrow-right-circle me-2"></i>
							<span className="fw-semibold">Departure Flight</span>
						</div>
						<div className="row g-3 align-items-center">
							<div className="col-12 col-md-5 text-center text-md-start">
								<div className="fw-bold fs-5">
									{departureFlight.departureAirport?.city}
								</div>
								<div className="text-secondary">
									{formatTime(departureFlight.departureTime)}
								</div>
								<div className="text-muted small">
									{departureFlight.departureDate}
								</div>
							</div>
							<div className="col-12 col-md-2 text-center">
								<i className="bi bi-airplane fs-2 text-primary"></i>
							</div>
							<div className="col-12 col-md-5 text-center text-md-end">
								<div className="fw-bold fs-5">
									{departureFlight.arrivalAirport?.city}
								</div>
								<div className="text-secondary">
									{formatTime(departureFlight.arrivalTime)}
								</div>
								<div className="text-muted small">
									{departureFlight.arrivalDate}
								</div>
							</div>
						</div>
						<div className="row mt-3 g-2">
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Airline:</span>{' '}
								{departureFlight.airline?.airlineName}
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Flight Number:</span>{' '}
								{departureFlight.flightNo}
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Plane:</span>{' '}
								{departureFlight.plane.planeName}
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Duration:</span>{' '}
								{Math.floor(departureFlight.duration / 60)}:
								{(departureFlight.duration % 60).toString().padStart(2, '0')} hr
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Class:</span>{' '}
								{departureFlight.seatType === 'business'
									? 'Business'
									: 'Economy'}
							</div>
						</div>
					</div>
				)}
				{/* Return Flight */}
				{returnFlight && (
					<div className="border-top pt-4 mt-4">
						<div className="d-flex align-items-center mb-2 text-primary">
							<i className="bi bi-arrow-repeat me-2"></i>
							<span className="fw-semibold">Return Flight</span>
						</div>
						<div className="row g-3 align-items-center">
							<div className="col-12 col-md-5 text-center text-md-start">
								<div className="fw-bold fs-5">
									{returnFlight.departureAirport?.city}
								</div>
								<div className="text-secondary">
									{formatTime(returnFlight.departureTime)}
								</div>
								<div className="text-muted small">
									{returnFlight.departureDate}
								</div>
							</div>
							<div className="col-12 col-md-2 text-center">
								<i className="bi bi-airplane fs-2 text-primary"></i>
							</div>
							<div className="col-12 col-md-5 text-center text-md-end">
								<div className="fw-bold fs-5">
									{returnFlight.arrivalAirport?.city}
								</div>
								<div className="text-secondary">
									{formatTime(returnFlight.arrivalTime)}
								</div>
								<div className="text-muted small">
									{returnFlight.arrivalDate}
								</div>
							</div>
						</div>
						<div className="row mt-3 g-2">
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Airline:</span>{' '}
								{returnFlight.airline?.airlineName}
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Flight Number:</span>{' '}
								{returnFlight.flightNo}
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Plane:</span>{' '}
								{returnFlight.plane.planeName}
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Duration:</span>{' '}
								{Math.floor(returnFlight.duration / 60)}:
								{(returnFlight.duration % 60).toString().padStart(2, '0')} hr
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Class:</span>{' '}
								{returnFlight.seatType === 'business' ? 'Business' : 'Economy'}
							</div>
							
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default FlightDetails;
