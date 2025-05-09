import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PopularDestinations.css';

const PopularDestinations = () => {
	const [popularDestinations, setPopularDestinations] = useState([]);

	useEffect(() => {
		const fetchPopularDestinations = async () => {
			const response = await axios.get(
				'http://localhost:8000/api/analytics/top-destinations'
			);
			setPopularDestinations(response.data);
		};
		fetchPopularDestinations();
	}, []);

	return (
		<div className="container text-center">
			<h1 className="mt-5 text-center mb-4">Popular Destinations</h1>
			<div className="d-flex flex-column flex-md-row my-5 gap-3">
				{popularDestinations.map((destination) => (
					<div className="col" key={destination._id}>
						<div className="card h-100 shadow-sm hover-card">
							<img
								className="card-img-top"
								src={destination.image}
								alt={destination.name}
								style={{ height: '200px', objectFit: 'cover' }}
							/>
							<div className="card-body">
								<p className="m-3 card-title">{destination.name}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PopularDestinations;
