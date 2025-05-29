import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightContext } from '../../../hooks/useFlightContext';
import Navbar from '../../../components/navbars/HomeNavbar';
import FlightSearchForm from '../../customer/flightSearch/FlightSearchForm';
import PopularDestinations from './PopularDestinations';

/**
 * Home Page
 */
const HomePage = () => {
	const navigate = useNavigate();

	const [flightTo, setFlightTo] = useState('');

	const changeFlightTo = (destination) => {
		setFlightTo(destination);
	};

	const { setFlightSearchData } = useFlightContext();

	const handleSearch = (formData) => {
		setFlightSearchData(formData);
		navigate('/customer/departureFlights');
	};

	return (
		<div className="bg-light min-vh-100">
			{/* Navbar */}
			<Navbar />

			<FlightSearchForm onSubmit={handleSearch} initialFlightTo={flightTo} />

			<PopularDestinations changeFlightTo={changeFlightTo} />
		</div>
	);
};

export default HomePage;
