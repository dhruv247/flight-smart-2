import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PassengerDetailsCard = ({
	passenger,
	index,
	isRoundTrip,
	onPassengerChange,
	onDateChange,
	openSeatMapModal,
	yesterday,
	minDate,
	today,
	passengerType,
}) => {
	// Calculate date restrictions based on passenger type
	const getDateRestrictions = () => {
		const now = new Date();
		const maxDate = new Date(now);
		const minDate = new Date(now);

		switch (passengerType) {
			case 'adult':
				// Adults must be 12+ years old
				maxDate.setFullYear(now.getFullYear() - 12);
				minDate.setFullYear(1900);
				break;
			case 'child':
				// Children must be between 2-12 years old
				maxDate.setFullYear(now.getFullYear() - 2);
				minDate.setFullYear(now.getFullYear() - 12);
				break;
			case 'infant':
				// Infants must be under 2 years old
				maxDate.setFullYear(now.getFullYear());
				minDate.setFullYear(now.getFullYear() - 2);
				break;
			default:
				maxDate.setFullYear(now.getFullYear());
				minDate.setFullYear(1900);
		}

		return { maxDate, minDate };
	};

	const { maxDate, minDate: typeMinDate } = getDateRestrictions();

	return (
		<div className="mb-4 pb-3 border-bottom">
			<div className="mb-3">
				<span className="badge bg-secondary fs-6">
					{passengerType.charAt(0).toUpperCase() + passengerType.slice(1)}{' '}
					Passenger {index + 1}
				</span>
			</div>
			<div className="row g-3">
				<div className="col-12 col-md-6">
					<label className="form-label fw-semibold">Full Name</label>
					<input
						placeholder="Enter full name"
						type="text"
						className="form-control"
						value={passenger.nameOfFlyer}
						onChange={(e) =>
							onPassengerChange(index, 'nameOfFlyer', e.target.value)
						}
						required
					/>
				</div>
				<div className="col-12 col-md-6">
					<label className="form-label fw-semibold">Date of Birth</label>
					<div className="form-control p-0 bg-white">
						<DatePicker
							selected={passenger.dateOfBirth}
							onChange={(date) => onDateChange(date, index)}
							className="form-control border-0"
							placeholderText="Select Date of Birth"
							dateFormat="yyyy-MM-dd"
							showMonthDropdown
							showYearDropdown
							dropdownMode="select"
							maxDate={maxDate}
							minDate={typeMinDate}
							excludeDateIntervals={[
								{ start: today, end: new Date(2100, 0, 1) },
							]}
							required
							yearDropdownItemNumber={100}
							scrollableYearDropdown
						/>
					</div>
				</div>
			</div>
			<div className="row g-3 mt-2">
				<div className="col-12 col-md-6">
					<label className="form-label fw-semibold">
						Departure Flight Seat
					</label>
					<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
						<input
							type="text"
							className="form-control bg-white"
							value={passenger.departureFlightSeatNumber || ''}
							readOnly
							placeholder="No seat selected"
							style={{ width: 120 }}
						/>
						<button
							type="button"
							className="btn btn-outline-primary btn-sm"
							onClick={() => openSeatMapModal(index, 'departure')}
						>
							Select Seat
						</button>
					</div>
				</div>
				{isRoundTrip && (
					<div className="col-12 col-md-6">
						<label className="form-label fw-semibold">Return Flight Seat</label>
						<div className="d-flex align-items-center gap-2 bg-light rounded p-2">
							<input
								type="text"
								className="form-control bg-white"
								value={passenger.returnFlightSeatNumber || ''}
								readOnly
								placeholder="No seat selected"
								style={{ width: 120 }}
							/>
							<button
								type="button"
								className="btn btn-outline-primary btn-sm"
								onClick={() => openSeatMapModal(index, 'return')}
							>
								Select Seat
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PassengerDetailsCard;
