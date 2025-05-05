import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UnverifiedAirlineCard from './UnverifiedAirlineCard';

const UnverifiedAirlineList = () => {
	const [airlines, setAirlines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAirlines = async () => {
			try {
				const response = await axios.get(
					'http://localhost:8000/api/admin/airline/get-all',
					{
						withCredentials: true,
					}
				);
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

	if (loading)
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading unverified airlines...</p>
			</div>
		);
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
