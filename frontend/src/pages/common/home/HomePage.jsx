// most parts of this page will need to be converted into components

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightContext } from '../../../context/FlightContext';
import Navbar from '../../../components/customer/HomeNavbar';
import FlightSearchForm from '../../../components/customer/flightSearch/FlightSearchForm';
import PopularDestinations from './PopularDestinations';

const HomePage = () => {
	const navigate = useNavigate();

	const { setFlightSearchData } = useFlightContext();

	const handleSearch = (formData) => {
		setFlightSearchData(formData);
		navigate('/customer/departureFlights');
	};

	return (
		<div className="bg-light min-vh-100">
			{/* Navbar */}
			<Navbar />

			<FlightSearchForm onSubmit={handleSearch} />

			<PopularDestinations />
		</div>
	);
};

export default HomePage;
