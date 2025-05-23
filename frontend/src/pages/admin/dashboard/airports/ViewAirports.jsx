import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewAirports = () => {
	const [airports, setAirports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const getAirports = async () => {
			try {
				const airportsResponse = await axios.get(
					'http://localhost:8000/api/airports/get-all-airports',
					{ withCredentials: true }
				);
				setAirports(airportsResponse.data.airports);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};
		getAirports();
	}, []);

	if (loading) {
		return <div className="text-center mt-5">Loading airports...</div>;
	}

	if (error) {
		return <div className="text-center mt-5 text-danger">Error: {error}</div>;
	}

	return (
		<div className="container text-center">
			<div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-5">
				{airports.map((airport) => (
					<div className="col" key={airport._id}>
						<div className="card h-100 shadow-sm">
							<img
								className="card-img-top"
								src={airport.image}
								alt={airport.airportName}
								style={{ height: '200px', objectFit: 'cover' }}
							/>
							<div className="card-body">
								<p className="m-3 card-title">{airport.airportName}</p>
								<p className="airport-code">{airport.airportCode}</p>
								<p className="airport-city">{airport.city}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ViewAirports;
