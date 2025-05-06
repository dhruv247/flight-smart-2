import React from 'react';

const TicketsModal = ({
	isOpen,
	onClose,
	booking,
	tickets,
	departureFlight,
	returnFlight,
}) => {
	if (!isOpen) return null;

	const formatHHMM = (time) => {
		if (typeof time !== 'number' && typeof time !== 'string') return '';
		const str = time.toString().padStart(4, '0');
		const hours = str.slice(0, 2);
		const minutes = str.slice(2, 4);
		return `${hours}:${minutes}`;
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div
			className="modal show d-block"
			tabIndex="-1"
			style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
		>
			<div className="modal-dialog modal-lg modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header border-bottom">
						<h5 className="modal-title">Booking Details</h5>
						<button
							type="button"
							className="btn-close"
							onClick={onClose}
						></button>
					</div>
					<div className="modal-body p-4">
						{booking ? (
							<div>
								{/* Flight Information */}
								<div className="card mb-4">
									<div className="card-body">
										<h6 className="card-subtitle mb-3 text-muted">
											Flight Information
										</h6>
										{/* Departure Flight */}
										<div className="mb-4">
											<h6 className="mb-3">Departure Flight</h6>
											<div className="row g-3">
												<div className="col-md-6">
													<div className="d-flex justify-content-between align-items-center mb-2">
														<div>
															<div className="fs-5 fw-medium">
																{departureFlight?.departurePlace}
															</div>
															<div className="text-muted">
																{formatHHMM(departureFlight?.departureTime)}
															</div>
														</div>
														<div className="text-center px-3">
															<i className="bi bi-airplane fs-5"></i>
														</div>
														<div className="text-end">
															<div className="fs-5 fw-medium">
																{departureFlight?.arrivalPlace}
															</div>
															<div className="text-muted">
																{formatHHMM(departureFlight?.arrivalTime)}
															</div>
														</div>
													</div>
													<div className="text-muted text-center">
														{formatDate(departureFlight?.departureDate)}
													</div>
												</div>
												<div className="col-md-6">
													<div className="d-flex flex-column gap-2">
														<div>
															<strong>Airline:</strong>{' '}
															{departureFlight?.airlineDetails?.airlineName}
														</div>
														<div>
															<strong>Flight Number:</strong>{' '}
															{departureFlight?.flightNo}
														</div>
														<div>
															<strong>Duration:</strong>{' '}
															{Math.floor(departureFlight?.duration / 60)}:
															{(departureFlight?.duration % 60)
																.toString()
																.padStart(2, '0')}{' '}
															hr
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Return Flight */}
										{returnFlight && (
											<div>
												<h6 className="mb-3">Return Flight</h6>
												<div className="row g-3">
													<div className="col-md-6">
														<div className="d-flex justify-content-between align-items-center mb-2">
															<div>
																<div className="fs-5 fw-medium">
																	{returnFlight?.departurePlace}
																</div>
																<div className="text-muted">
																	{formatHHMM(returnFlight?.departureTime)}
																</div>
															</div>
															<div className="text-center px-3">
																<i className="bi bi-airplane fs-5"></i>
															</div>
															<div className="text-end">
																<div className="fs-5 fw-medium">
																	{returnFlight?.arrivalPlace}
																</div>
																<div className="text-muted">
																	{formatHHMM(returnFlight?.arrivalTime)}
																</div>
															</div>
														</div>
														<div className="text-muted text-center">
															{formatDate(returnFlight?.departureDate)}
														</div>
													</div>
													<div className="col-md-6">
														<div className="d-flex flex-column gap-2">
															<div>
																<strong>Airline:</strong>{' '}
																{returnFlight?.airlineDetails?.airlineName}
															</div>
															<div>
																<strong>Flight Number:</strong>{' '}
																{returnFlight?.flightNo}
															</div>
															<div>
																<strong>Duration:</strong>{' '}
																{Math.floor(returnFlight?.duration / 60)}:
																{(returnFlight?.duration % 60)
																	.toString()
																	.padStart(2, '0')}{' '}
																hr
															</div>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Tickets Information */}
								<div className="card mb-4">
									<div className="card-body">
										<h6 className="card-subtitle mb-3 text-muted">Tickets</h6>
										<div className="table-responsive">
											<table className="table">
												<thead>
													<tr>
														<th>Passenger</th>
														<th>Seat Type</th>
														<th>Departure Seat</th>
														<th>Return Seat</th>
														<th>Price</th>
													</tr>
												</thead>
												<tbody>
													{tickets.map((ticket, index) => (
														<tr key={ticket._id}>
															<td>{ticket.nameOfFlyer}</td>
															<td>
																{ticket.seatType === 'business'
																	? 'Business'
																	: 'Economy'}
															</td>
															<td>{ticket.departureFlightSeatNumber}</td>
															<td>{ticket.returnFlightSeatNumber || '-'}</td>
															<td>₹{ticket.ticketPrice}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>

								{/* Booking Information */}
								<div className="card">
									<div className="card-body">
										<h6 className="card-subtitle mb-3 text-muted">
											Booking Information
										</h6>
										<div className="row g-3">
											<div className="col-md-6">
												<div>
													<strong>Booking ID:</strong>{' '}
													<span className="font-monospace">{booking._id}</span>
												</div>
												<div>
													<strong>Status:</strong>{' '}
													<span
														className={`badge ${
															booking.confirmed ? 'bg-success' : 'bg-danger'
														}`}
													>
														{booking.confirmed ? 'Confirmed' : 'Cancelled'}
													</span>
												</div>
											</div>
											<div className="col-md-6">
												<div>
													<strong>Total Passengers:</strong> {tickets.length}
												</div>
												<div>
													<strong>Total Amount:</strong> ₹
													{tickets.reduce(
														(sum, ticket) => sum + ticket.ticketPrice,
														0
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="text-center text-muted py-4">
								No booking information available
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TicketsModal;
