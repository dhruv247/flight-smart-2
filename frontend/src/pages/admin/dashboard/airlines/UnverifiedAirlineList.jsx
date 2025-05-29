import React, { useState, useEffect } from 'react';
import { authService } from '../../../../services/auth.service';
import UnverifiedAirlineCard from './UnverifiedAirlineCard';
import Loading from '../../../../components/Loading';

/**
 * Unverified Airline List
 */
const UnverifiedAirlineList = () => {
	const [airlines, setAirlines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	/**
	 * Fetch airlines from the database
	 */
	useEffect(() => {
		const fetchAirlines = async () => {
			try {
				const response = await authService.getAllAirlines();
				// Filter only unverified airlines
				const unverifiedAirlines = response.data.airlines.filter(
					(airline) => !airline.verificationStatus
				);
				setAirlines(unverifiedAirlines);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchAirlines();
	}, []);

	if (loading) return <Loading />;
	if (error) return <div>Error: {error}</div>;
	if (airlines.length === 0) return (
		<div className="text-center p-5">
			<h3 className="text-muted mb-3">No Unverified Airlines</h3>
			<p className="text-muted">There are currently no airlines pending verification.</p>
		</div>
	);

	return (
		<div className="container mt-3">
			<div className="d-flex flex-column gap-3">
				{airlines.map((airline) => (
					<UnverifiedAirlineCard key={airline._id} airline={airline} />
				))}
			</div>
		</div>
	);
};

export default UnverifiedAirlineList;
