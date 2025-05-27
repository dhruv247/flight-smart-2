import React, { useState, useEffect } from 'react';
import VerifiedAirlineCard from './VerifiedAirlineCard';
import { authService } from '../../../../services/auth.service';

const VerifiedAirlineList = () => {
	const [airlines, setAirlines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchVerifiedAirlines = async () => {
			try {
				const response = await authService.getAllAirlines();
				// Filter only verified airlines
				const verifiedAirlines = response.data.airlines.filter(
					(airline) => airline.verificationStatus
				);
				setAirlines(verifiedAirlines);
				setLoading(false);
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		fetchVerifiedAirlines();
	}, []);

	if (loading)
		return (
			<div className="text-center my-5">
				<div className="spinner-border text-primary" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
				<p className="mt-2">Loading verified airlines...</p>
			</div>
		);
	if (error) return <div>Error: {error}</div>;
	if (airlines.length === 0) return (
		<div className="text-center p-5">
			<h3 className="text-muted mb-3">No Verified Airlines</h3>
			<p className="text-muted">There are currently no verified airlines.</p>
		</div>
	);

	return (
		<div className="container mt-3">
			<div className="row mt-3">
				<div className="col-md-2"></div>
				<div className="col-md-8 row d-flex align-items-center p-2 m-0 mb-3 border rounded bg-light">
					<p className="col-12 col-md-4 fw-bold">Airline Name</p>
					<p className="col-12 col-md-4 fw-bold">Email</p>
					<p className="col-12 col-md-4 fw-bold">Verified On</p>
				</div>
				<div className="col-md-2"></div>
			</div>
			<div className="d-flex flex-column gap-3">
				{airlines.map((airline) => (
					<VerifiedAirlineCard key={airline._id} airline={airline} />
				))}
			</div>
		</div>
	);
};

export default VerifiedAirlineList;
