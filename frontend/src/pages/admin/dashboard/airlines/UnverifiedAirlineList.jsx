import React, { useState, useEffect } from 'react';
import { getAllAirlines } from '../../../../services/auth.service';
import UnverifiedAirlineCard from './UnverifiedAirlineCard';
import Loading from '../../../../components/Loading';

const UnverifiedAirlineList = () => {
	const [airlines, setAirlines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAirlines = async () => {
			try {
				const response = await getAllAirlines();
				// Filter only unverified airlines
				const unverifiedAirlines = response.airlines.filter(
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
	if (airlines.length === 0) return <div>No unverified airlines found</div>;

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
