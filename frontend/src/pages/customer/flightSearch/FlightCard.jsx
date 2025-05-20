import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightContext } from '../../../hooks/useFlightContext';

const FlightCard = ({
	flight,
	travelClass,
	passengers,
	tripType,
	isReturnFlight,
}) => {
	const navigate = useNavigate();
	const {
		selectedDepartureFlight,
		setSelectedDepartureFlight,
		setCurrentBooking,
	} = useFlightContext();

	if (!flight) return null;

	/**
	 * Format date and time from a Date object
	 * @param {Date} dateTime - The date and time to format
	 * @returns {Object} - Object containing formatted date and time
	 */
	const formatDateTime = (dateTime) => {
		const date = new Date(dateTime);
		return {
			time: date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			}),
			date: date
				.toLocaleDateString('en-US', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
				})
				.replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2'),
		};
	};

	/**
	 * Total Price of all tickets
	 * @returns
	 */
	const getTotalPrice = () => {
		const basePrice =
			travelClass === '2'
				? flight.businessCurrentPrice
				: flight.economyCurrentPrice;
		return basePrice * parseInt(passengers || 1);
	};

	const handleSelectFlight = () => {
		/**
		 * Needed for the individual ticket prices
		 */
		const currentPrice =
			travelClass === '2'
				? flight.businessCurrentPrice
				: flight.economyCurrentPrice;

		const selectedFlight = {
			departureFlightId: flight._id,
			roundTrip: tripType === 'roundTrip',
			seatType: travelClass === '2' ? 'business' : 'economy',
			ticketPrice: currentPrice,
			passengers: parseInt(passengers || 1),
		};

		if (isReturnFlight) {
			// Create complete booking data with return flight
			const bookingData = {
				...selectedDepartureFlight,
				returnFlightId: flight._id,
				ticketPrice: currentPrice,
			};

			// Store complete booking data in context
			setCurrentBooking(bookingData);
			navigate('/customer/bookingDetails');
		} else if (tripType === 'oneWay') {
			// Store one-way booking data in context
			setCurrentBooking(selectedFlight);
			navigate('/customer/bookingDetails');
		} else {
			// For round trip departure flight, just store the flight in context
			setSelectedDepartureFlight(selectedFlight);
			navigate('/customer/returnFlights');
		}
	};

	const departureDateTime = formatDateTime(flight.departureDateTime);
	const arrivalDateTime = formatDateTime(flight.arrivalDateTime);

	return (
		<div className="row border border-subtle rounded m-0 mb-3 py-2 align-items-center bg-white">
			<div className="col-12 col-md-1">
				<p>{flight.flightNo}</p>
			</div>
			<div className="col-12 col-md-1">
				<p>{flight.airline.airlineName}</p>
			</div>
			<div className="col-12 col-md-1">
				<p>{flight.plane.planeName}</p>
			</div>
			<div className="col-12 col-md-3 d-flex justify-content-evenly align-items-center">
				<div className="align-items-center">
					<p>{flight.departureAirport.city}</p>
					<p>{departureDateTime.time}</p>
					<p>{departureDateTime.date}</p>
				</div>
				<i className="bi bi-arrow-right"></i>
				<div className="align-items-center">
					<p>{flight.arrivalAirport.city}</p>
					<p>{arrivalDateTime.time}</p>
					<p>{arrivalDateTime.date}</p>
				</div>
			</div>
			<div className="col-12 col-md-2">
				<p>
					{Math.floor(flight.duration / 60)} hr : {(flight.duration % 60).toString().padStart(2, '0')} min
				</p>
			</div>
			<div className="col-12 col-md-2">
				<p>
					Total Price: <span>₹{getTotalPrice()}</span>
					<br />
					<small className="text-muted">
						{passengers || 1} {travelClass === '2' ? 'Business' : 'Economy'}{' '}
						ticket{parseInt(passengers || 1) > 1 ? 's' : ''}
					</small>
				</p>
			</div>
			<div className="col-12 col-md-2">
				<button
					className="btn btn-outline-secondary"
					onClick={handleSelectFlight}
				>
					Select Flight
				</button>
			</div>
		</div>
	);
};

export default FlightCard;
