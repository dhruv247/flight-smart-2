import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SeatMap = ({ flightId, seatType, onSeatSelect, blockedSeats = [] }) => {
	const [seats, setSeats] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedSeat, setSelectedSeat] = useState(null);

	useEffect(() => {
		/**
		 * Gets the seats for a flight
		 */
		const fetchSeats = async () => {
			try {
				setLoading(true);
				const response = await axios.get(
					`http://localhost:8000/api/seats/getSeats/${flightId}`
				);
				setSeats(response.data.data);
				setSelectedSeat(null); // Reset selected seat when flight changes
				setLoading(false);
			} catch (err) {
				setError('Failed to fetch seats');
				setLoading(false);
			}
		};

		if (flightId) {
			fetchSeats();
		}
	}, [flightId]);

	const handleSeatClick = (seat) => {
		if (!seat.occupied && !blockedSeats.includes(parseInt(seat.seatNumber))) {
			setSelectedSeat(seat);
		}
	};

	const handleConfirmSelection = () => {
		if (selectedSeat) {
			onSeatSelect(parseInt(selectedSeat.seatNumber));
		}
	};

	if (loading)
		return (
			<div className="text-center p-4">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading seats...</span>
				</div>
				<p className="mt-2">Loading seats...</p>
			</div>
		);

	if (error) return <div className="text-center text-danger p-4">{error}</div>;

	if (!seats || seats.length === 0)
		return (
			<div className="alert alert-warning">
				No seats available for this flight.
			</div>
		);

	// Filter seats by seat type
	const filteredSeats = seats.filter((seat) => seat.seatType === seatType);

	if (filteredSeats.length === 0)
		return (
			<div className="alert alert-warning">
				No {seatType} class seats available for this flight.
			</div>
		);

	// Organize seats in rows for better display
	const seatRows = {};
	filteredSeats.forEach((seat) => {
		// Use different seats per row based on seat type
		const seatsPerRow = seatType === 'business' ? 2 : 6;
		const rowNum = Math.ceil(seat.seatNumber / seatsPerRow);
		if (!seatRows[rowNum]) {
			seatRows[rowNum] = [];
		}
		seatRows[rowNum].push(seat);
	});

	return (
		<div>
			<div className="mb-3">
				<div className="d-flex flex-md-row flex-column justify-content-center align-items-center gap-2 mb-2">
					<div className="d-flex align-items-center me-3">
						<div
							className="btn btn-outline-primary me-1"
							style={{ pointerEvents: 'none' }}
						>
							A
						</div>
						<span>Available</span>
					</div>
					<div className="d-flex align-items-center me-3">
						<div
							className="btn btn-success me-1"
							style={{ pointerEvents: 'none' }}
						>
							B
						</div>
						<span>Selected</span>
					</div>
					<div className="d-flex align-items-center me-3">
						<div
							className="btn btn-danger me-1"
							style={{ pointerEvents: 'none' }}
						>
							C
						</div>
						<span>Occupied</span>
					</div>
					<div className="d-flex align-items-center">
						<div
							className="btn btn-warning me-1"
							style={{ pointerEvents: 'none' }}
						>
							D
						</div>
						<span>Blocked</span>
					</div>
				</div>
			</div>

			<div className="seat-map-container text-center mb-4">
				{Object.keys(seatRows)
					.sort((a, b) => Number(a) - Number(b))
					.map((rowNum) => (
						<div key={rowNum} className="seat-row mb-2">
							{seatRows[rowNum]
								.sort((a, b) => a.seatNumber - b.seatNumber)
								.map((seat) => {
									const isBlocked = blockedSeats.includes(
										parseInt(seat.seatNumber)
									);
									return (
										<button
											key={seat._id}
											className={`btn m-1 ${
												seat.occupied
													? 'btn-danger'
													: isBlocked
													? 'btn-warning'
													: selectedSeat?.seatNumber === seat.seatNumber
													? 'btn-success'
													: 'btn-outline-primary'
											}`}
											onClick={() => handleSeatClick(seat)}
											disabled={seat.occupied || isBlocked}
											style={{ width: '45px' }}
										>
											{seat.seatNumber}
										</button>
									);
								})}
						</div>
					))}
			</div>

			<div className="d-flex justify-content-between mt-3">
				<div>
					{selectedSeat && (
						<p className="mb-0">
							Selected seat: <strong>{selectedSeat.seatNumber}</strong>
						</p>
					)}
				</div>
				<div>
					<button
						type="button"
						className="btn btn-secondary me-2"
						data-bs-dismiss="modal"
					>
						Cancel
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleConfirmSelection}
						disabled={!selectedSeat}
						data-bs-dismiss="modal"
					>
						Confirm Selection
					</button>
				</div>
			</div>
		</div>
	);
};

export default SeatMap;
