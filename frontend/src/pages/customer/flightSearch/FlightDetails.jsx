import React, { useEffect, useState } from 'react';
import { useFlightContext } from '../../../hooks/useFlightContext';
import Loading from '../../../components/Loading';
import formatDateTime from '../../../utils/dateTime';
import { flightService } from '../../../services/flight.service';
import { discountService } from '../../../services/discount.service';

const FlightDetails = () => {
	const { currentBooking, flightSearchData } = useFlightContext();
	const [departureFlight, setDepartureFlight] = useState(null);
	const [returnFlight, setReturnFlight] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [adultsDiscount, setAdultsDiscount] = useState(0);
	const [childrenDiscount, setChildrenDiscount] = useState(0);
	const [infantsDiscount, setInfantsDiscount] = useState(0);
	const [totalBookingPrice, setTotalBookingPrice] = useState(0);

	const departureFlightId = currentBooking?.departureFlightId;
	const returnFlightId = currentBooking?.returnFlightId;

	useEffect(() => {
		const fetchFlight = async (flightId, setter) => {
			if (!flightId) return;
			try {
				setLoading(true);
				const res = await flightService.getFlightById(flightId);
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

	useEffect(() => {
		const fetchDiscounts = async () => {
			const res = await discountService.getDiscounts();
			res.data.forEach((discount) => {
				if (discount.discountFor === 'adults') {
					setAdultsDiscount(discount.discountValue);
				} else if (discount.discountFor === 'children') {
					setChildrenDiscount(discount.discountValue);
				} else if (discount.discountFor === 'infants') {
					setInfantsDiscount(discount.discountValue);
				}
			});
		};
		fetchDiscounts();
	}, []);

	useEffect(() => {
		if (!departureFlight || !currentBooking) return;

		const departureFlightPrice =
			currentBooking.seatType === 'business'
				? departureFlight.businessCurrentPrice
				: departureFlight.economyCurrentPrice;

		const returnFlightPrice = returnFlight
			? currentBooking.seatType === 'business'
				? returnFlight.businessCurrentPrice
				: returnFlight.economyCurrentPrice
			: 0;

		const totalPrice =
			departureFlightPrice * flightSearchData.adultPassengers +
			Math.round((departureFlightPrice *
				flightSearchData.childPassengers *
				(100 - childrenDiscount)) /
				100) +
			Math.round((departureFlightPrice *
				flightSearchData.infantPassengers *
				(100 - infantsDiscount)) /
				100) +
			returnFlightPrice * flightSearchData.adultPassengers +
			Math.round((returnFlightPrice *
				flightSearchData.childPassengers *
				(100 - childrenDiscount)) /
				100) +
			Math.round((returnFlightPrice *
				flightSearchData.infantPassengers *
				(100 - infantsDiscount)) /
				100);

		setTotalBookingPrice(totalPrice);
	}, [
		adultsDiscount,
		childrenDiscount,
		infantsDiscount,
		departureFlight,
		returnFlight,
		flightSearchData,
		currentBooking.seatType,
		currentBooking,
	]);

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
									{formatDateTime(departureFlight.departureDateTime).time}
								</div>
								<div className="text-muted small">
									{formatDateTime(departureFlight.departureDateTime).date}
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
									{formatDateTime(departureFlight.arrivalDateTime).time}
								</div>
								<div className="text-muted small">
									{formatDateTime(departureFlight.arrivalDateTime).date}
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
								{Math.floor(departureFlight.duration / 60)} hr :{' '}
								{(departureFlight.duration % 60).toString().padStart(2, '0')}{' '}
								min
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Class:</span>{' '}
								{departureFlight.seatType === 'business'
									? 'Business'
									: 'Economy'}
							</div>
						</div>
						<table className="table table-bordered mt-3">
							<thead>
								<tr>
									<th>Passenger Type</th>
									<th>Original Price</th>
									<th>Discount Applicable</th>
									<th>Discounted Price</th>
								</tr>
							</thead>
							<tbody>
								{flightSearchData.adultPassengers > 0 &&
									[...Array(flightSearchData.adultPassengers)].map((_, i) => (
										<tr>
											<td>Adult</td>
											<td>
												{currentBooking.seatType === 'business'
													? departureFlight.businessCurrentPrice
													: departureFlight.economyCurrentPrice}
											</td>
											<td>{adultsDiscount}%</td>
											<td>
												{currentBooking.seatType === 'business'
													? Math.round(
															departureFlight.businessCurrentPrice *
																(1 - adultsDiscount / 100)
													  )
													: Math.round(
															departureFlight.economyCurrentPrice *
																(1 - adultsDiscount / 100)
													  )}
											</td>
										</tr>
									))}
								{flightSearchData.childPassengers > 0 &&
									[...Array(flightSearchData.childPassengers)].map((_, i) => (
										<tr>
											<td>Child</td>
											<td>
												{currentBooking.seatType === 'business'
													? departureFlight.businessCurrentPrice
													: departureFlight.economyCurrentPrice}
											</td>
											<td>{childrenDiscount}%</td>
											<td>
												{currentBooking.seatType === 'business'
													? Math.round(
															departureFlight.businessCurrentPrice *
																(1 - childrenDiscount / 100)
													  )
													: Math.round(
															departureFlight.economyCurrentPrice *
																(1 - childrenDiscount / 100)
													  )}
											</td>
										</tr>
									))}
								{flightSearchData.infantPassengers > 0 &&
									[...Array(flightSearchData.infantPassengers)].map((_, i) => (
										<tr>
											<td>Infant</td>
											<td>
												{currentBooking.seatType === 'business'
													? departureFlight.businessCurrentPrice
													: departureFlight.economyCurrentPrice}
											</td>
											<td>{infantsDiscount}%</td>
											<td>
												{currentBooking.seatType === 'business'
													? Math.round(
															departureFlight.businessCurrentPrice *
																(1 - infantsDiscount / 100)
													  )
													: Math.round(
															departureFlight.economyCurrentPrice *
																(1 - infantsDiscount / 100)
													  )}
											</td>
										</tr>
									))}
							</tbody>
						</table>
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
									{formatDateTime(returnFlight.departureDateTime).time}
								</div>
								<div className="text-muted small">
									{formatDateTime(returnFlight.departureDateTime).date}
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
									{formatDateTime(returnFlight.arrivalDateTime).time}
								</div>
								<div className="text-muted small">
									{formatDateTime(returnFlight.arrivalDateTime).date}
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
								{Math.floor(returnFlight.duration / 60)} hr :{' '}
								{(returnFlight.duration % 60).toString().padStart(2, '0')} min
							</div>
							<div className="col-12 col-md-6">
								<span className="fw-semibold">Class:</span>{' '}
								{returnFlight.seatType === 'business' ? 'Business' : 'Economy'}
							</div>
						</div>
						<table className="table table-bordered mt-3">
							<thead>
								<tr>
									<th>Passenger Type</th>
									<th>Original Price</th>
									<th>Discount Applicable</th>
									<th>Discounted Price</th>
								</tr>
							</thead>
							<tbody>
								{flightSearchData.adultPassengers > 0 &&
									[...Array(flightSearchData.adultPassengers)].map((_, i) => (
										<tr>
											<td>Adult</td>
											<td>
												{currentBooking.seatType === 'business'
													? returnFlight.businessCurrentPrice
													: returnFlight.economyCurrentPrice}
											</td>
											<td>{adultsDiscount}%</td>
											<td>
												{currentBooking.seatType === 'business'
													? Math.round(
															returnFlight.businessCurrentPrice *
																(1 - adultsDiscount / 100)
													  )
													: Math.round(
															returnFlight.economyCurrentPrice *
																(1 - adultsDiscount / 100)
													  )}
											</td>
										</tr>
									))}
								{flightSearchData.childPassengers > 0 &&
									[...Array(flightSearchData.childPassengers)].map((_, i) => (
										<tr>
											<td>Child</td>
											<td>
												{currentBooking.seatType === 'business'
													? returnFlight.businessCurrentPrice
													: returnFlight.economyCurrentPrice}
											</td>
											<td>{childrenDiscount}%</td>
											<td>
												{currentBooking.seatType === 'business'
													? Math.round(
															returnFlight.businessCurrentPrice *
																(1 - childrenDiscount / 100)
													  )
													: Math.round(
															returnFlight.economyCurrentPrice *
																(1 - childrenDiscount / 100)
													  )}
											</td>
										</tr>
									))}
								{flightSearchData.infantPassengers > 0 &&
									[...Array(flightSearchData.infantPassengers)].map((_, i) => (
										<tr>
											<td>Infant</td>
											<td>
												{currentBooking.seatType === 'business'
													? returnFlight.businessCurrentPrice
													: returnFlight.economyCurrentPrice}
											</td>
											<td>{infantsDiscount}%</td>
											<td>
												{currentBooking.seatType === 'business'
													? Math.round(
															returnFlight.businessCurrentPrice *
																(1 - infantsDiscount / 100)
													  )
													: Math.round(
															returnFlight.economyCurrentPrice *
																(1 - infantsDiscount / 100)
													  )}
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				)}

				<div className="border-top pt-4 mt-4">
					<div className="d-flex align-items-center mb-2 text-primary">
						<i className="bi bi-cash-coin me-2"></i>
						<span className="fw-semibold">Total Booking Price: </span>
						<span className="fw-semibold text-black ms-2">₹{totalBookingPrice}</span>
					</div>
					{/* <div className="text-muted small">
						Cancellation Refund Policy: 100% refund if cancelled 24 hours before departure (in case of round trip, 24 hours before the first flight).
					</div> */}
				</div>
			</div>
		</div>
	);
};

export default FlightDetails;