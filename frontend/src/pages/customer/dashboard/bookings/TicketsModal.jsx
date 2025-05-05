import React from 'react';

const TicketsModal = ({ isOpen, onClose, booking }) => {
	if (!isOpen) return null;

	const formatTime = (time) => {
		return new Date(time).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
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
								<div className="card mb-4">
									<div className="card-body">
										<h6 className="card-subtitle mb-3 text-muted">
											Flight Information
										</h6>
										<div className="row g-3">
											<div className="col-md-6">
												<div className="d-flex justify-content-between align-items-center mb-2">
													<div>
														<div className="fs-5 fw-medium">
															{booking.flightFrom}
														</div>
														<div className="text-muted">
															{formatTime(booking.departureTime)}
														</div>
													</div>
													<div className="text-center px-3">
														<i className="bi bi-airplane fs-5"></i>
													</div>
													<div className="text-end">
														<div className="fs-5 fw-medium">
															{booking.flightTo}
														</div>
														<div className="text-muted">
															{formatTime(booking.arrivalTime)}
														</div>
													</div>
												</div>
												<div className="text-muted text-center">
													{formatDate(booking.departureTime)}
												</div>
											</div>
											<div className="col-md-6">
												<div className="d-flex flex-column gap-2">
													<div>
														<strong>Airline:</strong> {booking.airlineName}
													</div>
													<div>
														<strong>Flight Number:</strong>{' '}
														{booking.flightNumber}
													</div>
													<div>
														<strong>Status:</strong>{' '}
														<span
															className={`badge ${
																booking.status === 'Confirmed'
																	? 'bg-success'
																	: booking.status === 'Cancelled'
																	? 'bg-danger'
																	: 'bg-warning'
															}`}
														>
															{booking.status}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="card">
									<div className="card-body">
										<h6 className="card-subtitle mb-3 text-muted">
											Passenger Details
										</h6>
										<div className="row g-3">
											<div className="col-md-6">
												<div>
													<strong>Passengers:</strong> {booking.passengers}
												</div>
												<div>
													<strong>Class:</strong>{' '}
													{booking.travelClass === '1' ? 'Economy' : 'Business'}
												</div>
											</div>
											<div className="col-md-6">
												<div>
													<strong>Booking ID:</strong>{' '}
													<span className="font-monospace">{booking._id}</span>
												</div>
												<div>
													<strong>Booking Date:</strong>{' '}
													{formatDate(booking.createdAt)}
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
