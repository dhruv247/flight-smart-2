import React from 'react';

const FlightSorting = ({ onSort }) => {
	return (
		<form action="" className="my-3" id="sortFlights">
			<label className="me-2">Sort by:</label>
			<div className="btn-group">
				<input
					type="radio"
					className="btn-check"
					name="sortOptions"
					id="sortPrice"
					value="price"
					onChange={(e) => onSort(e.target.value)}
					defaultChecked
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
				/>
				<label className="btn btn-outline-primary" htmlFor="sortDuration">
					Duration
				</label>
			</div>
		</form>
	);
};

export default FlightSorting;
