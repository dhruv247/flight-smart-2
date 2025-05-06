import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ViewCities.css';

const ViewCities = () => {
	const [cities, setCities] = useState([]);

	useEffect(() => {
		const getCities = async () => {
			const citiesResponse = await axios.get(
				'http://localhost:8000/api/cities/getAll'
			);
			setCities(citiesResponse.data.cities);
		};
		getCities();
	}, []);

	// console.log(cities);

	return (
		<div className="container text-center">
			{/* <h1 className="mt-5 text-center mb-4">Cities</h1> */}
			<div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-5">
				{cities.map((city) => (
					<div className="col" key={city._id}>
						<div className="card h-100 shadow-sm hover-card">
							<img
								className="card-img-top"
								src={city.image}
								alt={city.name}
								style={{ height: '200px', objectFit: 'cover' }}
							/>
							<div className="card-body">
								<p className="m-3 card-title">{city.name}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ViewCities;
