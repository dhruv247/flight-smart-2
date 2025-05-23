import React from 'react';

const FlightSorting = ({ onSort, selectedOption = 'bestFlight' }) => {
	return (
		<form action="" className="my-3" id="sortFlights">
			<label className="me-2">Sort by:</label>
			<div className="btn-group">
				<input
					type="radio"
					className="btn-check"
					name="sortOptions"
					id="sortBestFlight"
					value="bestFlight"
					onChange={(e) => onSort(e.target.value)}
					checked={selectedOption === 'bestFlight'}
				/>
				<label className="btn btn-outline-primary" htmlFor="sortBestFlight">
					Best Flight
				</label>

				<input
					type="radio"
					className="btn-check"
					name="sortOptions"
					id="sortPrice"
					value="price"
					onChange={(e) => onSort(e.target.value)}
					checked={selectedOption === 'price'}
				/>
				<label className="btn btn-outline-primary" htmlFor="sortPrice">
					Price (Low to High)
				</label>

				<input
					type="radio"
					className="btn-check"
					name="sortOptions"
					id="sortDuration"
					value="duration"
					onChange={(e) => onSort(e.target.value)}
					checked={selectedOption === 'duration'}
				/>
				<label className="btn btn-outline-primary" htmlFor="sortDuration">
					Duration
				</label>
			</div>
		</form>
	);
};

export default FlightSorting;
